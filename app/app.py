from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from db import init_db, guardar_estado, cargar_estado
import json, os

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "static"))
USER_FILE  = os.path.join(BASE_DIR, "users.json")

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="/static")
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24).hex())   # Clave secreta segura
CORS(app, supports_credentials=True)

# ---------- Rutas básicas ----------
@app.route("/")
def root():
    return send_from_directory(STATIC_DIR, "login.html")

@app.route("/juego.html")
def juego():
    return app.send_static_file("juego.html")

@app.route("/defense.html")
def defense():
    return app.send_static_file("defense.html")

# Rutas para sprites eliminadas

# ---------- Login / registro ----------
def load_users():
    if not os.path.exists(USER_FILE): return {}
    with open(USER_FILE) as f: return json.load(f)

@app.route("/login", methods=["POST"])
def login():
    data  = request.json
    user  = data.get("username")
    pwd   = data.get("password")
    users = load_users()

    stored = users.get(user)
    if isinstance(stored, dict):
        stored = stored.get("password")

    if stored == pwd:
        session["usuario"] = user            # <── AHORA guardamos la sesión
        return jsonify({"message": "Login exitoso"})
    return jsonify({"error": "Credenciales inválidas"}), 401

@app.route("/register", methods=["POST"])
def register():
    data  = request.json
    user  = data.get("username")
    pwd   = data.get("password")
    users = load_users()
    if user in users:
        return jsonify({"error": "Usuario ya existe"}), 409
    users[user] = pwd
    with open(USER_FILE, "w") as f:
        json.dump(users, f)
    return jsonify({"message": "Usuario registrado"})

# ---------- Persistencia del juego ----------
@app.route("/guardar_estado", methods=["POST"])
def guardar_estado_usuario():
    if "usuario" not in session:
        return jsonify({"error": "No autenticado"}), 401
    data = request.json
    guardar_estado(
        session["usuario"],
        data["food"],
        data["fighters"],
        data["energy"],
        data["queenHP"],
        data.get("exploradoras", 0),
        data.get("guerreras", 0),
        data.get("levelExplorer", 1),
        data.get("levelFighter", 1),
        data.get("levelQueen", 1),
        data.get("levelCombat", 1)
    )
    return jsonify({"ok": True})

@app.route("/cargar_estado", methods=["GET"])
def cargar_estado_usuario():
    if "usuario" not in session:
        return jsonify({"error": "No autenticado"}), 401
    estado = cargar_estado(session["usuario"])
    return jsonify(estado)

# ---------- Inicializar DB y arrancar ----------
init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
