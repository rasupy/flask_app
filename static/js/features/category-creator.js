// カテゴリー追加機能
document.addEventListener("DOMContentLoaded", function () {
    const categoryModal = document.getElementById("category-modal");
    const createCategoryBtn = document.getElementById("create-category-btn");
    const closeCategoryBtn = document.getElementById("close-category-modal");
    const categoryForm = document.getElementById("category-form"); // フォームがある場合

    // モーダル制御
    if (createCategoryBtn && categoryModal) {
        createCategoryBtn.addEventListener("click", () => {
            categoryModal.classList.remove("hidden");
        });
    }

    if (closeCategoryBtn && categoryModal) {
        closeCategoryBtn.addEventListener("click", () => {
            categoryModal.classList.add("hidden");
        });
    }

    // モーダル外クリックで閉じる
    if (categoryModal) {
        categoryModal.addEventListener("click", (e) => {
            if (e.target === categoryModal) {
                categoryModal.classList.add("hidden");
            }
        });
    }

    // Escキーで閉じる
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && categoryModal && !categoryModal.classList.contains("hidden")) {
            categoryModal.classList.add("hidden");
        }
    });

    // フォーム送信処理（もしカテゴリーフォームがある場合）
    if (categoryForm) {
        categoryForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const formData = new FormData(categoryForm);
            const categoryName = formData.get('name');
            
            if (!categoryName) {
                alert("カテゴリー名を入力してください");
                return;
            }

            try {
                const response = await fetch("/admin/add_category", {
                    method: "POST",
                    body: formData
                });

                if (response.ok) {
                    // ページリロード（カテゴリー一覧の更新のため）
                    location.reload();
                } else {
                    alert("カテゴリーの追加に失敗しました");
                }
            } catch (error) {
                console.error("通信エラー:", error);
                alert("カテゴリーの追加中にエラーが発生しました");
            }
        });
    }
});