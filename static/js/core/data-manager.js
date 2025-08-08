// データ管理とアニメーション制御
class DataManager {
    constructor() {
        this.allPosts = {};
        this.postsByStatus = {};
        this.init();
    }

    init() {
        this.loadInitialData();
        this.setupCategoryAnimations();
    }

    loadInitialData() {
        try {
            // カテゴリー別データ（TODOのみ）
            const categoryData = document.getElementById("all-posts-data")?.textContent;
            if (categoryData) {
                this.allPosts = JSON.parse(categoryData);
            }

            // ステータス別データ（全ステータス）
            const statusData = document.getElementById("posts-by-status-data")?.textContent;
            if (statusData) {
                this.postsByStatus = JSON.parse(statusData);
                
                // allPostsにステータス別データもマージ
                Object.keys(this.postsByStatus).forEach(status => {
                    this.postsByStatus[status].forEach(task => {
                        const categoryId = task.category_id;
                        if (!this.allPosts[categoryId]) {
                            this.allPosts[categoryId] = [];
                        }
                        
                        // 重複チェック
                        const exists = this.allPosts[categoryId].some(t => t.id === task.id);
                        if (!exists) {
                            this.allPosts[categoryId].push(task);
                        }
                    });
                });
            }

            window.allPosts = this.allPosts; // グローバルに公開
            
            console.log("データロード完了:", {
                categories: Object.keys(this.allPosts).length,
                todo: this.postsByStatus.todo?.length || 0,
                progress: this.postsByStatus.progress?.length || 0,
                archive: this.postsByStatus.archive?.length || 0
            });
            
        } catch (error) {
            console.error("データの読み込みに失敗しました:", error);
            this.allPosts = {};
            this.postsByStatus = { todo: [], progress: [], archive: [] };
        }
    }

    setupCategoryAnimations() {
        const categoryItems = document.querySelectorAll(".category-item");
        categoryItems.forEach((item, index) => {
            item.classList.add("animate");
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    getTasksForCategory(categoryId) {
        return this.allPosts[categoryId] || [];
    }

    getTasksByStatus(status) {
        return this.postsByStatus[status] || [];
    }

    updateTaskStatus(taskId, newStatus) {
        let updated = false;
        
        // allPostsのデータを更新
        Object.keys(this.allPosts).forEach(categoryId => {
            const tasks = this.allPosts[categoryId];
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                const oldStatus = tasks[taskIndex].status;
                tasks[taskIndex].status = newStatus;
                
                // postsByStatusも更新
                if (this.postsByStatus[oldStatus]) {
                    const oldStatusIndex = this.postsByStatus[oldStatus].findIndex(t => t.id === taskId);
                    if (oldStatusIndex !== -1) {
                        const task = this.postsByStatus[oldStatus].splice(oldStatusIndex, 1)[0];
                        task.status = newStatus;
                        if (!this.postsByStatus[newStatus]) {
                            this.postsByStatus[newStatus] = [];
                        }
                        this.postsByStatus[newStatus].push(task);
                    }
                }
                
                updated = true;
                console.log(`データマネージャー: タスク${taskId}のステータスを${oldStatus}→${newStatus}に更新`);
            }
        });

        return updated;
    }

    addTaskToCategory(categoryId, task) {
        if (!this.allPosts[categoryId]) {
            this.allPosts[categoryId] = [];
        }
        this.allPosts[categoryId].push(task);
    }

    removeTaskFromCategory(categoryId, taskId) {
        if (this.allPosts[categoryId]) {
            this.allPosts[categoryId] = this.allPosts[categoryId].filter(
                task => task.id !== taskId
            );
        }
    }

    updateTaskInCategory(oldCategoryId, newCategoryId, taskData) {
        // 古いカテゴリから削除
        this.removeTaskFromCategory(oldCategoryId, taskData.id);
        // 新しいカテゴリに追加
        this.addTaskToCategory(newCategoryId, taskData);
    }

    updateTaskData(taskId, newData) {
        let updated = false;
        
        // allPostsのデータを更新
        Object.keys(this.allPosts).forEach(categoryId => {
            const tasks = this.allPosts[categoryId];
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                const task = tasks[taskIndex];
                
                // データを更新
                if (newData.title !== undefined) task.title = newData.title;
                if (newData.content !== undefined) task.content = newData.content;
                if (newData.category_id !== undefined) {
                    // カテゴリーが変更された場合は移動
                    if (task.category_id !== newData.category_id) {
                        // 元のカテゴリーから削除
                        tasks.splice(taskIndex, 1);
                        
                        // 新しいカテゴリーに追加
                        task.category_id = newData.category_id;
                        if (!this.allPosts[newData.category_id]) {
                            this.allPosts[newData.category_id] = [];
                        }
                        this.allPosts[newData.category_id].push(task);
                    } else {
                        task.category_id = newData.category_id;
                    }
                }
                
                updated = true;
                console.log(`データマネージャー: タスク${taskId}のデータを更新`, task);
            }
        });

        // postsByStatusのデータも更新
        if (this.postsByStatus) {
            Object.keys(this.postsByStatus).forEach(status => {
                const tasks = this.postsByStatus[status];
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    const task = tasks[taskIndex];
                    
                    if (newData.title !== undefined) task.title = newData.title;
                    if (newData.content !== undefined) task.content = newData.content;
                    if (newData.category_id !== undefined) task.category_id = newData.category_id;
                }
            });
        }

        return updated;
    }
}

// グローバルに公開
window.DataManager = DataManager;
window.dataManager = new DataManager();