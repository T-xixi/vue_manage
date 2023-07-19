import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/MyLogin.vue'
import Home from '@/components/MyHome.vue'
import Welcome from '@/components/MyWelcome.vue'
import Users from '@/components/user/MyUsers.vue'
import Rights from '@/components/power/MyRights.vue'
import Roles from '@/components/power/MyRoles.vue'
import Cate from '@/components/goods/MyCate.vue'
import Params from '@/components/goods/MyParams.vue'
import List from '@/components/goods/MyList.vue'
import Add from '@/components/goods/MyAdd.vue'
import Order from '@/components/order/MyOrder.vue'
import Report from '@/components/report/MyReport.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }

    ]
  }
]

const router = new VueRouter({
  routes
})
// 挂载路由守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转过来
  // next 是一个函数，表示放行
  //   next()放行  next('/login') 强制跳转
  // 访问登录页面 直接放行
  if (to.path === '/login') return next()
  // 有权限的页面
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token 即没有权限 强制跳转到登录页面
  if (!tokenStr) return next('/login')
  // 没有强制跳转 则放行
  next()
})
export default router
