# 🗨️ Django Chat Application

A real-time chat application built with **Django**, **TypeScript**, and **JavaScript**. This project demonstrates the power of Django for backend management, WebSockets for real-time communication, and TypeScript for scalable front-end code.

---

## 🚀 Features
- 🗣️ **User Registration & Authentication:** Sign up, login, and logout securely.
- 🗨️ **Chat Rooms:** Create and join multiple chat rooms.
- 🔔 **Notifications:** Get browser notifications for @mentions.
- 📥 **Real-time Messages:** Messages update without refreshing the page.
- 🌐 **Responsive Design:** Works on desktop and mobile.
- 🛡️ **CSRF Protection:** Secure POST requests.

---

## 🛠️ Installation

### 1. 📦 Clone the repository
```bash
git clone https://github.com/your-username/django-chat-app.git
cd django-chat-app
```
### 2. 🐍 Create a virtual environment and activate it
```python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
### 3. 📥 Install dependencies
`pip install -r requirements.txt`

### 4. ⚙️ Configure the database
Run migrations to create necessary tables:

`python manage.py migrate`

### 5. 🗝️ Create a superuser (optional)
`python manage.py createsuperuser`
### 6. 🏗️ Compile TypeScript
Ensure TypeScript is installed globally:

`npm install -g typescript`

Compile TypeScript to JavaScript:

`npx tsc`

### 7. 🚀 Run the development server

`python manage.py runserver`

Open your browser and visit: http://127.0.0.1:8000

## 🛠️ Technologies Used

* Backend: Django, Django ORM
* Frontend: HTML5, CSS3, TypeScript, JavaScript
* Database: SQLite (default)
* Notifications: Browser Notifications API
* Security: Django’s built-in authentication and
CSRF protection
