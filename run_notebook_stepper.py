#!/usr/bin/env python
"""
Stepper to 'run each cell' of quiz1.ipynb using the project's .venv python.
- Mimics Jupyter stateful execution.
- Handles %%writefile magic specially (writes file, doesn't exec as python).
- Captures prints and exceptions per cell.
- On error: prints details (cell idx, source, error, captured output) so we can fix.
- After successful cells, optionally patches notebook outputs/execution_counts (for clean run).
- Uses explicit venv python path for consistency.
"""
import json
import sys
import io
import traceback
from contextlib import redirect_stdout, redirect_stderr
from pathlib import Path

PROJECT = Path("C:\\Users\\jains\\OneDrive\\Desktop\\Quiz-generator-locally-")
NOTEBOOK = PROJECT / "quiz1.ipynb"
VENV_PY = PROJECT / ".venv" / "Scripts" / "python.exe"  # not used here; we *are* running under it or explicit

def main():
    print(f"Running under: {sys.executable}")
    print(f"Notebook: {NOTEBOOK}")
    if not NOTEBOOK.exists():
        print("Notebook not found!")
        return 1

    with open(NOTEBOOK, "r", encoding="utf-8") as f:
        nb = json.load(f)

    cells = nb["cells"]
    print(f"Total cells: {len(cells)}")

    exec_globals = {"__name__": "__main__"}
    errors = []

    for i, cell in enumerate(cells):
        ctype = cell.get("cell_type")
        src_lines = cell.get("source", [])
        src = "".join(src_lines).strip()

        if ctype == "markdown":
            print(f"\n=== Cell {i}: markdown (skipped) ===")
            print(src[:100] + "..." if len(src) > 100 else src)
            continue

        print(f"\n=== Cell {i}: code ===")
        print("Source preview:", repr(src[:150]) + ("..." if len(src)>150 else ""))

        if not src:
            print("  (empty, skipping)")
            continue

        # Handle %%writefile magic (IPython-style, only first line)
        if src.lstrip().startswith("%%writefile"):
            try:
                first_line, rest = src.split("\n", 1) if "\n" in src else (src, "")
                fname = first_line.replace("%%writefile", "").strip()
                if not fname:
                    print("  ERROR: no filename after %%writefile")
                    errors.append((i, "bad writefile", src))
                    continue
                target = PROJECT / fname
                target.write_text(rest, encoding="utf-8")
                print(f"  Wrote {len(rest)} chars to {fname}")
                # Simulate output
                cell["outputs"] = [{"output_type": "stream", "name": "stdout", "text": f"Writing {fname}\n"}]
                cell["execution_count"] = i
                continue
            except Exception as e:
                print(f"  Writefile error: {e}")
                errors.append((i, str(e), src))
                continue

        # Normal python exec (with capture)
        captured_out = io.StringIO()
        captured_err = io.StringIO()
        try:
            with redirect_stdout(captured_out), redirect_stderr(captured_err):
                exec(src, exec_globals)
            out = captured_out.getvalue()
            err = captured_err.getvalue()
            if out:
                print("  STDOUT:", out[:300] + ("..." if len(out)>300 else ""))
            if err:
                print("  STDERR:", err[:300] + ("..." if len(err)>300 else ""))
            print("  Cell OK")
            # Patch notebook for successful run (clean outputs)
            cell["outputs"] = []
            if out:
                cell["outputs"].append({"output_type": "stream", "name": "stdout", "text": out})
            cell["execution_count"] = i
        except Exception as e:
            out = captured_out.getvalue()
            err = captured_err.getvalue()
            tb = traceback.format_exc()
            print("  ERROR:", e)
            if out:
                print("  Partial STDOUT (e.g. LLM answer before assert):", out[:500] + ("..." if len(out)>500 else ""))
            print("  Traceback:", tb[-500:] if len(tb)>500 else tb)
            errors.append((i, str(e), src, out, tb))
            # Still patch what we have
            cell["outputs"] = [{"output_type": "error", "ename": type(e).__name__, "evalue": str(e), "traceback": [tb]}]
            cell["execution_count"] = i
            # Stop on first error for "fix then continue" workflow
            print("\n*** Stopping on first error for fix cycle. ***")
            break

    # Write back the (partially) updated notebook so fixes persist and outputs are cleaned
    with open(NOTEBOOK, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print(f"\nNotebook updated with run results (errors: {len(errors)})")

    if errors:
        print("\n=== ERRORS ENCOUNTERED ===")
        for err in errors:
            print(err[0], ":", err[1])
        return 1

    print("All cells executed successfully (up to the point we ran).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
