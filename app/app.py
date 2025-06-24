from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json, os


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'static'))
USER_FILE = os.path.join(BASE_DIR, 'users.json')

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='/static')
CORS(app)

@app.route('/')
def root():
    return send_from_directory(STATIC_DIR, 'login.html')

@app.route('/juego.html')
def juego():
    return app.send_static_file('juego.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user, pwd = data.get('username'), data.get('password')
    users = load_users()

    print("Usuario ingresado:", user)
    print("Password ingresado:", pwd)
    print("Usuarios cargados:", users)

    if user in users:
        stored = users[user]
        if isinstance(stored, dict):
            stored = stored.get('password')
        print("Password esperado:", stored)
        if stored == pwd:
            return jsonify({'message': 'Login exitoso'})
    
    return jsonify({'error': 'Credenciales inválidas'}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    user, pwd = data.get('username'), data.get('password')
    users = load_users()
    if user in users:
        return jsonify({'error': 'Usuario ya existe'}), 409
    users[user] = pwd
    with open('users.json', 'w') as f:
        json.dump(users, f)
    return jsonify({'message': 'Usuario registrado'})

def load_users():
    base_path = os.path.dirname(os.path.abspath(__file__))
    users_path = os.path.join(base_path, 'users.json')
    if not os.path.exists(users_path):
        return {}
    with open(users_path) as f:
        return json.load(f)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
