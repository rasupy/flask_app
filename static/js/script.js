// タスク追加ボタンの制御
const modal = document.getElementById("modal");
const openBtn = document.getElementById("open-modal");
const closeBtn = document.getElementById("close-modal");

openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
closeBtn.addEventListener("click", () => modal.classList.add("hidden"));