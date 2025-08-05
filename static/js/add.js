// カテゴリー追加とタスク追加のモーダル制御
document.addEventListener("DOMContentLoaded", function () {
    
    // ========================================
    // カテゴリー追加モーダル制御
    // ========================================
    const categoryModal = document.getElementById("category-modal");
    const createCategoryBtn = document.getElementById("create-category-btn");
    const closeCategoryBtn = document.getElementById("close-category-modal");

    if (createCategoryBtn && categoryModal) {
        createCategoryBtn.addEventListener("click", () => {
            categoryModal.classList.remove("hidden");
        });
    }

    if (closeCategoryBtn && categoryModal) {
        closeCategoryBtn.addEventListener("click", () => {
            categoryModal.classList.add("hidden");
        });
    }

    // ========================================
    // タスク追加モーダル制御
    // ========================================
    const taskModal = document.getElementById("task-modal");
    const openTaskBtn = document.getElementById("open-modal");
    const closeTaskBtn = document.getElementById("close-task-modal");
    const categoryButtons = document.querySelectorAll('.category-button');
    const hiddenCategoryInput = document.getElementById('task-category-id');
    const form = document.getElementById("task-form");
    const taskList = document.getElementById("todo-tasks");

    let selectedCategoryId = null;

    // カテゴリーボタン選択時に ID を記憶
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const li = btn.closest('.category-item');
                selectedCategoryId = li.dataset.categoryId;
            });
        });
    }

    // モーダル開く前にカテゴリ選択チェック
    if (openTaskBtn && taskModal) {
        openTaskBtn.addEventListener("click", () => {
            if (!selectedCategoryId) {
                alert("先にカテゴリーを選択してください。");
                return;
            }

            hiddenCategoryInput.value = selectedCategoryId;
            taskModal.classList.remove("hidden");
        });
    }

    if (closeTaskBtn && taskModal) {
        closeTaskBtn.addEventListener("click", () => {
            taskModal.classList.add("hidden");
        });
    }

    // フォーム送信時の非同期処理
    if (form) {
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

                // 追加したタスクを allPosts に追記
                if (!window.allPosts) {
                    window.allPosts = {};
                }
                if (!window.allPosts[task.category_id]) {
                    window.allPosts[task.category_id] = [];
                }
                window.allPosts[task.category_id].push(task);

                // 選択中のカテゴリのタスクリストを更新
                if (task.category_id === selectedCategoryId && taskList) {
                    // 「タスクがありません」メッセージをクリア
                    taskList.innerHTML = "";
                    
                    // 現在のカテゴリの全タスクを再描画
                    const tasks = window.allPosts[selectedCategoryId];
                    tasks.forEach((currentTask, index) => {
                        const li = document.createElement("li");
                        li.classList.add("task-item", "animate");
                        li.dataset.id = currentTask.id;
                        li.dataset.title = currentTask.title;
                        li.dataset.content = currentTask.content || "";
                        li.dataset.category = currentTask.category_id;
                        
                        // 削除ボタンを作成（左側に配置）
                        const deleteBtn = document.createElement("button");
                        deleteBtn.className = "delete-task-btn material-symbols-outlined hidden";
                        deleteBtn.dataset.taskId = currentTask.id;
                        deleteBtn.textContent = "delete";
                        
                        // タスクタイトルを作成
                        const titleSpan = document.createElement("span");
                        titleSpan.className = "task-title";
                        titleSpan.textContent = currentTask.title;
                        
                        // 削除ボタンを先に追加、次にタイトル
                        li.appendChild(deleteBtn);
                        li.appendChild(titleSpan);
                        
                        li.style.animationDelay = `${index * 0.1}s`;
                        taskList.appendChild(li);
                    });

                    // 削除ボタンの表示状態を更新
                    if (window.updateDeleteButtonsVisibility) {
                        window.updateDeleteButtonsVisibility();
                    }
                }

                // モーダル閉じてフォーム初期化
                form.reset();
                taskModal.classList.add("hidden");
            } catch (error) {
                console.error("通信エラー:", error);
                alert("タスクの追加中にエラーが発生しました。");
            }
        });
    }
});