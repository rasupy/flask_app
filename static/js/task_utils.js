// タスクの順序を更新するためのユーティリティ関数
function sendTaskOrderUpdate() {
    const updatedPosts = [];

    document.querySelectorAll(".task-list").forEach(list => {
        const status = list.dataset.status;
        list.querySelectorAll(".task-item").forEach((item, index) => {
            updatedPosts.push({
                id: item.dataset.id,
                sort_order: index,
                status: status
            });
        });
    });

    fetch("/update_task_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: updatedPosts })
    }).then(res => {
        if (!res.ok) {
            console.error("タスク順序の更新に失敗しました");
        }
    });
}
