"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let lastMessageId = 0;
let currentRoom = 'general';
// Fetch chat rooms and populate the <select> list
function fetchChatRooms() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/chatrooms/');
            const data = yield response.json();
            const roomSelect = document.getElementById('room-select');
            // Clear existing room options
            roomSelect.innerHTML = '';
            // Populate the dropdown with chat rooms
            data.rooms.forEach((room) => {
                const option = document.createElement('option');
                option.value = room.name;
                option.textContent = room.name.charAt(0).toUpperCase() + room.name.slice(1);
                if (room.name === currentRoom) {
                    option.selected = true; // Highlight the current room
                }
                roomSelect.appendChild(option);
            });
            // Fetch messages for the first room if not already set
            if (data.rooms.length > 0 && !currentRoom) {
                changeRoom(data.rooms[0].name);
            }
            else {
                lastMessageId = 0;
                fetchMessages();
            }
        }
        catch (error) {
            console.error("Error fetching chat rooms:", error);
        }
    });
}
// Change room and update chat log
function changeRoom(room) {
    return __awaiter(this, void 0, void 0, function* () {
        currentRoom = room;
        const roomSelect = document.getElementById('room-select');
        const selectedOption = roomSelect.options[roomSelect.selectedIndex];
        if (selectedOption) {
            currentRoom = selectedOption.value;
        }
        const currentRoomElement = document.getElementById('current-room');
        currentRoomElement.textContent = currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1);
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = ''; // Clear chat box
        lastMessageId = 0;
        fetchMessages();
    });
}
// Check if DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    const notificationBtn = document.getElementById('notification-btn');
    if (Notification.permission === 'granted') {
        notificationBtn.style.display = 'none';
    }
});
function getCSRFToken() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
}
// Request notification permission
function requestNotificationPermission() {
    const notificationBtn = document.getElementById('notification-btn');
    if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                alert('Notifications enabled!');
                notificationBtn.style.display = 'none';
            }
            else {
                alert('Notifications disabled!');
            }
        });
    }
    else {
        alert('Notifications are already enabled.');
        notificationBtn.style.display = 'none';
    }
}
// Handle user login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken() || '',
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
        if (data.status === 'success') {
            alert('Logged in successfully!');
        }
        else {
            alert(data.message);
        }
    });
}
// Send message to server
function sendMessage() {
    const message = document.getElementById('message-input').value;
    fetch('/send_message/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: currentRoom, message: message })
    })
        .then(response => response.json())
        .then(data => {
        if (data.status === 'success') {
            document.getElementById('message-input').value = '';
            fetchMessages();
        }
    });
}
// Fetch messages from server
function fetchMessages() {
    let currentRoom = document.getElementById('room-select').value;
    fetch(`/fetch_messages/?room=${currentRoom}&last_id=${lastMessageId}`)
        .then(response => response.json())
        .then(data => {
        const chatBox = document.getElementById('chat-box');
        data.messages.forEach((msg) => {
            const messageElement = document.createElement('div');
            messageElement.textContent = `${msg.user}: ${msg.message}`;
            chatBox.appendChild(messageElement);
            lastMessageId = msg.id;
            // Show notification if @mentioned
            const username = document.getElementById('username').value;
            if (msg.message.includes(`@${username}`) && Notification.permission === 'granted') {
                new Notification(`${msg.user}:`, { body: msg.message });
            }
        });
    });
}
document.addEventListener("DOMContentLoaded", fetchChatRooms);
// Poll for new messages every 3 seconds
setInterval(fetchMessages, 3000);
