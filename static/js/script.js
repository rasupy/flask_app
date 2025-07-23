document.addEventListener("DOMContentLoaded", function () {
    // タスク追加モーダル制御
    const taskModal = document.getElementById("task-modal");
    const openTaskBtn = document.getElementById("open-modal");
    const closeTaskBtn = document.getElementById("close-task-modal");

    openTaskBtn.addEventListener("click", () => taskModal.classList.remove("hidden"));
    closeTaskBtn.addEventListener("click", () => taskModal.classList.add("hidden"));

    // カテゴリー追加モーダル制御
    const categoryModal = document.getElementById("category-modal");
    const openCategoryBtn = document.getElementById("open-category-modal");
    const closeCategoryBtn = document.getElementById("close-category-modal");

    openCategoryBtn.addEventListener("click", () => categoryModal.classList.remove("hidden"));
    closeCategoryBtn.addEventListener("click", () => categoryModal.classList.add("hidden"));
});
