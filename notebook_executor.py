import sys
import json
import time
import traceback
from contextlib import redirect_stdout, redirect_stderr

def emit(event_name, data):
    # Print in SSE format
    print(f"event: {event_name}", file=sys.__stdout__)
    print(f"data: {json.dumps(data)}\n", file=sys.__stdout__)
    sys.__stdout__.flush()

class StreamToSSE:
    def __init__(self, step_id, is_error=False):
        self.step_id = step_id
        self.is_error = is_error

    def write(self, text):
        if not text:
            return
        # We don't want to emit an empty event for just newlines if we can avoid it, 
        # but for true streaming, we just send it.
        emit("step_log", {"id": self.step_id, "log": text.rstrip('\n'), "is_error": self.is_error})

    def flush(self):
        pass

def main():
    if len(sys.argv) < 2:
        print("Usage: python notebook_executor.py <notebook_path>", file=sys.__stderr__)
        sys.exit(1)

    notebook_path = sys.argv[1]

    try:
        with open(notebook_path, "r", encoding="utf-8") as f:
            nb = json.load(f)
    except Exception as e:
        emit("pipeline_end", {"status": "error", "message": f"Failed to load notebook: {e}"})
        sys.exit(1)

    cells = nb.get("cells", [])
    
    # Step 1: Parse steps
    steps = []
    step_id_map = [] # maps cell index to step id if it's a code cell
    current_step_id = 0
    last_markdown = None

    for i, cell in enumerate(cells):
        ctype = cell.get("cell_type")
        if ctype == "markdown":
            src = "".join(cell.get("source", [])).strip()
            if src.startswith("#"):
                last_markdown = src.split('\n')[0].strip('# ')
            else:
                last_markdown = src[:30] + "..."
            step_id_map.append(None)
        elif ctype == "code":
            src = "".join(cell.get("source", [])).strip()
            if not src:
                step_id_map.append(None)
                continue
                
            step_name = last_markdown if last_markdown else f"Cell {current_step_id + 1}"
            steps.append({"id": current_step_id, "name": step_name})
            step_id_map.append(current_step_id)
            current_step_id += 1
            last_markdown = None # reset for next cell
        else:
            step_id_map.append(None)

    emit("steps_info", {"steps": steps})

    # Step 2: Execute
    exec_globals = {"__name__": "__main__"}
    pipeline_status = "success"

    for i, cell in enumerate(cells):
        ctype = cell.get("cell_type")
        step_id = step_id_map[i]
        
        if ctype != "code" or step_id is None:
            continue

        src = "".join(cell.get("source", [])).strip()

        emit("step_start", {"id": step_id})
        
        # Handle writefile
        if src.lstrip().startswith("%%writefile"):
            try:
                first_line, rest = src.split("\n", 1) if "\n" in src else (src, "")
                fname = first_line.replace("%%writefile", "").strip()
                emit("step_log", {"id": step_id, "log": f"[Magic] Writing to {fname}..."})
                with open(fname, "w", encoding="utf-8") as out_f:
                    out_f.write(rest)
                emit("step_end", {"id": step_id, "status": "success"})
            except Exception as e:
                emit("step_log", {"id": step_id, "log": f"Error: {e}", "is_error": True})
                emit("step_end", {"id": step_id, "status": "error"})
                pipeline_status = "error"
                break
            continue

        # Execute code
        out_stream = StreamToSSE(step_id, is_error=False)
        err_stream = StreamToSSE(step_id, is_error=True)

        try:
            with redirect_stdout(out_stream), redirect_stderr(err_stream):
                exec(src, exec_globals)
            emit("step_end", {"id": step_id, "status": "success"})
        except Exception as e:
            tb = traceback.format_exc()
            emit("step_log", {"id": step_id, "log": tb, "is_error": True})
            emit("step_end", {"id": step_id, "status": "error"})
            pipeline_status = "error"
            break

    emit("pipeline_end", {"status": pipeline_status})

if __name__ == "__main__":
    main()
