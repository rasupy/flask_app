// カテゴリー追加モーダル制御
document.addEventListener("DOMContentLoaded", function () {
    const categoryModal = document.getElementById("category-modal");
    const createCategoryBtn = document.getElementById("create-category-btn");
    const closeCategoryBtn = document.getElementById("close-category-modal");

    createCategoryBtn.addEventListener("click", () => categoryModal.classList.remove("hidden"));
    closeCategoryBtn.addEventListener("click", () => categoryModal.classList.add("hidden"));
});
