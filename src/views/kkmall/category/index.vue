<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { categoryApi } from "@/api/kkmall";
import type { Category, CategoryQueryParams, CategoryTreeNode } from "@/api/kkmall/category";

defineOptions({
  name: "Category"
});

const defaultForm = (): Category => ({
  name: "",
  parentId: 0,
  level: 1,
  sort: 0,
  icon: ""
});

const queryForm = reactive<CategoryQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: "",
  parentId: undefined,
  level: undefined
});

const tableData = ref<Category[]>([]);
const total = ref(0);
const loading = ref(false);
const selectedRows = ref<Category[]>([]);

const dialogVisible = ref(false);
const dialogLoading = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const categoryForm = reactive<Category>(defaultForm());

const categoryTreeNodes = ref<CategoryTreeNode[]>([]);

const rules: FormRules = {
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  parentId: [{ required: true, message: "请选择父分类", trigger: "change" }],
  level: [{ required: true, message: "请选择层级", trigger: "change" }],
  sort: [{ required: true, message: "请输入排序", trigger: "change" }]
};

const resetFormData = () => {
  Object.assign(categoryForm, defaultForm());
};

const loadCategoryTreeNodes = async () => {
  try {
    categoryTreeNodes.value = await categoryApi.getCategoryTreeNodes();
  } catch (error: any) {
    ElMessage.error(error?.message || "加载分类树失败");
  }
};

const loadTableData = async () => {
  loading.value = true;
  try {
    const res = await categoryApi.getCategoryList(queryForm);
    tableData.value = res.records;
    total.value = res.total;
  } catch (error: any) {
    ElMessage.error(error?.message || "加载数据失败");
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryForm.pageNum = 1;
  loadTableData();
};

const handleReset = () => {
  queryForm.name = "";
  queryForm.parentId = undefined;
  queryForm.level = undefined;
  handleQuery();
};

const handlePageChange = (page: number) => {
  queryForm.pageNum = page;
  loadTableData();
};

const handleSizeChange = (size: number) => {
  queryForm.pageSize = size;
  queryForm.pageNum = 1;
  loadTableData();
};

const handleSelectionChange = (rows: Category[]) => {
  selectedRows.value = rows;
};

const handleAdd = () => {
  isEdit.value = false;
  resetFormData();
  dialogVisible.value = true;
  loadCategoryTreeNodes();
};

const handleEdit = (row: Category) => {
  isEdit.value = true;
  Object.assign(categoryForm, row);
  dialogVisible.value = true;
  loadCategoryTreeNodes();
};

const handleParentChange = (value: number) => {
  if (value === 0) {
    categoryForm.level = 1;
  } else {
    const findLevel = (nodes: CategoryTreeNode[], targetValue: number): number | null => {
      for (const node of nodes) {
        if (node.value === targetValue) {
          return node.level;
        }
        if (node.children) {
          const found = findLevel(node.children, targetValue);
          if (found !== null) return found;
        }
      }
      return null;
    };
    const parentLevel = findLevel(categoryTreeNodes.value, value);
    if (parentLevel !== null) {
      categoryForm.level = parentLevel + 1;
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (!valid) return;
    dialogLoading.value = true;
    try {
      if (isEdit.value && categoryForm.id) {
        await categoryApi.updateCategory(categoryForm.id, categoryForm);
        ElMessage.success("更新成功");
      } else {
        await categoryApi.createCategory(categoryForm);
        ElMessage.success("创建成功");
      }
      dialogVisible.value = false;
      loadTableData();
    } catch (error: any) {
      ElMessage.error(error?.message || "操作失败");
    } finally {
      dialogLoading.value = false;
    }
  });
};

const handleDelete = (row: Category) => {
  ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await categoryApi.deleteCategory(row.id!);
        ElMessage.success("删除成功");
        loadTableData();
      } catch (error: any) {
        ElMessage.error(error?.message || "删除失败");
      }
    })
    .catch(() => {});
};

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择要删除的分类");
    return;
  }
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个分类吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        const ids = selectedRows.value.map(row => row.id!);
        await categoryApi.batchDeleteCategories(ids);
        ElMessage.success("删除成功");
        loadTableData();
      } catch (error: any) {
        ElMessage.error(error?.message || "删除失败");
      }
    })
    .catch(() => {});
};

onMounted(() => {
  loadTableData();
});

// PLACEHOLDER_FOR_METHODS
</script>

<template>
  <div class="category-container">
    <el-card shadow="never">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="分类名称">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入分类名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="层级">
          <el-select v-model="queryForm.level" placeholder="请选择层级" clearable>
            <el-option label="一级" :value="1" />
            <el-option label="二级" :value="2" />
            <el-option label="三级" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="handleAdd">新增分类</el-button>
        <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column prop="parentId" label="父分类ID" width="100" />
        <el-table-column prop="level" label="层级" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.level === 1" type="success">一级</el-tag>
            <el-tag v-else-if="row.level === 2" type="warning">二级</el-tag>
            <el-tag v-else type="info">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.icon"
              :src="row.icon"
              style="width: 40px; height: 40px"
              fit="cover"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="categoryForm"
        :rules="rules"
        label-width="100px"
        v-loading="dialogLoading"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类" prop="parentId">
          <el-cascader
            v-model="categoryForm.parentId"
            :options="[{ value: 0, label: '顶级分类', level: 0 }, ...categoryTreeNodes]"
            :props="{ value: 'value', label: 'label', children: 'children', checkStrictly: true, emitPath: false }"
            placeholder="请选择父分类"
            clearable
            style="width: 100%"
            @change="handleParentChange"
          />
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-input-number
            v-model="categoryForm.level"
            :min="1"
            :max="3"
            disabled
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="categoryForm.sort"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="categoryForm.icon" placeholder="请输入图标URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="dialogLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.category-container {
  padding: 20px;
}
</style>
