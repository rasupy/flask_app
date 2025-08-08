// モーダル制御の共通機能
class ModalManager {
    constructor(modalId, formId, cancelBtnId) {
        this.modal = document.getElementById(modalId);
        this.form = document.getElementById(formId);
        this.cancelBtn = document.getElementById(cancelBtnId);
        this.isOpen = false;
        
        this.init();
    }

    init() {
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.close());
        }

        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.close();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    }

    open() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            this.isOpen = true;
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            this.isOpen = false;
        }
        if (this.form) {
            this.form.reset();
        }
    }
}

// グローバルに公開
window.ModalManager = ModalManager;