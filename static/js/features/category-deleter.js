// カテゴリー削除機能
document.addEventListener('DOMContentLoaded', () => {
    
    // 削除モードマネージャーの初期化
    const deleteModeManager = window.deleteModeManager || new (window.DeleteModeManager || class {
        constructor() { this.modes = {}; }
        setMode(type, enabled) { this.modes[type] = enabled; }
        getMode(type) { return this.modes[type] || false; }
        isAnyModeActive() { return Object.values(this.modes).some(m => m); }
    })();

    const deleteCategoryToggle = document.getElementById('delete-category-toggle');
    const deleteCategoryBtns = document.querySelectorAll('.delete-category-btn');
    let categoryDeleteMode = false;

    // 削除トグルボタンのイベント
    if (deleteCategoryToggle) {
        deleteCategoryToggle.addEventListener('click', () => {
            console.log("カテゴリー削除トグルクリック");
            
            // 編集モーダルが開いている場合は削除モードに切り替えない
            if (typeof window.getIsEditModalOpen === 'function' && window.getIsEditModalOpen()) {
                alert("編集モーダルを閉じてからカテゴリー削除モードに切り替えてください");
                return;
            }

            categoryDeleteMode = !categoryDeleteMode;
            console.log("カテゴリー削除モード:", categoryDeleteMode);
            
            // 削除ボタンの表示/非表示を切り替え
            deleteCategoryBtns.forEach(btn => {
                btn.classList.toggle('hidden', !categoryDeleteMode);
            });
            
            // トグルボタンのテキストを変更
            deleteCategoryToggle.textContent = categoryDeleteMode ? 'cancel' : 'delete';
            
            // 削除モードマネージャーに状態を登録
            deleteModeManager.setMode('category', categoryDeleteMode);
            
            // カテゴリー削除モード中はタスク削除モードを無効化
            if (categoryDeleteMode && typeof window.getTaskDeleteMode === 'function' && window.getTaskDeleteMode()) {
                const taskToggle = document.getElementById('delete-task-toggle');
                if (taskToggle) {
                    taskToggle.click(); // タスク削除モードを終了
                }
            }
        });
    } else {
        console.warn("delete-category-toggle button not found");
    }

    // カテゴリー削除ボタンのイベント
    deleteCategoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const categoryId = btn.dataset.categoryId;
            const categoryItem = btn.closest('.category-item');
            const categoryNameElement = categoryItem?.querySelector('.category-name');
            const categoryName = categoryNameElement?.textContent || 'このカテゴリー';
            
            console.log("カテゴリー削除ボタンクリック:", categoryId, categoryName);
            
            const confirmed = confirm(`カテゴリー「${categoryName}」を削除しますか？\n※このカテゴリーに属する全てのタスクも削除されます。`);
            if (!confirmed) return;

            deleteCategoryFromServer(categoryId, categoryItem);
        });
    });

    // サーバーからカテゴリーを削除する関数
    function deleteCategoryFromServer(categoryId, categoryItem) {
        console.log("カテゴリー削除開始:", categoryId);
        
        fetch(`/admin/delete_category/${categoryId}`, {
            method: 'POST'
        })
        .then(response => {
            console.log("削除レスポンス:", response.status);
            
            if (response.ok) {
                // DOM要素を削除
                if (categoryItem) {
                    categoryItem.remove();
                }
                
                // グローバルデータからも削除
                if (window.dataManager && window.dataManager.allPosts) {
                    delete window.dataManager.allPosts[categoryId];
                }
                
                // 削除モードを解除
                categoryDeleteMode = false;
                deleteCategoryBtns.forEach(b => b.classList.add('hidden'));
                if (deleteCategoryToggle) {
                    deleteCategoryToggle.textContent = 'delete';
                }
                deleteModeManager.setMode('category', false);
                
                // 現在選択されているカテゴリーが削除された場合の処理
                if (typeof window.getSelectedCategoryId === 'function' && 
                    window.getSelectedCategoryId() === categoryId) {
                    
                    // 最初のカテゴリーを選択
                    const firstCategory = document.querySelector('.category-button');
                    if (firstCategory) {
                        firstCategory.click();
                    } else {
                        // カテゴリーがない場合はタスクリストをクリア
                        const taskList = document.querySelector('.task-list');
                        if (taskList) {
                            taskList.innerHTML = '<li class="no-tasks">カテゴリーがありません</li>';
                        }
                    }
                }
                
                console.log("カテゴリーが正常に削除されました");
                
            } else {
                response.text().then(errorMsg => {
                    alert('削除に失敗しました: ' + errorMsg);
                });
            }
        })
        .catch(error => {
            console.error("カテゴリー削除エラー:", error);
            alert('通信エラーが発生しました。');
        });
    }

    // グローバル関数として公開
    window.getCategoryDeleteMode = () => categoryDeleteMode;
    
    console.log("カテゴリー削除機能初期化完了");
    console.log("削除トグルボタン:", deleteCategoryToggle);
    console.log("削除ボタン数:", deleteCategoryBtns.length);
});