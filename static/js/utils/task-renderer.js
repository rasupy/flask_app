// タスク描画の共通機能
class TaskRenderer {
    static createTaskElement(task, index = 0) {
        const li = document.createElement("li");
        li.className = "task-item";
        li.setAttribute("data-id", task.id);
        li.setAttribute("data-title", task.title);
        li.setAttribute("data-content", task.content || "");
        li.setAttribute("data-category", task.category_id);
        li.setAttribute("data-status", task.status || "todo");
        
        // シンプルなタイトル表示のみ
        const titleSpan = document.createElement("span");
        titleSpan.className = "task-title";
        titleSpan.textContent = task.title;
        
        li.appendChild(titleSpan);
        
        console.log("タスク要素作成:", {
            id: task.id,
            title: task.title,
            element: li,
            clickable: true,
            outerHTML: li.outerHTML
        });
        
        return li;
    }

    static renderTaskList(categoryId, taskListElement) {
        if (!taskListElement || !window.dataManager) return;

        console.log("TaskList描画:", categoryId, taskListElement.id);

        // TODOリストの場合はカテゴリー別にフィルタ
        if (taskListElement.id === "todo-tasks") {
            if (!categoryId) {
                taskListElement.innerHTML = '';
                return;
            }

            const tasks = window.dataManager.getTasksForCategory(categoryId);
            const todoTasks = tasks.filter(task => task.status === "todo");
            
            console.log("TODOタスク数:", todoTasks.length);
            
            // リストをクリア
            taskListElement.innerHTML = "";
            
            if (todoTasks.length === 0) {
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
                    return;
                }

                // タスクを描画
                statusTasks.forEach((task, index) => {
                    const taskElement = TaskRenderer.createTaskElement(task, index);
                    taskListElement.appendChild(taskElement);
                });
            }
        }

        // 削除モードがアクティブな場合のみ削除ボタンを追加
        if (window.deleteModeManager && window.deleteModeManager.getMode('task')) {
            setTimeout(() => {
                TaskRenderer.addDeleteButtonsToTasks();
            }, 50);
        }
    }

    // 削除ボタンを動的に追加する機能を修正
    static addDeleteButtonsToTasks() {
        document.querySelectorAll('.task-item').forEach(taskItem => {
            // 既に削除ボタンがある場合はスキップ
            if (taskItem.querySelector('.delete-task-btn')) return;
            
            const taskId = taskItem.getAttribute('data-id');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-task-btn material-symbols-outlined visible';
            deleteBtn.setAttribute('data-task-id', taskId);
            deleteBtn.textContent = 'delete';
            
            // タスクタイトルの前（最初）に挿入
            taskItem.insertBefore(deleteBtn, taskItem.firstChild);
        });
    }

    // 削除ボタンを削除する機能
    static removeDeleteButtonsFromTasks() {
        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.remove();
        });
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

        // UUIDの場合も文字列として比較
        const taskElement = taskListElement.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
        }
    }

    static updateTaskInList(taskId, newStatus) {
        // 既存のタスクを全リストから削除
        const allLists = document.querySelectorAll('.task-list');
        allLists.forEach(list => {
            // UUIDの場合も文字列として比較
            const taskElement = list.querySelector(`[data-id="${taskId}"]`);
            if (taskElement) {
                taskElement.remove();
            }
        });

        // データマネージャーからタスクを取得
        if (window.dataManager && window.dataManager.postsByStatus) {
            // UUIDの場合は文字列として比較
            const task = window.dataManager.postsByStatus[newStatus]?.find(t => String(t.id) === String(taskId));
            if (task) {
                // 新しいステータスのリストに追加
                const targetListId = newStatus === 'todo' ? 'todo-tasks' : 
                                   newStatus === 'progress' ? 'progress-tasks' : 'archive-tasks';
                const targetList = document.getElementById(targetListId);
                if (targetList) {
                    TaskRenderer.addTaskToList(task, targetList);
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