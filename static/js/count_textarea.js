// タスクモーダルのテキストエリア文字数をカウント
const textarea = document.getElementById("add-content-task");
const charCount = document.getElementById("char-count");

textarea.addEventListener("input", () => {
  const text = textarea.value;

  // 改行 = 1文字
  const newlineCount = (text.match(/\n/g) || []).length;

  // URL = 23文字としてカウント
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  const urlCount = urls.length * 23;

  // ハッシュタグ = 1文字としてカウント
  const hashtagRegex = /#[\w\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー]+/gu;
  const hashtags = text.match(hashtagRegex) || [];
  const hashtagCount = hashtags.length;

  // 残りのテキスト（URLとハッシュタグを除去してカウント）
  let cleanedText = text
    .replace(urlRegex, "")  // URL除外
    .replace(hashtagRegex, "");  // ハッシュタグ除外

  // 日本語（全角）は1文字、英語（半角）は0.5文字としてカウント
  let jpCount = 0;
  for (let char of cleanedText) {
    if (char.match(/[^\x00-\x7F]/)) {
      jpCount += 1; // 全角
    } else {
      jpCount += 0.5; // 半角
    }
  }

  const totalCount = Math.round(jpCount + urlCount + hashtagCount + newlineCount);
  const limit = isMostlyJapanese(text) ? 140 : 280;

  charCount.textContent = `${totalCount} / ${limit}`;
  charCount.style.color = totalCount > limit ? "red" : "black";
});

function isMostlyJapanese(text) {
  const jpMatches = text.match(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー]/gu) || [];
  return jpMatches.length > text.length * 0.3;  // 日本語が3割以上なら日本語優先
}

