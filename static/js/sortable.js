// 並び替え、移動機能
document.addEventListener("DOMContentLoaded", () => {
    // カテゴリー並び替え
    const categoryList = document.getElementById("category-list");

    if (categoryList) {
        Sortable.create(categoryList, {
            animation: 150,
            onEnd: function () {
                const newOrder = [];
                document.querySelectorAll(".category-item").forEach(item => {
                    newOrder.push(item.dataset.categoryId);
                });

                fetch("/update_category_order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ category_ids: newOrder })
                }).then(res => {
                    if (!res.ok) {
                        console.error("順序の更新に失敗しました");
                    }
                });
            }
        });
    }

    // タスク並び替えと移動
    document.querySelectorAll(".task-list").forEach(list => {
        Sortable.create(list, {
            group: "tasks",
            animation: 150,
            onEnd: function () {
                sendTaskOrderUpdate();
            }
        });
    });
});