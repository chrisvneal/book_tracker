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
		text: "INSERT INTO books(book_id, title, author, isbn, cover_url_small, cover_url_medium, cover_url_large) VALUES($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (book_id) DO NOTHING",
		values: [cover_id, title, author, isbn, cover_url_small, cover_url_medium, cover_url_large],
	};

	try {
		await db.query(query.text, query.values);
	} catch (error) {
		console.error(error);
	}
}

// Search for book by ISBN or title
app.post("/api/search", async (req, res) => {
	const { isbn, query, limit } = req.body;

	let openLibraryURL = process.env.OPENLIBRARY_URL;
	let title = query;
	const numOfBooks = limit || 4;
	const bookLimit = `&limit=${numOfBooks}`;

	// if isbn is not defined, the request is for title...
	if (isbn == undefined) {
		openLibraryURL += `?q=${encodeURIComponent(title)}${bookLimit}`;
	} else if (title == undefined) {
		// ... otherwise, the request is for isbn
		openLibraryURL += `?isbn=${isbn}${bookLimit}`;
	}

	// Fetch book data from OpenLibrary and parse it
	const result = await axios.get(openLibraryURL);
	const bookData = result.data.docs;

	// Initialize array to store book data
	let books = [];
	let bookTitles = [];

	// Loop through book data, insert into books array
	for (let i = 0; i < bookData.length; i++) {
		if (!bookData[i]) {
			continue;
		}

		// Get ISBN from Google Books API by title
		const googleISBN = (await getTitleISBN(bookData[i].title)) || "Unknown ISBN";

		if (!bookData[i].cover_i) {
			console.warn(`⚠️ Book "${bookData[i].title}" has no cover image. It will be included with 'null' cover URLs.`);
		}

		// create book object with data from OpenLibrary
		const book = {
			title: bookData[i].title,
			author: bookData[i].author_name?.[0] || "Unknown",
			isbn: isbn || googleISBN,
			cover_id: bookData[i].cover_i,
			cover_url_small: bookData[i].cover_i ? `http://covers.openlibrary.org/b/id/${bookData[i].cover_i}-S.jpg` : null,
			cover_url_medium: bookData[i].cover_i ? `http://covers.openlibrary.org/b/id/${bookData[i].cover_i}-M.jpg` : null,
			cover_url_large: bookData[i].cover_i ? `http://covers.openlibrary.org/b/id/${bookData[i].cover_i}-L.jpg` : null,
		};

		books.push(book);
		bookTitles.push(book.title);

		// await storeBookInDB(book);
	}

	// Return book data to client
	// console.log(books[0].author_name);
	console.log("");
	console.log(`The API returned ${books.length} books for ${isbn ? `ISBN: ${isbn}` : `title: ${title}`}.`);
	console.log("=====================================");
	bookTitles.forEach((title) => console.log(title));
	const booksWithoutImages = books.filter((book) => !book.cover_id);
	if (booksWithoutImages.length > 0) {
		console.warn(`⚠️ There are ${booksWithoutImages.length} books without cover images.`);
		booksWithoutImages.forEach((book) => console.warn(`- ${book.title} by ${book.author}`));
	}

	res.status(200).json(books);
});

// listen on the API_PORT for incoming requests
app.listen(API_PORT, () => {
	console.log(`Server is running on port ${API_PORT}`);
});
