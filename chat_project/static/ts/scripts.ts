let lastMessageId: number = 0;
let currentRoom = 'general';

interface ChatRoom {
    id: number;
    name: string;
}

// Define types for message data
interface MessageData {
    id: number;
    room: string;
    user: string;
    message: string;
}

// Fetch chat rooms and populate the <select> list
async function fetchChatRooms(): Promise<void> {
    try {
        const response = await fetch('/chatrooms/');
        const data = await response.json();
        const roomSelect = document.getElementById('room-select') as HTMLSelectElement;

        // Clear existing room options
        roomSelect.innerHTML = '';

        // Populate the dropdown with chat rooms
        (data.rooms as ChatRoom[]).forEach((room: ChatRoom) => {
            const option = document.createElement('option');
            option.value = room.name;
            option.textContent = room.name.charAt(0).toUpperCase() + room.name.slice(1);
            if (room.name === currentRoom) {
                option.selected = true;  // Highlight the current room
            }
            roomSelect.appendChild(option);
        });

        // Fetch messages for the first room if not already set
        if (data.rooms.length > 0 && !currentRoom) {
            changeRoom(data.rooms[0].name);
        } else {
            lastMessageId = 0;
            fetchMessages();
        }
    } catch (error) {
        console.error("Error fetching chat rooms:", error);
    }
}

// Change room and update chat log
async function changeRoom(room: string): Promise<void> {
    currentRoom = room;

    const roomSelect = document.getElementById('room-select') as HTMLSelectElement;
    const selectedOption = roomSelect.options[roomSelect.selectedIndex];

    if (selectedOption) {
        currentRoom = selectedOption.value;
    }

    const currentRoomElement = document.getElementById('current-room')!;
    currentRoomElement.textContent = currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1);

    const chatBox = document.getElementById('chat-box') as HTMLDivElement;
    chatBox.innerHTML = '';  // Clear chat box

    lastMessageId = 0;
    fetchMessages();
}


// Check if DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    const notificationBtn = document.getElementById('notification-btn') as HTMLButtonElement;
    if (Notification.permission === 'granted') {
        notificationBtn.style.display = 'none';
    }
});

function getCSRFToken(): string | null {
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
function requestNotificationPermission(): void {
    const notificationBtn = document.getElementById('notification-btn') as HTMLButtonElement;

    if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                alert('Notifications enabled!');
                notificationBtn.style.display = 'none';
            } else {
                alert('Notifications disabled!');
            }
        });
    } else {
        alert('Notifications are already enabled.');
        notificationBtn.style.display = 'none';
    }
}

// Handle user login
function login(): void {
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

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
            } else {
                alert(data.message);
            }
        });
}

function logout(): void {
    fetch('/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken() || ''  // Include CSRF token for security
        }
    }).then(response => {
        if (response.ok) {
            window.location.href = '/';  // Redirect to home if successful
        } else {
            console.error('Logout failed');
        }
    }).catch(error => {
        console.error('Error during logout:', error);
    });
}

// Send message to server
function sendMessage(): void {
    const message = (document.getElementById('message-input') as HTMLInputElement).value;

    fetch('/send_message/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: currentRoom, message: message })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                (document.getElementById('message-input') as HTMLInputElement).value = '';
                fetchMessages();
            }
        });
}

// Fetch messages from server
function fetchMessages(): void {
    let currentRoom = (document.getElementById('room-select') as HTMLInputElement).value;
    fetch(`/fetch_messages/?room=${currentRoom}&last_id=${lastMessageId}`)
        .then(response => response.json())
        .then(data => {
            const chatBox = document.getElementById('chat-box') as HTMLDivElement;
            data.messages.forEach((msg: MessageData) => {
                const messageElement = document.createElement('div');
                messageElement.textContent = `${msg.user}: ${msg.message}`;
                chatBox.appendChild(messageElement);
                lastMessageId = msg.id;

                // Safely get username if logged in
                const usernameInput = document.getElementById('username') as HTMLInputElement | null;
                const username = usernameInput ? usernameInput.value : null;
                // Show notification if @mentioned and username is available
                if (username && msg.message.includes(`@${username}`) && Notification.permission === 'granted') {
                    new Notification(`${msg.user}:`, { body: msg.message });
                }
            });
        });
}

document.addEventListener("DOMContentLoaded", fetchChatRooms);
document.addEventListener("DOMContentLoaded", () => {
    const messageInput = document.getElementById('message-input') as HTMLInputElement | null;

    if (messageInput) {  // Check if the input exists
        messageInput.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();  // Stop default Enter behavior (like form submission)
                sendMessage();           // Call sendMessage function
            }
        });
    } else {
        console.error('message-input element not found');
    }
});
// Poll for new messages every 3 seconds
setInterval(fetchMessages, 3000);
