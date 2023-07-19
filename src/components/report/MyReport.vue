<template>
  <div class="report-container">
          <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!--2. 为Echars准备一个具备大小的DOM -->
      <div id="main" style="height:400px;width:750px"></div>
    </el-card>
  </div>
</template>

<script>
// 1. 导入Echarts
import * as echarts from 'echarts'
import _ from 'lodash'
// const echarts = require('echarts')
export default {
  created () {

  },
  // 此时页面上的元素已经被渲染完毕了
  async mounted () {
    // 3. 基于准备好的dom，初始化echarts实例
    const myChart = echarts.init(document.getElementById('main'))
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) return this.$message.error('获取报告数据失败！')
    // 4.准备数据和配置项
    const result = _.merge(res.data, this.options)

    // 5.展示数据
    myChart.setOption(result)
  },
  data () {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }

    }
  },
  methods: {

  }

}
</script>

<style>

</style>
