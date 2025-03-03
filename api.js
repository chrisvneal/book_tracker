import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import bodyParser from "body-parser";

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

app.get("/api/search/:isbn", (req, res) => {
	const { isbn } = req.params;

	console.log(req.params);

	// Placeholder response that should eventually handle the search logic
	res.send(`Search results for ISBN: ${isbn}`);
});

app.listen(API_PORT, () => {
	console.log(`Server is running on port ${API_PORT}`);
});
