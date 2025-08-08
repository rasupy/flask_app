// タスク移動機能（ドラッグ&ドロップによるステータス変更）
document.addEventListener('DOMContentLoaded', () => {
    console.log("task-mover.js初期化開始");
    
    // Sortable.jsライブラリの存在確認
    if (typeof Sortable === 'undefined') {
        console.error("Sortable.jsライブラリが読み込まれていません");
        return;
    }
    
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
            forceFallback: true,
            fallbackTolerance: 5, // 移動範囲を広げる
            delay: 50, // ドラッグ開始の遅延を短縮
            delayOnTouchStart: true,
            filter: '.delete-task-btn', // 削除ボタンのみフィルタ
            preventOnFilter: false,
            fallbackOnBody: true, // ドラッグ範囲を広げる
            swapThreshold: 0.65, // ドラッグ感度を上げる
            
            onStart: function(evt) {
                console.log("タスクドラッグ開始:", evt.item);
                console.log("要素データ:", evt.item.dataset);
                
                document.body.classList.add('task-dragging');
                
                // 全てのタスクリストにドラッグオーバー用のイベント設定
                document.querySelectorAll('.task-list').forEach(list => {
                    list.addEventListener('dragover', handleDragOver);
                    list.addEventListener('dragleave', handleDragLeave);
                    list.addEventListener('drop', handleDrop);
                });
            },

            onEnd: function(evt) {
                console.log("タスクドラッグ終了");
                document.body.classList.remove('task-dragging');
                
                // ドラッグオーバーイベントをクリーンアップ
                document.querySelectorAll('.task-list').forEach(list => {
                    list.classList.remove('drag-over');
                    list.removeEventListener('dragover', handleDragOver);
                    list.removeEventListener('dragleave', handleDragLeave);
                    list.removeEventListener('drop', handleDrop);
                });

                const taskElement = evt.item;
                const sourceList = evt.from;
                const targetList = evt.to;

                console.log("ドラッグ情報:", {
                    source: sourceList.id,
                    target: targetList.id,
                    element: taskElement
                });

                // 同じリスト内での並び替えの場合
                if (sourceList === targetList) {
                    console.log("同じリスト内での並び替え");
                    return;
                }

                // データ属性を確実に取得
                const taskId = taskElement.getAttribute('data-id');
                const taskTitle = taskElement.getAttribute('data-title') || 
                                taskElement.querySelector('.task-title')?.textContent || 'Unknown';
                const sourceStatus = sourceList.dataset.status;
                const targetStatus = targetList.dataset.status;

                console.log("移動情報詳細:", {
                    taskId,
                    taskTitle,
                    sourceStatus,
                    targetStatus,
                    attributes: Array.from(taskElement.attributes).map(attr => `${attr.name}=${attr.value}`)
                });

                // データ検証（UUID対応 - parseIntを削除）
                if (!taskId || !targetStatus || !sourceStatus) {
                    console.error("必要な情報が不足:", { 
                        taskId, 
                        targetStatus, 
                        sourceStatus,
                        element: taskElement.outerHTML
                    });
                    sourceList.appendChild(taskElement);
                    return;
                }

                // 確認ダイアログを削除 - 即座に移動実行
                console.log("ステータス更新実行");
                updateTaskStatus(taskId, targetStatus, taskElement, sourceStatus);
            }
        });
        
        // ドラッグオーバーハンドラー
        function handleDragOver(e) {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
        }
        
        function handleDragLeave(e) {
            if (!e.currentTarget.contains(e.relatedTarget)) {
                e.currentTarget.classList.remove('drag-over');
            }
        }

        function handleDrop(e) {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
        }
    }

    async function updateTaskStatus(taskId, newStatus, taskElement, oldStatus) {
        console.log("updateTaskStatus実行:", { taskId, newStatus, oldStatus });
        
        try {
            // URLパスを修正（/adminを削除）
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
                console.error("更新エラー詳細:", errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log("更新成功:", result);
            
            taskElement.setAttribute('data-status', newStatus);
            
            if (window.dataManager) {
                window.dataManager.updateTaskStatus(taskId, newStatus);
            }

        } catch (error) {
            console.error("タスクステータス更新エラー:", error);
            
            const originalList = document.querySelector(`[data-status="${oldStatus}"]`);
            if (originalList) {
                originalList.appendChild(taskElement);
            }
        }
    }

    console.log("タスク移動機能初期化完了");
});