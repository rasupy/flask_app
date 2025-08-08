// タスク削除機能
document.addEventListener("DOMContentLoaded", function() {
    console.log("タスク削除機能初期化");
    
    const deleteTaskToggle = document.getElementById("delete-task-toggle");

    // 削除ボタンを動的に作成・削除
    function createTaskDeleteButtons() {
        console.log("タスク削除ボタンを作成");
        // TaskRendererの機能を使用
        if (window.TaskRenderer) {
            window.TaskRenderer.addDeleteButtonsToTasks();
        }
    }

    function removeTaskDeleteButtons() {
        console.log("タスク削除ボタンを削除");
        // TaskRendererの機能を使用
        if (window.TaskRenderer) {
            window.TaskRenderer.removeDeleteButtonsFromTasks();
        }
    }

    // トグルボタンの状態を更新
    function updateToggleButtonState(enabled) {
        if (deleteTaskToggle) {
            deleteTaskToggle.textContent = enabled ? 'cancel' : 'delete';
            
            if (enabled) {
                deleteTaskToggle.classList.add('active');
                createTaskDeleteButtons(); // 削除ボタンを作成
            } else {
                deleteTaskToggle.classList.remove('active');
                removeTaskDeleteButtons(); // 削除ボタンを削除
            }
        }
    }

    // 削除モードマネージャーにコールバックを登録
    if (window.deleteModeManager) {
        window.deleteModeManager.onModeChange('task', updateToggleButtonState);
    }

    // 削除トグルボタンのイベントリスナー
    if (deleteTaskToggle) {
        deleteTaskToggle.addEventListener("click", function() {
            const currentMode = window.deleteModeManager.getMode('task');
            window.deleteModeManager.setMode('task', !currentMode);
        });
    }

    // タスク削除ボタンのクリックイベント（イベント委譲）
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("delete-task-btn")) {
            const taskId = e.target.getAttribute("data-task-id");
            const taskItem = e.target.closest('.task-item');
            const taskTitle = taskItem.querySelector('.task-title').textContent.trim();
            
            // アラート削除 - 即座に削除実行
            deleteTask(taskId);
        }
    });

    // タスク削除の実行（エラーハンドリング修正）
    function deleteTask(taskId) {
        console.log("タスク削除実行:", taskId);
        
        // URLパスを修正（/adminを削除）
        fetch(`/delete_task/${taskId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then(response => {
            console.log("削除レスポンス:", response.status, response.statusText);
            
            if (response.ok) {
                console.log("タスク削除成功");
                
                const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
                if (taskElement) {
                    taskElement.remove();
                }
                
                if (window.dataManager) {
                    Object.keys(window.dataManager.allPosts).forEach(categoryId => {
                        window.dataManager.removeTaskFromCategory(categoryId, taskId);
                    });
                    
                    Object.keys(window.dataManager.postsByStatus).forEach(status => {
                        window.dataManager.postsByStatus[status] = window.dataManager.postsByStatus[status].filter(
                            task => String(task.id) !== String(taskId)
                        );
                    });
                }
                
                console.log("タスク削除完了:", taskId);
            } else {
                console.error("タスク削除失敗:", response.status, response.statusText);
                return response.text().then(text => {
                    console.error("エラー詳細:", text);
                });
            }
        })
        .catch(error => {
            console.error("タスク削除エラー:", error);
        });
    }

    // グローバル関数として公開
    window.setTaskDeleteMode = function(enabled) {
        window.deleteModeManager.setMode('task', enabled);
    };
});