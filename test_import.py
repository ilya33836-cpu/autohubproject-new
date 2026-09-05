"""Test script to check if the main module imports correctly."""
import traceback

out = []
try:
    import main
    out.append("IMPORT_OK routes=" + str(len(main.app.routes)))
    for r in main.app.routes:
        if hasattr(r, "path"):
            methods = r.methods if hasattr(r, "methods") else set()
            out.append("  {} {}".format(methods, r.path))
except Exception:
    out.append("IMPORT_ERROR")
    out.append(traceback.format_exc())

print("\n".join(out))
