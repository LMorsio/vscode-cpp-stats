import sys
import re

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

# -------------------------------------------------------
# 1. Регэксп для поиска начала функций
# -------------------------------------------------------

func_pattern = re.compile(
    r"""
    (?P<signature>
        (?:[a-zA-Z_][a-zA-Z0-9_:\<\>\,\s\*&~]*)     # return type + qualifiers
        \s+
        (?P<name>[a-zA-Z_][a-zA-Z0-9_:]*)           # function name with :: 
        \s*
        \(
            [^\)]*                                  # parameters
        \)
        \s*
        (?:const\s*)?                               # optional const
        \{                                          # start of body
    )
    """,
    re.VERBOSE
)

# -------------------------------------------------------
# 2. Функция поиска конца тела функции
# -------------------------------------------------------

def find_function_end(src, start_index):
    depth = 0
    for i in range(start_index, len(src)):
        if src[i] == '{':
            depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                return i
    return None


# -------------------------------------------------------
# 3. Сбор информации по функциям
# -------------------------------------------------------

functions = []

for match in func_pattern.finditer(text):
    func_name = match.group("name")
    start_index = match.start()

    end_index = find_function_end(text, start_index)
    if end_index is None:
        continue

    func_text = text[start_index:end_index]

    func_lines = func_text.count("\n") + 1

    start_line = text.count("\n", 0, start_index) + 1
    end_line = start_line + func_lines - 1

    functions.append({
        "name": func_name,
        "lines": func_lines,
        "start_line": start_line,
        "end_line": end_line
    })

# -------------------------------------------------------
# 4. Итоговые метрики
# -------------------------------------------------------

func_count = len(functions)

min_function_name = None
max_function_name = None
min_function_lines = 0
max_function_lines = 0

if functions:
    smallest = min(functions, key=lambda f: f["lines"])
    min_function_name = smallest["name"]
    min_function_lines = smallest["lines"]
    greatest = max(functions, key=lambda f: f["lines"])
    max_function_name = greatest["name"]
    max_function_lines = greatest["lines"]

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
<b>Loops:</b> {loops}
<b>Quantity of Functions:</b> {func_count}
<b>Greatest function:</b> {max_function_name} ({max_function_lines} lines)
<b>Smallest function:</b> {min_function_name} ({min_function_lines} lines)"""

print(result)
