import socketio
import requests

BASE_URL = 'http://localhost:3000'

sio = socketio.Client()

@sio.event
def connect():
    print('Connected to server')

@sio.event
def disconnect():
    print('Disconnected from server')

@sio.event
def receive_message(data):
    sender = data.get('username')
    message = data.get('message')

    display_name = 'You' if sender == user_name else sender
    print(f"\r{display_name}: {message}")
    print(">> ", end="", flush=True)

def get_token():
    try:
        with open('.token', 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        return None
    
def write_token(token):
    with open('.token', 'w') as f:
        f.write(token)

def get_all_chats(headers):
    response = requests.get(f'{BASE_URL}/chats', headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f'Error fetching chats: {response.status_code}')
        return []

def getUserName(headers):
    response = requests.get(f'{BASE_URL}/auth/me', headers=headers)
    if response.status_code == 200:
        return response.json().get('username')
    else:
        print(f'Error fetching user info: {response.status_code}')
        return None
    
def login_register_loop():
    while True:
        choice = input('Do you want to login or register? (login/register): ')
        if choice.lower() == 'login':
            username = input('Enter username: ')
            password = input('Enter password: ')
            response = requests.post(f'{BASE_URL}/auth/login', json={'username': username, 'password': password})
            if response.status_code == 200:
                token = response.json().get('token')
                write_token(token)
                print('Login successful.')
                return token
            else:
                print(f'Login failed: {response.status_code} - {response.text}')
        elif choice.lower() == 'register':
            username = input('Enter username: ')
            password = input('Enter password: ')
            response = requests.post(f'{BASE_URL}/auth/register', json={'username': username, 'password': password})
            if response.status_code == 200:
                print('Registration successful.')
                token = response.json().get('token')
                write_token(token)
                return token
            else:
                print(f'Registration failed: {response.status_code} - {response.text}')

if __name__ == '__main__':
    token = get_token()
    if not token:
        token = login_register_loop()
    
    headers = {'Authorization': f'Bearer {token}'}
    user_name = getUserName(headers)

    sio.connect(BASE_URL) 

    history = get_all_chats(headers)
    for chat in history:
        senderName = chat.get('sendername')
        if senderName == user_name:
            print(f"You: {chat['chattext']}")
        else:
            print(f"{senderName}: {chat['chattext']}")

    try:
        while True:
            msg = input(f'>> ')
            if msg.lower() == 'exit':
                break
            sio.emit('chat_message', {'message': msg, 'username': user_name})
    except KeyboardInterrupt:
        sio.disconnect()