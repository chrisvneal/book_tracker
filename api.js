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

app.get("/api/reviews", async (req, res) => {
	const getReviews = {
		text: "SELECT  books.id AS id,books.isbn AS isbn, books.title AS title, books.author AS author, books.published_date AS published_date,  reviews.review_text AS review FROM books LEFT JOIN reviews ON books.book_id = reviews.book_id ORDER BY books.title ASC;",
	};

	try {
		let results = await db.query(getReviews.text);
		// console.log(results.rows);
		res.status(200).json(results.rows);
	} catch (error) {
		console.error(error.message);
	}
});

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
	try {
		const result = await axios.get(openLibraryURL);
		const bookData = result.data.docs;

		// Initialize array to store search results from API
		let searchResults = [];

		// Loop through results, insert into books array
		for (let i = 0; i < bookData.length; i++) {
			if (!bookData[i]) {
				continue;
			}

			// Get ISBN from Google Books API by title
			const googleISBN = (await getTitleISBN(bookData[i].title)) || "Unknown ISBN";

			if (!bookData[i].cover_i) {
				continue;
			}

			// create new object from OpenLibrary API data
			const { title, author_name, first_publish_year, cover_i } = bookData[i];
			const book = {
				title: title,
				author: author_name?.[0] || "Unknown",
				isbn: isbn || googleISBN,
				published_date: first_publish_year || "Unknown",
				cover_id: cover_i,
				cover_url_small: cover_i ? `http://covers.openlibrary.org/b/id/${cover_i}-S.jpg` : null,
				cover_url_medium: cover_i ? `http://covers.openlibrary.org/b/id/${cover_i}-M.jpg` : null,
				cover_url_large: cover_i ? `http://covers.openlibrary.org/b/id/${cover_i}-L.jpg` : null,
			};

			// store each book/result in searchResults array
			searchResults.push(book);
		}

		// send search results as JSON to server
		res.status(200).json(searchResults);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

app.post("/api/submit-review", async (req, res) => {
	const { book_id, isbn, title, author, published_date, review } = req.body;

	// check if book is in database

	let getBook = {
		text: "SELECT * FROM books WHERE book_id = $1 AND isbn = $2",
		values: [String(book_id), String(isbn)],
	};

	let book = await db.query(getBook.text, getBook.values);

	// if book is not in the database, store it
	if (book.rows.length === 0) {
		// store book in database
		let storeBook = {
			text: "INSERT INTO books (book_id, isbn, title, author, published_date) VALUES ($1, $2, $3, $4, $5) ON CONFLICT ON CONSTRAINT unique_book DO NOTHING",
			values: [book_id, isbn, title, author, published_date],
		};

		// store review in database
		let storeReview = {
			text: "INSERT INTO reviews (book_id, review_text) VALUES ($1, $2)",
			values: [book_id, review],
		};

		try {
			// try accessing the database
			await db.query("BEGIN"); // Start transaction

			await db.query(storeBook.text, storeBook.values);
			// console.log("Book added to database.");

			await db.query(storeReview.text, storeReview.values);
			// console.log("Review added to database.");

			await db.query("COMMIT"); // Commit transaction

			return res.status(201).json({ message: "Book added successfully" });
		} catch (error) {
			// database error
			console.error(error.message);
			return res.status(500).json({ message: "Database error" });
		}
	} else {
		console.log("Book already exists in database.");
		return res.status(204).end();
	}
});

app.get("/api/review/:id", async (req, res) => {
	const { id } = req.params;

	let query = {
		text: "SELECT books.id AS id, books.isbn AS isbn, books.title AS title, books.author AS author, books.published_date AS published_date, reviews.review_text AS review FROM books LEFT JOIN reviews ON books.id = reviews.id WHERE reviews.id = $1",
		values: [id],
	};

	try {
		let results = await db.query(query.text, query.values);

		if (results.rows.length > 0) {
			const { id, isbn, title, author, published_date, review } = results.rows[0];
			return res.status(200).json({ id, isbn, title, author, published_date, review });
		} else {
			return res.status(404).json({ message: "Review not found." });
		}
	} catch (error) {
		console.error("Error fetching review:", error);
		return res.status(500).json({ error: "An error occurred while fetching the review." });
	}
});

app.patch("/api/edit-review/:id", async (req, res) => {
	const { id } = req.params;
	const { review } = req.body;
	// console.log("Update review:", review, id);

	// update review in database
	let updateReview = {
		text: "UPDATE reviews SET review_text = $1 WHERE id = $2",
		values: [review, id],
	};

	try {
		await db.query(updateReview.text, updateReview.values);
		res.status(200).json({ message: "Review updated successfully." });
	} catch (error) {
		console.error("Error editing review:", error);
		res.status(500).json({ error: "An error occurred while editing the review." });
	}
});

app.delete("/api/delete/:id", async (req, res) => {
	const { id } = req.params;

	let deleteReview = {
		text: "DELETE FROM reviews WHERE id = $1",
		values: [id],
	};

	let deleteBook = {
		text: "DELETE FROM books WHERE id = $1",
		values: [id],
	};

	try {
		await db.query("BEGIN"); // Start transaction
		await db.query(deleteReview.text, deleteReview.values);
		await db.query(deleteBook.text, deleteBook.values);
		await db.query("COMMIT"); // Commit transaction
		// console.log("Book and its reviews deleted successfully.");
		res.status(200).json({ message: "Deleted successfully" });
	} catch (error) {
		await db.query("ROLLBACK"); // Rollback transaction in case of error
		console.error("Error deleting book and reviews:", error.message);
		return res.status(500).send("Error deleting book and reviews.");
	}

	// try {
	// 	await db.query(deleteReview.text, deleteReview.values);
	// 	console.log("Review deleted successfully.");
	// } catch (error) {
	// 	console.error("Error deleting review:", error.message);
	// 	return res.status(500).send("Error deleting review.");
	// }
});

// listen on the API_PORT for incoming requests
app.listen(API_PORT, () => {
	console.log(`Server is running on port ${API_PORT}`);
});
