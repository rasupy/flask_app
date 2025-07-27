// カテゴリーのドラッグで並べ替えする機能
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

