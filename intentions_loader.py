# intentions_loader.py
import re
import pandas as pd
from psycopg import connect
from psycopg.rows import dict_row

LAST_BRACKET_RX = re.compile(r"\s\[[^\]]+\]\s*$")

def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()

def norm_key(s: str) -> str:
    return norm(s).lower()

def parse_parent_and_variety(full_name: str) -> tuple[str|None, str|None]:
    """Peace [Inner] -> ('Peace', 'Inner'); Peace -> (None, None)"""
    if not full_name:
        return None, None
    m = LAST_BRACKET_RX.search(full_name)
    if not m:
        return None, None
    parent = full_name[:m.start()].rstrip()
    variety = full_name[m.start():].strip()[1:-1].strip()  # strip [ ]
    return (parent, variety)

def upsert_intention(conn, name: str) -> int:
    """
    Inserts/updates one intention by display name and returns intention_id.
    Recursively ensures the parent exists, using the last-bracket rule.
    """
    name = norm(name)
    nn = norm_key(name)

    parent_name, variety = parse_parent_and_variety(name)
    parent_id = None
    if parent_name:
        parent_id = upsert_intention(conn, parent_name)

    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO public.intention(name, normalized_name, parent_intention_id, variety, normalized_variety)
            VALUES (%s, %s, %s, %s, LOWER(TRIM(%s)))
            ON CONFLICT (normalized_name) DO UPDATE SET
              name = EXCLUDED.name,
              parent_intention_id = COALESCE(EXCLUDED.parent_intention_id, public.intention.parent_intention_id),
              variety = COALESCE(EXCLUDED.variety, public.intention.variety),
              normalized_variety = COALESCE(EXCLUDED.normalized_variety, public.intention.normalized_variety)
            RETURNING intention_id
        """, (name, nn, parent_id, variety, variety))
        return cur.fetchone()["intention_id"]

def load_intentions_csv(dsn: str, path: str):
    """
    Reads the 'Intention or Association' CSV exported from the PDF and loads all rows
    into public.intention. Expected columns:
      - 'Intention or Association' (display name)  
      - optional 'Type' (ignored here)
    """
    df = pd.read_csv(path).fillna("")
    # find a column that contains “Intention”
    name_col = next((c for c in df.columns if "intention" in c.lower()), df.columns[0])

    with connect(dsn, autocommit=False, row_factory=dict_row) as conn:
        for _, r in df.iterrows():
            name = norm(str(r.get(name_col, "")))
            if not name:
                continue
            upsert_intention(conn, name)
        conn.commit()

# Example:
# load_intentions_csv("postgresql://user:pass@localhost/db", "intentions.csv")
