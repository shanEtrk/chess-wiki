const DATA = window.WIKI_DATA;
const escapeText = value => String(value).replace(/[&<>"']/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]));
const PIECES = {k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"};
const NAMES = {k:"王",q:"后",r:"車",b:"象",n:"馬",p:"兵"};

function boardHTML(fen, focus = []) {
  const rows = fen.split(" ")[0].split("/");
  const labels = [];
  let cells = "";
  rows.forEach((row, rowIndex) => {
    let column = 0;
    for (const character of row) {
      const count = /[1-8]/.test(character) ? Number(character) : 1;
      for (let empty = 0; empty < count; empty++) {
        const piece = /[1-8]/.test(character) ? "" : character;
        const file = "abcdefgh"[column];
        const rank = 8 - rowIndex;
        const square = file + rank;
        const color = piece === piece.toUpperCase() ? "white" : "black";
        if (piece) labels.push(square + (color === "white" ? "白" : "黑") + NAMES[piece.toLowerCase()]);
        cells += `<span aria-hidden="true" class="square ${(rowIndex + column) % 2 ? "dark" : "light"} ${piece ? color : ""} ${focus.includes(square) ? "marked" : ""}" ${column === 0 ? `data-rank="${rank}"` : ""} ${rank === 1 ? `data-file="${file}"` : ""}>${PIECES[piece.toLowerCase()] ?? ""}</span>`;
        column++;
      }
    }
  });
  return `<div class="board" role="img" aria-label="${escapeText(labels.join("、") + (focus.length ? "。標記格 " + focus.join("、") : ""))}">${cells}</div>`;
}

function sourceLinks(note) {
  return `<div class="sources-line">Wiki <a href="./wiki.html?topic=${note.id}">${escapeText(note.title)}</a>來源 ${note.sourceIds.map(id => `<a href="./sources.html#${id}">${id}</a>`).join("")}</div>`;
}

function mountExample(container, note, interactive = true) {
  container.innerHTML = `<figure class="board-figure"><div class="board-host"></div><figcaption aria-live="polite"></figcaption></figure>`;
  let step = 0;
  const board = container.querySelector(".board-host");
  const caption = container.querySelector("figcaption");
  const show = () => {
    const state = note.states[step];
    board.innerHTML = boardHTML(state.fen, step ? note.focus : []);
    caption.textContent = step ? `示範第 ${step} 步 · ${state.label}` : `自製局面 · ${note.fen.split(" ")[1] === "w" ? "白方" : "黑方"}行棋`;
  };
  if (interactive && note.states.length > 1) {
    const controls = document.createElement("div");
    controls.className = "board-controls";
    controls.innerHTML = '<button type="button">下一步示範</button><button type="button">重設棋盤</button>';
    const [next, reset] = controls.querySelectorAll("button");
    next.addEventListener("click", () => {
      step++;
      show();
      next.disabled = step === note.states.length - 1;
    });
    reset.addEventListener("click", () => { step = 0; next.disabled = false; show(); });
    container.append(controls);
  }
  show();
}

function mountQuiz(container, note) {
  container.className = "quiz";
  container.innerHTML = `<h3 id="question-${note.id}">${escapeText(note.question)}</h3><div class="options" role="group" aria-labelledby="question-${note.id}"></div><div class="feedback" role="status"></div><button type="button" class="reset-quiz" hidden>重新作答</button>`;
  const options = container.querySelector(".options");
  const feedback = container.querySelector(".feedback");
  const reset = container.querySelector(".reset-quiz");
  note.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = choice;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      options.querySelector('[aria-pressed="true"]')?.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-pressed", "true");
      feedback.textContent = (index === note.answer ? "答對了。" : "再想想。") + note.explanation;
      reset.hidden = false;
    });
    options.append(button);
  });
  reset.addEventListener("click", () => {
    feedback.textContent = "";
    options.querySelector('[aria-pressed="true"]')?.setAttribute("aria-pressed", "false");
    reset.hidden = true;
    options.firstElementChild.focus();
  });
}
