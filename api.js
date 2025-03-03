import express from "express";
import pg from "pg";
import dotenv, { parse } from "dotenv";
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

async function getTitleISBN(title) {
	const data = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${title}#`);

	const result = data.data.items[0];
	const isbn = result.volumeInfo.industryIdentifiers[0].identifier;

	return isbn;
}

app.get("/api/search", async (req, res) => {
	const { isbn, title } = req.query;

	let openLibraryURL = process.env.OPENLIBRARY_URL;

	if (isbn == undefined) {
		openLibraryURL += `?title=${encodeURIComponent(title)}`;
	} else if (title == undefined) {
		openLibraryURL += `?isbn=${isbn}`;
	}

	const result = await axios.get(openLibraryURL);

	const bookData = result.data.docs[0];

	if (!bookData) {
		res.send("No book found");
		return;
	} else {
		let googleISBN = await getTitleISBN(bookData.title);

		const book = {
			title: bookData.title,
			author: bookData.author_name,
			isbn: isbn ? isbn : googleISBN, // updated to use googleISBN
			cover_id: bookData.cover_i,
			cover_url_small: `http://covers.openlibrary.org/b/id/${bookData.cover_i}-S.jpg`,
			cover_url_medium: `http://covers.openlibrary.org/b/id/${bookData.cover_i}-M.jpg`,
			cover_url_large: `http://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg`,
		};
		res.status(200).json(book);
	}
});

app.listen(API_PORT, () => {
	console.log(`Server is running on port ${API_PORT}`);
});
