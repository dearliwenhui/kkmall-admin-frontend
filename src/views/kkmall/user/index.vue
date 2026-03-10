<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { userApi } from "@/api/kkmall";
import type {
  UserInfo,
  UserQueryParams,
  UserCreateData,
  UserUpdateData,
  RoleInfo
} from "@/api/kkmall/user";

defineOptions({
  name: "User"
});

const defaultCreateForm = (): UserCreateData => ({
  username: "",
  password: "",
  nickname: "",
  email: "",
  phone: "",
  status: 1,
  roleIds: []
});

const defaultUpdateForm = (): UserUpdateData => ({
  nickname: "",
  email: "",
  phone: "",
  status: 1,
  roleIds: []
});

const queryForm = reactive<UserQueryParams>({
  pageNum: 1,
  pageSize: 10,
  username: "",
  nickname: "",
  status: undefined
});

const tableData = ref<UserInfo[]>([]);
const total = ref(0);
const loading = ref(false);

const dialogVisible = ref(false);
const dialogLoading = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const createForm = reactive<UserCreateData>(defaultCreateForm());
const updateForm = reactive<UserUpdateData>(defaultUpdateForm());
const currentEditId = ref<number>();

const resetPasswordVisible = ref(false);
const resetPasswordLoading = ref(false);
const resetPasswordForm = reactive({
  newPassword: ""
});
const resetPasswordFormRef = ref<FormInstance>();
const currentResetUserId = ref<number>();

const roleOptions = ref<RoleInfo[]>([]);

const createRules: FormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 50, message: "用户名长度为 3-50 个字符", trigger: "blur" },
    { pattern: /^[a-zA-Z0-9_]+$/, message: "用户名只能包含字母、数字和下划线", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度为 6-20 个字符", trigger: "blur" }
  ],
  nickname: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { max: 50, message: "昵称长度不能超过 50 个字符", trigger: "blur" }
  ],
  email: [
    {
      type: "email",
      message: "请输入正确的邮箱格式",
      trigger: "blur",
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback();
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          callback(new Error("请输入正确的邮箱格式"));
        } else {
          callback();
        }
      }
    }
  ],
  phone: [
    {
      message: "请输入正确的手机号格式",
      trigger: "blur",
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback();
        } else if (!/^1[0-9]{10}$/.test(value)) {
          callback(new Error("请输入正确的手机号格式"));
        } else {
          callback();
        }
      }
    }
  ],
  status: [
    { required: true, message: "请选择状态", trigger: "change" }
  ]
};

const updateRules: FormRules = {
  nickname: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { max: 50, message: "昵称长度不能超过 50 个字符", trigger: "blur" }
  ],
  email: [
    {
      type: "email",
      message: "请输入正确的邮箱格式",
      trigger: "blur",
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback();
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          callback(new Error("请输入正确的邮箱格式"));
        } else {
          callback();
        }
      }
    }
  ],
  phone: [
    {
      message: "请输入正确的手机号格式",
      trigger: "blur",
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback();
        } else if (!/^1[0-9]{10}$/.test(value)) {
          callback(new Error("请输入正确的手机号格式"));
        } else {
          callback();
        }
      }
    }
  ],
  status: [
    { required: true, message: "请选择状态", trigger: "change" }
  ]
};

const resetPasswordRules: FormRules = {
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度为 6-20 个字符", trigger: "blur" }
  ]
};

const formatStatus = (status: number) => (status === 1 ? "启用" : "禁用");

const resetCreateFormData = () => {
  Object.assign(createForm, defaultCreateForm());
};

const resetUpdateFormData = () => {
  Object.assign(updateForm, defaultUpdateForm());
};

const loadRoles = async () => {
  try {
    roleOptions.value = await userApi.getAllRoles();
  } catch (error: any) {
    ElMessage.error(error?.message || "加载角色列表失败");
  }
};

const getUserList = async () => {
  loading.value = true;
  try {
    const res = await userApi.getUserList(queryForm);
    tableData.value = res.records || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryForm.pageNum = 1;
  getUserList();
};

const handleReset = () => {
  queryForm.username = "";
  queryForm.nickname = "";
  queryForm.status = undefined;
  queryForm.pageNum = 1;
  getUserList();
};

const handlePageChange = (page: number) => {
  queryForm.pageNum = page;
  getUserList();
};

const handleSizeChange = (size: number) => {
  queryForm.pageSize = size;
  queryForm.pageNum = 1;
  getUserList();
};

const openCreateDialog = () => {
  isEdit.value = false;
  resetCreateFormData();
  dialogVisible.value = true;
};

const openEditDialog = async (row: UserInfo) => {
  isEdit.value = true;
  currentEditId.value = row.id;

  try {
    const detail = await userApi.getUserDetail(row.id);
    updateForm.nickname = detail.nickname;
    updateForm.email = detail.email || "";
    updateForm.phone = detail.phone || "";
    updateForm.status = detail.status;
    updateForm.roleIds = detail.roles.map(r => r.id);
    dialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error?.message || "获取用户详情失败");
  }
};

