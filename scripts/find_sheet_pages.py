"""
Znajduje stronę arkusza PDF, na której zaczyna się każde zadanie, i zapisuje
wynik do src/data/sheet-pages.json ({"id zadania": [część arkusza, strona]}).

Dzięki temu podgląd PDF na stronie zadania otwiera się od razu na właściwej
stronie. Skrypt uruchamia się ręcznie po dodaniu zadań (wymaga `pdftotext`
z pakietu poppler):

    python scripts/find_sheet_pages.py

Arkusze będące skanami (bez warstwy tekstowej) nie dają wyniku – podgląd
otwiera się wtedy na pierwszej stronie.
"""
import glob
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "src" / "data" / "sheet-pages.json"


def pdf_pages(path, cache={}):
    if path not in cache:
        text = subprocess.run(
            ["pdftotext", "-layout", str(ROOT / "public" / path), "-"],
            capture_output=True,
            check=False,
        ).stdout.decode("utf-8", "replace")
        cache[path] = text.split("\f")
    return cache[path]


def main():
    catalog = json.loads((ROOT / "src" / "data" / "catalog.generated.json").read_text("utf-8"))
    sessions = {session["id"]: session for session in catalog}
    found, missing = {}, []
    task_files = glob.glob(str(ROOT / "src" / "data" / "tasks" / "*.json")) + glob.glob(
        str(ROOT / "src" / "data" / "spreadsheet" / "*.json")
    ) + glob.glob(str(ROOT / "src" / "data" / "sql" / "*.json"))
    for task_file in sorted(task_files):
        for task in json.loads(Path(task_file).read_text("utf-8")):
            # Nagłówek „Zadanie 3.1.” (z wielkiej litery – pomija odwołania „do zadania 3.1”).
            pattern = re.compile(r"Zadanie\s+" + re.escape(task["number"]) + r"\.?(?![\d.])")
            location = None
            for part, sheet in enumerate(sessions[task["sessionId"]]["sheets"]):
                for page, text in enumerate(pdf_pages(sheet), start=1):
                    if pattern.search(text):
                        location = [part, page]
                        break
                if location:
                    break
            if location:
                found[task["id"]] = location
            else:
                missing.append(task["id"])
    OUTPUT.write_text(
        json.dumps(dict(sorted(found.items())), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"Znaleziono {len(found)} zadań, bez strony: {len(missing)}")
    for task_id in missing:
        print("  -", task_id)


if __name__ == "__main__":
    main()
