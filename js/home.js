let currentPage = 1;
let lastPage = 5;

isPostPage = false;

function main() {
  updateUi();
  try {
    showPosts(true);
  } catch (error) {
    console.error("Failed to load posts:", error);
  }
}
main();

let isLoading = false;
const btnBackToTop = document.getElementById("btnBackToTop");

window.addEventListener("scroll", async () => {
  if (window.scrollY > window.innerHeight) {
    btnBackToTop.classList.remove("d-none");
  } else {
    btnBackToTop.classList.add("d-none");
  }
  if (
    window.scrollY + window.innerHeight >= document.body.scrollHeight - 200 &&
    !isLoading
  ) {
    isLoading = true;
    showLoading(true);

    currentPage++;
    await showPosts(false);

    showLoading(false);
    isLoading = false;
  }
});

btnBackToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
