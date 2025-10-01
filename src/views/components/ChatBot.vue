<template>
  <div class="chatbot-container">
    <!-- 悬浮按钮 -->
    <button 
      class="chatbot-toggle-btn" 
      @click="toggleChat"
      :class="{ active: isOpen }"
    >
      <img v-if="!isOpen" :src="chatbotIcon" alt="Chatbot" class="chatbot-icon" />
      <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- 聊天对话框 -->
    <div class="chatbot-dialog" :class="{ open: isOpen }">
      <div class="chatbot-header">
        <h3>Carbon Assistant</h3>
        <p>I can help you learn about carbon footprint and environmental knowledge</p>
      </div>
      
      <div class="chatbot-messages" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="{ 'user-message': message.isUser, 'bot-message': !message.isUser }"
        >
          <div class="message-bubble">
            <div class="message-content" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        
        <!-- 加载指示器 -->
        <div v-if="isLoading" class="message bot-message">
          <div class="message-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chatbot-input">
        <input 
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          placeholder="Type your question..."
          :disabled="isLoading"
        />
        <button 
          @click="sendMessage" 
          :disabled="!inputMessage.trim() || isLoading"
          class="send-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import chatbotIcon from '@/assets/img/chatbot.jpg'

export default {
  name: 'ChatBot',
  data() {
    return {
      isOpen: false,
      inputMessage: '',
      messages: [],
      isLoading: false,
      eventSource: null,
      chatId: null,
      chatbotIcon
    }
  },
  mounted() {
    // Add welcome message
    this.addMessage('Hello! I am your Carbon Assistant. I can help you learn about carbon footprint and environmental knowledge. Feel free to ask me anything!', false)
  },
  beforeUnmount() {
    if (this.eventSource) {
      this.eventSource.close()
    }
  },
  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen
      if (this.isOpen) {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    
    async sendMessage() {
      if (!this.inputMessage.trim() || this.isLoading) return
      
      const userMessage = this.inputMessage.trim()
      this.addMessage(userMessage, true)
      this.inputMessage = ''
      
      this.isLoading = true
      
      try {
        await this.sendToAPI(userMessage)
      } catch (error) {
        console.error('Failed to send message:', error)
        this.addMessage('Sorry, I am unable to respond to your message right now. Please try again later.', false)
      } finally {
        this.isLoading = false
      }
    },
    
    addMessage(content, isUser) {
      const message = {
        id: Date.now() + Math.random(),
        content,
        isUser,
        timestamp: new Date()
      }
      this.messages.push(message)
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    
    async sendToAPI(message) {
      const baseURL = 'http://3.25.234.38:8123'
      const chatId = this.generateChatId()
      const url = `${baseURL}/api/ai/carbon_assistant/chat/sse?message=${encodeURIComponent(message)}&chatId=${encodeURIComponent(chatId)}`
      
      return new Promise((resolve, reject) => {
        this.eventSource = new EventSource(url)
        let botResponse = ''
        
        this.eventSource.onmessage = (event) => {
          // Handle SSE data format: data: content
          if (event.data && event.data !== '[DONE]') {
            botResponse += event.data
            this.updateLastMessage(botResponse)
          }
        }
        
        this.eventSource.onerror = (error) => {
          console.error('SSE connection error:', error)
          this.eventSource.close()
          reject(error)
        }
        
        // Handle end of stream
        this.eventSource.addEventListener('message', (event) => {
          if (event.data === '[DONE]') {
            this.eventSource.close()
            resolve()
          }
        })
        
        // Set timeout
        setTimeout(() => {
          if (this.eventSource) {
            this.eventSource.close()
            if (!botResponse) {
              reject(new Error('Request timeout'))
            } else {
              resolve()
            }
          }
        }, 30000) // 30 second timeout
      })
    },
    
    generateChatId() {
      // Generate a unique chat ID for the session
      if (!this.chatId) {
        this.chatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      }
      return this.chatId
    },
    
    updateLastMessage(content) {
      const lastMessage = this.messages[this.messages.length - 1]
      if (lastMessage && !lastMessage.isUser) {
        lastMessage.content = content
      } else {
        this.addMessage(content, false)
      }
    },
    
    formatMessage(content) {
      // Simple line break handling
      return content.replace(/\n/g, '<br>')
    },
    
    formatTime(timestamp) {
      return timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }
}
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chatbot-toggle-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
}

.chatbot-icon {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
}

.chatbot-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(76, 175, 80, 0.6);
}

.chatbot-toggle-btn.active {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  box-shadow: 0 4px 20px rgba(244, 67, 54, 0.4);
}

.chatbot-toggle-btn.active .chatbot-icon {
  display: none;
}

.chatbot-dialog {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  transform: translateY(20px) scale(0.9);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  overflow: hidden;
}

.chatbot-dialog.open {
  transform: translateY(0) scale(1);
  opacity: 1;
  visibility: visible;
}

.chatbot-header {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 20px;
  text-align: center;
}

.chatbot-header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 600;
}

.chatbot-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.chatbot-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  display: flex;
  width: 100%;
}

.user-message {
  justify-content: flex-end;
}

.bot-message {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
}

.user-message .message-bubble {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border-bottom-right-radius: 4px;
}

.bot-message .message-bubble {
  background: #f5f5f5;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-content {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chatbot-input {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  align-items: center;
}

.chatbot-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.chatbot-input input:focus {
  border-color: #4CAF50;
}

.chatbot-input input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .chatbot-dialog {
    width: 300px;
    height: 450px;
  }
  
  .chatbot-container {
    bottom: 15px;
    right: 15px;
  }
  
  .chatbot-toggle-btn {
    width: 50px;
    height: 50px;
  }
}
</style>
