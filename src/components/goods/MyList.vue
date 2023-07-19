<template>
  <div class="list-container">
          <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区 -->
      <el-table :data="goodsList" border stripe>
             <!-- 索引列 -->
             <el-table-column type="index"></el-table-column>
             <el-table-column label="商品名称" prop="goods_name"></el-table-column>
             <el-table-column label="商品价格(元)" prop="goods_price" width="100px"></el-table-column>
             <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
             <el-table-column label="创建时间" prop="add_time" width="140px">
               <template slot-scope="scope">
                 {{scope.row.add_time|dataFormat}}
               </template>
             </el-table-column>
             <el-table-column label="操作" width="130px">
              <template slot-scope="scope">
               <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
               <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
              </template>
             </el-table-column>
      </el-table>
           <!-- 分页区 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" background>
    </el-pagination>
    </el-card>

        <!-- 修改商品信息的对话框 -->
    <el-dialog title="修改商品信息" :visible.sync="editDialogVisible" width="50%"  @close="editDialogClosed">
     <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="120px">
       <el-form-item label="商品名称：" prop="goods_name">
         <el-input v-model="editForm.goods_name" ></el-input>
       </el-form-item>
       <el-form-item label="商品价格(元):" prop="goods_price">
        <el-input v-model="editForm.goods_price" type="number"></el-input>
       </el-form-item>
       <el-form-item label="商品重量:" prop="goods_weight">
        <el-input v-model="editForm.goods_weight" type="number"></el-input>
       </el-form-item>
        <el-form-item label="商品数量:" prop="goods_number">
        <el-input v-model="editForm.goods_number" type="number"></el-input>
       </el-form-item>
     </el-form>
     <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editList">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created () {
    this.getGoodsList()
  },
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表
      goodsList: [],
      // 数据总条数
      total: 0,
      // 商品修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改的商品表单数据
      editForm: {},
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格(元)', trigger: blur }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: blur }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: blur }
        ]
      }
    }
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！')
      this.$message.success('获取商品成功！')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 点击按钮删除
    async removeById (id) {
      // 弹框询问是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返回值为字符串confirm
      // 如果用户取消删除，则返回值为字符串cancel
      // console.log(confirmResult)
      // 点击取消
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
      // 提示修改成功
      this.$message.success('删除用户成功！')
      // 重新获取用户的列表数据
      this.getGoodsList()
    },
    goAddpage () {
      this.$router.push('/goods/add')
    },
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询参数信息失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 点击按钮提交修改商品信息
    async editList () {
      const { data: res } = await this.$http.put('goods/' + this.editForm.goods_id, this.editForm)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('修改商品失败')
      this.$message.success('修改商品成功！')
      this.getGoodsList()
      this.editDialogVisible = false
    },
    // 监听修改对话框关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    }
  }

}
</script>

<style lang="less" scoped>

</style>
