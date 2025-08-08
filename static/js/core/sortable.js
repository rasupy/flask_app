// 並び替え機能（カテゴリー並び替えのみ）
document.addEventListener("DOMContentLoaded", () => {
    console.log("Sortable.js初期化開始");
    
    // Sortable.jsライブラリの存在確認
    if (typeof Sortable === 'undefined') {
        console.error("Sortable.jsライブラリが読み込まれていません");
        return;
    }

    // カテゴリー並び替え
    const categoryList = document.getElementById("category-list");
    console.log("カテゴリーリスト要素:", categoryList);

    if (categoryList) {
        const categorySortable = Sortable.create(categoryList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            
            onStart: function(evt) {
                console.log("カテゴリードラッグ開始:", evt.item);
            },
            
            onEnd: function(evt) {
                console.log("カテゴリードラッグ終了");
                
                const newOrder = [];
                document.querySelectorAll(".category-item").forEach(item => {
                    const categoryId = item.dataset.categoryId;
                    if (categoryId) {
                        newOrder.push(categoryId);
                    }
                });

                console.log("新しいカテゴリー順序:", newOrder);

                if (newOrder.length > 0) {
                    fetch("/update_category_order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ category_ids: newOrder })
                    })
                    .then(res => {
                        if (!res.ok) {
                            console.error("カテゴリー順序の更新に失敗しました");
                        } else {
                            console.log("カテゴリー順序を更新しました");
                        }
                    })
                    .catch(error => {
                        console.error("カテゴリー順序更新の通信エラー:", error);
                    });
                }
            }
        });
        
        console.log("カテゴリー並び替え初期化完了:", categorySortable);
    } else {
        console.warn("category-listが見つかりません");
    }

    console.log("Sortable初期化完了");
});