<template>
  <div class="order-container">
              <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
         <el-input placeholder="请输入内容">
          <el-button slot="append" icon="el-icon-search"></el-button>
         </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="100px">
          <template  slot-scope="scope">
            <el-tag v-if="scope.row.pay_status==='1'" type="success">已付款</el-tag>
          <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px">
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time"  width="140px">
          <template slot-scope="scope">
            {{scope.row.create_time|dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作"  width="140px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox(scope.row.order_id)"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
    <!-- 分页区 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="queryInfo.pagenum"
      :page-size="queryInfo.pagesize"
      :page-sizes="[5, 10, 15, 20]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" background>
    </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
       width="50%" @close="addressDialogColsed"    >
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px" >
       <el-form-item label="省市区/县" prop="address1">
           <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
            ></el-cascader>
       </el-form-item>
       <el-form-item label="详细地址" prop="consignee_addr">
         <el-input v-model="addressForm.consignee_addr"></el-input>
       </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button @click="addressVisible = false">取 消</el-button>
      <el-button type="primary" @click="editAddress">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度的对话框 -->
    <el-dialog
  title="提示"
  :visible.sync="progressVisible"
  width="50%">
  <!-- 时间线 -->
    <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
</el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  created () {
    this.getOrderList()
  },
  data () {
    return {
      // /查询对象
      queryInfo: {
        pagenum: 1,
        pagesize: 10,
        query: ''

      },
      orderList: [],
      total: 0,
      addressVisible: false,
      progressVisible: false,
      addressForm: {
        address1: [],
        consignee_addr: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: blur }
        ],
        consignee_addr: [
          { required: true, message: '请填写详细地址', trigger: blur }
        ]
      },
      cityData,
      // 物流信息
      progress:
        {
          data: [
            {
              time: '2018-05-10 09:39:00',
              ftime: '2018-05-10 09:39:00',
              context: '已签收,感谢使用顺丰,期待再次为您服务',
              location: ''
            },
            {
              time: '2018-05-10 08:23:00',
              ftime: '2018-05-10 08:23:00',
              context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
              location: ''
            },
            {
              time: '2018-05-10 07:32:00',
              ftime: '2018-05-10 07:32:00',
              context: '快件到达 [北京海淀育新小区营业点]',
              location: ''
            },
            {
              time: '2018-05-10 02:03:00',
              ftime: '2018-05-10 02:03:00',
              context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
              location: ''
            },
            {
              time: '2018-05-09 23:05:00',
              ftime: '2018-05-09 23:05:00',
              context: '快件到达 [北京顺义集散中心]',
              location: ''
            },
            {
              time: '2018-05-09 21:21:00',
              ftime: '2018-05-09 21:21:00',
              context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
              location: ''
            },
            {
              time: '2018-05-09 13:07:00',
              ftime: '2018-05-09 13:07:00',
              context: '顺丰速运 已收取快件',
              location: ''
            },
            {
              time: '2018-05-09 12:25:03',
              ftime: '2018-05-09 12:25:03',
              context: '卖家发货',
              location: ''
            },
            {
              time: '2018-05-09 12:22:24',
              ftime: '2018-05-09 12:22:24',
              context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
              location: ''
            },
            {
              time: '2018-05-08 21:36:04',
              ftime: '2018-05-08 21:36:04',
              context: '商品已经下单',
              location: ''
            }
          ],
          meta: { status: 200, message: '获取物流信息成功！' }
        },

      progressInfo: []

    }
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败！')
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 展示修改地址的对话框
    async showBox (id) {
      const { data: res } = await this.$http.get('orders/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询地址信息失败！')
      this.addressForm = res.data
      this.addressVisible = true
    },
    addressDialogColsed () {
      this.$refs.addressFormRef.resetFields()
    },
    editAddress () {
      this.$refs.addressFormRef.validate(async valid => {
        const { data: res } = await this.$http.put('orders/' + this.addressForm.order_id, this.addressForm)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error('修改地址失败')
        this.$message.success('修改地址成功！')
        this.addressVisible = false
        this.getOrderList()
      })
    },
    showProgressBox () {
      this.progressInfo = this.progress.data
      this.progressVisible = true
      // console.log(this.progressInfo)
    }
  }

}
</script>

<style lang="less" scoped>
.el-cascader{
  width: 100%;
}
</style>
