// タスク移動機能（ドラッグ&ドロップによるステータス変更）
document.addEventListener('DOMContentLoaded', () => {
    console.log("task-mover.js初期化開始");
    
    // Sortable.jsライブラリの存在確認
    if (typeof Sortable === 'undefined') {
        console.error("Sortable.jsライブラリが読み込まれていません");
        return;
    }
    
    // ステータス定義
    const STATUS_LABELS = {
        'todo': 'TODO',
        'progress': 'Progress', 
        'archive': 'Archive'
    };

    const STATUS_LIST_MAP = {
        'todo': 'todo-tasks',
        'progress': 'progress-tasks',
        'archive': 'archive-tasks'
    };

    // 各ステータスリストにSortable.jsを適用
    initializeStatusLists();

    function initializeStatusLists() {
        Object.keys(STATUS_LIST_MAP).forEach(status => {
            const listElement = document.getElementById(STATUS_LIST_MAP[status]);
            console.log(`リスト要素確認 - ${status}:`, listElement);
            
            if (listElement) {
                createSortableForStatusList(listElement, status);
            } else {
                console.warn(`リスト要素が見つかりません: ${STATUS_LIST_MAP[status]}`);
            }
        });
    }

    function createSortableForStatusList(listElement, status) {
        console.log(`Sortable作成中: ${status}`);
        
        const sortableInstance = Sortable.create(listElement, {
            group: 'task-status',
            animation: 200,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            
            onStart: function(evt) {
                console.log("タスクドラッグ開始:", evt.item);
                document.body.classList.add('task-dragging');
            },

            onEnd: function(evt) {
                console.log("タスクドラッグ終了");
                document.body.classList.remove('task-dragging');

                const taskElement = evt.item;
                const sourceList = evt.from;
                const targetList = evt.to;

                console.log("ソース:", sourceList.id, "ターゲット:", targetList.id);

                // 同じリスト内での並び替えの場合
                if (sourceList === targetList) {
                    console.log("同じリスト内での並び替え");
                    return;
                }

                // 異なるステータス間の移動
                const taskId = taskElement.dataset.id;
                const taskTitle = taskElement.dataset.title;
                const sourceStatus = sourceList.dataset.status;
                const targetStatus = targetList.dataset.status;

                console.log("移動情報:", {
                    taskId,
                    taskTitle,
                    sourceStatus,
                    targetStatus
                });

                if (!taskId || !targetStatus) {
                    console.error("必要な情報が不足しています");
                    sourceList.appendChild(taskElement);
                    return;
                }

                // 確認ダイアログ
                const confirmed = confirm(
                    `"${taskTitle}"を${STATUS_LABELS[sourceStatus]}から${STATUS_LABELS[targetStatus]}に移動しますか？`
                );

                if (!confirmed) {
                    console.log("移動をキャンセル");
                    sourceList.appendChild(taskElement);
                    return;
                }

                console.log("ステータス更新実行");
                updateTaskStatus(taskId, targetStatus, taskElement, sourceStatus);
            }
        });

        console.log(`Sortable初期化完了: ${status}`, sortableInstance);
    }

    async function updateTaskStatus(taskId, newStatus, taskElement, oldStatus) {
        console.log("updateTaskStatus実行:", { taskId, newStatus, oldStatus });
        
        try {
            const response = await fetch(`/update_task_status/${taskId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            console.log("レスポンス:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log("更新成功:", result);
            
            // タスク要素のステータスを更新
            taskElement.dataset.status = newStatus;
            
            // 移動アニメーション
            taskElement.classList.add('task-moved');
            setTimeout(() => {
                taskElement.classList.remove('task-moved');
            }, 800);
            
            // データマネージャー更新
            if (window.dataManager) {
                window.dataManager.updateTaskStatus(taskId, newStatus);
            }

        } catch (error) {
            console.error("タスクステータス更新エラー:", error);
            alert("タスクの移動に失敗しました: " + error.message);
            
            // エラー時は元のリストに戻す
            const originalList = document.querySelector(`[data-status="${oldStatus}"]`);
            if (originalList) {
                originalList.appendChild(taskElement);
            }
        }
    }

    console.log("タスク移動機能初期化完了");
});