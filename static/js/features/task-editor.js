// モーダル管理クラス
class ModalManager {
    constructor(modalId, formId, cancelBtnId) {
        this.modal = document.getElementById(modalId);
        this.form = document.getElementById(formId);
        this.cancelBtn = document.getElementById(cancelBtnId);
        this._isOpen = false; // 内部状態を追跡
        
        if (!this.modal) {
            console.warn(`Modal element with id '${modalId}' not found`);
            return;
        }
        
        if (!this.form) {
            console.warn(`Form element with id '${formId}' not found`);
        }
        
        if (!this.cancelBtn) {
            console.warn(`Cancel button with id '${cancelBtnId}' not found`);
        }
        
        this.init();
    }
    
    init() {
        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._isOpen) {
                this.close();
            }
        });
        
        // モーダル外クリックで閉じる
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal && this._isOpen) {
                    this.close();
                }
            });
        }
        
        // キャンセルボタンでモーダルを閉じる
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }
    }
    
    open() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            this._isOpen = true;
            console.log("モーダルオープン:", this.modal.id);
            
            // フォーカス管理
            const firstInput = this.form?.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    close() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            this._isOpen = false;
            console.log("モーダルクローズ:", this.modal.id);
            
            // フォームリセット
            if (this.form) {
                this.form.reset();
            }
        }
    }
    
    // モーダルが開いているかどうかを返す
    isOpen() {
        return this._isOpen;
    }
    
    // レガシー互換性のため
    get isModalOpen() {
        return this._isOpen;
    }
}

