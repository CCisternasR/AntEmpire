from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json, os

app = Flask(__name__)
CORS(app)
STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static'))

@app.route('/')
def root():
    return send_from_directory(STATIC_DIR, 'login.html')

@app.route('/juego.html')
def juego():
    return send_from_directory(STATIC_DIR, 'juego.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user, pwd = data.get('username'), data.get('password')
    users = load_users()
    if user in users:
        stored = users[user]
        # Acepta ambos formatos
        if isinstance(stored, dict):
            stored = stored.get('password')
        if stored == pwd:
            return jsonify({'message':'Login exitoso'})
    return jsonify({'error':'Credenciales inválidas'}), 401

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
    if not os.path.exists('users.json'):
        return {}
    with open('users.json') as f:
        return json.load(f)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
