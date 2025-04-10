import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";
import methodOverride from "method-override";

dotenv.config();

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method")); // helps override form methods

// Set variables for server port and API URL from ".env" file
const MAIN_PORT = process.env.MAIN_PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:4000";

// Render "main" page
app.get("/", async (req, res) => {
	try {
		// Retrieve book data from API, ...
		const ownedBooks = await axios.get(`${API_URL}/api/books`);
		let books = ownedBooks.data;

		// ...check for a sort query parameter in the URL.
		const sortOption = req.query.sort;

		// Based on search query (if provided), sort the book data.
		if (sortOption) {
			if (sortOption === "title") {
				books.sort((a, b) => a.title.localeCompare(b.title));
			} else if (sortOption === "author") {
				books.sort((a, b) => a.author.localeCompare(b.author));
			} else if (sortOption === "year") {
				books.sort((a, b) => {
					// Provide a default value if a year is missing
					const aYear = parseInt(a.published_date) || 0;
					const bYear = parseInt(b.published_date) || 0;
					return aYear - bYear;
				});
			}
		}

		// Render main page providing retrieved book data, sorted via query parameter
		res.render("index.ejs", { ownedBooks: books });
	} catch (error) {
		console.error("Error retrieving book data:", error.message);
		res.status(500).send("Error retrieving book data.");
	}
});

// Render "edit book" page w/ selected book data
app.get("/books/edit/:id", async (req, res) => {
	// Get the id of the book to edit from the URL
	const { id } = req.params;

	// Retrieve book data from API using the id & store it in a variable
	try {
		const book = await axios.get(`${API_URL}/api/book/${id}`);
		const bookData = book.data;

		// Render the edit-review page with the book data
		res.render("edit-review.ejs", { bookData });
	} catch (error) {
		console.error("Error retrieving book data:", error.message);
		res.status(500).send("Error retrieving book data.");
	}
});

// Retrieve book data from API
app.post("/search", async (req, res) => {
	const { query } = req.body;

	// Check if the query is an ISBN
	const isISBN = (/^[\d-]+$/.test(query) && query.replace(/-/g, "").length === 10) || query.replace(/-/g, "").length === 13;

	try {
		const ownedBooks = await axios.get(`${API_URL}/api/books`);

		// retrieve results from API

		const results = await axios.post(`${API_URL}/api/search`, isISBN ? { isbn: query } : { query });

		// Render main page with retrieved book data
		res.status(200).render("index.ejs", { books: results.data, ownedBooks: ownedBooks.data });
	} catch (error) {
		res.status(500).render("index.ejs", { books: [], error: "An error occurred while searching for the book.", ownedBooks: ownedBooks.data });
	}
});

// Post selected book and review to database
app.post("/books", async (req, res) => {
	const { title, isbn, author, published_date, book_id, review } = req.body;

	try {
		await axios.post(`${API_URL}/api/submit-review`, { title, isbn, author, published_date, book_id, review });

		res.redirect("/");
	} catch (error) {
		if (error.response) {
			if (error.response.status === 204) {
				return res.redirect("/");
			}

			console.error("Axios error:");
			console.error("Status:", error.response.status);
			console.error("Data:", error.response.data);
		} else {
			console.error(error.message);
		}

		res.redirect("/");
	}
});

// Route to handle the form submission for editing a review
app.patch("/edit-review", async (req, res) => {
	const { review, id } = req.body;

	try {
		await axios.patch(`${API_URL}/api/edit-review/${id}`, { review });
		res.redirect("/");
	} catch (error) {
		console.log(error.message);
		res.status(500).json({ error: "An error occurred while updating the review." });
	}
});

// Route to delete a book (and review) by "id"
app.delete("/books/delete/:id", async (req, res) => {
	const { id } = req.params;

	try {
		await axios.delete(`${API_URL}/api/delete/${id}`);

		res.redirect("/");
	} catch (error) {
		// database error
		console.error("Error deleting review:", error.message);
		res.status(500).json({ error: "An error occurred while deleting the review." });
	}
});

// Listen on the specified server port
app.listen(MAIN_PORT, () => {
	console.log(`Server is running on port ${MAIN_PORT}`);
});
