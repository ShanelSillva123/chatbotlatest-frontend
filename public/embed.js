(function() {
  const defaultConfig = {
    position: 'bottom-right', 
    apiUrl: 'https://pichatbot.microwebstudios.com/assistant', 
    botName: 'PI Assist',
    companyName: 'People\'s Insurance',
    chatbotUrl: 'https://pichatbot1.microwebstudios.com', 
    zIndex: 9999
  };

  const scriptTag = document.currentScript;
  const config = { ...defaultConfig };
  
  if (scriptTag) {
    if (scriptTag.getAttribute('data-position')) 
      config.position = scriptTag.getAttribute('data-position');
    if (scriptTag.getAttribute('data-api-url')) 
      config.apiUrl = scriptTag.getAttribute('data-api-url');
    if (scriptTag.getAttribute('data-bot-name')) 
      config.botName = scriptTag.getAttribute('data-bot-name');
    if (scriptTag.getAttribute('data-company-name')) 
      config.companyName = scriptTag.getAttribute('data-company-name');
    if (scriptTag.getAttribute('data-chatbot-url')) 
      config.chatbotUrl = scriptTag.getAttribute('data-chatbot-url');
    if (scriptTag.getAttribute('data-z-index')) 
      config.zIndex = scriptTag.getAttribute('data-z-index');
  }

  const userId = `user_${Math.random().toString(36).substr(2, 9)}`;

  const getPositionStyle = () => {
    switch(config.position) {
      case 'bottom-left': return 'bottom: 20px; left: 20px;';
      case 'top-right': return 'top: 20px; right: 20px;';
      case 'top-left': return 'top: 20px; left: 20px;';
      case 'bottom-right': 
      default: return 'bottom: 20px; right: 20px;';
    }
  };

  const style = document.createElement('style');
  style.innerHTML = `
    .pi-chat-button {
      position: fixed;
      ${getPositionStyle()}
      z-index: ${config.zIndex};
      width: 9rem;
      height: 9rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    
    .pi-chat-button:hover {
      transform: scale(1.1);
    }
    
    .pi-chat-window {
      position: fixed;
      ${getPositionStyle()}
      z-index: ${config.zIndex};
      width: 400px;
      height: 620px;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
      display: none;
    }
    
    .pi-close-button {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
      background-color: rgba(0,0,0,0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      font-size: 16px;
      z-index: ${Number(config.zIndex) + 1};
    }
  `;
  document.head.appendChild(style);

  const iframeSrc = `${config.chatbotUrl}/?position=${config.position}&apiUrl=${encodeURIComponent(config.apiUrl)}&botName=${encodeURIComponent(config.botName)}&companyName=${encodeURIComponent(config.companyName)}&userId=${encodeURIComponent(userId)}`;
  
  const chatButton = document.createElement('div');
  chatButton.className = 'pi-chat-button';

  const lottieScript = document.createElement('script');
  lottieScript.className = 'lottie';
  lottieScript.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
  document.head.appendChild(lottieScript);
  lottieScript.onload = () => {
    chatButton.innerHTML = `
    <lottie-player
      src="https://peoplesinsurance.lk/wp-content/uploads/2025/04/chat-bot-animation.json"
      background="transparent"
      speed="1"
      style="width: 100%; height:100%;"
      loop
      autoplay>
    </lottie-player>
  `;
  };

  const chatWindow = document.createElement('div');
  chatWindow.className = 'pi-chat-window';
  
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
  iframe.src = iframeSrc;
  
  const closeButton = document.createElement('div');
  closeButton.className = 'pi-close-button';
  closeButton.textContent = '✕';
  
  chatWindow.appendChild(iframe);
  chatWindow.appendChild(closeButton);
  document.body.appendChild(chatButton);
  document.body.appendChild(chatWindow);
  
  chatButton.addEventListener('click', function() {
    chatWindow.style.display = 'block';
    chatButton.style.display = 'none';
    
    try {
      iframe.contentWindow.postMessage({
        type: 'TOGGLE_CHAT',
        open: true
      }, '*');
    } catch (error) {
      console.error('Error sending message to iframe:', error);
    }
  });
  
  closeButton.addEventListener('click', function() {
    chatWindow.style.display = 'none';
    chatButton.style.display = 'flex';
    
    // Notify iframe that chat is closed
    try {
      iframe.contentWindow.postMessage({
        type: 'TOGGLE_CHAT',
        open: false
      }, '*');
    } catch (error) {
      console.error('Error sending message to iframe:', error);
    }
  });
  
  window.addEventListener('message', function(event) {
    try {
      const data = event.data;
      
      if (data.type === 'CHATBOT_STATE_CHANGED') {
        if (!data.isChatOpen) {
          chatWindow.style.display = 'none';
          chatButton.style.display = 'flex';
        }
      }
    } catch (error) {
      console.error('Error processing message from iframe:', error);
    }
  });
  
  window.piChatbotDebug = {
    showButton: function() {
      chatButton.style.display = 'flex';
      chatWindow.style.display = 'none';
    },
    showWindow: function() {
      chatButton.style.display = 'none';
      chatWindow.style.display = 'block';
    },
    chatButton,
    chatWindow,
    iframe,
    config,
    userId
  };
})();