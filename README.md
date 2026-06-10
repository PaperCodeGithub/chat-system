# Real-Time Full-Stack Chat System

A professional real-time chat application architecture featuring a Node.js backend, PostgreSQL database, and a Python CLI client.

## System Architecture
The application utilizes a hybrid communication model:
* **REST API:** Handles user authentication (Registration/Login) and historical data retrieval.
* **WebSockets:** Provides bi-directional, low-latency message broadcasting via Socket.io.
* **Database:** Relational storage for user credentials and message persistence.



## Technical Specifications
* **Backend:** Node.js, Express.js, Socket.io
* **Database:** PostgreSQL
* **Security:** JWT (JSON Web Tokens), Bcrypt password hashing
* **Client:** Python 3.x, python-socketio, Requests

## Database Schema
Execute the following SQL commands to initialize the required tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    senderName TEXT NOT NULL,
    chatText TEXT NOT NULL,
    datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Installation and Setup
### Server Configuration
```bash
npm install express socket.io pg jsonwebtoken bcrypt dotenv
```
Configure your ```.env``` file with the following variables:
```
DATABASE_URL=your_url
JWT_SECRET=your_secure_jwt_secret
```
### Python Client Configuration
Install the required Python libraries:
```bash
pip install "python-socketio[client]" requests
```

## Execution
1. Start the Node.js server: ```npm run dev``` or ```node index.js```.
2. Launch the Python client: python ```chat_client.py```.
3. Follow the CLI prompts to register or login.
4. Messages sent are automatically saved to PostgreSQL and broadcasted to all active clients.

## Security Implementation
- **Password Hashing**: Utilizes Bcrypt with a salt factor of 10.
- **Stateless Auth**: Employs JWT for session management, stored locally in the client as a hidden file.
- **Input Sanitization**: Parameterized queries are used for all PostgreSQL interactions to prevent SQL injection.
