import React from "react";
import ReactDOM from "react-dom/client";
import Chatbot from "./Chatbot/chatbot";

// Create a div to hold the chatbot widget
const containerId = "chatbot-widget-container";
let container = document.getElementById(containerId);
if (!container) {
  container = document.createElement("div");
  container.id = containerId;
  document.body.appendChild(container);
}

const root = ReactDOM.createRoot(container);
root.render(<Chatbot />);
