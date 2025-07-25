document.addEventListener("DOMContentLoaded", () => {
  const taskList = document.querySelector(".task-list");
  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-form");
  const cancelBtn = document.getElementById("cancel-edit");

  // 1) タスク一覧全体にクリックイベントをひとまとめにバインド
  taskList.addEventListener("click", (e) => {
    // 本当に .task-item をクリックしたかチェック
    const item = e.target.closest(".task-item");
    if (!item) return;

    const taskId     = item.dataset.id;
    const title      = item.dataset.title;
    const content    = item.dataset.content;
    const categoryId = item.dataset.category;

    // フォームに値をセット
    editForm.action = `/admin/edit_task/${taskId}`;
    editForm.querySelector('input[name="title"]').value            = title;
    editForm.querySelector('textarea[name="content"]').value        = content;
    editForm.querySelector('select[name="category_id"]').value      = categoryId;

    // モーダル表示
    editModal.classList.remove("hidden");
  });

  // 2) キャンセルでクローズ
  cancelBtn.addEventListener("click", () => {
    editModal.classList.add("hidden");
  });
});
