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
                queenHP  INTEGER,
                exploradoras INTEGER DEFAULT 0,
                guerreras INTEGER DEFAULT 0,
                levelExplorer INTEGER DEFAULT 1,
                levelFighter INTEGER DEFAULT 1,
                levelQueen INTEGER DEFAULT 1,
                levelCombat INTEGER DEFAULT 1
            )
        """)
        conn.commit()

def guardar_estado(usuario, food, fighters, energy, queenHP, exploradoras, guerreras,
                   levelExplorer, levelFighter, levelQueen, levelCombat):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO estados (usuario, food, fighters, energy, queenHP, exploradoras, guerreras, levelExplorer, levelFighter, levelQueen, levelCombat)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(usuario) DO UPDATE SET
            food = excluded.food,
            fighters = excluded.fighters,
            energy = excluded.energy,
            queenHP = excluded.queenHP,
            exploradoras = excluded.exploradoras,
            guerreras = excluded.guerreras,
            levelExplorer = excluded.levelExplorer,
            levelFighter = excluded.levelFighter,
            levelQueen = excluded.levelQueen,
            levelCombat = excluded.levelCombat
    ''', (usuario, food, fighters, energy, queenHP, exploradoras, guerreras,
          levelExplorer, levelFighter, levelQueen, levelCombat))
    conn.commit()
   

def cargar_estado(usuario):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        SELECT food, fighters, energy, queenHP, exploradoras, guerreras,levelExplorer, levelFighter, levelQueen, levelCombat
        FROM estados WHERE usuario = ?
    ''', (usuario,))
    row = c.fetchone()
    conn.close()
    if row:
        return {
            "food": row[0],
            "fighters": row[1],
            "energy": row[2],
            "queenHP": row[3],
            "exploradoras": row[4],
            "guerreras": row[5],
            "levelExplorer": row[6],
            "levelFighter": row[7],
            "levelQueen": row[8],
            "levelCombat": row[9],
        }
    return {
        "food": 10, "fighters": 0, "energy": 100, "queenHP": 100,
        "exploradoras": 0, "guerreras": 0,
        "levelExplorer": 1, "levelFighter": 1, "levelQueen": 1, "levelCombat": 1
    }

