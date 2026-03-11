<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, shallowRef } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules, UploadRequestOptions } from "element-plus";
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { categoryApi, commonApi, productApi } from "@/api/kkmall";
import type { Product, ProductQueryParams } from "@/api/kkmall/product";
import type { CategoryTreeNode } from "@/api/kkmall/category";

defineOptions({
  name: "Product"
});

const defaultForm = (): Product => ({
  productName: "",
  productCode: "",
  categoryId: 1,
  price: 0.01,
  stock: 0,
  description: "",
  status: 1,
  images: []
});

const queryForm = reactive<ProductQueryParams>({
  pageNum: 1,
  pageSize: 10,
  productName: "",
  categoryId: undefined,
  status: undefined
});

const tableData = ref<Product[]>([]);
const total = ref(0);
const loading = ref(false);
const selectedRows = ref<Product[]>([]);
const categoryTreeNodes = ref<CategoryTreeNode[]>([]);

const dialogVisible = ref(false);
const dialogLoading = ref(false);
const uploadLoading = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const productForm = reactive<Product>(defaultForm());

const editorRef = shallowRef();
const editorMode = "default";
const toolbarConfig: any = { excludeKeys: ["fullScreen"] };
const editorConfig: any = { placeholder: "请输入商品图文详情..." };

editorConfig.MENU_CONF = {
  uploadImage: {
    async customUpload(file: File, insertFn: (url: string, alt?: string, href?: string) => void) {
      const res = await commonApi.uploadFile(file, "product-richtext");
      insertFn(res.url, file.name, res.url);
    }
  }
};

const rules: FormRules = {
  productName: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  productCode: [{ required: true, message: "请输入商品编码", trigger: "blur" }],
  categoryId: [{ required: true, message: "请选择商品分类", trigger: "change" }],
  price: [{ required: true, message: "请输入商品价格", trigger: "change" }],
  stock: [{ required: true, message: "请输入库存", trigger: "change" }],
  status: [{ required: true, message: "请选择商品状态", trigger: "change" }]
};

const formatPrice = (price: number) => `￥${Number(price || 0).toFixed(2)}`;
const formatStatus = (status: number) => (status === 1 ? "上架" : "下架");

const resetFormData = () => {
  Object.assign(productForm, defaultForm());
};

const loadCategoryTreeNodes = async () => {
  try {
    categoryTreeNodes.value = await categoryApi.getCategoryTreeNodes();
  } catch (error: any) {
    ElMessage.error(error?.message || "加载分类树失败");
  }
};

const handleEditorCreated = (editor: any) => {
  editorRef.value = editor;
};

const removeImageUrl = (index: number) => {
  productForm.images?.splice(index, 1);
};

const uploadImageRequest = async (options: UploadRequestOptions) => {
  uploadLoading.value = true;
  try {
    const file = options.file as File;
    const res = await commonApi.uploadFile(file, "product");
    if (!productForm.images) {
      productForm.images = [];
    }
    if (!productForm.images.includes(res.url)) {
      productForm.images.push(res.url);
    }
    ElMessage.success("图片上传成功");
    options.onSuccess?.(res as any);
  } catch (error: any) {
    ElMessage.error(error?.message || "图片上传失败");
    options.onError?.(error);
  } finally {
    uploadLoading.value = false;
  }
};

const getProductList = async () => {
  loading.value = true;
  try {
    const res = await productApi.getProductList(queryForm);
    tableData.value = res.records || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryForm.pageNum = 1;
  getProductList();
};

const handleReset = () => {
  queryForm.productName = "";
  queryForm.categoryId = undefined;
  queryForm.status = undefined;
  queryForm.pageNum = 1;
  getProductList();
};

const handlePageChange = (page: number) => {
  queryForm.pageNum = page;
  getProductList();
};

const handleSizeChange = (size: number) => {
  queryForm.pageSize = size;
  queryForm.pageNum = 1;
  getProductList();
};

const handleSelectionChange = (rows: Product[]) => {
  selectedRows.value = rows;
};

const openCreateDialog = () => {
  isEdit.value = false;
  resetFormData();
  dialogVisible.value = true;
  loadCategoryTreeNodes();
};

const openEditDialog = (row: Product) => {
  isEdit.value = true;
  Object.assign(productForm, {
    id: row.id,
    productName: row.productName,
    productCode: row.productCode,
    categoryId: row.categoryId,
    price: Number(row.price),
    stock: row.stock,
    description: row.description || "",
    status: row.status,
    images: [...(row.images || [])]
  });
  dialogVisible.value = true;
  loadCategoryTreeNodes();
};

const handleDialogClose = () => {
  formRef.value?.clearValidate();
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();

  dialogLoading.value = true;
  try {
    if (isEdit.value && productForm.id) {
      await productApi.updateProduct(productForm.id, productForm);
      ElMessage.success("商品更新成功");
    } else {
      await productApi.createProduct(productForm);
      ElMessage.success("商品创建成功");
    }
    dialogVisible.value = false;
    getProductList();
  } finally {
    dialogLoading.value = false;
  }
};

const handleDelete = (row: Product) => {
  ElMessageBox.confirm("确认删除该商品吗？", "提示", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消"
  })
    .then(async () => {
      if (!row.id) return;
      await productApi.deleteProduct(row.id);
      ElMessage.success("删除成功");
      getProductList();
    })
    .catch(() => undefined);
};

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请至少选择一条商品记录");
    return;
  }
  const ids = selectedRows.value.map(item => item.id).filter(Boolean) as number[];
  if (ids.length === 0) return;

  ElMessageBox.confirm(`确认删除已选中的 ${ids.length} 个商品吗？`, "提示", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消"
  })
    .then(async () => {
      await productApi.batchDeleteProducts(ids);
      ElMessage.success("批量删除成功");
      getProductList();
    })
    .catch(() => undefined);
};

