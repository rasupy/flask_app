const raw = document.getElementById("all-posts-data").textContent;
const allPosts = JSON.parse(raw);
console.log("Loaded posts:", allPosts);

document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.querySelector(".task-list");
    const taskTitle = document.querySelector(".title-bar .title");

    const categoryItems = document.querySelectorAll(".category-item");

    categoryItems.forEach(item => {
        item.addEventListener("click", () => {
            const categoryId = item.dataset.categoryId;
            const tasks = allPosts[categoryId];

            // タイトルの上書き
            const categoryName = item.querySelector("button").textContent;
            taskTitle.textContent = `Task - ${categoryName}`;

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
