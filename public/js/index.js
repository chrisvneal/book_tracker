// Populate the review section with the selected book's details
function showReviewSection(book) {
	// Get review book title, author name, isbn, larger size from selected book
	let title, author, isbn, published_date, cover_id, cover_url_large;

	title = book.querySelector("h3").textContent.trim();
	author = book.querySelector(".book-author span").textContent.trim();
	isbn = book.querySelector(".book-isbn span").textContent.trim();
	published_date = book.querySelector(".book-published-date span").textContent.trim();
	cover_id = book.getAttribute("data-cover-id");
	cover_url_large = book.getAttribute("data-cover-large");

	// Populate the review form with the selected book's details when it loads
	document.querySelector(".review-book-title").textContent = title;
	document.querySelector(".review-book-author span").textContent = author;
	document.querySelector(".review-book-isbn span").textContent = isbn;
	document.querySelector(".review-book-published-date span").textContent = published_date;
	document.querySelector(".review-book-image img").setAttribute("src", "ugly.jpg");

	// Give hidden inputs the values of the selected book to be used in the form submission (request body)
	document.getElementById("review-book-title").value = title;
	document.getElementById("review-book-author").value = author;
	document.getElementById("review-book-isbn").value = isbn;
	document.getElementById("review-book-published-date").value = published_date;
	document.getElementById("review-book-id").value = cover_id;

	// Set the cover image to the large version
	document.querySelector(".review-book-image img").setAttribute("src", cover_url_large);

	// document.querySelector(".review-book").setAttribute("data-id", book.closest(".book").getAttribute("data-id"));
	let reviewSection = document.querySelector(".review-section");

	if (reviewSection.classList.contains("hidden")) {
		reviewSection.classList.remove("hidden");
	}
}

// Actions to take when the page loads
document.addEventListener("DOMContentLoaded", function () {
	// Lazy load large book cover images when hovering over book elements
	document.querySelectorAll(".book").forEach((bookElement) => {
		bookElement.addEventListener("mouseenter", function () {
			let coverUrlLarge = this.getAttribute("data-cover-large");

			let img = new Image();
			img.src = coverUrlLarge;
		});
	});
});

let hiddenInput = document.querySelector("#searched");

let form = document.querySelector("#search-form");

// If search returns results, make each book clickable
const bookSearchResults = document.querySelector(".book-search-results");

bookSearchResults?.addEventListener("click", (e) => {
	const book = e.target.closest(".book");
	if (!book) return;

	// Clear "selected" class from all books and add it to the clicked book
	document.querySelectorAll(".book.selected").forEach((bookItem) => bookItem.classList.remove("selected"));
	book.classList.add("selected");

	// Show the review section with the selected book's details
	showReviewSection(book);
});
