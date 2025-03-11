document.querySelector(".book-search-results").addEventListener("click", function (e) {
	let book = e.target.closest(".book"); // Find the closest book item
	if (!book) return; // Stop if clicked outside book items

	console.log("Book item clicked:", book);

	let reviewForm = document.querySelector(".review-form");

	if (reviewForm.classList.contains("hidden")) {
		reviewForm.classList.remove("hidden");
	}
});
