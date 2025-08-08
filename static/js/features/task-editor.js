// タスク編集機能
document.addEventListener('DOMContentLoaded', () => {
    console.log("タスク編集機能初期化開始");
    
    const modal = document.getElementById('edit-modal');
    const form = document.getElementById('edit-form');
    const cancelBtn = document.getElementById('cancel-edit');
    
    let currentTaskId = null;
    let currentCategoryId = null;
    let originalCategoryId = null;

    if (!modal || !form) {
        console.error("編集モーダルまたはフォームが見つかりません");
        return;
    }

    // タスククリック時の編集機能
    document.addEventListener('click', (e) => {
        console.log("=== クリックイベント詳細 ===");
        console.log("クリック対象:", {
            target: e.target,
            tagName: e.target.tagName,
            className: e.target.className,
            id: e.target.id
        });
        
        // より厳密にタスクアイテムを検索
        let taskItem = null;
        
        // 1. 直接的な検索
        if (e.target.classList.contains('task-item')) {
            taskItem = e.target;
        }
        // 2. 親要素を検索
        else if (e.target.closest) {
            taskItem = e.target.closest('.task-item');
        }
        // 3. 手動で親要素を遡る
        else {
            let element = e.target;
            while (element && element !== document) {
                if (element.classList && element.classList.contains('task-item')) {
                    taskItem = element;
                    break;
                }
                element = element.parentElement;
            }
        }
        
        console.log("タスクアイテム検索結果:", taskItem);
        
        if (taskItem) {
            console.log("タスクアイテム発見:", {
                taskId: taskItem.getAttribute('data-id'),
                taskTitle: taskItem.getAttribute('data-title'),
                element: taskItem
            });
            
            // 削除ボタンのクリックでない場合のみ編集モーダルを開く
            if (!e.target.closest('.delete-task-btn')) {
                console.log("編集モーダル開く条件チェック:");
                console.log("- タスクアイテム:", !!taskItem);
                console.log("- 削除ボタンではない:", !e.target.closest('.delete-task-btn'));
                console.log("- 削除モード:", window.deleteModeManager?.isAnyModeActive());
                console.log("- ドラッグ中:", document.body.classList.contains('task-dragging'));
                
                // 削除モードがアクティブな場合は編集を無効化
                if (window.deleteModeManager && window.deleteModeManager.isAnyModeActive()) {
                    console.log("削除モードがアクティブのため編集無効");
                    return;
                }
                
                // ドラッグ中は編集しない
                if (document.body.classList.contains('task-dragging')) {
                    console.log("ドラッグ中のため編集無効");
                    return;
                }
                
                console.log("編集モーダル開始実行");
                openEditModal(taskItem);
            }
        } else {
            console.log("タスクアイテムが見つかりません - ULクリックの可能性");
            
            // ULがクリックされた場合、その中のタスクアイテムを確認
            if (e.target.classList.contains('task-list')) {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                console.log("UL内クリック座標:", { x, y });
                
                // クリック座標にあるタスクアイテムを探す
                const taskItems = e.target.querySelectorAll('.task-item');
                taskItems.forEach(item => {
                    const itemRect = item.getBoundingClientRect();
                    const itemX = itemRect.left - rect.left;
                    const itemY = itemRect.top - rect.top;
                    
                    if (x >= itemX && x <= itemX + itemRect.width &&
                        y >= itemY && y <= itemY + itemRect.height) {
                        console.log("座標からタスクアイテム発見:", item);
                        
                        if (!window.deleteModeManager?.isAnyModeActive() && 
                            !document.body.classList.contains('task-dragging')) {
                            openEditModal(item);
                        }
                    }
                });
            }
            
            return;
        }
    });

    function openEditModal(item) {
        console.log("編集モーダル開始");
        
        const itemData = {
            id: item.getAttribute('data-id'),
            title: item.getAttribute('data-title'),
            content: item.getAttribute('data-content'),
            category: item.getAttribute('data-category')
        };
        
        console.log("タスクデータ:", itemData);
        
        currentTaskId = itemData.id;
        currentCategoryId = itemData.category;
        originalCategoryId = itemData.category;
        
        const titleInput = form.querySelector('input[name="title"]');
        const contentTextarea = form.querySelector('textarea[name="content"]');
        const categorySelect = form.querySelector('select[name="category_id"]');
        
        if (titleInput) titleInput.value = itemData.title || '';
        if (contentTextarea) contentTextarea.value = itemData.content || '';
        if (categorySelect) categorySelect.value = currentCategoryId;
        
        console.log("フォーム値設定:", {
            title: titleInput?.value,
            content: contentTextarea?.value,
            category: categorySelect?.value
        });
        
        modal.classList.remove('hidden');
        
        // フォーカス
        setTimeout(() => {
            if (titleInput) {
                titleInput.focus();
                titleInput.select();
            }
        }, 100);
        
        console.log("編集モーダル表示完了");
    }

    function closeEditModal() {
        console.log("編集モーダル閉じる");
        modal.classList.add('hidden');
        form.reset();
        currentTaskId = null;
        currentCategoryId = null;
        originalCategoryId = null;
    }

    // キャンセルボタン
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeEditModal();
        });
    }

    // モーダル外クリック
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeEditModal();
        }
    });

    // ESCキー
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeEditModal();
        }
    });

    // フォーム送信
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const newTitle = formData.get('title');
        const newContent = formData.get('content');
        const newCategoryId = formData.get('category_id');
        
        console.log("フォーム送信データ:", {
            taskId: currentTaskId,
            title: newTitle,
            content: newContent,
            categoryId: newCategoryId
        });
        
        try {
            const response = await fetch(`/admin/edit_task/${currentTaskId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newTitle,
                    content: newContent,
                    category_id: newCategoryId
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log("更新成功:", result);
                
                updateTaskInUI(currentTaskId, {
                    title: newTitle,
                    content: newContent,
                    category_id: newCategoryId
                });
                
                closeEditModal();
                
            } else {
                const errorData = await response.json();
                console.error("更新エラー:", errorData);
            }
        } catch (error) {
            console.error("通信エラー:", error);
        }
    });

    function updateTaskInUI(taskId, updatedData) {
        console.log("UI更新開始:", taskId, updatedData);
        
        const allTaskItems = document.querySelectorAll(`[data-id="${taskId}"]`);
        console.log("更新対象タスクアイテム数:", allTaskItems.length);
        
        allTaskItems.forEach(taskItem => {
            taskItem.setAttribute('data-title', updatedData.title);
            taskItem.setAttribute('data-content', updatedData.content);
            taskItem.setAttribute('data-category', updatedData.category_id);
            
            const titleElement = taskItem.querySelector('.task-title');
            if (titleElement) {
                titleElement.textContent = updatedData.title;
            }
        });

        if (window.dataManager) {
            window.dataManager.updateTaskData(taskId, {
                title: updatedData.title,
                content: updatedData.content,
                category_id: updatedData.category_id
            });
        }
    }
    
    console.log("タスク編集機能初期化完了");
});