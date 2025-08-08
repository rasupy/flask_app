// 削除モード制御の共通機能
class DeleteModeManager {
    constructor() {
        this.modes = {
            category: false,
            task: false
        };
        this.callbacks = {};
        this.initialized = false;
        
        // 即座に非表示処理を実行
        this.immediateHide();
        
        // DOMの準備ができたら初期化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    immediateHide() {
        // ページ読み込み中でも即座に実行
        const hideButtons = () => {
            // カテゴリー削除ボタン
            document.querySelectorAll('.delete-category-btn').forEach(btn => {
                btn.remove(); // 完全に削除
            });
            
            // タスク削除ボタン
            document.querySelectorAll('.delete-task-btn').forEach(btn => {
                btn.remove(); // 完全に削除
            });
        };
        
        // 即座に実行
        hideButtons();
        
        // DOM更新監視
        const observer = new MutationObserver(() => {
            // 削除モードがアクティブでない場合は削除ボタンを除去
            if (!this.isAnyModeActive()) {
                hideButtons();
            }
        });
        
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        // 5秒後に監視を停止
        setTimeout(() => observer.disconnect(), 5000);
    }

    init() {
        console.log("DeleteModeManager初期化開始");
        this.hideAllDeleteButtons();
        this.initialized = true;
        console.log("DeleteModeManager初期化完了");
    }

    setMode(type, enabled) {
        console.log(`削除モード設定: ${type} = ${enabled}`);
        
        // 他のモードを無効化
        Object.keys(this.modes).forEach(key => {
            if (key !== type) {
                this.modes[key] = false;
                if (this.callbacks[key]) {
                    this.callbacks[key](false);
                }
            }
        });
        
        this.modes[type] = enabled;
        
        // コールバック実行
        if (this.callbacks[type]) {
            this.callbacks[type](enabled);
        }
        
        // レイアウトクラスの更新
        this.updateLayoutClasses();
    }

    hideAllDeleteButtons() {
        console.log("全削除ボタンを非表示にします");
        
        // カテゴリー削除ボタンを完全に削除
        const categoryDeleteBtns = document.querySelectorAll('.delete-category-btn');
        categoryDeleteBtns.forEach(btn => btn.remove());

        // タスク削除ボタンを完全に削除
        const taskDeleteBtns = document.querySelectorAll('.delete-task-btn');
        taskDeleteBtns.forEach(btn => btn.remove());
        
        console.log(`削除ボタンを削除: カテゴリー${categoryDeleteBtns.length}個, タスク${taskDeleteBtns.length}個`);
    }

    updateLayoutClasses() {
        // カテゴリーアイテムのレイアウトクラス
        document.querySelectorAll('.category-item').forEach(item => {
            if (this.modes.category) {
                item.classList.add('delete-mode');
            } else {
                item.classList.remove('delete-mode');
            }
        });

        // タスクアイテムのレイアウトクラス
        document.querySelectorAll('.task-item').forEach(item => {
            if (this.modes.task) {
                item.classList.add('delete-mode');
            } else {
                item.classList.remove('delete-mode');
            }
        });
    }

    isAnyModeActive() {
        return Object.values(this.modes).some(mode => mode);
    }

    getMode(type) {
        return this.modes[type];
    }

    onModeChange(type, callback) {
        this.callbacks[type] = callback;
    }

    // 新しい要素が追加された時の処理
    onCategoryAdded() {
        setTimeout(() => {
            if (!this.modes.category) {
                this.hideAllDeleteButtons();
            }
            this.updateLayoutClasses();
        }, 50);
    }

    onTaskAdded() {
        setTimeout(() => {
            if (!this.modes.task) {
                this.hideAllDeleteButtons();
            }
            this.updateLayoutClasses();
        }, 50);
    }
}

// 即座に初期化
if (!window.deleteModeManager) {
    window.DeleteModeManager = DeleteModeManager;
    window.deleteModeManager = new DeleteModeManager();
}