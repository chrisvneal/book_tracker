function getColorURL(cover_id, size) {
	let url = `http://covers.openlibrary.org/b/id/${cover_id}-${size.toUpperCase()}.jpg`;
	return url;
}

function populateReviewHeader(book) {
	// get review book title, author name, isbn from selected book
	let title, author, isbn, published_date, cover_id;

	title = book.querySelector("h3").textContent.trim();
	author = book.querySelector(".book-author span").textContent.trim();
	isbn = book.querySelector(".book-isbn span").textContent.trim();
	published_date = book.querySelector(".book-published-date span").textContent.trim();
	cover_id = book.getAttribute("data-cover-id");

	document.querySelector(".review-book-title").textContent = title;
	document.querySelector(".review-book-author span").textContent = author;
	document.querySelector(".review-book-isbn span").textContent = isbn;
	document.querySelector(".review-book-published-date span").textContent = published_date;

	// Set hidden input values for form submission
	document.getElementById("review-book-title").value = title;
	document.getElementById("review-book-author").value = author;
	document.getElementById("review-book-isbn").value = isbn;
	document.getElementById("review-book-published-date").value = published_date;
	document.getElementById("review-book-id").value = cover_id;

	document.querySelector(".review-book-image img").setAttribute("src", book.querySelector("img").getAttribute("src"));
	// document.querySelector(".review-book").setAttribute("data-id", book.closest(".book").getAttribute("data-id"));
}

let hiddenInput = document.querySelector("#searched");

let form = document.querySelector("#search-form");

document.querySelector(".book-search-results").addEventListener("click", function (e) {
	let book = e.target.closest(".book"); // Find the closest book item
	if (!book) return; // Stop if clicked outside book items

	let reviewSection = document.querySelector(".review-section");

	document.querySelectorAll(".book").forEach(function (bookItem) {
		bookItem.classList.remove("selected");
	});
	book.classList.add("selected");

	populateReviewHeader(book);

	if (!reviewSection) {
		console.error("Review section not found in the DOM.");
		return;
	} else {
		if (reviewSection.classList.contains("hidden")) {
			reviewSection.classList.remove("hidden");
		}
	}
});
