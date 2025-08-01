//　カテゴリーテーブルの表示とタスクの描画
document.addEventListener("DOMContentLoaded", () => {
    const raw = document.getElementById("all-posts-data").textContent;
    window.allPosts = JSON.parse(raw);  // グローバルに展開

    const taskList = document.querySelector(".task-list");
    const buttons = document.querySelectorAll('.category-button');

    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();

            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const categoryId = button.closest(".category-item").dataset.categoryId;
            const tasks = window.allPosts[categoryId];  // グローバル変数を参照

            taskList.innerHTML = "";
            if (!tasks || tasks.length === 0) {
                taskList.innerHTML = "<li>タスクがありません。</li>";
                return;
            }

            tasks.forEach(task => {
                const li = document.createElement("li");
                li.className = "task-item";
                li.dataset.id = task.id;
                li.dataset.title = task.title;
                li.dataset.content = task.content;
                li.dataset.category = task.category_id;
                li.textContent = task.title;
                taskList.appendChild(li);
            });
        });
    });
});