// タスク編集機能
document.addEventListener('DOMContentLoaded', () => {
    console.log("タスク編集機能初期化開始");
    
    // ModalManagerの存在確認
    if (typeof ModalManager === 'undefined') {
        console.error("ModalManagerが読み込まれていません");
        return;
    }
    
    const modalManager = new ModalManager('edit-modal', 'edit-form', 'cancel-edit');
    const deleteModeManager = window.deleteModeManager || new DeleteModeManager();
    
    let currentTaskId = null;
    let currentCategoryId = null;
    let originalCategoryId = null; // 元のカテゴリーIDを保存

    // 複数のタスクリストに対応
    const taskLists = document.querySelectorAll('.task-list');
    taskLists.forEach(taskList => {
        if (taskList) {
            taskList.addEventListener('click', (e) => {
                // 削除モード中は編集を無効化
                if (deleteModeManager.isAnyModeActive()) return;

                const taskItem = e.target.closest('.task-item');
                if (taskItem && !e.target.closest('.delete-task-btn')) {
                    openEditModal(taskItem);
                }
            });
        }
    });

    function openEditModal(item) {
        console.log("編集モーダル開く:", item.dataset);
        
        currentTaskId = item.dataset.id;
        currentCategoryId = item.dataset.category;
        originalCategoryId = item.dataset.category; // 元のカテゴリーを保存
        
        const form = modalManager.form;
        if (!form) {
            console.error("編集フォームが見つかりません");
            return;
        }
        
        const titleInput = form.querySelector('input[name="title"]');
        const contentTextarea = form.querySelector('textarea[name="content"]');
        const categorySelect = form.querySelector('select[name="category_id"]');
        
        // フォームに値を設定
        if (titleInput) titleInput.value = item.dataset.title || '';
        if (contentTextarea) contentTextarea.value = item.dataset.content || '';
        if (categorySelect) categorySelect.value = currentCategoryId;
        
        console.log("フォーム値設定:", {
            title: titleInput?.value,
            content: contentTextarea?.value,
            category: categorySelect?.value
        });
        
        // モーダル状態をグローバルに設定
        if (typeof window.setIsEditModalOpen === 'function') {
            window.setIsEditModalOpen(true);
        }
        
        modalManager.open();
    }

    // フォーム送信処理
    if (modalManager.form) {
        modalManager.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(modalManager.form);
            const newTitle = formData.get('title');
            const newContent = formData.get('content');
            const newCategoryId = formData.get('category_id');
            
            console.log("送信データ:", {
                title: newTitle,
                content: newContent,
                category: newCategoryId,
                taskId: currentTaskId
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
                    
                    // UI更新
                    await updateTaskInUI(currentTaskId, {
                        title: newTitle,
                        content: newContent,
                        category_id: newCategoryId
                    });
                    
                    // モーダル閉じる
                    closeEditModal();
                    
                } else {
                    const errorData = await response.json();
                    console.error("更新エラー:", errorData);
                    alert('更新に失敗しました: ' + (errorData.error || '不明なエラー'));
                }
            } catch (error) {
                console.error("通信エラー:", error);
                alert('通信エラーが発生しました: ' + error.message);
            }
        });
    }

    function closeEditModal() {
        modalManager.close();
        
        // モーダル状態をリセット
        if (typeof window.setIsEditModalOpen === 'function') {
            window.setIsEditModalOpen(false);
        }
        
        // 変数をリセット
        currentTaskId = null;
        currentCategoryId = null;
        originalCategoryId = null;
    }

    // キャンセルボタンの処理も更新
    if (modalManager.cancelBtn) {
        modalManager.cancelBtn.addEventListener('click', () => {
            closeEditModal();
        });
    }

    async function updateTaskInUI(taskId, updatedData) {
        console.log("UI更新開始:", taskId, updatedData);
        
        // 全てのタスクリストから該当タスクを検索
        const allTaskItems = document.querySelectorAll(`[data-id="${taskId}"]`);
        
        allTaskItems.forEach(taskItem => {
            // データセットを更新
            taskItem.dataset.title = updatedData.title;
            taskItem.dataset.content = updatedData.content;
            taskItem.dataset.category = updatedData.category_id;
            
            // タイトル表示を更新
            const titleSpan = taskItem.querySelector('.task-title');
            if (titleSpan) {
                titleSpan.textContent = updatedData.title;
            }
            
            console.log("UI更新完了:", taskItem.dataset);
        });

        // データマネージャーを更新
        if (window.dataManager) {
            const updated = window.dataManager.updateTaskData(taskId, {
                title: updatedData.title,
                content: updatedData.content,
                category_id: updatedData.category_id
            });
            console.log("データマネージャー更新:", updated);
        }

        // カテゴリーが変更された場合の処理
        if (originalCategoryId && updatedData.category_id !== originalCategoryId) {
            console.log("カテゴリー変更を検出:", originalCategoryId, "→", updatedData.category_id);
            
            // 現在表示中のカテゴリーを確認
            const currentSelectedCategoryId = typeof window.getSelectedCategoryId === 'function' 
                ? window.getSelectedCategoryId() 
                : null;
            
            // TODOリストを再描画（現在選択中のカテゴリーのタスクのみ表示）
            if (currentSelectedCategoryId && window.TaskRenderer) {
                const todoList = document.getElementById('todo-tasks');
                if (todoList) {
                    window.TaskRenderer.renderTaskList(currentSelectedCategoryId, todoList);
                }
            }
        }
    }

    // グローバル関数として公開（安全なチェック付き）
    window.openTaskEditModal = openEditModal;
    
    window.getIsEditModalOpen = () => {
        try {
            if (modalManager && typeof modalManager.isOpen === 'function') {
                return modalManager.isOpen();
            } else if (modalManager && modalManager.isModalOpen !== undefined) {
                return modalManager.isModalOpen;
            } else {
                console.warn("modalManager.isOpen()が利用できません");
                return false;
            }
        } catch (error) {
            console.error("getIsEditModalOpen エラー:", error);
            return false;
        }
    };
    
    window.setIsEditModalOpen = (isOpen) => {
        // 将来的な拡張用
        console.log("編集モーダル状態設定:", isOpen);
    };
    
    console.log("タスク編集機能初期化完了");
});