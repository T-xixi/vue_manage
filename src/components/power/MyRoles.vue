<template>
  <div class="roles-container">
 <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 添加用户按钮 -->
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- <pre>
              {{scope.row}}
            </pre> -->
            <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
            <!-- 一级权限 -->
             <el-col :span="5">
              <el-tag  closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
             </el-col>
            <!-- 二级和二级权限 -->
             <el-col :span="19">
               <!-- 通过for 循环 嵌套渲染二级权限 -->
               <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2===0?'':'bdtop','vcenter']">
                 <el-col :span="6">
                  <el-tag type="success"  closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                 </el-col>
                 <el-col :span="18">
                   <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                     {{item3.authName}}
                   </el-tag>

                 </el-col>
               </el-row>
             </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column  label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">修改</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog  title="添加角色"  :visible.sync="addDialogVisible"  width="50%" @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="addForm.roleName" ></el-input>
        </el-form-item>
        <el-form-item label="角色操作">
        <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog  title="修改角色"  :visible.sync="editDialogVisible"  width="50%" @close="editDialogClosed">
       <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="editForm.roleName" ></el-input>
        </el-form-item>
        <el-form-item label="角色操作">
        <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog  title="分配权限"  :visible.sync="setRightDialogVisible"  width="50%" @close="setRightDialogClosed">
      <!-- 树形空间 -->
       <el-tree ref = "treeRef" :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys">

       </el-tree>
      <span slot="footer" class="dialog-footer">
      <el-button @click="setRightDialogVisible = false">取 消</el-button>
      <el-button type="primary"  @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created () {
    this.getRolesList()
  },
  data () {
    const checkName = (rule, value, cb) => {
      const regName = /^.+$/
      if (regName.test(value)) return cb()
      cb(new Error('输入内容不能为空'))
    }
    return {
      rolesList: [],
      // 控制添加用户表单的出现与隐藏
      addDialogVisible: false,
      // 控制修改角色表单的出现隐藏
      editDialogVisible: false,
      // 添加角色信息
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色信息
      editForm: {},
      // 所有权限的信息
      rightsList: [],
      // 树形空间的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'

      },
      // 默认选中的节点ID值
      defKeys: [],
      // 当前即将分配权限的id
      roleId: '',
      // 控制分配角色权限对话框的显式与隐藏
      setRightDialogVisible: false,
      // 添加角色名称表单验证对象、
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { validator: checkName, trigger: 'blur' }
        ]
      },
      // 修改角色名称表单验证对象、
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { validator: checkName, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.rolesList = res.data
    },
    async removeRoleById (id) {
      const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      // 提示修改成功
      this.$message.success('删除角色成功！')
      // 重新获取用户的列表数据
      this.getRolesList()
    },
    // 监听添加角色对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加角色
    addRole () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功！')
        // 隐藏对话框
        this.addDialogVisible = false
        // 重新获取角色列表
        this.getRolesList()
      })
    },
    // 展示编辑角色的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询角色失败')
      this.$message.success('查询角色成功！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改角色对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮修改角色并提交
    editRoleInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
        if (res.meta.status !== 200) return this.$message.error('修改角色失败')
        this.$message.success('修改角色成功！')
        // 隐藏对话框
        this.editDialogVisible = false
        // 重新获取角色列表
        this.getRolesList()
      })
    },
    // 根据ID删除对应权限
    async removeRightById (role, rightId) {
      // 弹窗提示用户是否要删除
      const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      // 提示修改成功
      this.$message.success('删除角色成功！')
      // 重新获取用户的列表数据
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败！')
      // 提示修改成功
      this.$message.success('获取权限成功！')
      // 获取到的权限数据保存到data中
      this.rightsList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式获得所有三级权限的id并保存到defKeys数组中
    getLeafKeys (node, arr) {
      // 如果当前的node不包含children属性 则是三级权限
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [this.$refs.treeRef.getCheckedKeys(), this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      // 提示修改成功
      this.$message.success('分配权限成功！')
      // 隐藏对话框
      this.setRightDialogVisible = false
      // 重新获取角色列表
      this.getRolesList()
    }

  }

}
</script>

<style lang="less" scoped>

.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
