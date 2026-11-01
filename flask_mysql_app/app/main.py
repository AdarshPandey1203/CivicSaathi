from flask import Flask, jsonify, request
from app.db import get_connection

app = Flask(__name__)

@app.route('/')
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/users', methods=['GET', 'POST'])
def users():
    conn = get_connection()
    cursor = conn.cursor()
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        cursor.execute('INSERT INTO users (name, email) VALUES (%s, %s)', (name, email))
        conn.commit()
        return jsonify({'message': 'User created'}), 201
    else:
        cursor.execute('SELECT id, name, email FROM users')
        rows = cursor.fetchall()
        return jsonify(rows), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
