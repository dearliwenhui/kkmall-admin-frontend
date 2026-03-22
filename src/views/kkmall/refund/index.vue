<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { refundApi } from "@/api/kkmall";
import type { Refund, RefundQueryParams } from "@/api/kkmall/refund";
import { formatCurrency, getOrderCustomerName } from "../order/helper";

defineOptions({
  name: "Refund"
});

const texts = {
  pageTitle: "\u9000\u6B3E\u552E\u540E\u7BA1\u7406",
  refundNo: "\u9000\u6B3E\u5355\u53F7",
  orderNo: "\u8BA2\u5355\u53F7",
  keyword: "\u5173\u952E\u8BCD",
  status: "\u72B6\u6001",
  refundType: "\u7C7B\u578B",
  amount: "\u9000\u6B3E\u91D1\u989D",
  customer: "\u7533\u8BF7\u7528\u6237",
  reason: "\u9000\u6B3E\u539F\u56E0",
  createdAt: "\u7533\u8BF7\u65F6\u95F4",
  updatedAt: "\u66F4\u65B0\u65F6\u95F4",
  refundAt: "\u9000\u6B3E\u65F6\u95F4",
  actions: "\u64CD\u4F5C",
  detail: "\u8BE6\u60C5",
  audit: "\u5BA1\u6838",
  search: "\u67E5\u8BE2",
  reset: "\u91CD\u7F6E",
  all: "\u5168\u90E8",
  detailTitle: "\u552E\u540E\u8BE6\u60C5",
  auditTitle: "\u5BA1\u6838\u9000\u6B3E",
  approve: "\u901A\u8FC7",
  reject: "\u62D2\u7EDD",
  submit: "\u63D0\u4EA4",
  cancel: "\u53D6\u6D88",
  description: "\u8BF4\u660E",
  images: "\u51ED\u8BC1\u56FE\u7247",
  rejectReason: "\u62D2\u7EDD\u539F\u56E0",
  approveLabel: "\u5BA1\u6838\u7ED3\u679C",
  placeholderRefundNo: "\u8BF7\u8F93\u5165\u9000\u6B3E\u5355\u53F7",
  placeholderOrderNo: "\u8BF7\u8F93\u5165\u8BA2\u5355\u53F7",
  placeholderKeyword:
    "\u8BA2\u5355\u53F7/\u9000\u6B3E\u5355\u53F7/\u7528\u6237",
  placeholderRejectReason: "\u8BF7\u8F93\u5165\u62D2\u7EDD\u539F\u56E0",
  placeholderDescription: "\u65E0",
  approvedSuccess: "\u5DF2\u901A\u8FC7\u9000\u6B3E\u5BA1\u6838",
  rejectedSuccess: "\u5DF2\u62D2\u7EDD\u9000\u6B3E\u7533\u8BF7",
  pending: "\u5F85\u5BA1\u6838"
};

const refundTypeOptions = [
  { label: "\u4EC5\u9000\u6B3E", value: 1 },
  { label: "\u9000\u8D27\u9000\u6B3E", value: 2 }
];

const refundStatusOptions = [
  { label: "\u5F85\u5BA1\u6838", value: 0 },
  { label: "\u5DF2\u62D2\u7EDD", value: 2 },
  { label: "\u9000\u6B3E\u6210\u529F", value: 3 }
];

const queryForm = reactive<RefundQueryParams>({
  pageNum: 1,
  pageSize: 10,
  refundNo: "",
  orderNo: "",
  keyword: "",
  status: undefined,
  refundType: undefined
});

const loading = ref(false);
const tableData = ref<Refund[]>([]);
const total = ref(0);
const detailVisible = ref(false);
const auditVisible = ref(false);
const detailData = ref<Refund | null>(null);
const auditTarget = ref<Refund | null>(null);
const auditLoading = ref(false);
const auditFormRef = ref<FormInstance>();
const auditForm = reactive({
  approved: true,
  rejectReason: ""
});

const auditRules: FormRules = {
  rejectReason: [
    {
      validator: (_rule, value, callback) => {
        if (!auditForm.approved && !value) {
          callback(new Error("\u8BF7\u8F93\u5165\u62D2\u7EDD\u539F\u56E0"));
          return;
        }
        callback();
      },
      trigger: "blur"
    }
  ]
};

const getRefundTypeLabel = (type?: number) =>
  refundTypeOptions.find(item => item.value === type)?.label || "-";

const getRefundStatusLabel = (status?: number) =>
  refundStatusOptions.find(item => item.value === status)?.label || "-";

const getRefundStatusTagType = (status?: number) => {
  switch (status) {
    case 0:
      return "warning";
    case 2:
      return "danger";
    case 3:
      return "success";
    default:
      return "info";
  }
};

