//　カテゴリーテーブルの表示とタスクの描画
document.addEventListener("DOMContentLoaded", () => {
    const raw = document.getElementById("all-posts-data").textContent;
    const allPosts = JSON.parse(raw);

    const taskList = document.querySelector(".task-list");
    const buttons = document.querySelectorAll('.category-button');

    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();  // 親要素に伝播しないように

            // active クラスの切り替え
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // カテゴリIDの取得
            const categoryId = button.closest(".category-item").dataset.categoryId;
            const tasks = allPosts[categoryId];

            // タスクの描画
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
