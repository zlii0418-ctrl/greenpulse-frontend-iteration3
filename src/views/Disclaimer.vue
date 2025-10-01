<template>
    <Header />

    <main class="page flex-col">
        <div class="content flex-col">
            <h1>Disclaimer</h1>
            <p>
            The information provided on the GreenPulse website is for general informational purposes only. 
            While we strive to ensure accuracy, GreenPulse makes no representation or warranty of any kind, 
            express or implied, regarding the accuracy, reliability, availability, or completeness of any information 
            on this site.
            </p>
            <p>
            Under no circumstance shall GreenPulse be held liable for any loss or damage of any kind incurred as a result 
            of the use of this website or reliance on any information provided herein.
            </p>
            <p>
            Your use of the site and your reliance on any information is solely at your own risk.
            </p>
        </div>
    </main>

    <Footer />
    
    <!-- 聊天机器人组件 -->
    <ChatBot />
</template>

<script setup lang="ts">
import Header from './components/header.vue'
import Footer from './components/footer.vue'
import ChatBot from './components/ChatBot.vue'

</script>

<style scoped>
    body {
        margin: 0;
        font-family: 'EB Garamond', serif;
        color: #333;
        line-height: 1.6;
    }

    .page {
        display: flex;
        justify-content: center;
        background-color: rgba(249, 250, 236, 1);
        align-items: center;
        padding: 60px 20px;
    }

    .content {
        padding: 40px;
        border-radius: 16px;
        max-width: 800px;
        width: 100%;
    }

    .content h1 {
        font-size: 36px;
        color: rgba(61, 124, 74, 1);
        margin-bottom: 20px;
        text-align: center;
    }

    .content p {
        font-size: 18px;
        margin-bottom: 16px;
        text-align: justify;
    }

/* Responsive Design */
@media (max-width: 768px) {
    .page {
        padding: 40px 15px;
    }
    
    .content {
        padding: 30px 20px;
        max-width: 95%;
    }
    
    .content h1 {
        font-size: 28px;
        margin-bottom: 15px;
    }
    
    .content p {
        font-size: 16px;
        margin-bottom: 14px;
        text-align: left;
    }
}

@media (max-width: 480px) {
    .page {
        padding: 30px 10px;
    }
    
    .content {
        padding: 20px 15px;
        max-width: 98%;
    }
    
    .content h1 {
        font-size: 24px;
        margin-bottom: 12px;
    }
    
    .content p {
        font-size: 14px;
        margin-bottom: 12px;
        text-align: left;
    }
}
</style>
