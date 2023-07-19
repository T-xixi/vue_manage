<template>
  <div class="cate-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
        <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 搜索添加区域 -->
      <el-row :gutter="20" class="addCate">
         <el-col :span="8">
         <el-button type="primary" @click="showAddCatDialog">添加分类</el-button>
         </el-col>
      </el-row>
      <!-- 表格区 -->
      <tree-table :data="cateList" :columns="columns"
       :selection-type="false" :expand-type="false"
       show-index border :show-row-hover="false">
       <!-- 是否有效 -->
       <template v-slot:isok="scope">
         <i class="el-icon-error" v-if="scope.row.cat_deleted" style="color:red;"></i>
         <i class="el-icon-success" v-else style="color:lightgreen"></i>

       </template>
       <!-- 排序 -->
       <template  v-slot:order="scope">
         <el-tag size="mini" v-if="scope.row.cat_level===0" >一级</el-tag>
         <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
         <el-tag type="warning" size="mini" v-else>三级</el-tag>

       </template>
       <!-- 操作 -->
       <template v-slot:opt="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">修改</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
       </template>
       </tree-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"  @current-change="handleCurrentChange"  :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10,15]"  :page-size="queryInfo.pagesize"  layout="total, sizes, prev, pager, next, jumper"  :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类"  :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed" >
      <!-- 内容主体区域 -->
       <el-form  :rules="addCateFormRules" ref="addCateFormRef" :model="addCateForm" label-width="100px">
         <el-form-item label="分类名称：" prop="cat_name">
           <el-input v-model="addCateForm.cat_name"></el-input>
         </el-form-item>
         <el-form-item label="父级分类：">
           <!-- options用来指定数据源 -->
           <!-- props用来指定配置对象 -->
             <el-cascader
               v-model="selectedKeys"
               :options="parentCateList"
               :props="cascaderProps"
               @change="parentCateChanged"
               clearable
               ></el-cascader>
         </el-form-item>
       </el-form>
       <!-- 底部区 -->
       <span slot="footer" class="dialog-footer">
       <el-button @click="addCateDialogVisible = false">取消</el-button>
       <el-button type="primary"  @click="addCate">确 定</el-button>
       </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
        <el-dialog title="编辑分类"  :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed" >
      <!-- 内容主体区域 -->
       <el-form  :rules="editCateFormRules" ref="editCateFormRef" :model="editCateForm" label-width="100px">
         <el-form-item label="分类名称：" prop="cat_name">
           <el-input v-model="editCateForm.cat_name"></el-input>
         </el-form-item>
       </el-form>
       <!-- 底部区 -->
       <span slot="footer" class="dialog-footer">
       <el-button @click="editCateDialogVisible = false">取消</el-button>
       <el-button type="primary"  @click="editCate">确 定</el-button>
       </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  created () {
    this.getCateList()
  },
  data () {
    return {
      // 查询信息
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列
          type: 'template',
          // 当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 将当前列定义为模板列
          type: 'template',
          // 当前这一列使用模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义为模板列
          type: 'template',
          // 当前这一列使用模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类的ID
        cat_pid: 0,
        // 默认一级分类
        cat_level: 0

      },
      // 分类名称的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类数据
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 选中的父级分类的ID数组
      selectedKeys: [],
      // 控制修改分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 修改分类的表单数据对象
      editCateForm: {
      },
      // 分类名称的验证规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }

    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      // 把数据列表幅值给数据列表
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听当前页码pagenum改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 展示天界分类对话框
    showAddCatDialog () {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再打印对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async  getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分裂数据失败！')
      this.parentCateList = res.data
    },
    // 选择项发生变化触发
    parentCateChanged () {
      // console.log(this.selectedKeys)
      // 如果 selectedKeys数组中的length大于0，则说明选中了父级分类
      // 反之 就说明没有选中
      if (this.selectedKeys.length > 0) {
        // 父级分类的ID
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的ID
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加新的分类
    addCate () {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类的对话框关闭事件，重置数据表单
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      // 父级分类的ID
      this.addCateForm.cat_pid = 0
      // 为当前分类的等级赋值
      this.addCateForm.cat_level = 0
    },
    // 根据ID删除对应用户信息
    async removeCateById (id) {
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
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
      // 提示修改成功
      this.$message.success('删除用户成功！')
      // 重新获取用户的列表数据
      this.getCateList()
    },
    // 展示编辑分类的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败！')
      this.$message.success('查询用户成功！')
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 监听修改分类的对话框关闭事件，重置数据表单
    editCateDialogClosed () {
      this.$refs.editCateFormRef.resetFields()
      this.selectedKeys = []
      // 父级分类的ID
      this.editCateForm.cat_pid = 0
      // 为当前分类的等级赋值
      this.editCateForm.cat_level = 0
    },
    // 点击按钮修改分类
    editCate () {
      // console.log(this.addCateForm)
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) return this.$message.error('修改分类失败')
        this.$message.success('修改分类成功！')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    }

  }

}
</script>

<style lang="less" scoped>

.addCate{
  margin-bottom: 15px;
  font-size: 12px;
}
.el-cascader{
  width: 100%;
}
</style>
