import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const API_PORT = process.env.API_PORT || 4000;
const db = new pg.Client({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

db.connect();

// Fetch ISBN based on book title
async function getTitleISBN(title) {
	try {
		const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${title}`);
		if (!response.data.items || response.data.items.length === 0) return null;

		const identifiers = response.data.items[0].volumeInfo.industryIdentifiers;
		if (!identifiers || identifiers.length === 0) return null;

		return identifiers[0].identifier;
	} catch (error) {
		console.error("Error fetching ISBN:", error.message);
		return null;
	}
}

// Store book in database
async function storeBookInDB(book) {
	const { cover_id, title, author, isbn, cover_url_small, cover_url_medium, cover_url_large } = book;

	const query = {
		text: "INSERT INTO books(book_id, title, author, isbn, cover_url_small, cover_url_medium, cover_url_large) VALUES($1, $2, $3, $4, $5, $6, $7)",
		values: [cover_id, title, author, isbn, cover_url_small, cover_url_medium, cover_url_large],
	};

	try {
		await db.query(query.text, query.values);
	} catch (error) {
		console.error(error);
	}
}

// Get all books from database
app.get("/api/search", async (req, res) => {
	const { isbn, title } = req.query;

	let openLibraryURL = process.env.OPENLIBRARY_URL;

	// if isbn is not defind, the request is for title...
	if (isbn == undefined) {
		openLibraryURL += `?title=${encodeURIComponent(title)}`;
	} else if (title == undefined) {
		// ... otherwise, the request is for isbn
		openLibraryURL += `?isbn=${isbn}`;
	}

	// Fetch book data from OpenLibrary
	const result = await axios.get(openLibraryURL);

	const bookData = result.data.docs[0];

	if (!bookData) {
		return res.status(404).json({ error: "No book found" });
	} else {
		let googleISBN = await getTitleISBN(bookData.title);
		if (!bookData.cover_i) {
			return res.status(404).json({ error: "No book cover found" });
		}
		// create book object with data from OpenLibrary
		const book = {
			title: bookData.title,
			author: bookData.author_name?.[0] || "Unknown",
			isbn: isbn ? isbn : googleISBN, // updated to use googleISBN
			cover_id: bookData.cover_i,
			cover_url_small: `http://covers.openlibrary.org/b/id/${bookData.cover_i}-S.jpg`,
			cover_url_medium: `http://covers.openlibrary.org/b/id/${bookData.cover_i}-M.jpg`,
			cover_url_large: `http://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg`,
		};

		// store book in database
		await storeBookInDB(book);

		// return book data to client
		res.status(200).json(book);
	}
});

// listen on the API_PORT for incoming requests
app.listen(API_PORT, () => {
	console.log(`Server is running on port ${API_PORT}`);
});
