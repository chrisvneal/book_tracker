function populateReviewHeader(book) {
	document.querySelector(".review-book-title").textContent = book.querySelector("h3").textContent;
	document.querySelector(".review-book-author").textContent = book.querySelector(".book-author").textContent;
	document.querySelector(".review-book-image img").setAttribute("src", book.querySelector("img").getAttribute("src"));
}

document.querySelector(".book-search-results").addEventListener("click", function (e) {
	let book = e.target.closest(".book"); // Find the closest book item
	if (!book) return; // Stop if clicked outside book items

	// console.log("Book item clicked:", book);

	let reviewForm = document.querySelector(".review-form");

	document.querySelectorAll(".book").forEach(function (bookItem) {
		bookItem.classList.remove("selected");
	});
	book.classList.add("selected");

	populateReviewHeader(book);

	if (reviewForm.classList.contains("hidden")) {
		reviewForm.classList.remove("hidden");
	}
});
