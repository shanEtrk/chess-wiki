const deck = document.querySelector("#deck");
const sections = [];

function addSlide(markup, label) {
  const section = document.createElement("section");
  section.className = "slide";
  section.setAttribute("aria-label", label);
  section.innerHTML = markup;
  section.hidden = true;
  deck.append(section);
  sections.push(section);
  return section;
}

addSlide(`<div class="slide-grid"><div><p class="eyebrow">給西洋棋初學者的教學簡報</p><h1>西洋棋<br>戰術入門</h1><p class="cover-line">五個基本戰術</p><p class="lead">認識雙攻、牽制、串擊、閃擊與底線將死。每個主題都有自製棋局和一道練習。</p><p class="cover-caption">知識來源為本專案的 <a href="./index.html">LLM Wiki</a>。先讀概念，再用「下一步示範」觀察棋子變化。</p></div><figure class="board-figure">${boardHTML(DATA.notes[0].fen)}<figcaption>自製局面 · 白方行棋</figcaption></figure></div>`, "西洋棋戰術入門");

addSlide(`<div class="slide-grid"><div><h2>棋盤與走法記號</h2><p class="lead">下方是白方。左右為 a–h，上下為 1–8。e5 就是 e 線與第 5 橫列交會的格子。</p><p class="detail">K 王、Q 后、R 車、B 象、N 馬。兵的走法通常省略棋子代號。<br>「x」代表吃子，「+」代表將軍，「#」代表將死。</p><div class="standout">Nf7+ 表示騎士走到 f7，並將軍。</div>${sourceLinks(DATA.notes[0])}<p class="sources-line">記號和座標以本專案的合法棋步示範。</p></div><figure class="board-figure">${boardHTML(DATA.notes[0].fen, ["e5", "f7"])}<figcaption>e5 的白馬，準備跳到 f7</figcaption></figure></div>`, "棋盤與走法記號");

function addTactic(note) {
  const slide = addSlide(`<div class="slide-grid"><div><p class="eyebrow">${escapeText(note.english)}</p><h2>${escapeText(note.slideTitle)}</h2><p class="lead">${escapeText(note.slideText)}</p><p class="detail">${escapeText(note.recognize)}</p><div class="quiz-slot"></div>${sourceLinks(note)}</div><div class="example-slot"></div></div>`, note.title);
  mountExample(slide.querySelector(".example-slot"), note);
  mountQuiz(slide.querySelector(".quiz-slot"), note);
}

addTactic(DATA.notes[0]);
addTactic(DATA.notes[1]);

addSlide(`<div><h2>牽制與串擊的差別</h2><p class="lead">沿著攻擊方向，先看哪一個目標在前面。</p><div class="table-scroll"><table class="comparison"><thead><tr><th>戰術</th><th>攻擊線上的排列</th><th>想達到的效果</th></tr></thead><tbody><tr><td>本課的絕對牽制</td><td>白車、黑馬、黑王</td><td>黑馬必須繼續擋住王</td></tr><tr><td>下一課的串擊</td><td>白象、黑王、黑車</td><td>黑王移開後，吃後方的車</td></tr></tbody></table></div><p class="detail">絕對牽制的棋子不能露出對己方王的將軍。能否沿牽制線移動，仍要看棋子的走法。</p><div class="sources-line">Wiki <a href="./wiki.html?topic=pin">絕對牽制</a><a href="./wiki.html?topic=skewer">串擊</a>來源 <a href="./sources.html#S02">S02</a><a href="./sources.html#S03">S03</a></div></div>`, "牽制與串擊的差別");

DATA.notes.slice(2).forEach(addTactic);

addSlide(`<div><h2>尋找戰術的方法</h2><p class="lead">先找能將軍的走法，再確認對手有哪些合法回應。</p><ol><li>觀察國王的位置，以及沒有保護的棋子。</li><li>找同時攻擊兩個目標，或打開攻擊線的機會。</li><li>算完對手的回應，再判斷能否得子或將死。</li></ol><p class="detail">這是本課依照五篇 Wiki 筆記整理的練習順序。每一局仍要重新計算。</p><div class="sources-line">課程歸納依據 ${DATA.notes.map(note => `<a href="./wiki.html?topic=${note.id}">${escapeText(note.title)}</a>`).join("")}</div></div>`, "尋找戰術的方法");

