import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Guide from '@/views/Guide.vue'
import Calculator from '@/views/Calculator.vue'
import PrivateDetailed from '@/views/travel/PrivateDetailed.vue'
import PublicDetailed from '@/views/travel/PublicDetailed.vue'
import Result from '@/views/Result.vue'
import Recommendations from '@/views/Recommendations.vue'
import Disclaimer from '@/views/Disclaimer.vue'
import GreenPlaces from '@/views/greenplaces/GreenPlaces.vue'
import ChatBotFullScreen from '@/views/ChatBotFullScreen.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    // 始终滚动到顶部
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/guide', name: 'guide', component: Guide },
    // 统一的计算器页面
    {
      path: '/calculator/:type?',
      name: 'calculator',
      component: Calculator,
      props: true
    },
    // 绿色地点页面
    { path: '/green-places', name: 'green-places', component: GreenPlaces },
    // 向后兼容的路由重定向
    { path: '/travel-private', redirect: '/calculator/travel' },
    { path: '/household-calculator', redirect: '/calculator/household' },
    { path: '/shopping-calculator', redirect: '/calculator/shopping' },
    { path: '/coming-soon', redirect: '/calculator/food' },
    // 详细页面和结果页面保持不变
    { path: '/travel-private-details', name: 'trav-private', component: PrivateDetailed},
    { path: '/travel-public', redirect: '/calculator/travel' },
    { path: '/travel-public-details', name: 'trav-pub-detailed', component: PublicDetailed },
    { path: '/travel-result', name: 'trav-result', component: Result },
    { path: '/result', name: 'result', component: Result },
    { path: '/recommendations', name: 'recommendations', component: Recommendations },
    { path: '/disclaimer', name: 'disclaimer', component: Disclaimer},
    { path: '/chatbot', name: 'chatbot', component: ChatBotFullScreen }
  ],
})

export default router
