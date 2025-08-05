// カテゴリー削除機能 & タスク削除機能
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // カテゴリー削除機能
    const deleteCategoryToggle = document.getElementById('delete-category-toggle');
    const deleteCategoryBtns = document.querySelectorAll('.delete-category-btn');
    let categoryDeleteMode = false;

    if (deleteCategoryToggle) {
        deleteCategoryToggle.addEventListener('click', () => {
            categoryDeleteMode = !categoryDeleteMode;
            deleteCategoryBtns.forEach(btn => {
                btn.classList.toggle('hidden', !categoryDeleteMode);
            });
        });
    }

    deleteCategoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.categoryId;
            const confirmed = confirm("本当にこのカテゴリーを削除しますか？関連するタスクも削除されます。");
            if (confirmed) {
                fetch(`/admin/delete_category/${id}`, {
                    method: "POST"
                }).then(res => {
                    if (res.ok) {
                        location.reload();
                    } else {
                        alert("削除に失敗しました");
                    }
                });
            }
        });
    });

    // タスク削除機能の改善
    // 削除モードの切り替え（削除アイコンの表示/非表示）
    const deleteTaskToggle = document.getElementById("delete-task-toggle"); 
    let taskDeleteMode = false;

    if (deleteTaskToggle) {
        deleteTaskToggle.addEventListener("click", () => {
            taskDeleteMode = !taskDeleteMode;

            // 現在表示されている全ての削除ボタンを取得して表示切替
            updateDeleteButtonsVisibility();
        });
    }

    // 削除ボタンの表示状態を更新する関数
    function updateDeleteButtonsVisibility() {
        document.querySelectorAll(".delete-task-btn").forEach((btn) => {
            btn.classList.toggle("hidden", !taskDeleteMode);
        });
    }

    // タスク削除処理（イベントデリゲーション）
    const taskList = document.querySelector(".task-list");
    if (taskList) {
        taskList.addEventListener("click", (e) => {
            const btn = e.target.closest(".delete-task-btn");
            if (!btn) return;

            // イベントの伝播を完全に停止
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const taskId = btn.dataset.taskId;
            const confirmed = confirm("本当にこのタスクを削除しますか？");
            if (!confirmed) return;

            fetch(`/admin/delete_task/${taskId}`, {
                method: "POST",
            })
            .then((res) => {
                if (res.ok) {
                    const taskItem = btn.closest(".task-item");
                    if (taskItem) {
                        taskItem.remove();
                        
                        // グローバルデータからも削除
                        const categoryId = taskItem.dataset.category;
                        if (window.allPosts && window.allPosts[categoryId]) {
                            window.allPosts[categoryId] = window.allPosts[categoryId].filter(
                                task => task.id !== taskId
                            );
                        }
                    }
                } else {
                    alert("削除に失敗しました。");
                }
            })
            .catch(() => alert("通信エラーが発生しました"));
        }, true); // キャプチャフェーズで処理
    }

    // グローバル関数として削除ボタンの表示状態を更新する関数を公開
    window.updateDeleteButtonsVisibility = updateDeleteButtonsVisibility;
    window.getTaskDeleteMode = () => taskDeleteMode;
});
