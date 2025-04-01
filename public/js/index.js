function populateReviewHeader(book) {
	// get review book title, author name, isbn, larger size from selected book
	let title, author, isbn, published_date, cover_id, cover_url_large;

	title = book.querySelector("h3").textContent.trim();
	author = book.querySelector(".book-author span").textContent.trim();
	isbn = book.querySelector(".book-isbn span").textContent.trim();
	published_date = book.querySelector(".book-published-date span").textContent.trim();
	cover_id = book.getAttribute("data-cover-id");
	cover_url_large = book.getAttribute("data-cover-large");

	document.querySelector(".review-book-title").textContent = title;
	document.querySelector(".review-book-author span").textContent = author;
	document.querySelector(".review-book-isbn span").textContent = isbn;
	document.querySelector(".review-book-published-date span").textContent = published_date;
	document.querySelector(".review-book-image img").setAttribute("src", "ugly.jpg");

	// Set hidden input values for form submission
	document.getElementById("review-book-title").value = title;
	document.getElementById("review-book-author").value = author;
	document.getElementById("review-book-isbn").value = isbn;
	document.getElementById("review-book-published-date").value = published_date;
	document.getElementById("review-book-id").value = cover_id;

	document.querySelector(".review-book-image img").setAttribute("src", cover_url_large);
	// document.querySelector(".review-book").setAttribute("data-id", book.closest(".book").getAttribute("data-id"));
}

document.addEventListener("DOMContentLoaded", function () {
	document.querySelectorAll(".book").forEach((bookElement) => {
		bookElement.addEventListener("mouseenter", function () {
			let coverUrlLarge = this.getAttribute("data-cover-large");

			// Lazy preload large image only when hovering over a book
			let img = new Image();
			img.src = coverUrlLarge;
		});
	});

	// Edit button functionality
	document.querySelectorAll(".edit-button").forEach((button) => {
		button.addEventListener("click", function (e) {
			e.preventDefault();
			e.stopPropagation(); // Prevent triggering the book click event
			let reviewId = this.closest("tr").getAttribute("data-id");

			window.location.href = `/books/edit/${reviewId}`;
		});
	});

	// Delete button functionality
	document.querySelectorAll(".delete-button").forEach((button) => {
		button.addEventListener("click", function (e) {
			e.preventDefault(); // Prevent default action of the button
			e.stopPropagation(); // Prevent triggering the book click event
			let reviewId = this.closest("tr").getAttribute("data-id");
			// console.log("Delete button clicked for review ID:", reviewId);
			// window.location.href = `/delete-review/${reviewId}`;
		});
	});
});

// Update button functionality

if (document.querySelector(".update-button")) {
	document.querySelector(".update-button").addEventListener("click", async function (e) {
		e.preventDefault(); // Prevent default action of the button
		e.stopPropagation(); // Prevent triggering the book click event
		let reviewId = this.closest("tr").getAttribute("data-id");

		let review = {
			text: document.querySelector("#review").value,
			id: reviewId,
		};

		await axios.patch("/update-review", review);
	});
}

let hiddenInput = document.querySelector("#searched");

let form = document.querySelector("#search-form");

if (document.querySelector(".book-search-results")) {
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
}
