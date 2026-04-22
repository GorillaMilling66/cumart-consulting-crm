#!/usr/bin/env python3
"""One-shot helper for v1.16.0 soft-delete: inject .is('deleted_at', null)
after every db.from('<soft-delete table>').select(...) in app.js.

Handles paren-balanced matching so args like
   select('*, typ:lookup_values!fkey(id, wert, farbe)')
aren't truncated. Ignores parens inside single/double/backtick strings.

Usage:
    python3 migrations/_inject_soft_delete_filter.py          # dry-run
    python3 migrations/_inject_soft_delete_filter.py --apply  # write back

Idempotent: will skip selects already followed by .is('deleted_at', null).
"""
import re
import sys
from pathlib import Path

TABLES = ['companies', 'contacts', 'appointments',
          'projects', 'deployments', 'memberships']

FILTER = ".is('deleted_at', null)"

ROOT = Path(__file__).resolve().parent.parent
APP_JS = ROOT / 'app.js'


def find_injection_points(content: str):
    """Yield (line_no, select_start, select_end, snippet) for every
    .from('<table>').select(...) occurrence that doesn't already have
    .is('deleted_at', null) appended."""
    points = []
    for table in TABLES:
        from_re = re.compile(r"from\('" + re.escape(table) + r"'\)")
        for m in from_re.finditer(content):
            after = content[m.end():]
            sel_match = re.match(r'\s*\.select\(', after)
            if not sel_match:
                continue

            open_paren_pos = m.end() + sel_match.end() - 1
            close_pos = find_matching_close(content, open_paren_pos)
            if close_pos is None:
                continue

            # Skip if already filtered
            tail = content[close_pos + 1: close_pos + 1 + len(FILTER)]
            if tail == FILTER:
                continue

            line_no = content.count('\n', 0, m.start()) + 1
            snippet = content[m.start(): close_pos + 1].replace('\n', ' ')
            if len(snippet) > 120:
                snippet = snippet[:117] + '...'
            points.append((line_no, close_pos + 1, table, snippet))
    return sorted(points, key=lambda p: p[1])


def find_matching_close(content: str, open_pos: int):
    assert content[open_pos] == '('
    depth = 0
    i = open_pos
    in_str = None
    while i < len(content):
        c = content[i]
        if in_str:
            if c == '\\':
                i += 2
                continue
            if c == in_str:
                in_str = None
        elif c in ("'", '"', '`'):
            in_str = c
        elif c == '(':
            depth += 1
        elif c == ')':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return None


def main():
    apply = '--apply' in sys.argv
    content = APP_JS.read_text()
    points = find_injection_points(content)

    print(f"Found {len(points)} .select() calls on soft-delete tables without filter.\n")
    for line_no, pos, table, snippet in points[:10]:
        print(f"  line {line_no:>4} [{table:<13}] {snippet}")
    if len(points) > 10:
        print(f"  ... and {len(points) - 10} more")

    if not apply:
        print("\n(dry-run — pass --apply to write changes)")
        return

    # Apply injections from END to START so positions don't shift
    new_content = content
    for _, pos, _, _ in sorted(points, key=lambda p: p[1], reverse=True):
        new_content = new_content[:pos] + FILTER + new_content[pos:]

    APP_JS.write_text(new_content)
    print(f"\nWrote {len(points)} injections to {APP_JS}")


if __name__ == '__main__':
    main()