const handleSubmit = async () => {
  const currentFormRef = formRef.value;
  if (!currentFormRef) return;

  await currentFormRef.validate();

  dialogLoading.value = true;
  try {
    if (isEdit.value && currentEditId.value) {
      await userApi.updateUser(currentEditId.value, updateForm);
      ElMessage.success("更新成功");
    } else {
      await userApi.createUser(createForm);
      ElMessage.success("创建成功");
    }
    dialogVisible.value = false;
    getUserList();
  } catch (error: any) {
    ElMessage.error(error?.message || "操作失败");
  } finally {
    dialogLoading.value = false;
  }
};

const handleDelete = (row: UserInfo) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      await userApi.deleteUser(row.id);
      ElMessage.success("删除成功");
      getUserList();
    } catch (error: any) {
      ElMessage.error(error?.message || "删除失败");
    }
  });
};

const handleStatusChange = async (row: UserInfo) => {
  try {
    if (row.status === 1) {
      await userApi.enableUser(row.id);
      ElMessage.success("启用成功");
    } else {
      await userApi.disableUser(row.id);
      ElMessage.success("禁用成功");
    }
    getUserList();
  } catch (error: any) {
    row.status = row.status === 1 ? 0 : 1;
    ElMessage.error(error?.message || "操作失败");
  }
};

const openResetPasswordDialog = (row: UserInfo) => {
  currentResetUserId.value = row.id;
  resetPasswordForm.newPassword = "";
  resetPasswordVisible.value = true;
};

const handleResetPasswordSubmit = async () => {
  const currentFormRef = resetPasswordFormRef.value;
  if (!currentFormRef) return;

  await currentFormRef.validate();

  if (!currentResetUserId.value) return;

  resetPasswordLoading.value = true;
  try {
    await userApi.resetPassword(currentResetUserId.value, resetPasswordForm.newPassword);
    ElMessage.success("密码重置成功");
    resetPasswordVisible.value = false;
  } catch (error: any) {
    ElMessage.error(error?.message || "密码重置失败");
  } finally {
    resetPasswordLoading.value = false;
  }
};

onMounted(() => {
  getUserList();
  loadRoles();
});
</script>

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="queryForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input
            v-model="queryForm.nickname"
            placeholder="请输入昵称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <div class="toolbar">
        <el-button type="primary" v-auth="'user:add'" @click="openCreateDialog">
          新增用户
        </el-button>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="角色" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              size="small"
              style="margin-right: 5px"
            >
              {{ role.roleName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              v-auth="'user:edit'"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              v-auth="'user:edit'"
              @click="openEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              type="warning"
              size="small"
              link
              v-auth="'user:edit'"
              @click="openResetPasswordDialog(row)"
            >
              重置密码
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              v-auth="'user:delete'"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="isEdit ? '编辑用户' : '新增用户'"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="isEdit ? updateForm : createForm"
        :rules="isEdit ? updateRules : createRules"
        label-width="100px"
      >
        <template v-if="!isEdit">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="createForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="createForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="createForm.nickname" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="createForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="createForm.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="createForm.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="角色" prop="roleIds">
            <el-select
              v-model="createForm.roleIds"
              multiple
              placeholder="请选择角色"
              style="width: 100%"
            >
              <el-option
                v-for="role in roleOptions"
                :key="role.id"
                :label="role.roleName"
                :value="role.id"
              />
            </el-select>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="updateForm.nickname" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="updateForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="updateForm.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="updateForm.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="角色" prop="roleIds">
            <el-select
              v-model="updateForm.roleIds"
              multiple
              placeholder="请选择角色"
              style="width: 100%"
            >
              <el-option
                v-for="role in roleOptions"
                :key="role.id"
                :label="role.roleName"
                :value="role.id"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      title="重置密码"
      v-model="resetPasswordVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="resetPasswordFormRef"
        :model="resetPasswordForm"
        :rules="resetPasswordRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetPasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPasswordVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="resetPasswordLoading"
          @click="handleResetPasswordSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.app-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .toolbar {
      margin-bottom: 20px;
    }
  }
}
</style>
