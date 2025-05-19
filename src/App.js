import React from "react";
import { Routes, Route } from "react-router-dom";
import EmbeddableChatbot from "./Chatbot/EmbeddableChatbot";
import "./index.css";

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const position = queryParams.get("position") || "bottom-right";
  const apiUrl = queryParams.get("apiUrl") || "http://127.0.0.1:8000/chat";
  const botName = queryParams.get("botName") || "PI Assist";
  const companyName = queryParams.get("companyName") || "People's Insurance";
  const userId =
    queryParams.get("userId") ||
    `user_${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <EmbeddableChatbot
            position={position}
            apiUrl={apiUrl}
            botName={botName}
            companyName={companyName}
            userId={userId}
          />
        }
      />
    </Routes>
  );
}

export default App;
