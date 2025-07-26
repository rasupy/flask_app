// カテゴリー削除機能
document.addEventListener('DOMContentLoaded', () => {
    const deleteToggle = document.getElementById('delete-toggle');
    const deleteBtns = document.querySelectorAll('.delete-category-btn');

    let deleteMode = false;

    deleteToggle.addEventListener('click', () => {
        deleteMode = !deleteMode;
        deleteBtns.forEach(btn => {
            btn.classList.toggle('hidden', !deleteMode);
        });
    });

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.categoryId;
            const confirmed = confirm("本当にこのカテゴリーを削除しますか？関連するタスクも削除されます。");
            if (confirmed) {
                fetch(`/admin/delete_category/${id}`, {
                    method: "POST"
                }).then(res => {
                    if (res.ok) {
                        location.reload();
                    } else {
                        alert("削除に失敗しました");
                    }
                });
            }
        });
    });
});
