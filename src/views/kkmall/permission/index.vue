<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { permissionApi } from "@/api/kkmall";
import type {
  PermissionInfo,
  PermissionQueryParams,
  PermissionCreateData,
  PermissionUpdateData
} from "@/api/kkmall/permission";

defineOptions({
  name: "Permission"
});

const defaultCreateForm = (): PermissionCreateData => ({
  permissionName: "",
  permissionCode: "",
  resourceType: 1,
  path: "",
  description: ""
});

const defaultUpdateForm = (): PermissionUpdateData => ({
  permissionName: "",
  resourceType: 1,
  path: "",
  description: ""
});

const queryForm = reactive<PermissionQueryParams>({
  pageNum: 1,
  pageSize: 10,
  permissionName: "",
  permissionCode: "",
  resourceType: undefined
});

const tableData = ref<PermissionInfo[]>([]);
const total = ref(0);
const loading = ref(false);

const dialogVisible = ref(false);
const dialogLoading = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const createForm = reactive<PermissionCreateData>(defaultCreateForm());
const updateForm = reactive<PermissionUpdateData>(defaultUpdateForm());
const currentEditId = ref<number>();

const resourceTypeOptions = [
  { label: "菜单", value: 1 },
  { label: "按钮", value: 2 },
  { label: "API", value: 3 }
];

const createRules: FormRules = {
  permissionName: [
    { required: true, message: "请输入权限名称", trigger: "blur" },
    { max: 50, message: "权限名称长度不能超过 50 个字符", trigger: "blur" }
  ],
  permissionCode: [
    { required: true, message: "请输入权限代码", trigger: "blur" },
    { max: 50, message: "权限代码长度不能超过 50 个字符", trigger: "blur" }
  ],
  resourceType: [
    { required: true, message: "请选择资源类型", trigger: "change" }
  ]
};

const updateRules: FormRules = {
  permissionName: [
    { required: true, message: "请输入权限名称", trigger: "blur" },
    { max: 50, message: "权限名称长度不能超过 50 个字符", trigger: "blur" }
  ],
  resourceType: [
    { required: true, message: "请选择资源类型", trigger: "change" }
  ]
};

const formatResourceType = (type: number) => {
  const option = resourceTypeOptions.find(o => o.value === type);
  return option ? option.label : type;
};

const resetCreateFormData = () => {
  Object.assign(createForm, defaultCreateForm());
};

const resetUpdateFormData = () => {
  Object.assign(updateForm, defaultUpdateForm());
};

const getPermissionList = async () => {
  loading.value = true;
  try {
    const res = await permissionApi.getPermissionList(queryForm);
    tableData.value = res.data.records || [];
    total.value = res.data.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryForm.pageNum = 1;
  getPermissionList();
};

const handleReset = () => {
  queryForm.permissionName = "";
  queryForm.permissionCode = "";
  queryForm.resourceType = undefined;
  queryForm.pageNum = 1;
  getPermissionList();
};

const handlePageChange = (page: number) => {
  queryForm.pageNum = page;
  getPermissionList();
};

const handleSizeChange = (size: number) => {
  queryForm.pageSize = size;
  queryForm.pageNum = 1;
  getPermissionList();
};

const openCreateDialog = () => {
  isEdit.value = false;
  resetCreateFormData();
  dialogVisible.value = true;
};

const openEditDialog = async (row: PermissionInfo) => {
  isEdit.value = true;
  currentEditId.value = row.id;

  try {
    const detail = await permissionApi.getPermissionDetail(row.id);
    updateForm.permissionName = detail.data.permissionName;
    updateForm.resourceType = detail.data.resourceType;
    updateForm.path = detail.data.path || "";
    updateForm.description = detail.data.description || "";
    dialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error?.message || "获取权限详情失败");
  }
};

const handleSubmit = async () => {
  const currentFormRef = formRef.value;
  if (!currentFormRef) return;

  await currentFormRef.validate();

  dialogLoading.value = true;
  try {
    if (isEdit.value && currentEditId.value) {
      await permissionApi.updatePermission(currentEditId.value, updateForm);
      ElMessage.success("更新成功");
    } else {
      await permissionApi.createPermission(createForm);
      ElMessage.success("创建成功");
    }
    dialogVisible.value = false;
    getPermissionList();
  } catch (error: any) {
    ElMessage.error(error?.message || "操作失败");
  } finally {
    dialogLoading.value = false;
  }
};

const handleDelete = (row: PermissionInfo) => {
  ElMessageBox.confirm(`确定要删除权限 "${row.permissionName}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      await permissionApi.deletePermission(row.id);
      ElMessage.success("删除成功");
      getPermissionList();
    } catch (error: any) {
      ElMessage.error(error?.message || "删除失败");
    }
  });
};

onMounted(() => {
  getPermissionList();
});
</script>

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="权限名称">
          <el-input
            v-model="queryForm.permissionName"
            placeholder="请输入权限名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="权限代码">
          <el-input
            v-model="queryForm.permissionCode"
            placeholder="请输入权限代码"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select
            v-model="queryForm.resourceType"
            placeholder="请选择资源类型"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in resourceTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
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
        <el-button
          type="primary"
          v-auth="'permission:add'"
          @click="openCreateDialog"
        >
          新增权限
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
        <el-table-column prop="permissionName" label="权限名称" width="150" />
        <el-table-column prop="permissionCode" label="权限代码" width="180" />
        <el-table-column label="资源类型" width="100">
          <template #default="{ row }">
            {{ formatResourceType(row.resourceType) }}
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              v-auth="'permission:edit'"
              @click="openEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              v-auth="'permission:delete'"
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
      :title="isEdit ? '编辑权限' : '新增权限'"
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
          <el-form-item label="权限名称" prop="permissionName">
            <el-input
              v-model="createForm.permissionName"
              placeholder="请输入权限名称"
            />
          </el-form-item>
          <el-form-item label="权限代码" prop="permissionCode">
            <el-input
              v-model="createForm.permissionCode"
              placeholder="请输入权限代码（如：user:add）"
            />
          </el-form-item>
          <el-form-item label="资源类型" prop="resourceType">
            <el-select
              v-model="createForm.resourceType"
              placeholder="请选择资源类型"
              style="width: 100%"
            >
              <el-option
                v-for="option in resourceTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="路径" prop="path">
            <el-input
              v-model="createForm.path"
              placeholder="请输入路径（如：/api/users/*）"
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
        </template>
        <template v-else>
          <el-form-item label="权限名称" prop="permissionName">
            <el-input
              v-model="updateForm.permissionName"
              placeholder="请输入权限名称"
            />
          </el-form-item>
          <el-form-item label="资源类型" prop="resourceType">
            <el-select
              v-model="updateForm.resourceType"
              placeholder="请选择资源类型"
              style="width: 100%"
            >
              <el-option
                v-for="option in resourceTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="路径" prop="path">
            <el-input
              v-model="updateForm.path"
              placeholder="请输入路径（如：/api/users/*）"
            />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="updateForm.description"
              type="textarea"
              placeholder="请输入描述"
              :rows="3"
            />
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
