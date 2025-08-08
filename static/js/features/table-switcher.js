// テーブル表示切り替え機能
document.addEventListener('DOMContentLoaded', () => {
    const tableToggles = document.querySelectorAll('[data-table-toggle]');
    
    tableToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetTable = toggle.dataset.tableToggle;
            const table = document.getElementById(targetTable);
            
            if (table) {
                table.classList.toggle('hidden');
                toggle.textContent = table.classList.contains('hidden') ? 'show' : 'hide';
            }
        });
    });
});