"""Ingest curated source summaries, retrieve Wiki notes, validate examples and build HTML data."""
import argparse
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

import chess

ROOT = Path(__file__).resolve().parents[1]


def read_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def write_json(path, value):
    destination = ROOT / path
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ingest():
    sources = read_json("sources/articles.json")
    notes = read_json("wiki/notes.json")
    source_map = {source["id"]: source for source in sources}
    assert len(source_map) == len(sources) >= 5
    assert len({source["url"] for source in sources}) == len(sources)
    assert len({note["id"] for note in notes}) == len(notes)
    for source in sources:
        for key in ["title", "publisher", "url", "section", "accessed", "summary", "supports"]:
            assert source[key], (source["id"], key)
        text = f'# {source["id"]} · {source["title"]}\n\n'
        text += f'來源機構：{source["publisher"]}\n\n閱讀日期：{source["accessed"]}\n\n'
        text += f'閱讀章節：{source["section"]}\n\n人工改寫摘要：{source["summary"]}\n\n'
        text += f'[原文]({source["url"]})\n'
        (ROOT / "sources" / f'{source["id"]}.md').write_text(text, encoding="utf-8")
    for note in notes:
        assert note["sourceIds"] and all(sid in source_map for sid in note["sourceIds"])
        assert all(other in {item["id"] for item in notes} for other in note["related"])
        text = f'# {note["title"]} / {note["english"]}\n\n'
        for label, field in [("定義", "definition"), ("辨識方法", "recognize"), ("適用條件", "boundary"), ("自製範例", "example")]:
            text += f'## {label}\n\n{note[field]}\n\n'
        text += '## 來源\n\n' + '\n'.join(f'- [{sid}](../../sources/{sid}.md)' for sid in note["sourceIds"])
        text += '\n\n## 相關筆記\n\n' + '\n'.join(f'- [{other}]({other}.md)' for other in note["related"]) + '\n'
        (ROOT / "wiki/entries" / f'{note["id"]}.md').write_text(text, encoding="utf-8")
    return sources, notes


def retrieve(query, notes):
    tokens = query.lower().split()
    scored = []
    for note in notes:
        search = " ".join([note["title"], note["english"], *note["keywords"], note["definition"]]).lower()
        score = sum(token in search for token in tokens)
        if score:
            scored.append((score, note))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [note for _, note in scored[:3]]


def validate(notes):
    results = []
    for note in notes:
        board = chess.Board(note["fen"])
        assert board.is_valid(), (note["id"], board.status())
        assert len(note["choices"]) == len(set(note["choices"])) == 3
        assert 0 <= note["answer"] < 3
        states = [{"fen": board.fen(), "label": "初始局面"}]
        for san in note["moves"]:
            move = board.parse_san(san)
            assert board.san(move) == san, (note["id"], san, board.san(move))
            board.push(move)
            states.append({"fen": board.fen(), "label": san})
        start = chess.Board(note["fen"])
        if note["id"] == "fork":
            start.push_san("Nf7+")
            assert {chess.H8, chess.D8} <= set(start.attacks(chess.F7)) and start.is_check()
        elif note["id"] == "pin":
            assert start.is_pinned(chess.BLACK, chess.E7)
            assert not any(move.from_square == chess.E7 for move in start.legal_moves)
        elif note["id"] == "skewer":
            start.push_san("Bb3+")
            assert start.is_check()
            assert all(move.from_square == chess.E6 for move in start.legal_moves)
            for reply in list(start.legal_moves):
                branch = start.copy()
                branch.push(reply)
                assert branch.parse_san("Bxg8") in branch.legal_moves
        elif note["id"] == "discovered":
            assert chess.E8 not in start.attacks(chess.E1)
            start.push_san("Nf6+")
            assert start.is_check() and chess.E8 in start.attacks(chess.E1)
            assert set(start.checkers()) == {chess.F6}
        elif note["id"] == "back-rank":
            assert board.is_checkmate() and not list(board.legal_moves)
        note["states"] = states
        results.append({"note": note["id"], "valid_position": True, "san_moves": note["moves"], "state_count": len(states), "tactic_check": "passed"})
    return results


def build():
    sources, notes = ingest()
    results = validate(notes)
    queries = ["騎士 雙攻", "絕對 牽制", "串擊", "閃擊 閃將", "底線 將死"]
    retrieval = []
    for query, expected in zip(queries, notes):
        hits = retrieve(query, notes)
        assert hits and hits[0]["id"] == expected["id"]
        retrieval.append({"query": query, "top_note": hits[0]["id"], "source_ids": hits[0]["sourceIds"], "used_for": f'簡報的「{hits[0]["title"]}」頁與練習題', "definition": hits[0]["definition"]})
    write_json("runs/retrieval.json", retrieval)
    now = datetime.now(timezone.utc).isoformat()
    report = {"executed_at_utc": now, "python_chess": chess.__version__, "source_count": len(sources), "wiki_count": len(notes), "retrieval_queries_passed": len(retrieval), "examples": results, "input_hashes": {path: hashlib.sha256((ROOT / path).read_bytes()).hexdigest() for path in ["sources/articles.json", "wiki/notes.json"]}}
    write_json("runs/validation.json", report)
    issues = read_json("runs/issues.json")
    data = {"sources": sources, "notes": notes, "retrieval": retrieval, "validation": report, "issues": issues}
    browser_path = ROOT / "runs/browser-checks.json"
    if browser_path.exists():
        data["browserChecks"] = read_json("runs/browser-checks.json")
    (ROOT / "docs/assets/data.js").write_text("window.WIKI_DATA = " + json.dumps(data, ensure_ascii=False) + ";\n", encoding="utf-8")
    evidence = ROOT / "docs/evidence"
    evidence.mkdir(exist_ok=True)
    for path in ["validation.json", "retrieval.json", "issues.json", "first-error.txt", "browser-checks.json"]:
        source = ROOT / "runs" / path
        if source.exists():
            shutil.copyfile(source, evidence / path)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--query", help="Search ingested Wiki notes")
    args = parser.parse_args()
    if args.query:
        print(json.dumps(retrieve(args.query, read_json("wiki/notes.json")), ensure_ascii=False, indent=2))
    else:
        build()