const loadRefundList = async () => {
  loading.value = true;
  try {
    const res = await refundApi.getRefundList(queryForm);
    tableData.value = res.records || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryForm.pageNum = 1;
  loadRefundList();
};

const handleReset = () => {
  queryForm.pageNum = 1;
  queryForm.pageSize = 10;
  queryForm.refundNo = "";
  queryForm.orderNo = "";
  queryForm.keyword = "";
  queryForm.status = undefined;
  queryForm.refundType = undefined;
  loadRefundList();
};

const handlePageChange = (page: number) => {
  queryForm.pageNum = page;
  loadRefundList();
};

const handleSizeChange = (size: number) => {
  queryForm.pageSize = size;
  queryForm.pageNum = 1;
  loadRefundList();
};

const openDetail = async (row: Refund) => {
  detailData.value = await refundApi.getRefundDetail(row.id);
  detailVisible.value = true;
};

const openAudit = (row: Refund) => {
  auditTarget.value = row;
  auditForm.approved = true;
  auditForm.rejectReason = "";
  auditVisible.value = true;
};

const submitAudit = async () => {
  if (!auditFormRef.value || !auditTarget.value) return;
  await auditFormRef.value.validate();

  auditLoading.value = true;
  try {
    await refundApi.auditRefund(auditTarget.value.id, {
      approved: auditForm.approved,
      rejectReason: auditForm.approved ? undefined : auditForm.rejectReason
    });
    ElMessage.success(
      auditForm.approved ? texts.approvedSuccess : texts.rejectedSuccess
    );
    auditVisible.value = false;
    await loadRefundList();
  } finally {
    auditLoading.value = false;
  }
};

onMounted(() => {
  loadRefundList();
});
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item :label="texts.refundNo">
          <el-input
            v-model="queryForm.refundNo"
            :placeholder="texts.placeholderRefundNo"
            clearable
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item :label="texts.orderNo">
          <el-input
            v-model="queryForm.orderNo"
            :placeholder="texts.placeholderOrderNo"
            clearable
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item :label="texts.keyword">
          <el-input
            v-model="queryForm.keyword"
            :placeholder="texts.placeholderKeyword"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item :label="texts.refundType">
          <el-select
            v-model="queryForm.refundType"
            :placeholder="texts.all"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in refundTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="texts.status">
          <el-select
            v-model="queryForm.status"
            :placeholder="texts.all"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in refundStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">{{
            texts.search
          }}</el-button>
          <el-button @click="handleReset">{{ texts.reset }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span>{{ texts.pageTitle }}</span>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column
          prop="refundNo"
          :label="texts.refundNo"
          min-width="180"
        />
        <el-table-column
          prop="orderNo"
          :label="texts.orderNo"
          min-width="180"
        />
        <el-table-column :label="texts.customer" min-width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <span>{{ getOrderCustomerName(row) }}</span>
              <el-text size="small" type="info">{{
                row.username || "-"
              }}</el-text>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="texts.amount" width="120">
          <template #default="{ row }">
            {{ formatCurrency(row.refundAmount) }}
          </template>
        </el-table-column>
        <el-table-column :label="texts.refundType" width="120">
          <template #default="{ row }">
            {{ getRefundTypeLabel(row.refundType) }}
          </template>
        </el-table-column>
        <el-table-column :label="texts.status" width="120">
          <template #default="{ row }">
            <el-tag :type="getRefundStatusTagType(row.status)">
              {{ getRefundStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" :label="texts.reason" min-width="200" />
        <el-table-column
          prop="createTime"
          :label="texts.createdAt"
          width="180"
        />
        <el-table-column :label="texts.actions" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="openDetail(row)"
            >
              {{ texts.detail }}
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="success"
              size="small"
              link
              @click="openAudit(row)"
            >
              {{ texts.audit }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
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
      v-model="detailVisible"
      :title="texts.detailTitle"
      width="760px"
      :close-on-click-modal="false"
    >
      <el-descriptions v-if="detailData" :column="2" border>
        <el-descriptions-item :label="texts.refundNo">
          {{ detailData.refundNo }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.orderNo">
          {{ detailData.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.customer">
          {{ getOrderCustomerName(detailData) }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.amount">
          {{ formatCurrency(detailData.refundAmount) }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.refundType">
          {{ getRefundTypeLabel(detailData.refundType) }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.status">
          {{ getRefundStatusLabel(detailData.status) }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.reason">
          {{ detailData.reason || "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.rejectReason">
          {{ detailData.rejectReason || "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.description" :span="2">
          {{ detailData.description || texts.placeholderDescription }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.createdAt">
          {{ detailData.createTime || "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.updatedAt">
          {{ detailData.updateTime || "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.refundAt" :span="2">
          {{ detailData.refundTime || "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="texts.images" :span="2">
          <div v-if="detailData.images?.length" class="image-list">
            <el-image
              v-for="(img, index) in detailData.images"
              :key="`${img}-${index}`"
              :src="img"
              fit="cover"
              class="image-item"
            />
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog
      v-model="auditVisible"
      :title="texts.auditTitle"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="auditFormRef"
        :model="auditForm"
        :rules="auditRules"
        label-width="100px"
      >
        <el-form-item :label="texts.refundNo">
          <el-input :model-value="auditTarget?.refundNo || '-'" disabled />
        </el-form-item>
        <el-form-item :label="texts.approveLabel">
          <el-radio-group v-model="auditForm.approved">
            <el-radio :label="true">{{ texts.approve }}</el-radio>
            <el-radio :label="false">{{ texts.reject }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="!auditForm.approved"
          :label="texts.rejectReason"
          prop="rejectReason"
        >
          <el-input
            v-model="auditForm.rejectReason"
            type="textarea"
            :rows="3"
            :placeholder="texts.placeholderRejectReason"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditVisible = false">{{ texts.cancel }}</el-button>
        <el-button type="primary" :loading="auditLoading" @click="submitAudit">
          {{ texts.submit }}
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

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pagination {
  justify-content: flex-end;
  margin-top: 20px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  width: 72px;
  height: 72px;
  border-radius: 6px;
}
</style>
