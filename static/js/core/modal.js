// モーダル管理の汎用クラス
class ModalManager {
    constructor(modalId, formId, cancelBtnId) {
        this.modal = document.getElementById(modalId);
        this.form = document.getElementById(formId);
        this.cancelBtn = document.getElementById(cancelBtnId);
        this.isModalOpen = false;
        
        if (!this.modal) {
            console.error(`Modal element with ID "${modalId}" not found`);
        }
        if (!this.form) {
            console.error(`Form element with ID "${formId}" not found`);
        }
        if (!this.cancelBtn) {
            console.error(`Cancel button element with ID "${cancelBtnId}" not found`);
        }
        
        this.init();
    }
    
    init() {
        // キャンセルボタンのイベントリスナー
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }
        
        // モーダル外クリックで閉じる
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
        
        // ESCキーで閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.close();
            }
        });
    }
    
    open() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            this.isModalOpen = true;
            console.log(`Modal opened: ${this.modal.id}`);
        }
    }
    
    close() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            this.isModalOpen = false;
            console.log(`Modal closed: ${this.modal.id}`);
        }
        
        // フォームをリセット
        if (this.form) {
            this.form.reset();
        }
    }
    
    // isOpenメソッドを追加
    isOpen() {
        return this.isModalOpen;
    }
    
    // モーダルの状態を取得するメソッド
    getState() {
        return {
            isOpen: this.isModalOpen,
            modalId: this.modal?.id || null,
            formId: this.form?.id || null
        };
    }
}

// グローバルに公開
window.ModalManager = ModalManager;

console.log("Modal manager initialized");