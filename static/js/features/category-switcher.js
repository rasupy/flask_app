// カテゴリー切り替え機能
document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.category-button');
    const taskList = document.querySelector('#todo-tasks');
    
    let selectedCategoryId = null;

    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();

            // アクティブ状態の更新
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // カテゴリーIDを取得
            selectedCategoryId = button.closest('.category-item').dataset.categoryId;
            
            // タスクリストにカテゴリーIDを設定
            if (taskList) {
                taskList.dataset.currentCategoryId = selectedCategoryId;
            }
            
            console.log("カテゴリー切り替え:", selectedCategoryId);
            
            // TODOタスクリストを更新（カテゴリー別にフィルタ）
            if (window.TaskRenderer && taskList) {
                window.TaskRenderer.renderTaskList(selectedCategoryId, taskList);
            }
        });
    });

    // 初期化処理：何も表示しない状態
    function initializeEmptyState() {
        console.log("初期状態: カテゴリー未選択");
        
        // 全てのカテゴリーボタンからactiveクラスを削除
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        
        // selectedCategoryIdをnullに設定
        selectedCategoryId = null;
        
        // TODOリストを空に設定（メッセージなし）
        if (taskList) {
            taskList.dataset.currentCategoryId = '';
            taskList.innerHTML = ''; // 完全に空にする
        }
        
        console.log("初期化完了: 空の状態");
    }

    // 初期化実行
    initializeEmptyState();

    // グローバル関数として公開
    window.getSelectedCategoryId = () => selectedCategoryId;
    window.setSelectedCategoryId = (id) => {
        selectedCategoryId = id;
        
        if (taskList) {
            taskList.dataset.currentCategoryId = id || '';
        }
        
        // ボタンのアクティブ状態も更新
        categoryButtons.forEach(btn => {
            const categoryId = btn.closest('.category-item').dataset.categoryId;
            btn.classList.toggle('active', categoryId === id);
        });
        
        // タスクリストを更新
        if (id && window.TaskRenderer) {
            window.TaskRenderer.renderTaskList(id, taskList);
        } else if (taskList) {
            taskList.innerHTML = ''; // 空にする（メッセージなし）
        }
    };
    
    console.log("カテゴリースイッチャー初期化完了");
});