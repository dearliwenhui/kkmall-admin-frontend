<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { roleApi, permissionApi } from "@/api/kkmall";
import type {
  RoleInfo,
  RoleQueryParams,
  RoleCreateData,
  RoleUpdateData
} from "@/api/kkmall/role";

defineOptions({
  name: "Role"
});

const defaultCreateForm = (): RoleCreateData => ({
  roleName: "",
  roleCode: "",
  description: "",
  permissionIds: []
});

const defaultUpdateForm = (): RoleUpdateData => ({
  roleName: "",
  description: "",
  permissionIds: []
});

const queryForm = reactive<RoleQueryParams>({
  pageNum: 1,
  pageSize: 10,
  roleName: "",
  roleCode: ""
});

const tableData = ref<RoleInfo[]>([]);
const total = ref(0);
const loading = ref(false);

const dialogVisible = ref(false);
const dialogLoading = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const createForm = reactive<RoleCreateData>(defaultCreateForm());
const updateForm = reactive<RoleUpdateData>(defaultUpdateForm());
const currentEditId = ref<number>();

const permissionDialogVisible = ref(false);
const permissionDialogLoading = ref(false);
const currentRoleId = ref<number>();
const selectedPermissionIds = ref<number[]>([]);
const permissionOptions = ref<any[]>([]);

const createRules: FormRules = {
  roleName: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
    { max: 50, message: "角色名称长度不能超过 50 个字符", trigger: "blur" }
  ],
  roleCode: [
    { required: true, message: "请输入角色代码", trigger: "blur" },
    { max: 50, message: "角色代码长度不能超过 50 个字符", trigger: "blur" },
    {
      pattern: /^[A-Z_]+$/,
      message: "角色代码只能包含大写字母和下划线",
      trigger: "blur"
    }
  ]
};

const updateRules: FormRules = {
  roleName: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
    { max: 50, message: "角色名称长度不能超过 50 个字符", trigger: "blur" }
  ]
};

const resetCreateFormData = () => {
  Object.assign(createForm, defaultCreateForm());
};

const resetUpdateFormData = () => {
  Object.assign(updateForm, defaultUpdateForm());
};

const loadPermissions = async () => {
  try {
    const res = await permissionApi.getAllPermissions();
    permissionOptions.value = res.data || [];
  } catch (error: any) {
    ElMessage.error(error?.message || "加载权限列表失败");
  }
};

const getRoleList = async () => {
  loading.value = true;
  try {
    const res = await roleApi.getRoleList(queryForm);
    tableData.value = res.data.records || [];
    total.value = res.data.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryForm.pageNum = 1;
  getRoleList();
};

const handleReset = () => {
  queryForm.roleName = "";
  queryForm.roleCode = "";
  queryForm.pageNum = 1;
  getRoleList();
};

const handlePageChange = (page: number) => {
  queryForm.pageNum = page;
  getRoleList();
};

const handleSizeChange = (size: number) => {
  queryForm.pageSize = size;
  queryForm.pageNum = 1;
  getRoleList();
};

const openCreateDialog = () => {
  isEdit.value = false;
  resetCreateFormData();
  dialogVisible.value = true;
};

const openEditDialog = async (row: RoleInfo) => {
  isEdit.value = true;
  currentEditId.value = row.id;

  try {
    const detail = await roleApi.getRoleDetail(row.id);
    updateForm.roleName = detail.data.roleName;
    updateForm.description = detail.data.description || "";
    updateForm.permissionIds = detail.data.permissions.map((p: any) => p.id);
    dialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error?.message || "获取角色详情失败");
  }
};

const handleSubmit = async () => {
  const currentFormRef = formRef.value;
  if (!currentFormRef) return;

  await currentFormRef.validate();

  dialogLoading.value = true;
  try {
    if (isEdit.value && currentEditId.value) {
      await roleApi.updateRole(currentEditId.value, updateForm);
      ElMessage.success("更新成功");
    } else {
      await roleApi.createRole(createForm);
      ElMessage.success("创建成功");
    }
    dialogVisible.value = false;
    getRoleList();
  } catch (error: any) {
    ElMessage.error(error?.message || "操作失败");
  } finally {
    dialogLoading.value = false;
  }
};

