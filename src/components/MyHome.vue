<template>
  <el-container class="home-container">
    <!-- 头布局 -->
  <el-header>
    <div>
      <img src="../assets/logo.png" alt="">
      <span>后台管理系统</span>
    </div>
    <el-button type="info" @click="logout">退出</el-button></el-header>
    <!-- 页面主主体区-->
  <el-container>
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse?'64px':'200px'">
      <!-- 菜单栏折叠 -->
      <div class="toggle-btn" @click="toggleCollapse">
         |||
      </div>
      <!-- 侧边栏菜单区域 -->
      <el-menu
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409EFF"
      unique-opened
      :collapse="isCollapse"
      :collapse-transition="false"
      :router="true"
      :default-active="activePath"
      >
      <!-- 一级菜单 -->
      <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
          <!-- 一级菜单的模板区 -->
        <template slot="title">
          <!-- 图标 -->
          <i :class="iconObj[item.id]"></i>
          <!-- 文本 -->
          <span>{{item.authName}}</span>
        </template>
        <!-- 二级菜单 -->
      <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
        <template slot="title">
          <!-- 图标 -->
          <i class="el-icon-menu"></i>
          <!-- 文本 -->
          <span>{{subItem.authName}}</span>
        </template>
      </el-menu-item>
      </el-submenu>
    </el-menu>
    </el-aside>
    <!-- 右侧内容主体 -->
    <el-main>      <!-- 路由占位符 -->
      <router-view></router-view></el-main>
  </el-container>
</el-container>
</template>

<script>
export default {
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data () {
    return {
      menuList: [],
      iconObj: {
        125: 'el-icon-s-custom',
        103: 'el-icon-s-platform',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-data'

      },
      // 是否被折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      // console.log(res)
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存连接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }

}
</script>

<style lang="less" scoped>
.home-container{
  height: 100%;
}
.el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left:0 ;
  align-items: center;
  color: #fff;
  font-size: 20px;
 >div {
   display: flex;
   align-items: center;
   img{
  height: 44px;
  width: 44px;
  border-radius:50% ;
  }
   span{
     margin-left: 15px;
   }
 }

}
.el-aside{
  background-color: #333744;
  .el-menu{
    border-right:none;
  }
}
.el-main{
  background-color:#eaedf1 ;
}
.toggle-btn{
  background-color:#4a5064 ;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
