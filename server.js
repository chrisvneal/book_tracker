import express from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const MAIN_PORT = process.env.MAIN_PORT || 3000;

app.get("/", (req, res) => {
	// const query = req.query.query;
	// const isISBN = /^\d+$/.test(query);
	// const searchParam = isISBN ? { isbn: query } : { query: query };
	// const results = await axios.post("http://localhost:4000/api/search", { searchParam });
	// console.log(results.data);
	res.render("index.ejs");
});

app.listen(MAIN_PORT, () => {
	console.log(`Server is running on port ${MAIN_PORT}`);
});
