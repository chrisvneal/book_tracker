import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const MAIN_PORT = process.env.MAIN_PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:4000";

// Render main page
app.get("/", (req, res) => {
	res.render("index.ejs");
});

// Retrieve book data from API
app.post("/search", async (req, res) => {
	const { query } = req.body;

	// Check if the query is an ISBN
	const isISBN = (/^[\d-]+$/.test(query) && query.replace(/-/g, "").length === 10) || query.replace(/-/g, "").length === 13;

	try {
		// retrieve results from API
		const results = await axios.post(`${API_URL}/api/search`, isISBN ? { isbn: query } : { query });

		// Render main page with retrieved book data
		res.status(200).render("index.ejs", { books: results.data });
	} catch (error) {
		res.status(500).render("index.ejs", { books: [], error: "An error occurred while searching for the book." });
	}
});

app.post("/reviews", async (req, res) => {
	// res.sendStatus(400).json({ error: "Book not found" });

	const { title, isbn, author, published_date, book_id, review } = req.body;

	// save book to database if it isnt there, "books" table

	try {
		await axios.post(`${API_URL}/api/submit-review`, { title, isbn, author, published_date, book_id, review });
		// saved review to database, "reviews" table
		res.redirect("/");
	} catch (error) {
		console.log("");
		console.log("");
		console.log("");
		console.log("");
		console.log("");
		console.log("ERROR***************************");
		console.error(error);
		console.log("");

		// Send an error response instead of redirecting
		// return res.status(500).json({ error: "Failed to submit review" });
		res.redirect("/");
	}
});

app.listen(MAIN_PORT, () => {
	console.log(`Server is running on port ${MAIN_PORT}`);
});
