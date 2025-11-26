import sys

file_path = sys.argv[1]

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

chars = len(text)
lines = text.split("\n")
empty_lines = sum(1 for l in lines if not l.strip())
comment_lines = sum(1 for l in lines if l.strip().startswith("//") or l.strip().startswith("/*"))
class_lines = sum(1 for l in lines if l.strip().startswith("class ") or l.strip().startswith("struct "))
include_lines = sum(1 for l in lines if l.strip().startswith("#include"))
longest_line = max((len(l) for l in lines), default=0)
avg_line_length = chars / len(lines) if lines else 0
comment_percent = (comment_lines / len(lines) * 100) if lines else 0
loops = sum(1 for l in lines if l.strip().startswith("for") or l.strip().startswith("while"))

result = f"""
<b>File:</b> {file_path[0].upper() + file_path[1:]}
<b>Total symbols:</b> {chars}
<b>Total lines:</b> {len(lines)}
<b>Code lines:</b> {len(lines) - empty_lines - comment_lines}
<b>Blank lines:</b> {empty_lines}
<b>Comment lines:</b> {comment_lines} ({comment_percent:.1f}%)
<b>Longest line length:</b> {longest_line} symbols
<b>Average line length:</b> {avg_line_length:.1f} symbols
<b>Classes/Structs:</b> {class_lines}
<b>Include lines:</b> {include_lines}
<b>Loops:</b> {loops}"""

print(result)
