<template>
  <div class="chatbot-container">
    <!-- Floating Button -->
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

    <!-- Chat Dialog -->
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
        
        <!-- Preset Questions -->
        <div v-if="showPresetQuestions" class="preset-questions">
          <div class="preset-questions-title">Quick Questions:</div>
          <div class="preset-questions-list">
            <button 
              v-for="question in presetQuestions" 
              :key="question"
              @click="selectPresetQuestion(question)"
              class="preset-question-btn"
              :disabled="isLoading"
            >
              {{ question }}
            </button>
          </div>
        </div>
        
        <!-- Loading Indicator -->
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

<script lang="js">
import chatbotIcon from '@/assets/img/chatbot.jpg'
import { marked } from 'marked'

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
      chatbotIcon,
      presetQuestions: [
        'What is a carbon footprint?',
        'How can I reduce my daily carbon footprint?',
        'Which activities produce the most carbon emissions?',
        'Why is reducing carbon emissions important for the environment?'
      ],
      showPresetQuestions: true
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
      this.showPresetQuestions = false
      
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
    
    async selectPresetQuestion(question) {
      if (this.isLoading) return
      
      this.addMessage(question, true)
      this.showPresetQuestions = false
      
      this.isLoading = true
      
      try {
        await this.sendToAPI(question)
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
      // Use same-origin /api, proxy to backend through Vercel rewrites to avoid browser Mixed Content/CORS
      const chatId = this.generateChatId()
      const url = `/api/ai/carbon_assistant/chat/sse?message=${encodeURIComponent(message)}&chatId=${encodeURIComponent(chatId)}`
      
      return new Promise((resolve, reject) => {
        this.eventSource = new EventSource(url)
        let botResponse = ''
        
        this.eventSource.onmessage = (event) => {
          // Handle SSE data format: data: content
          if (event.data && event.data !== '[DONE]') {
            console.log('Raw backend response chunk:', JSON.stringify(event.data))
            // Add space between chunks to prevent concatenation, but be smart about it
            if (botResponse && !botResponse.endsWith(' ') && !event.data.startsWith(' ')) {
              botResponse += ' '
            }
            botResponse += event.data
            console.log('Accumulated response so far:', JSON.stringify(botResponse))
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
      // Enhanced text formatting with markdown support
      console.log('Original content before formatting:', JSON.stringify(content))
      
      // Remove trailing newlines first
      const trimmedContent = content.replace(/\n+$/, '')
      
      try {
        // Configure marked options
        marked.setOptions({
          breaks: false, // Don't convert \n to <br> automatically
          gfm: true, // GitHub Flavored Markdown
        })
        
        // Parse markdown
        const formatted = marked.parse(trimmedContent)
        
        // Clean up the output: remove extra newlines and normalize spacing
        const cleaned = formatted
          .replace(/\n+/g, '') // Remove all newlines from markdown output
          .replace(/\s+/g, ' ') // Normalize multiple spaces
          .trim()
        
        console.log('Formatted content after processing:', JSON.stringify(cleaned))
        return cleaned
      } catch (error) {
        console.log('Marked parsing failed, using fallback formatting:', error)
        // Fallback to simple formatting
        const formatted = trimmedContent
          .replace(/\n\n/g, '<br><br>') // Double line breaks for paragraphs
          .replace(/\n/g, '<br>') // Single line breaks
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim()
        console.log('Formatted content after processing (fallback):', JSON.stringify(formatted))
        return formatted
      }
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
  color: #ffffff;
  padding: 20px;
  text-align: center;
}

.chatbot-header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.chatbot-header p {
  margin: 0;
  font-size: 14px;
  color: #ffffff;
  opacity: 0.95;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.chatbot-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  padding: 14px 18px;
  border-radius: 18px;
  position: relative;
  margin-bottom: 2px;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  text-align: left;
  letter-spacing: 0.3px;
  word-spacing: 0.1em;
  text-rendering: optimizeLegibility;
  font-feature-settings: "kern" 1;
}

/* Style all HTML elements within message content with maximum specificity */
.chatbot-container .bot-message .message-content {
  color: #333333 !important;
}

.chatbot-container .bot-message .message-content * {
  color: inherit !important;
}

.chatbot-container .bot-message .message-content p {
  color: #333333 !important;
  margin: 8px 0;
}

.chatbot-container .bot-message .message-content ul,
.chatbot-container .bot-message .message-content ol {
  color: #333333 !important;
  margin: 8px 0;
  padding-left: 20px;
}

.chatbot-container .bot-message .message-content li {
  color: #333333 !important;
  margin: 4px 0;
}

/* Style headers within message content with maximum specificity */
.chatbot-container .bot-message .message-content h1,
.chatbot-container .bot-message .message-content h2,
.chatbot-container .bot-message .message-content h3,
.chatbot-container .bot-message .message-content h4,
.chatbot-container .bot-message .message-content h5,
.chatbot-container .bot-message .message-content h6 {
  color: #2c3e50 !important;
  font-weight: 700 !important;
  margin: 16px 0 8px 0;
  line-height: 1.3;
}

.chatbot-container .bot-message .message-content h1 {
  font-size: 20px;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 4px;
  color: #2c3e50 !important;
}

.chatbot-container .bot-message .message-content h2 {
  font-size: 18px;
  border-bottom: 1px solid #4CAF50;
  padding-bottom: 2px;
  color: #2c3e50 !important;
}

.chatbot-container .bot-message .message-content h3 {
  font-size: 16px;
  color: #4CAF50 !important;
}

.chatbot-container .bot-message .message-content h4 {
  font-size: 15px;
  color: #4CAF50 !important;
}

.chatbot-container .bot-message .message-content h5,
.chatbot-container .bot-message .message-content h6 {
  font-size: 14px;
  color: #4CAF50 !important;
}

/* Style other markdown elements */
.message-content strong,
.message-content b {
  color: #333333;
  font-weight: 700;
}

.message-content em,
.message-content i {
  color: #333333;
  font-style: italic;
}

.message-content code {
  background-color: #f5f5f5;
  color: #333333;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.message-content blockquote {
  border-left: 4px solid #4CAF50;
  padding-left: 16px;
  margin: 8px 0;
  color: #333333;
  font-style: italic;
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
  background-color: #ffffff;
  color: #333333;
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

.preset-questions {
  margin: 15px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.preset-questions-title {
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
  text-align: center;
}

.preset-questions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-question-btn {
  padding: 10px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 13px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  line-height: 1.3;
  word-wrap: break-word;
}

.preset-question-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #4CAF50;
  color: #4CAF50;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
}

.preset-question-btn:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Responsive Design */
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

/* Global override to ensure chatbot text colors are not overridden by page styles */
.chatbot-container .message-content,
.chatbot-container .message-content * {
  color: #333333 !important;
}

.chatbot-container .message-content h1,
.chatbot-container .message-content h2 {
  color: #2c3e50 !important;
}

.chatbot-container .message-content h3,
.chatbot-container .message-content h4,
.chatbot-container .message-content h5,
.chatbot-container .message-content h6 {
  color: #4CAF50 !important;
}
</style>
