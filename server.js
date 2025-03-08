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
	const isISBN = /^\d+$/.test(query);
	const API_URL = process.env.API_URL || "http://localhost:4000";

	try {
		const results = await axios.post(`${API_URL}/api/search`, isISBN ? { isbn: query } : { query });
		console.log(`${API_URL}/api/search`);
		// console.log(results.data);
		res.render("index.ejs", { books: results.data });
	} catch (error) {
		console.error("Error searching for book:", error.message);
		res.render("index.ejs", { books: [] }); // Render an empty array on error
	}
});

app.listen(MAIN_PORT, () => {
	console.log(`Server is running on port ${MAIN_PORT}`);
});
