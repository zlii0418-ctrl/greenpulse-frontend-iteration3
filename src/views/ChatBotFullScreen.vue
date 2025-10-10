<template>
  <div>
    <Header />
    <div class="fullpage-container">
      <div class="chat-wrapper">
        <div class="chatbot-header">
          <button @click="goBack" class="back-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>
          <h2>Carbon Assistant</h2>
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

          <!-- 预设问题 -->
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
  </div>
  
</template>

<script>
import Header from './components/header.vue'

export default {
  name: 'ChatBotFullScreen',
  components: { Header },
  data() {
    return {
      inputMessage: '',
      messages: [],
      isLoading: false,
      eventSource: null,
      chatId: null,
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
    this.addMessage('Hello! I am your Carbon Assistant. I can help you learn about carbon footprint and environmental knowledge. Feel free to ask me anything!', false)
  },
  beforeUnmount() {
    if (this.eventSource) {
      this.eventSource.close()
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
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
      const chatId = this.generateChatId()
      const url = `/api/ai/carbon_assistant/chat/sse?message=${encodeURIComponent(message)}&chatId=${encodeURIComponent(chatId)}`
      return new Promise((resolve, reject) => {
        this.eventSource = new EventSource(url)
        let botResponse = ''
        this.eventSource.onmessage = (event) => {
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
        this.eventSource.addEventListener('message', (event) => {
          if (event.data === '[DONE]') {
            this.eventSource.close()
            resolve()
          }
        })
        setTimeout(() => {
          if (this.eventSource) {
            this.eventSource.close()
            if (!botResponse) {
              reject(new Error('Request timeout'))
            } else {
              resolve()
            }
          }
        }, 30000)
      })
    },
    generateChatId() {
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
.fullpage-container {
  width: 100%;
  min-height: 100vh;
  padding-top: 80px; /* account for fixed header */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.chat-wrapper {
  width: min(100%, 980px);
  height: min(80vh, 820px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chatbot-header {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 24px;
  text-align: center;
  position: relative;
}

.chatbot-header p {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.back-button {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.05);
}

.back-button svg {
  stroke-width: 2.5px;
}

.chatbot-header h2 {
  margin: 0 0 6px 0;
  color: white;
  font-size: 28px;
  font-weight: 600;
}

.chatbot-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message { display: flex; width: 100%; }
.user-message { justify-content: flex-end; }
.bot-message { justify-content: flex-start; }

.message-bubble {
  max-width: 80%;
  padding: 18px 22px;
  border-radius: 18px;
  font-size: 18px;
  line-height: 1.6;
}
.user-message .message-bubble { background: linear-gradient(135deg, #4CAF50, #45a049); color: #fff; border-bottom-right-radius: 4px; }
.bot-message .message-bubble { background: #f5f5f5; color: #333; border-bottom-left-radius: 4px; }

.message-time { font-size: 14px; opacity: 0.7; margin-top: 8px; }

.typing-indicator { display: flex; gap: 4px; align-items: center; }
.typing-indicator span { width: 6px; height: 6px; border-radius: 50%; background: #999; animation: typing 1.4s infinite ease-in-out; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-10px); opacity: 1; }
}

.chatbot-input {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  align-items: center;
}
.chatbot-input input { flex: 1; padding: 16px 20px; border: 1px solid #ddd; border-radius: 25px; outline: none; font-size: 18px; transition: border-color 0.3s ease; }
.chatbot-input input:focus { border-color: #4CAF50; }
.chatbot-input input:disabled { background: #f5f5f5; cursor: not-allowed; }
.send-btn { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #4CAF50, #45a049); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
.send-btn:hover:not(:disabled) { transform: scale(1.1); }
.send-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }

.preset-questions {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.preset-questions-title {
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
  text-align: center;
}

.preset-questions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preset-question-btn {
  padding: 16px 20px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 18px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  line-height: 1.6;
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

@media (max-width: 768px) {
  .chat-wrapper { width: 100%; height: calc(100vh - 100px); border-radius: 0; }
  .fullpage-container { padding-top: 70px; }
}
</style>


