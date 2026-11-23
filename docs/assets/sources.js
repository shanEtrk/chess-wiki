document.querySelector("#source-list").innerHTML = DATA.sources.map(source => {
  const notes = DATA.notes.filter(note => note.sourceIds.includes(source.id));
  return `<article class="source-entry" id="${source.id}"><div class="source-meta"><strong>${source.id}</strong>${escapeText(source.publisher)}<br>閱讀日期 ${source.accessed}<br>狀態 · 已閱讀與匯入</div><div><h2>${escapeText(source.title)}</h2><p class="source-meta">閱讀章節 · ${escapeText(source.section)}</p><p>${escapeText(source.summary)}</p><p><a href="${escapeText(source.url)}" target="_blank" rel="noopener noreferrer">開啟原文</a></p><p class="sources-line">使用這篇來源的 Wiki ${notes.map(note => `<a href="./wiki.html?topic=${note.id}">${escapeText(note.title)}</a>`).join("")}</p></div></article>`;
}).join("");
