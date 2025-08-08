// テキストエリアの文字数カウント機能
document.addEventListener('DOMContentLoaded', () => {
    // テキストエリアの文字数制限とカウント表示
    const textareas = document.querySelectorAll('textarea[maxlength]');
    
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength') || 140;
        
        // カウンター要素を作成または取得
        let counter = textarea.parentElement.querySelector('.char-count');
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'char-count';
            textarea.parentElement.appendChild(counter);
        }
        
        // 初期表示
        updateCounter();
        
        // イベントリスナー
        textarea.addEventListener('input', updateCounter);
        textarea.addEventListener('paste', () => setTimeout(updateCounter, 0));
        
        function updateCounter() {
            const currentLength = textarea.value.length;
            counter.textContent = `${currentLength} / ${maxLength}`;
            
            // 制限に近づいた時の視覚的フィードバック
            if (currentLength > maxLength * 0.9) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
            
            if (currentLength >= maxLength) {
                counter.classList.add('error');
            } else {
                counter.classList.remove('error');
            }
        }
    });
});