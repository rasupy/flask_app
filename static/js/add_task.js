// タスク追加モーダル制御
document.addEventListener("DOMContentLoaded", function () {
    const taskModal = document.getElementById("task-modal");
    const openTaskBtn = document.getElementById("open-modal");
    const closeTaskBtn = document.getElementById("close-task-modal");
    const categoryButtons = document.querySelectorAll('.category-button');
    const hiddenCategoryInput = document.getElementById('task-category-id');

    let selectedCategoryId = null;

    // カテゴリーボタン選択時に ID を記憶
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const li = btn.closest('.category-item');
            selectedCategoryId = li.dataset.categoryId;
        });
    });

    // モーダル開く前にカテゴリ選択チェック
    openTaskBtn.addEventListener("click", () => {
        if (!selectedCategoryId) {
            alert("先にカテゴリーを選択してください。");
            return;
        }

        // カテゴリーIDを hidden input に設定
        hiddenCategoryInput.value = selectedCategoryId;

        taskModal.classList.remove("hidden");
    });

    closeTaskBtn.addEventListener("click", () => {
        taskModal.classList.add("hidden");
    });
});
