// タスク削除機能
document.addEventListener('DOMContentLoaded', () => {
    const deleteModeManager = window.deleteModeManager || new DeleteModeManager();
    const deleteToggle = document.getElementById('delete-task-toggle');

    if (deleteToggle) {
        deleteToggle.addEventListener('click', () => {
            const newMode = !deleteModeManager.getMode('task');
            deleteModeManager.setMode('task', newMode);
            deleteToggle.textContent = newMode ? 'cancel' : 'delete';
        });
    }

    // 削除ボタン表示制御
    deleteModeManager.onModeChange('task', (enabled) => {
        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.classList.toggle('hidden', !enabled);
        });
    });

    // 削除処理
    document.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-task-btn');
        if (!deleteBtn) return;

        e.stopPropagation();
        
        const taskId = deleteBtn.dataset.taskId;
        if (confirm('このタスクを削除しますか？')) {
            deleteTask(taskId, deleteBtn);
        }
    });

    async function deleteTask(taskId, btn) {
        try {
            const response = await fetch(`/admin/delete_task/${taskId}`, {
                method: 'POST'
            });

            if (response.ok) {
                btn.closest('.task-item').remove();
            } else {
                alert('削除に失敗しました');
            }
        } catch (error) {
            alert('通信エラーが発生しました');
        }
    }
});