const handleDelete = (row: RoleInfo) => {
  ElMessageBox.confirm(`确定要删除角色 "${row.roleName}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      await roleApi.deleteRole(row.id);
      ElMessage.success("删除成功");
      getRoleList();
    } catch (error: any) {
      ElMessage.error(error?.message || "删除失败");
    }
  });
};

const openPermissionDialog = async (row: RoleInfo) => {
  currentRoleId.value = row.id;
  try {
    const detail = await roleApi.getRoleDetail(row.id);
    selectedPermissionIds.value = detail.data.permissions.map((p: any) => p.id);
    permissionDialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error?.message || "获取角色权限失败");
  }
};

const handlePermissionSubmit = async () => {
  if (!currentRoleId.value) return;

  permissionDialogLoading.value = true;
  try {
    await roleApi.assignPermissions(
      currentRoleId.value,
      selectedPermissionIds.value
    );
    ElMessage.success("分配权限成功");
    permissionDialogVisible.value = false;
    getRoleList();
  } catch (error: any) {
    ElMessage.error(error?.message || "分配权限失败");
  } finally {
    permissionDialogLoading.value = false;
  }
};

onMounted(() => {
  getRoleList();
  loadPermissions();
});
</script>

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="角色名称">
          <el-input
            v-model="queryForm.roleName"
            placeholder="请输入角色名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="角色代码">
          <el-input
            v-model="queryForm.roleCode"
            placeholder="请输入角色代码"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
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
        <el-button type="primary" v-auth="'role:add'" @click="openCreateDialog">
          新增角色
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
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="roleCode" label="角色代码" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="权限" width="300">
          <template #default="{ row }">
            <el-tag
              v-for="permission in row.permissions.slice(0, 3)"
              :key="permission.id"
              size="small"
              style="margin-right: 5px"
            >
              {{ permission.permissionName }}
            </el-tag>
            <el-tag v-if="row.permissions.length > 3" size="small">
              +{{ row.permissions.length - 3 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              v-auth="'role:edit'"
              @click="openEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              type="warning"
              size="small"
              link
              v-auth="'role:edit'"
              @click="openPermissionDialog(row)"
            >
              分配权限
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              v-auth="'role:delete'"
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
      :title="isEdit ? '编辑角色' : '新增角色'"
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
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="createForm.roleName" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="角色代码" prop="roleCode">
            <el-input
              v-model="createForm.roleCode"
              placeholder="请输入角色代码（大写字母和下划线）"
            />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="createForm.description"
              type="textarea"
              placeholder="请输入描述"
              :rows="3"
            />
          </el-form-item>
          <el-form-item label="权限" prop="permissionIds">
            <el-select
              v-model="createForm.permissionIds"
              multiple
              placeholder="请选择权限"
              style="width: 100%"
            >
              <el-option
                v-for="permission in permissionOptions"
                :key="permission.id"
                :label="permission.permissionName"
                :value="permission.id"
              />
            </el-select>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="updateForm.roleName" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="updateForm.description"
              type="textarea"
              placeholder="请输入描述"
              :rows="3"
            />
          </el-form-item>
          <el-form-item label="权限" prop="permissionIds">
            <el-select
              v-model="updateForm.permissionIds"
              multiple
              placeholder="请选择权限"
              style="width: 100%"
            >
              <el-option
                v-for="permission in permissionOptions"
                :key="permission.id"
                :label="permission.permissionName"
                :value="permission.id"
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

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      v-model="permissionDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-checkbox-group v-model="selectedPermissionIds">
        <el-checkbox
          v-for="permission in permissionOptions"
          :key="permission.id"
          :value="permission.id"
          style="display: block; margin-bottom: 10px"
        >
          {{ permission.permissionName }} ({{ permission.permissionCode }})
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="permissionDialogLoading"
          @click="handlePermissionSubmit"
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
