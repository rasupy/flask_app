// カテゴリーをドラッグで並べ替えする機能
document.addEventListener("DOMContentLoaded", () => {
    const categoryList = document.getElementById("category-list");

    Sortable.create(categoryList, {
        animation: 150,
        onEnd: function () {
            // 並び替え後のID順を取得
            const newOrder = [];
            document.querySelectorAll(".category-item").forEach(item => {
                newOrder.push(item.dataset.categoryId);
            });

            // サーバーに送信
            fetch("/update_category_order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ category_ids: newOrder })
            }).then(res => {
                if (!res.ok) {
                    console.error("順序の更新に失敗しました");
                }
            });
        }
    });
});

// タスクをドラッグで並べ替え、移動する機能
document.addEventListener("DOMContentLoaded", () => {
    const taskColumns = document.querySelectorAll(".task-list");

    taskColumns.forEach(column => {
        Sortable.create(column, {
            group: "tasks",
            animation: 150,
            onEnd: function (evt) {
                const newStatus = evt.to.dataset.status;
                const taskElements = evt.to.querySelectorAll(".task-item");
                const newOrder = [];

                taskElements.forEach((el, index) => {
                    newOrder.push({
                        id: el.dataset.taskId,
                        sort_order: index,
                        status: newStatus
                    });
                });

                // サーバーへ送信
                fetch("/update_task_order", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ tasks: newOrder })
                }).then(res => {
                    if (!res.ok) {
                        console.error("タスクの更新に失敗しました");
                    }
                });
            }
        });
    });
});
