interface Message {
  userId?: string;
  username: string;
  text: string;
  time: string;
}

interface User {
  username: string;
  id: string;
}

// These variables are set in the EJS template
declare const userId: string;
declare const username: string;
declare const io: any;

// DOM Elements
const chatForm = document.getElementById("chat-form") as HTMLFormElement;
const chatMessages = document.getElementById("chat-messages") as HTMLDivElement;
const usersList = document.getElementById("users") as HTMLUListElement;

// Connect to Socket.io
const socket = io();

// Join chatroom
socket.emit("joinRoom", { userId });

// Message from server
socket.on("message", (message: Message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Get room users
socket.on("roomUsers", ({ users }: { users: User[] }) => {
  outputUsers(users);
});

// Message submit
chatForm.addEventListener("submit", (e: Event) => {
  e.preventDefault();

  // Get message text
  const msgInput = document.getElementById("msg") as HTMLInputElement;
  const msg = msgInput.value;

  // Emit message to server
  socket.emit("chatMessage", { userId, msg });

  // Clear input
  msgInput.value = "";
  msgInput.focus();
});

// Output message to DOM
function outputMessage(message: Message): void {
  const div = document.createElement("div");
  div.classList.add("message");

  // Add "own-message" class if the message is from the current user
  if (message.username === username) {
    div.classList.add("own-message");
  }

  div.innerHTML = `
      <p class="meta">${message.username} <span>${new Date(
    message.time
  ).toLocaleTimeString()}</span></p>
      <p class="text">${message.text}</p>
    `;
  chatMessages.appendChild(div);
}

// Output users to DOM
function outputUsers(users: User[]): void {
  usersList.innerHTML = users
    .map((user) => `<li>${user.username}</li>`)
    .join("");
}