const handleToggleStatus = async (row: Product) => {
  if (!row.id) return;
  if (row.status === 1) {
    await productApi.putOffSale(row.id);
    ElMessage.success("已下架");
  } else {
    await productApi.putOnSale(row.id);
    ElMessage.success("已上架");
  }
  getProductList();
};

onMounted(() => {
  getProductList();
});

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor) {
    editor.destroy();
  }
});
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="商品名称">
          <el-input
            v-model="queryForm.productName"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable>
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="mt-4">
      <template #header>
        <div class="table-header">
          <el-button type="primary" @click="openCreateDialog">新增商品</el-button>
          <el-button type="danger" plain @click="handleBatchDelete">批量删除</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="productCode" label="商品编码" width="140" />
        <el-table-column prop="productName" label="商品名称" min-width="180" />
        <el-table-column label="主图" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.images && row.images.length > 0"
              :src="row.images[0]"
              fit="cover"
              style="width: 48px; height: 48px; border-radius: 4px"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="categoryId" label="分类ID" width="100" />
        <el-table-column label="价格" width="120">
          <template #default="{ row }">
            {{ formatPrice(row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="$router.push(`/kkmall/product/detail/${row.id}`)"
            >
              详情
            </el-button>
            <el-button type="primary" size="small" link @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? "下架" : "上架" }}
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="mt-4"
        :current-page="queryForm.pageNum"
        :page-size="queryForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="860px"
      @closed="handleDialogClose"
    >
      <el-form ref="formRef" :model="productForm" :rules="rules" label-width="120px">
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="productForm.productName" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="商品编码" prop="productCode">
          <el-input v-model="productForm.productCode" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-cascader
            v-model="productForm.categoryId"
            :options="categoryTreeNodes"
            :props="{
              value: 'value',
              label: 'label',
              children: 'children',
              checkStrictly: true,
              emitPath: false
            }"
            placeholder="请选择商品分类"
            clearable
            filterable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="productForm.price"
            :min="0.01"
            :precision="2"
            :step="0.1"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="productForm.stock"
            :min="0"
            :precision="0"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="productForm.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品图片">
          <el-upload
            :show-file-list="false"
            :http-request="uploadImageRequest"
            accept=".jpg,.jpeg,.png,.webp"
          >
            <el-button type="primary" plain :loading="uploadLoading">上传图片</el-button>
          </el-upload>

          <div v-if="productForm.images && productForm.images.length > 0" class="image-list">
            <div v-for="(img, index) in productForm.images" :key="`${img}-${index}`" class="image-item">
                <el-image :src="img" fit="cover" class="image-preview" />
                <div class="image-actions">
                  <el-text truncated>{{ img }}</el-text>
                  <el-button type="danger" link @click="removeImageUrl(index)">移除</el-button>
                </div>
              </div>
          </div>
        </el-form-item>
        <el-form-item label="图文详情" prop="description">
          <div class="wangeditor">
            <Toolbar
              :editor="editorRef"
              :default-config="toolbarConfig"
              :mode="editorMode"
              style="border-bottom: 1px solid var(--el-border-color)"
            />
            <Editor
              v-model="productForm.description"
              :default-config="editorConfig"
              :mode="editorMode"
              style="height: 320px; overflow-y: hidden"
              @on-created="handleEditorCreated"
            />
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="submitForm">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.image-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 8px;
}

.image-preview {
  width: 56px;
  height: 56px;
  border-radius: 4px;
  flex-shrink: 0;
}

.image-actions {
  min-width: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  gap: 8px;
}

.wangeditor {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
}
</style>
