// カテゴリー削除機能
document.addEventListener('DOMContentLoaded', () => {
    console.log("カテゴリー削除機能初期化開始");
    
    const deleteCategoryToggle = document.getElementById("delete-category-toggle");

    // 削除ボタンを動的に作成・削除
    function createDeleteButtons() {
        document.querySelectorAll('.category-item').forEach(item => {
            // 既存の削除ボタンがある場合は何もしない
            if (item.querySelector('.delete-category-btn')) return;
            
            const categoryId = item.getAttribute('data-category-id');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-category-btn material-symbols-outlined visible';
            deleteBtn.setAttribute('data-category-id', categoryId);
            deleteBtn.textContent = 'delete';
            
            // カテゴリーボタンの前に挿入
            const categoryButton = item.querySelector('.category-button');
            item.insertBefore(deleteBtn, categoryButton);
        });
    }

    function removeDeleteButtons() {
        document.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.remove();
        });
    }

    // トグルボタンの状態を更新
    function updateToggleButtonState(enabled) {
        if (deleteCategoryToggle) {
            deleteCategoryToggle.textContent = enabled ? 'cancel' : 'delete';
            
            if (enabled) {
                deleteCategoryToggle.classList.add('active');
                deleteCategoryToggle.style.backgroundColor = '#ff6b6b';
                deleteCategoryToggle.style.color = 'white';
                createDeleteButtons(); // 削除ボタンを作成
            } else {
                deleteCategoryToggle.classList.remove('active');
                deleteCategoryToggle.style.backgroundColor = '';
                deleteCategoryToggle.style.color = '';
                removeDeleteButtons(); // 削除ボタンを削除
            }
        }
    }

    // 削除モードマネージャーにコールバックを登録
    if (window.deleteModeManager) {
        window.deleteModeManager.onModeChange('category', updateToggleButtonState);
    }

    // 削除トグルボタンのイベントリスナー
    if (deleteCategoryToggle) {
        deleteCategoryToggle.addEventListener("click", function(e) {
            e.preventDefault();
            
            console.log("カテゴリー削除トグルクリック");
            
            // 編集モーダルが開いている場合は削除モードを無効化
            try {
                const isEditModalOpen = typeof window.getIsEditModalOpen === 'function' 
                    ? window.getIsEditModalOpen() 
                    : false;
                
                if (isEditModalOpen) {
                    console.log("編集モーダルが開いているため削除モードを無効化");
                    return;
                }
            } catch (error) {
                console.warn("編集モーダル状態の確認でエラー:", error);
            }
            
            const currentMode = window.deleteModeManager.getMode('category');
            window.deleteModeManager.setMode('category', !currentMode);
        });
    } else {
        console.warn("delete-category-toggleボタンが見つかりません");
    }

    // カテゴリー削除ボタンのクリックイベント（イベント委譲）
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("delete-category-btn")) {
            const categoryId = e.target.getAttribute("data-category-id");
            const categoryItem = e.target.closest('.category-item');
            const categoryName = categoryItem.querySelector('.category-button').textContent.trim();
            
            // アラート削除 - 即座に削除実行
            deleteCategory(categoryId);
        }
    });

    // カテゴリー削除の実行（エラーハンドリング修正）
    function deleteCategory(categoryId) {
        console.log("カテゴリー削除実行:", categoryId);
        
        // URLパスを修正（/adminを削除）
        fetch(`/delete_category/${categoryId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then(response => {
            console.log("削除レスポンス:", response.status, response.statusText);
            
            if (response.ok) {
                console.log("カテゴリー削除成功");
                
                if (window.dataManager) {
                    window.dataManager.removeCategory(categoryId);
                }
                
                window.deleteModeManager.setMode('category', false);
                location.reload();
            } else {
                console.error("カテゴリー削除失敗:", response.status, response.statusText);
                return response.text().then(text => {
                    console.error("エラー詳細:", text);
                });
            }
        })
        .catch(error => {
            console.error("カテゴリー削除エラー:", error);
        });
    }

    // グローバル関数として公開（他のスクリプトから使用可能）
    window.setCategoryDeleteMode = function(enabled) {
        window.deleteModeManager.setMode('category', enabled);
    };
    
    console.log("カテゴリー削除機能初期化完了");
});