const list = document.querySelector("#note-list");
if (list) {
  document.querySelector("#hero-board").innerHTML = boardHTML(DATA.notes[0].fen);
  const search = document.querySelector("#wiki-search");
  const show = () => {
    const query = search.value.trim().toLowerCase();
    const tokens = query.split(/\s+/).filter(Boolean);
    const notes = DATA.notes.filter(note => {
      const text = [note.title, note.english, ...note.keywords, note.definition, note.boundary].join(" ").toLowerCase();
      return tokens.every(token => text.includes(token));
    });
    document.querySelector("#search-status").textContent = query ? (notes.length ? `找到 ${notes.length} 篇筆記` : "找不到筆記，請試試「雙攻」或「牽制」。") : "";
    list.innerHTML = notes.map(note => `<a class="note-card" href="./wiki.html?topic=${note.id}"><h3>${escapeText(note.title)}</h3><span class="english">${escapeText(note.english)}</span><p>${escapeText(note.definition)}</p><span class="card-bottom">閱讀筆記 · ${note.sourceIds.join("、")}</span></a>`).join("");
  };
  search.addEventListener("input", show);
  show();
}

const article = document.querySelector("#wiki-article");
if (article) {
  const id = new URLSearchParams(location.search).get("topic");
  const note = DATA.notes.find(note => note.id === id);
  if (!note) {
    article.innerHTML = '<div class="page-heading"><h1>找不到這篇筆記</h1><p><a href="./index.html">返回 Wiki 選擇主題</a></p></div>';
  } else {
    document.title = `${note.title} · 棋盤筆記 Wiki`;
    article.innerHTML = `<header class="article-header"><a class="back-link" href="./index.html">返回 Wiki</a><h1>${escapeText(note.title)}</h1><p class="english">${escapeText(note.english)}</p></header><div class="article-layout"><div class="article-copy"><section><h2>定義</h2><p>${escapeText(note.definition)}</p></section><section><h2>辨識方法</h2><p>${escapeText(note.recognize)}</p></section><section class="callout"><h2>適用條件</h2><p>${escapeText(note.boundary)}</p></section><section><h2>自製範例</h2><p>${escapeText(note.example)}</p><p><code>${escapeText(note.moves.join(" ")) || "觀察局面，黑方行棋"}</code></p></section><section><h2>來源追溯</h2>${sourceLinks(note)}<p class="muted">定義由 LLM 根據來源改寫。棋局為本專案自製，已用 python-chess 檢查。</p></section><section><h2>相關筆記</h2><div class="related">${note.related.map(id => `<a href="./wiki.html?topic=${id}">${escapeText(DATA.notes.find(item => item.id === id).title)}</a>`).join("")}</div></section><a class="secondary" href="./slides.html#slide-${DATA.notes.indexOf(note) + 3 + (DATA.notes.indexOf(note) > 1 ? 1 : 0)}">在教學簡報中閱讀</a></div><div><div id="article-example"></div><section id="article-quiz"></section></div></div>`;
    mountExample(document.querySelector("#article-example"), note);
    mountQuiz(document.querySelector("#article-quiz"), note);
  }
}
