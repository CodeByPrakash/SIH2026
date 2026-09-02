"""
Execute all code cells in model.ipynb and save outputs directly into the notebook JSON.
"""

import json
import sys
import io
import traceback

notebook_path = "model.ipynb"

with open(notebook_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

global_env = {}
execution_count = 1

for idx, cell in enumerate(nb["cells"]):
    if cell["cell_type"] == "code":
        code_str = "".join(cell["source"])
        print(f"Executing Code Cell {execution_count} (index {idx})...")
        cell["execution_count"] = execution_count
        cell["outputs"] = []

        # Redirect stdout and stderr
        old_stdout = sys.stdout
        old_stderr = sys.stderr
        redirected_output = io.StringIO()
        redirected_error = io.StringIO()
        sys.stdout = redirected_output
        sys.stderr = redirected_error

        try:
            exec(code_str, global_env)
        except Exception as e:
            traceback.print_exc(file=redirected_error)
            print(f"Error in cell {execution_count}: {e}", file=old_stderr)
        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stderr

        out_text = redirected_output.getvalue()
        err_text = redirected_error.getvalue()

        if out_text:
            cell["outputs"].append({
                "name": "stdout",
                "output_type": "stream",
                "text": [s + "\n" for s in out_text.rstrip("\n").split("\n")]
            })

        if err_text:
            cell["outputs"].append({
                "name": "stderr",
                "output_type": "stream",
                "text": [s + "\n" for s in err_text.rstrip("\n").split("\n")]
            })

        execution_count += 1

with open(notebook_path, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=1)

print(f"Successfully executed all {execution_count-1} code cells in {notebook_path}!")
