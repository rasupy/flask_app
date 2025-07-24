document.addEventListener("DOMContentLoaded", function () {
    // カテゴリー追加モーダル制御
    const categoryModal = document.getElementById("category-modal");
    const openCategoryBtn = document.getElementById("open-category-modal");
    const closeCategoryBtn = document.getElementById("close-category-modal");

    openCategoryBtn.addEventListener("click", () => categoryModal.classList.remove("hidden"));
    closeCategoryBtn.addEventListener("click", () => categoryModal.classList.add("hidden"));
});
