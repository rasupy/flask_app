//　カテゴリーテーブルの表示とタスクの描画
document.addEventListener("DOMContentLoaded", () => {
    const raw = document.getElementById("all-posts-data").textContent;
    window.allPosts = JSON.parse(raw);  // グローバルに展開

    const taskList = document.querySelector(".task-list");
    const categoryItems = document.querySelectorAll(".category-item");
    const buttons = document.querySelectorAll('.category-button');

    // カテゴリーアイテムのアニメーションを適用
    categoryItems.forEach((item, index) => {
        item.classList.add("animate");
        item.style.animationDelay = `${index * 0.1}s`;
    });

    // カテゴリーボタンのクリックイベント
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

            tasks.forEach((task, index) => {
                const li = document.createElement("li");
                li.className = "task-item animate";
                li.dataset.id = task.id;
                li.dataset.title = task.title;
                li.dataset.content = task.content;
                li.dataset.category = task.category_id;
                
                // 削除ボタンを作成（左側に配置）
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-task-btn material-symbols-outlined hidden";
                deleteBtn.dataset.taskId = task.id;
                deleteBtn.textContent = "delete";
                
                // タスクタイトルを作成
                const titleSpan = document.createElement("span");
                titleSpan.className = "task-title";
                titleSpan.textContent = task.title;
                
                // 削除ボタンを先に追加、次にタイトル
                li.appendChild(deleteBtn);
                li.appendChild(titleSpan);
                
                // アニメーション開始のタイミングをずらして、連続した動きにする
                li.style.animationDelay = `${index * 0.1}s`;
                
                taskList.appendChild(li);
            });

            // 削除ボタンの表示状態を更新
            if (window.updateDeleteButtonsVisibility) {
                window.updateDeleteButtonsVisibility();
            }
        });
    });
});
