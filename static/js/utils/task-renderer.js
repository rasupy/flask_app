// タスク描画の共通機能
class TaskRenderer {
    static createTaskElement(task, index = 0) {
        const li = document.createElement("li");
        li.className = "task-item animate";
        li.dataset.id = task.id;
        li.dataset.title = task.title;
        li.dataset.content = task.content || "";
        li.dataset.category = task.category_id;
        li.dataset.status = task.status || "todo";
        
        // 削除ボタンを作成（TODOタスクのみ）
        if (task.status === "todo") {
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-task-btn material-symbols-outlined hidden";
            deleteBtn.dataset.taskId = task.id;
            deleteBtn.textContent = "delete";
            li.appendChild(deleteBtn);
        }
        
        // タスクタイトルを作成
        const titleSpan = document.createElement("span");
        titleSpan.className = "task-title";
        titleSpan.textContent = task.title;
        li.appendChild(titleSpan);
        
        // アニメーション遅延を設定
        li.style.animationDelay = `${index * 0.1}s`;
        
        // アニメーション完了後にクラスを追加
        li.addEventListener('animationend', () => {
            li.classList.add('animation-complete');
        });
        
        return li;
    }

    static renderTaskList(categoryId, taskListElement) {
        if (!taskListElement || !window.dataManager) return;

        console.log("TaskList描画:", categoryId, taskListElement.id);

        // TODOリストの場合はカテゴリー別にフィルタ
        if (taskListElement.id === "todo-tasks") {
            if (!categoryId) {
                taskListElement.innerHTML = ''; // 完全に空にする
                return;
            }

            const tasks = window.dataManager.getTasksForCategory(categoryId);
            const todoTasks = tasks.filter(task => task.status === "todo");
            
            console.log("TODOタスク数:", todoTasks.length);
            
            // リストをクリア
            taskListElement.innerHTML = "";
            
            if (todoTasks.length === 0) {
                // 空の場合は何も表示しない
                return;
            }

            // タスクを描画
            todoTasks.forEach((task, index) => {
                const taskElement = TaskRenderer.createTaskElement(task, index);
                taskListElement.appendChild(taskElement);
            });
        } else {
            // Progress、Archiveリストの場合はステータス別に表示
            const status = taskListElement.dataset.status;
            if (status && window.dataManager.postsByStatus) {
                const statusTasks = window.dataManager.postsByStatus[status] || [];

                console.log(`${status}タスク数:`, statusTasks.length);
                
                // リストをクリア
                taskListElement.innerHTML = "";
                
                if (statusTasks.length === 0) {
                    // 空の場合は何も表示しない
                    return;
                }

                // タスクを描画
                statusTasks.forEach((task, index) => {
                    const taskElement = TaskRenderer.createTaskElement(task, index);
                    taskListElement.appendChild(taskElement);
                });
            }
        }

        // 削除ボタンの表示状態を更新
        if (typeof window.updateDeleteButtonsVisibility === 'function') {
            window.updateDeleteButtonsVisibility();
        }
    }

    // 初期化時にProgressとArchiveリストを描画
    static initializeStatusLists() {
        console.log("ステータスリスト初期化開始");
        
        // Progressリストを描画
        const progressList = document.getElementById('progress-tasks');
        if (progressList) {
            TaskRenderer.renderTaskList(null, progressList);
        }
        
        // Archiveリストを描画
        const archiveList = document.getElementById('archive-tasks');
        if (archiveList) {
            TaskRenderer.renderTaskList(null, archiveList);
        }
        
        console.log("ステータスリスト初期化完了");
    }

    static addTaskToList(task, taskListElement) {
        if (!taskListElement) return;

        const taskElement = TaskRenderer.createTaskElement(task);
        taskListElement.appendChild(taskElement);
    }

    static removeTaskFromList(taskId, taskListElement) {
        if (!taskListElement) return;

        const taskElement = taskListElement.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
        }
    }

    static updateTaskInList(taskId, newStatus) {
        // 既存のタスクを全リストから削除
        const allLists = document.querySelectorAll('.task-list');
        allLists.forEach(list => {
            const taskElement = list.querySelector(`[data-id="${taskId}"]`);
            if (taskElement) {
                taskElement.remove();
            }
        });

        // データマネージャーからタスクを取得
        if (window.dataManager && window.dataManager.postsByStatus) {
            const task = window.dataManager.postsByStatus[newStatus]?.find(t => t.id === taskId);
            if (task) {
                // 新しいステータスのリストに追加
                const targetListId = newStatus === 'todo' ? 'todo-tasks' : 
                                   newStatus === 'progress' ? 'progress-tasks' : 'archive-tasks';
                const targetList = document.getElementById(targetListId);
                if (targetList) {
                    const taskElement = TaskRenderer.createTaskElement(task);
                    targetList.appendChild(taskElement);
                }
            }
        }
    }
}

// グローバルに公開
window.TaskRenderer = TaskRenderer;

// 初期化時にProgressとArchiveリストのみ描画
document.addEventListener('DOMContentLoaded', () => {
    // データマネージャーの読み込みを待ってから初期化
    if (window.dataManager) {
        TaskRenderer.initializeStatusLists();
    } else {
        // データマネージャーが読み込まれていない場合は少し待つ
        setTimeout(() => {
            if (window.dataManager) {
                TaskRenderer.initializeStatusLists();
            }
        }, 100);
    }
    
    console.log("TaskRenderer初期化完了");
});