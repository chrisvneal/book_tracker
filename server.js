import express from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const MAIN_PORT = process.env.MAIN_PORT || 3000;

app.get("/", (req, res) => {
	res.render("index.ejs");
});

app.post("/search", async (req, res) => {
	const query = req.body.query;

	// Check if the query is an ISBN
	const isISBN = (/^[\d-]+$/.test(query) && query.replace(/-/g, "").length === 10) || query.replace(/-/g, "").length === 13;

	const API_URL = process.env.API_URL || "http://localhost:4000";

	try {
		const results = await axios.post(`${API_URL}/api/search`, isISBN ? { isbn: query } : { query });

		res.status(200).render("index.ejs", { books: results.data });
	} catch (error) {
		res.status(500).render("index.ejs", { books: [], error: "An error occurred while searching for the book." });
	}
});

app.listen(MAIN_PORT, () => {
	console.log(`Server is running on port ${MAIN_PORT}`);
});
