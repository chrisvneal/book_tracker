# Book Review Tracker

### Summary

Book Review Tracker is a full-stack web application that allows users to search for books, leave reviews, and manage book entries. It uses PostgreSQL for data storage, EJS for templating, and Axios for client-server communication.

## Features

- 🔍 Search books via the Open Library API by **title** or **ISBN**
- 📚 Filter search results by **title**, **author**, or **year** (sorted in ascending order)
- ✍️ Add, edit, and delete reviews
- 📘 Add and manage books (automatically saved when reviewing)
- 📄 Render pages using EJS templates
- ⚡ Dynamic HTTP requests handled with Axios
- 🧪 (Coming soon) Fallback mock data support for users without a database

> ⚠️ Note: UI is currently desktop-first and not responsive yet.

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** EJS templating
- **Database:** PostgreSQL
- **Client Communication:** Axios
- **Middleware:** Express
- **External API:** Open Library API

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/chrisvneal/book_tracker.git && cd book_tracker
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

   > This installs all required packages, including `pg` for PostgreSQL connectivity.

3. **Create your environment file:**
   Create a `.env` file in the root directory with the following content:

   > 💡 Be sure to add `.env` to your `.gitignore` file to avoid committing sensitive data.

   ```env
   SERVER_PORT=3000
   API_PORT=4000
   API_URL=http://localhost:4000
   MAIN_PORT=3000

   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD='your-password-here'
   DB_NAME=book_review_tracker
   DB_PORT=5432

   OPENLIBRARY_URL='https://openlibrary.org/search.json'
   ```

## Database Setup

1. **Install PostgreSQL:**
   [Download PostgreSQL](https://www.postgresql.org/download/) and install it on your system.

2. **Create the database:**
   You can do this in one of two ways:

   - **Using pgAdmin (GUI):** Open pgAdmin, right-click on "Databases" → "Create" → "Database", and name it `book_review_tracker`.
   - **Using the terminal (CLI):**
     ```bash
     createdb book_review_tracker
     ```

3. **Create the required tables:**
   Run the following SQL using `psql` or pgAdmin:

   ```sql
   -- BOOKS TABLE
   CREATE TABLE IF NOT EXISTS books (
     id SERIAL PRIMARY KEY,
     book_id INTEGER NOT NULL,
     isbn VARCHAR(20) NOT NULL,
     title TEXT NOT NULL,
     author TEXT NOT NULL,
     published_date TEXT,
     CONSTRAINT unique_book UNIQUE (book_id, isbn)
   );

   -- REVIEWS TABLE
   CREATE TABLE IF NOT EXISTS reviews (
     id SERIAL PRIMARY KEY,
     book_id INTEGER NOT NULL,
     review_text TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Running the App

To start the development environment:

1. **Start the backend API:**

   ```bash
   nodemon api.js
   ```

2. **In a new terminal, start the frontend and SCSS compiler:**
   ```bash
   npm run dev
   ```

Access the app at:

```
http://localhost:3000
```

> ⚠️ For production, replace `nodemon` with `node` and precompile SCSS beforehand.

## API Routes

### Book & Review Endpoints

- `GET /api/books` – Retrieve all books with their reviews
- `GET /api/book/:id` – Retrieve a single book and review by ID
- `POST /api/search` – Search Open Library API by title or ISBN

  Example request body:

  ```json
  {
  	"query": "book title",
  	"isbn": "1234567890",
  	"limit": 4
  }
  ```

- `POST /api/submit-review` – Save a book and its review
- `PATCH /api/edit-review/:id` – Update a review by ID
- `DELETE /api/delete/:id` – Delete a book and its review by ID

These endpoints power all backend features used by the frontend.

## Project Structure

```
book_review_tracker/
├── public/                 # Static assets
│   ├── css/               # Compiled CSS
│   ├── images/            # Image assets
│   ├── js/                # Client-side JavaScript
│   └── scss/              # SCSS source files
│       ├── partials/      # SCSS partials
│       └── sections/      # SCSS per layout section
├── views/                 # EJS templates
│   ├── partials/          # Shared layout components
│   ├── edit-review.ejs    # Edit review form
│   └── index.ejs          # Main view
├── api.js                 # Backend API (port 4000)
├── server.js              # Frontend Express app (port 3000)
├── .env                   # Environment variables
├── package.json
└── README.md
```

---

### Author

Created by [Chris Neal](https://github.com/chrisvneal)