addSlide(`<div><h2>兩個容易混淆的判斷</h2><div class="table-scroll"><table class="comparison"><thead><tr><th>觀察</th><th>還需要確認什麼？</th></tr></thead><tbody><tr><td>露出白車的攻擊，而且有將軍</td><td>是誰在將軍？本課由移動的馬將軍，屬於閃擊。露出來的棋子將軍，才稱為閃將。</td></tr><tr><td>黑王被將軍，旁邊有自己的兵</td><td>是否還能逃王、吃掉攻擊者或擋住攻擊線？全部都無法做到，才是將死。</td></tr></tbody></table></div><div class="sources-line">Wiki <a href="./wiki.html?topic=discovered">閃擊</a><a href="./wiki.html?topic=back-rank">底線將死</a>來源 <a href="./sources.html#S04">S04</a><a href="./sources.html#S05">S05</a></div></div>`, "兩個容易混淆的判斷");

addSlide(`<div><h2>五個戰術的辨識線索</h2><div class="table-scroll"><table><thead><tr><th>戰術</th><th>先觀察的線索</th><th>回到 Wiki</th></tr></thead><tbody>${DATA.notes.map(note => `<tr><td>${escapeText(note.title)}</td><td>${escapeText(note.recognize)}</td><td><a href="./wiki.html?topic=${note.id}">閱讀筆記</a></td></tr>`).join("")}</tbody></table></div><p class="detail">可以返回第 3、4、6、7、8 頁，重新作答五道練習。</p></div>`, "五個戰術的辨識線索");

addSlide(`<div><h2>Wiki 與資料來源</h2><p class="detail">簡報的概念與定義從 Wiki 筆記產生。棋局由本專案自製，再用 python-chess 驗證。以下五篇文章均於 2026 年 11 月 22 日閱讀並摘要。</p><ol class="source-deck-list">${DATA.sources.map(source => `<li><a href="./sources.html#${source.id}">${source.id} · ${escapeText(source.title)}</a><span class="muted"> · ${escapeText(source.publisher)}</span></li>`).join("")}</ol><p><a class="primary" href="./index.html">探索完整 Wiki</a> <a class="secondary" href="./workflow.html">閱讀流程與檢查紀錄</a></p></div>`, "Wiki 與資料來源");

const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
let current = 0;
function showSlide(index) {
  current = Math.min(sections.length - 1, Math.max(0, index));
  sections.forEach((section, i) => { section.hidden = i !== current; });
  previous.disabled = current === 0;
  next.disabled = current === sections.length - 1;
  document.querySelector("#slide-count").textContent = `${current + 1} / ${sections.length}`;
  const progress = document.querySelector("#slide-progress");
  progress.max = sections.length;
  progress.value = current + 1;
  document.title = `${current + 1}. ${sections[current].getAttribute("aria-label")} · 棋盤筆記`;
}
function navigate(index) {
  showSlide(index);
  history.replaceState(null, "", `#slide-${current + 1}`);
  window.scrollTo(0, 0);
}
function readHash() {
  const match = /^#slide-(\d+)$/.exec(location.hash);
  showSlide(match ? Number(match[1]) - 1 : 0);
}
previous.addEventListener("click", () => navigate(current - 1));
next.addEventListener("click", () => navigate(current + 1));
window.addEventListener("hashchange", readHash);
document.addEventListener("keydown", event => {
  if (event.target.closest("button,a,input,textarea,select")) return;
  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") { event.preventDefault(); navigate(current + 1); }
  if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); navigate(current - 1); }
  if (event.key === "Home") { event.preventDefault(); navigate(0); }
  if (event.key === "End") { event.preventDefault(); navigate(sections.length - 1); }
});
document.querySelector("#fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    document.querySelector("#deck-status").textContent = "瀏覽器無法開啟全螢幕。你仍可使用上一頁與下一頁瀏覽。";
  }
});
document.addEventListener("fullscreenchange", () => {
  document.querySelector("#fullscreen").textContent = document.fullscreenElement ? "離開全螢幕" : "全螢幕";
});
readHash();
