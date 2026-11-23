document.querySelector("#retrieval-rows").innerHTML = DATA.retrieval.map(result => {
  const note = DATA.notes.find(note => note.id === result.top_note);
  return `<tr><td>${escapeText(result.query)}</td><td><a href="./wiki.html?topic=${note.id}">${escapeText(note.title)}</a></td><td>${result.source_ids.map(id => `<a href="./sources.html#${id}">${id}</a>`).join(" ")}</td></tr>`;
}).join("");
const report = DATA.validation;
document.querySelector("#validation-summary").innerHTML = `<p class="success">${report.source_count} 篇資料匯入、${report.wiki_count} 篇 Wiki 筆記、${report.retrieval_queries_passed} 個查詢與 ${report.examples.length} 個棋局範例通過程式檢查。</p><p class="muted">執行時間 ${escapeText(report.executed_at_utc)} · chess ${escapeText(report.python_chess)} · 輸入檔案雜湊保留於 JSON。</p>`;
document.querySelector("#validation-rows").innerHTML = report.examples.map(result => `<tr><td>${escapeText(DATA.notes.find(note => note.id === result.note).title)}</td><td>${escapeText(result.san_moves.join(" ") || "觀察黑馬的合法移動集合")}</td><td class="success">通過</td></tr>`).join("");
document.querySelector("#issues").innerHTML = (DATA.issues ?? []).map(issue => `<section><h3>${escapeText(issue.id)} · ${escapeText(issue.node)}</h3><p>${escapeText(issue.observed)}</p><p>原因是${escapeText(issue.cause)}</p><p>修正方式是${escapeText(issue.change)}</p><p class="success">重新檢查 · ${escapeText(issue.recheck)}</p></section>`).join("");
const browserChecks = DATA.browserChecks;
if (browserChecks) {
  document.querySelector("#browser-results").innerHTML = `<h3>瀏覽器實測</h3><p>${escapeText(browserChecks.summary)}</p><p class="muted">測試日期 ${escapeText(browserChecks.date)}。${escapeText(browserChecks.limitations)}</p>`;
}
