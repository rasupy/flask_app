// タスク追加モーダル制御
document.addEventListener("DOMContentLoaded", function () {
    const taskModal = document.getElementById("task-modal");
    const openTaskBtn = document.getElementById("open-modal");
    const closeTaskBtn = document.getElementById("close-task-modal");
    const categoryButtons = document.querySelectorAll('.category-button');
    const hiddenCategoryInput = document.getElementById('task-category-id');
    const form = document.getElementById("task-form");
    const taskList = document.getElementById("todo-tasks");

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

        hiddenCategoryInput.value = selectedCategoryId;
        taskModal.classList.remove("hidden");
    });

    closeTaskBtn.addEventListener("click", () => {
        taskModal.classList.add("hidden");
    });

    // フォーム送信時の非同期処理
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = form.querySelector("input[name='title']").value.trim();
        const content = form.querySelector("textarea[name='content']").value.trim();
        const category_id = hiddenCategoryInput.value;

        if (!title || !category_id) {
            alert("タイトルまたはカテゴリが未入力です");
            return;
        }

        try {
            const response = await fetch("/add_task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, content, category_id })
            });

            if (!response.ok) {
                const error = await response.json();
                alert("エラー: " + error.error);
                return;
            }

            const task = await response.json();

            // タスクを画面に追加（例：li 要素）
            const li = document.createElement("li");
            li.classList.add("task-item");
            li.dataset.id = task.id;
            li.textContent = task.title;
            taskList.appendChild(li);

            // モーダル閉じてフォーム初期化
            form.reset();
            taskModal.classList.add("hidden");
        } catch (error) {
            console.error("通信エラー:", error);
            alert("タスクの追加中にエラーが発生しました。");
        }
    });
});
