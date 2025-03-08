import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const MAIN_PORT = process.env.MAIN_PORT || 3000;

app.get("/", (req, res) => {
	res.render("index");
});

app.listen(MAIN_PORT, () => {
	console.log(`Server is running on port ${MAIN_PORT}`);
});
