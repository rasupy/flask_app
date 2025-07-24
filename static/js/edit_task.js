// タスク編集モーダル要素
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const cancelEditBtn = document.getElementById("cancel-edit");

// タスク編集モーダルを開く（タスクをクリックしたとき）
document.querySelectorAll(".task-item").forEach(item => {
    item.addEventListener("click", () => {
        const id = item.dataset.id;
        const title = item.dataset.title;
        const content = item.dataset.content;
        const category = item.dataset.category;

        // モーダル内のform要素に値をセット
        editForm.action = `/admin/edit_task/${id}`;
        editForm.title.value = title;
        editForm.content.value = content;
        editForm.category_id.value = category;

        editModal.classList.remove("hidden");
    });
});

// キャンセルボタンで閉じる
cancelEditBtn.addEventListener("click", () => {
    editModal.classList.add("hidden");
});
