// 削除モード制御の共通機能
class DeleteModeManager {
    constructor() {
        this.modes = {
            category: false,
            task: false
        };
        this.callbacks = {};
    }

    setMode(type, enabled) {
        // 他のモードを無効化
        Object.keys(this.modes).forEach(key => {
            if (key !== type) this.modes[key] = false;
        });
        
        this.modes[type] = enabled;
        
        // コールバック実行
        if (this.callbacks[type]) {
            this.callbacks[type](enabled);
        }
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
}

// グローバルに公開
window.DeleteModeManager = DeleteModeManager;