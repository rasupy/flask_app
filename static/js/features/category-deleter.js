// カテゴリー削除機能
document.addEventListener('DOMContentLoaded', () => {
    console.log("カテゴリー削除機能初期化開始");
    
    // 削除モードマネージャーの初期化
    const deleteModeManager = window.deleteModeManager || new (window.DeleteModeManager || class {
        constructor() {
            console.warn("DeleteModeManagerが見つかりません - フォールバック使用");
        }
        isAnyModeActive() { return false; }
        setCategoryDeleteMode(active) { console.log("カテゴリー削除モード:", active); }
    })();

    const deleteCategoryToggle = document.getElementById('delete-category-toggle');
    let categoryDeleteMode = false;
    let isProcessing = false; // 処理中フラグを追加

    // 削除トグルボタンのイベント
    if (deleteCategoryToggle) {
        deleteCategoryToggle.addEventListener('click', (e) => {
            e.preventDefault();
            
            console.log("カテゴリー削除トグルクリック");
            
            // 編集モーダルが開いている場合は削除モードを無効化
            try {
                const isEditModalOpen = typeof window.getIsEditModalOpen === 'function' 
                    ? window.getIsEditModalOpen() 
                    : false;
                
                if (isEditModalOpen) {
                    console.log("編集モーダルが開いているため削除モードを無効化");
                    alert("編集中は削除モードを使用できません。編集を完了してから再試行してください。");
                    return;
                }
            } catch (error) {
                console.warn("編集モーダル状態の確認でエラー:", error);
            }
            
            // 削除モードの切り替え
            categoryDeleteMode = !categoryDeleteMode;
            console.log("カテゴリー削除モード:", categoryDeleteMode);
            
            // 削除モードマネージャーに状態を通知
            if (deleteModeManager && typeof deleteModeManager.setCategoryDeleteMode === 'function') {
                deleteModeManager.setCategoryDeleteMode(categoryDeleteMode);
            }
            
            // UI更新
            updateDeleteButtonsVisibility();
            updateToggleButtonState();
        });
    } else {
        console.warn("delete-category-toggleボタンが見つかりません");
    }

    // イベント委譲を使用してカテゴリー削除ボタンのイベントを処理
    document.addEventListener('click', (e) => {
        // 削除ボタンがクリックされた場合のみ処理
        if (!e.target.classList.contains('delete-category-btn')) {
            return;
        }
        
        // 処理中の場合は無視
        if (isProcessing) {
            console.log("削除処理中のため、クリックを無視");
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        const categoryItem = e.target.closest('.category-item');
        if (!categoryItem) {
            console.error("カテゴリーアイテムが見つかりません");
            return;
        }
        
        const categoryId = categoryItem.dataset.categoryId;
        const categoryName = categoryItem.querySelector('.category-button')?.textContent?.trim() || 'Unknown';
        
        console.log("カテゴリー削除ボタンクリック:", categoryId, categoryName);
        
        // 確認ダイアログ
        const confirmed = confirm(`カテゴリー "${categoryName}" を削除しますか？\n※このカテゴリーに属するタスクも全て削除されます。`);
        if (confirmed) {
            deleteCategoryFromServer(categoryId, categoryItem);
        }
    });

    // 削除ボタンの表示状態を更新
    function updateDeleteButtonsVisibility() {
        const deleteCategoryBtns = document.querySelectorAll('.delete-category-btn');
        deleteCategoryBtns.forEach(btn => {
            if (categoryDeleteMode) {
                btn.classList.remove('hidden');
                btn.classList.add('visible');
            } else {
                btn.classList.add('hidden');
                btn.classList.remove('visible');
            }
        });
    }

    // トグルボタンの状態を更新
    function updateToggleButtonState() {
        if (deleteCategoryToggle) {
            if (categoryDeleteMode) {
                deleteCategoryToggle.classList.add('active');
                deleteCategoryToggle.style.backgroundColor = '#ff6b6b';
                deleteCategoryToggle.style.color = 'white';
            } else {
                deleteCategoryToggle.classList.remove('active');
                deleteCategoryToggle.style.backgroundColor = '';
                deleteCategoryToggle.style.color = '';
            }
        }
    }

    // サーバーからカテゴリーを削除する関数
    async function deleteCategoryFromServer(categoryId, categoryItem) {
        // 処理中フラグを設定
        if (isProcessing) {
            console.log("既に削除処理が実行中です");
            return;
        }
        
        isProcessing = true;
        console.log("サーバーからカテゴリー削除開始:", categoryId);
        
        try {
            const response = await fetch(`/admin/delete_category/${categoryId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("削除レスポンス:", response.status, response.statusText);

            if (response.ok) {
                const result = await response.json();
                console.log("カテゴリー削除成功:", result);
                
                // 成功メッセージを表示
                if (result.message) {
                    alert(result.message);
                }
                
                // DOMから削除（削除済みの要素を確認）
                if (categoryItem && categoryItem.parentNode) {
                    categoryItem.remove();
                    console.log("DOMからカテゴリーアイテムを削除");
                } else {
                    console.warn("カテゴリーアイテムは既に削除済みです");
                }
                
                // データマネージャーからも削除
                if (window.dataManager && typeof window.dataManager.removeCategory === 'function') {
                    window.dataManager.removeCategory(categoryId);
                }
                
                // 選択中のカテゴリーがこのカテゴリーだった場合、選択を解除
                if (typeof window.getSelectedCategoryId === 'function' && 
                    window.getSelectedCategoryId() === categoryId) {
                    if (typeof window.setSelectedCategoryId === 'function') {
                        window.setSelectedCategoryId(null);
                    }
                }
                
                // TODOリストを更新
                if (window.TaskRenderer) {
                    const todoList = document.getElementById('todo-tasks');
                    if (todoList) {
                        todoList.innerHTML = '';
                    }
                    
                    // Progress, Archiveリストも更新
                    if (window.TaskRenderer.initializeStatusLists) {
                        window.TaskRenderer.initializeStatusLists();
                    }
                }
                
            } else {
                // レスポンスがJSONでない場合の処理
                let errorMessage = '不明なエラー';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (jsonError) {
                    // HTMLエラーページが返された場合
                    if (response.status === 404) {
                        errorMessage = 'カテゴリーが見つかりません（既に削除済みの可能性があります）';
                    } else {
                        errorMessage = `サーバーエラー (${response.status})`;
                    }
                }
                
                console.error("カテゴリー削除エラー:", errorMessage);
                alert('カテゴリーの削除に失敗しました: ' + errorMessage);
            }
        } catch (error) {
            console.error("カテゴリー削除通信エラー:", error);
            alert('通信エラーが発生しました: ' + error.message);
        } finally {
            // 処理中フラグをリセット
            isProcessing = false;
            console.log("カテゴリー削除処理完了");
        }
    }

    // グローバル関数として公開
    window.getCategoryDeleteMode = () => categoryDeleteMode;
    
    window.setCategoryDeleteMode = (mode) => {
        categoryDeleteMode = mode;
        updateDeleteButtonsVisibility();
        updateToggleButtonState();
    };
    
    // 削除ボタン表示更新のグローバル関数（他のスクリプトから呼び出し用）
    window.updateCategoryDeleteButtonsVisibility = updateDeleteButtonsVisibility;
    
    // 初期状態設定
    updateDeleteButtonsVisibility();
    updateToggleButtonState();
    
    console.log("カテゴリー削除機能初期化完了");
});