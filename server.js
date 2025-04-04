import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";
import methodOverride from "method-override";

dotenv.config();

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(methodOverride("_method"));

const MAIN_PORT = process.env.MAIN_PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:4000";

// Render main page
app.get("/", async (req, res) => {
	const ownedBooks = await axios.get(`${API_URL}/api/reviews`);

	res.render("index.ejs", { ownedBooks: ownedBooks.data });
});

// Render book edit page
app.get("/books/edit/:id", async (req, res) => {
	// Get the id of the book to edit from the URL
	const { id } = req.params;

	// Retrieve book data from API using the id
	try {
		const book = await axios.get(`${API_URL}/api/review/${id}`);

		// Store the book data in a variable
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
		const ownedBooks = await axios.get(`${API_URL}/api/reviews`);

		// retrieve results from API

		const results = await axios.post(`${API_URL}/api/search`, isISBN ? { isbn: query } : { query });

		// Render main page with retrieved book data
		res.status(200).render("index.ejs", { books: results.data, ownedBooks: ownedBooks.data });
	} catch (error) {
		res.status(500).render("index.ejs", { books: [], error: "An error occurred while searching for the book.", ownedBooks: ownedBooks.data });
	}
});

app.post("/reviews", async (req, res) => {
	// res.sendStatus(400).json({ error: "Book not found" });

	const { title, isbn, author, published_date, book_id, review } = req.body;

	// save book to database if it isnt there, "books" table

	try {
		await axios.post(`${API_URL}/api/submit-review`, { title, isbn, author, published_date, book_id, review });
		// console.log("Book review sent.");

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

app.patch("/update-review", async (req, res) => {
	const { review, id } = req.body;
	// console.log("Update review:", review, id);
	// console.log(req.body);
	try {
		// const { text, id } = req.body.review;
		// console.log("Review:", text, id);
		await axios.patch(`${API_URL}/api/edit-review/${id}`, { review });
		res.redirect("/");
	} catch (error) {
		console.log(error.message);
		res.status(500).json({ error: "An error occurred while updating the review." });
	}
});

app.delete("/books/delete/:id", async (req, res) => {
	const { id } = req.params;
	// console.log("srver hit up");

	try {
		await axios.delete(`${API_URL}/api/delete/${id}`);
		// console.log("server Delete review ID:", id);

		// res.status(204).send("works");
		const books = await axios.get(`${API_URL}/api/reviews`);
		if (books) {
			console.log("Books:", books.data);
		} else {
			console.log("Books not found.");
		}

		res.render("index.ejs", { ownedBooks: books.data });
		// res.status(200).json({ message: "Review deleted successfully." });
	} catch (error) {
		console.error("Error deleting review:", error.message);
		res.status(500).json({ error: "An error occurred while deleting the review." });
	}
});

app.listen(MAIN_PORT, () => {
	console.log(`Server is running on port ${MAIN_PORT}`);
});
