import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), "juego.db")

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS estados (
                usuario  TEXT PRIMARY KEY,
                food     INTEGER,
                fighters INTEGER,
                energy   INTEGER,
                queenHP  INTEGER
            )
        """)
        conn.commit()

def guardar_estado(usuario, food, fighters, energy, queenHP):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            INSERT INTO estados (usuario, food, fighters, energy, queenHP)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(usuario) DO UPDATE SET
              food     = excluded.food,
              fighters = excluded.fighters,
              energy   = excluded.energy,
              queenHP  = excluded.queenHP
        """, (usuario, food, fighters, energy, queenHP))
        conn.commit()

def cargar_estado(usuario):
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute("""
            SELECT food, fighters, energy, queenHP
            FROM estados WHERE usuario = ?
        """, (usuario,))
        row = cur.fetchone()
        if row:
            return dict(food=row[0], fighters=row[1], energy=row[2], queenHP=row[3])
        return {}
