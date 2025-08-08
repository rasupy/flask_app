// タスク追加機能
document.addEventListener("DOMContentLoaded", function () {
    
    // ===========================================
    // DOM要素の取得
    // ===========================================
    const taskModal = document.getElementById("task-modal");
    const openTaskBtn = document.getElementById("open-modal");
    const closeTaskBtn = document.getElementById("close-task-modal");
    const categoryButtons = document.querySelectorAll('.category-button');
    const hiddenCategoryInput = document.getElementById('task-category-id');
    const form = document.getElementById("task-form");
    const taskList = document.getElementById("todo-tasks");

    let selectedCategoryId = null;

    // ===========================================
    // カテゴリー選択の監視
    // ===========================================
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const li = btn.closest('.category-item');
                selectedCategoryId = li.dataset.categoryId;
                
                // 選択状態の視覚的フィードバック
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // ===========================================
    // モーダル制御
    // ===========================================
    if (openTaskBtn && taskModal) {
        openTaskBtn.addEventListener("click", () => {
            if (!selectedCategoryId) {
                alert("先にカテゴリーを選択してください。");
                return;
            }

            hiddenCategoryInput.value = selectedCategoryId;
            taskModal.classList.remove("hidden");
            
            // フォーカスをタイトル入力に移動
            const titleInput = form.querySelector("input[name='title']");
            if (titleInput) {
                setTimeout(() => titleInput.focus(), 100);
            }
        });
    }

    if (closeTaskBtn && taskModal) {
        closeTaskBtn.addEventListener("click", () => {
            closeModal();
        });
    }

    // モーダル外クリックで閉じる
    if (taskModal) {
        taskModal.addEventListener("click", (e) => {
            if (e.target === taskModal) {
                closeModal();
            }
        });
    }

    // Escキーで閉じる
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && taskModal && !taskModal.classList.contains("hidden")) {
            closeModal();
        }
    });

    function closeModal() {
        taskModal.classList.add("hidden");
        if (form) {
            form.reset();
        }
    }

    // ===========================================
    // フォーム送信処理
    // ===========================================
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = form.querySelector("input[name='title']").value.trim();
            const content = form.querySelector("textarea[name='content']").value.trim();
            const category_id = hiddenCategoryInput.value;

            // バリデーション
            if (!title) {
                alert("タイトルは必須です");
                const titleInput = form.querySelector("input[name='title']");
                if (titleInput) titleInput.focus();
                return;
            }

            if (!category_id) {
                alert("カテゴリが選択されていません");
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
                    alert("エラー: " + (error.error || "不明なエラー"));
                    return;
                }

                const task = await response.json();
                
                // データとUIを更新
                updateTaskData(task);
                updateTaskUI(task);
                
                // モーダルを閉じてフォームをリセット
                closeModal();
                
                console.log("タスクが正常に追加されました:", task);

            } catch (error) {
                console.error("通信エラー:", error);
                alert("タスクの追加中にエラーが発生しました。");
            }
        });
    }

    // ===========================================
    // データ更新
    // ===========================================
    function updateTaskData(task) {
        if (!window.allPosts) {
            window.allPosts = {};
        }
        if (!window.allPosts[task.category_id]) {
            window.allPosts[task.category_id] = [];
        }
        window.allPosts[task.category_id].push(task);
    }

    // ===========================================
    // UI更新
    // ===========================================
    function updateTaskUI(task) {
        const selectedCategoryId = window.getSelectedCategoryId?.();
        const taskList = document.querySelector('.task-list');
        
        // 選択中のカテゴリのタスクリストを更新
        if (task.category_id === selectedCategoryId && taskList) {
            TaskRenderer.addTaskToList(task, taskList);
        }
    }

    function rerenderTaskList(categoryId) {
        if (!taskList || !window.allPosts || !window.allPosts[categoryId]) return;

        taskList.innerHTML = "";
        const tasks = window.allPosts[categoryId];
        
        tasks.forEach((task, index) => {
            const taskElement = createTaskElement(task, index);
            taskList.appendChild(taskElement);
        });

        // 削除ボタンの表示状態を更新
        if (typeof window.updateDeleteButtonsVisibility === 'function') {
            window.updateDeleteButtonsVisibility();
        }
    }

    function createTaskElement(task, index = 0) {
        const li = document.createElement("li");
        li.classList.add("task-item", "animate");
        li.dataset.id = task.id;
        li.dataset.title = task.title;
        li.dataset.content = task.content || "";
        li.dataset.category = task.category_id;
        
        // 削除ボタンを作成
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-task-btn material-symbols-outlined hidden";
        deleteBtn.dataset.taskId = task.id;
        deleteBtn.textContent = "delete";
        
        // タスクタイトルを作成
        const titleSpan = document.createElement("span");
        titleSpan.className = "task-title";
        titleSpan.textContent = task.title;
        
        // 要素を組み立て
        li.appendChild(deleteBtn);
        li.appendChild(titleSpan);
        
        // アニメーション遅延を設定
        li.style.animationDelay = `${index * 0.1}s`;
        
        return li;
    }

    // ===========================================
    // グローバル関数の公開
    // ===========================================
    window.getSelectedCategoryId = () => selectedCategoryId;
    window.setSelectedCategoryId = (id) => {
        selectedCategoryId = id;
    };
});