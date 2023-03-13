let socket = io();
let lastOutputOption = [];

//Click event functionality
function handleSpanClick(event) {
  appendUserMessage(event.target.textContent);
  const spans = document.querySelectorAll(".popup-option span");
  spans.forEach((span) => {
    span.removeEventListener("click", handleSpanClick);
  });
}
//Create User message
const userMessage = ({ ...userDetails }) => {
  // Get the chat-body element
  let chatBody = document.querySelector(".chat-body");
  // Create the customer-message element
  let customerMessage = document.createElement("div");
  customerMessage.classList.add("customer-message");
  // Create the image-section element
  let imageSection = document.createElement("div");
  imageSection.classList.add("image-section");
  // Create the img element
  let img = document.createElement("img");
  img.src = userDetails.image;
  img.alt = userDetails.altText;
  // Create the date element
  let date = document.createElement("span");
  date.classList.add("date");
  let dateFormat = new Date();
  date.innerText = dateFormat.getHours() + ":" + dateFormat.getMinutes();
  // Append the img and date elements to the image-section element
  imageSection.appendChild(img);
  imageSection.appendChild(date);
  // Create the message-section element
  let messageSection = document.createElement("div");
  messageSection.classList.add("message-section");
  // Create the h4 element
  let h4 = document.createElement("h4");
  h4.innerText = userDetails.message;
  // Append the h4 element to the message-section element
  messageSection.appendChild(h4);
  // Append the image-section and message-section elements to the customer-message element
  customerMessage.appendChild(imageSection);
  customerMessage.appendChild(messageSection);
  // Append the customer-message element to the chat-body element
  chatBody.appendChild(customerMessage);
  const spans = document.querySelectorAll(".popup-option span");
  spans.forEach((span) => {
    span.removeEventListener("click", handleSpanClick);
  });
  chatBody.scrollTop = chatBody.scrollHeight;
};
//Create bot message
const botMessage = ({ ...botDetails }) => {
  lastOutputOption = botDetails.options;
  // Get the chat-body element
  let chatBody = document.querySelector(".chat-body");
  // Create the customer-message element
  let botMessage = document.createElement("div");
  botMessage.classList.add("bot-message");
  // Create the image-section element
  let imageSection = document.createElement("div");
  imageSection.classList.add("image-section");
  // Create the img element
  let img = document.createElement("img");
  img.src = "/static/images/bot.png";
  img.alt = "Burgerito Bot Image";
  // Create the date element
  let date = document.createElement("span");
  date.classList.add("date");
  let dateFormat = new Date();
  date.innerText = dateFormat.getHours() + ":" + dateFormat.getMinutes();
  // Append the img and date elements to the image-section element
  imageSection.appendChild(img);
  imageSection.appendChild(date);
  // Create the message-section element
  let messageSection = document.createElement("div");
  messageSection.classList.add("message-section");
  // Create the h4 element
  let h4 = document.createElement("h4");
  h4.innerHTML = botDetails.message;
  const container = document.createElement("div");
  container.classList.add("popup-options");
  for (let i = 0; i < botDetails.options.length; i++) {
    const option = document.createElement("div");
    option.classList.add("popup-option");
    const span = document.createElement("span");
    span.textContent = botDetails.options[i];
    span.addEventListener("click", handleSpanClick);
    option.appendChild(span);
    container.appendChild(option);
  }
  // Append the h4 element to the message-section element
  messageSection.appendChild(h4);
  messageSection.appendChild(container);
  // Append the image-section and message-section elements to the customer-message element
  botMessage.appendChild(imageSection);
  botMessage.appendChild(messageSection);

  // Append the customer-message element to the chat-body element
  chatBody.appendChild(botMessage);
  chatBody.scrollTop = chatBody.scrollHeight;
};
//Create Info Message
const infoMessage = (message) => {
  let chatBody = document.querySelector(".chat-body");
  let infoSection = document.createElement("span");
  infoSection.innerHTML = message;
  infoSection.classList.add("info");
  chatBody.appendChild(infoSection);
  chatBody.scrollTop = chatBody.scrollHeight;
};
// Get Input Element
const form = document.getElementById("form");
const inputElement = document.getElementById("my-input");
//page on load functionality
window.addEventListener("load", () => {
  let username = prompt("Please enter your name");
  if (!username) {
    username = "Anonymous ";
  }
  socket.emit("userConnection", username);
  inputElement.focus();
});
let lastNumber = ["101"];
//User message functionality
function appendUserMessage(messageInput) {
  // Get the value of the input element
  let inputValue = messageInput.trim();
  if (!inputValue) return;
  userMessage({
    message: inputValue,
    image: "/static/images/user.png",
    altText: "User Image",
  });
  let orderItems = [
    "20",
    "21",
    "22",
    "23",
    "24",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
  ];
  if (lastOutputOption.includes(parseInt(inputValue))) {
    if (inputValue === "100") {
      if (lastNumber.length === 1) {
        inputValue = lastNumber[0];
      } else {
        lastNumber.pop();
        inputValue = lastNumber[lastNumber.length - 1];
      }
      console.log(lastNumber)
    } else {
      if (orderItems.includes(inputValue)) {
        lastNumber.push();
      } else {
        lastNumber.push(inputValue);
      }
      console.log(lastNumber);
    }
  } else {
    inputValue = "404";
  }
  socket.emit("userMessage", parseInt(inputValue));
  inputElement.value = "";
}
//Info message event Listener
socket.on("infoMessage", (output) => {
  infoMessage(output.message);
});
//Bot message Reply
socket.on("botMessage", (output) => {
  setTimeout(() => {
    botMessage({
      message: output.message,
      image: "/static/images/bot.png",
      altText: "Bot Image",
      options: output.options,
    });
  }, 1000);
});
//Form submit
form.addEventListener("submit", (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();
  appendUserMessage(inputElement.value);
});
