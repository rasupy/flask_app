// タスク追加モーダル制御
document.addEventListener("DOMContentLoaded", function () {
    const taskModal = document.getElementById("task-modal");
    const openTaskBtn = document.getElementById("open-modal");
    const closeTaskBtn = document.getElementById("close-task-modal");

    openTaskBtn.addEventListener("click", () => taskModal.classList.remove("hidden"));
    closeTaskBtn.addEventListener("click", () => taskModal.classList.add("hidden"));
});
