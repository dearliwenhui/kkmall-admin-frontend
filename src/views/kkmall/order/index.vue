<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { orderApi } from "@/api/kkmall";
import type {
  Order,
  OrderQueryParams,
  OrderStatistics
} from "@/api/kkmall/order";
import {
  formatCurrency,
  getOrderCustomerName,
  getOrderStatusLabel,
  getOrderStatusTagType,
  orderStatusOptions
} from "./helper";

defineOptions({
  name: "Order"
});

const texts = {
  totalOrders: "\u8BA2\u5355\u603B\u6570",
  validSales: "\u6709\u6548\u9500\u552E\u989D",
  pendingShipment: "\u5F85\u53D1\u8D27",
  pendingReceipt: "\u5F85\u6536\u8D27",
  orderNo: "\u8BA2\u5355\u53F7",
  keyword: "\u5173\u952E\u8BCD",
  status: "\u72B6\u6001",
  createdAt: "\u521B\u5EFA\u65F6\u95F4",
  customer: "\u4E0B\u5355\u7528\u6237",
  amount: "\u8BA2\u5355\u91D1\u989D",
  items: "\u5546\u54C1\u6570",
  receiver: "\u6536\u8D27\u4FE1\u606F",
  logistics: "\u7269\u6D41\u4FE1\u606F",
  actions: "\u64CD\u4F5C",
  search: "\u67E5\u8BE2",
  reset: "\u91CD\u7F6E",
  export: "\u5BFC\u51FA",
  detail: "\u8BE6\u60C5",
  deliver: "\u53D1\u8D27",
  complete: "\u5B8C\u6210",
  cancel: "\u53D6\u6D88",
  deliverTitle: "\u8BA2\u5355\u53D1\u8D27",
  carrier: "\u7269\u6D41\u516C\u53F8",
  trackingNo: "\u7269\u6D41\u5355\u53F7",
  confirm: "\u786E\u8BA4",
  allStatus: "\u5168\u90E8\u72B6\u6001",
  placeholderOrderNo: "\u8BF7\u8F93\u5165\u8BA2\u5355\u53F7",
  placeholderKeyword: "\u6536\u8D27\u4EBA/\u624B\u673A/\u7528\u6237",
  startTime: "\u5F00\u59CB\u65F6\u95F4",
  endTime: "\u7ED3\u675F\u65F6\u95F4",
  rangeTo: "\u81F3",
  receiverName: "\u6536\u8D27\u4EBA",
  receiverPhone: "\u8054\u7CFB\u7535\u8BDD",
  promptCancelMessage:
    "\u8BF7\u8F93\u5165\u53D6\u6D88\u539F\u56E0\uFF0C\u53EF\u7559\u7A7A",
  promptCancelTitle: "\u53D6\u6D88\u8BA2\u5355",
  promptCancelPlaceholder:
    "\u4F8B\u5982\uFF1A\u7528\u6237\u8981\u6C42\u53D6\u6D88\u3001\u5730\u5740\u5F02\u5E38",
  back: "\u8FD4\u56DE",
  exportSuccess: "\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u5BFC\u51FA\u6587\u4EF6",
  deliverSuccess: "\u53D1\u8D27\u6210\u529F",
  cancelSuccess: "\u8BA2\u5355\u5DF2\u53D6\u6D88",
  completeSuccess: "\u8BA2\u5355\u5DF2\u5B8C\u6210",
  completeTitle: "\u5B8C\u6210\u8BA2\u5355",
  completeMessage:
    "\u786E\u8BA4\u5C06\u8BE5\u8BA2\u5355\u6807\u8BB0\u4E3A\u5DF2\u5B8C\u6210\u5417\uFF1F",
  completeConfirm: "\u786E\u8BA4\u5B8C\u6210",
  completeCancel: "\u53D6\u6D88",
  deliverCarrierRequired: "\u8BF7\u8F93\u5165\u7269\u6D41\u516C\u53F8",
  deliverTrackingRequired: "\u8BF7\u8F93\u5165\u7269\u6D41\u5355\u53F7",
  exportFilename: "\u8BA2\u5355\u5BFC\u51FA.csv"
};

const router = useRouter();
const loading = ref(false);
const statsLoading = ref(false);
const exportLoading = ref(false);
const tableData = ref<Order[]>([]);
const total = ref(0);
const statistics = ref<OrderStatistics>();
const dateRange = ref<string[]>([]);

const queryForm = reactive<OrderQueryParams>({
  pageNum: 1,
  pageSize: 10,
  orderNo: "",
  status: undefined,
  keyword: "",
  startTime: undefined,
  endTime: undefined
});

const deliverDialogVisible = ref(false);
const deliverLoading = ref(false);
const deliverFormRef = ref<FormInstance>();
const deliverForm = reactive({
  id: undefined as number | undefined,
  orderNo: "",
  expressCompany: "",
  expressNo: ""
});

const deliverRules: FormRules = {
  expressCompany: [
    {
      required: true,
      message: texts.deliverCarrierRequired,
      trigger: "blur"
    }
  ],
  expressNo: [
    {
      required: true,
      message: texts.deliverTrackingRequired,
      trigger: "blur"
    }
  ]
};

const syncDateRangeToQuery = () => {
  queryForm.startTime = dateRange.value?.[0] || undefined;
  queryForm.endTime = dateRange.value?.[1] || undefined;
};

const loadStatistics = async () => {
  statsLoading.value = true;
  try {
    syncDateRangeToQuery();
    statistics.value = await orderApi.getOrderStatistics({
      startTime: queryForm.startTime,
      endTime: queryForm.endTime
    });
  } finally {
    statsLoading.value = false;
  }
};

const loadOrderList = async () => {
  loading.value = true;
  try {
    syncDateRangeToQuery();
    const res = await orderApi.getOrderList(queryForm);
    tableData.value = res.records || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = async () => {
  queryForm.pageNum = 1;
  await Promise.all([loadStatistics(), loadOrderList()]);
};

const handleReset = async () => {
  queryForm.orderNo = "";
  queryForm.status = undefined;
  queryForm.keyword = "";
  queryForm.pageNum = 1;
  queryForm.pageSize = 10;
  queryForm.startTime = undefined;
  queryForm.endTime = undefined;
  dateRange.value = [];
  await Promise.all([loadStatistics(), loadOrderList()]);
};

const handlePageChange = (page: number) => {
  queryForm.pageNum = page;
  loadOrderList();
};

const handleSizeChange = (size: number) => {
  queryForm.pageSize = size;
  queryForm.pageNum = 1;
  loadOrderList();
};

const openDeliverDialog = (row: Order) => {
  deliverForm.id = row.id;
  deliverForm.orderNo = row.orderNo;
  deliverForm.expressCompany = row.logisticsCompany || "";
  deliverForm.expressNo = row.trackingNumber || "";
  deliverDialogVisible.value = true;
};

const handleDeliver = async () => {
  if (!deliverFormRef.value || !deliverForm.id) return;
  await deliverFormRef.value.validate();

  deliverLoading.value = true;
  try {
    await orderApi.deliverOrder(deliverForm.id, {
      expressCompany: deliverForm.expressCompany,
      expressNo: deliverForm.expressNo
    });
    ElMessage.success(texts.deliverSuccess);
    deliverDialogVisible.value = false;
    await Promise.all([loadStatistics(), loadOrderList()]);
  } finally {
    deliverLoading.value = false;
  }
};

const handleCancel = (row: Order) => {
  if (!row.id) return;
  ElMessageBox.prompt(texts.promptCancelMessage, texts.promptCancelTitle, {
    confirmButtonText: texts.confirm,
    cancelButtonText: texts.back,
    inputPlaceholder: texts.promptCancelPlaceholder,
    inputValue: ""
  })
    .then(async ({ value }) => {
      await orderApi.cancelOrder(row.id!, value || undefined);
      ElMessage.success(texts.cancelSuccess);
      await Promise.all([loadStatistics(), loadOrderList()]);
    })
    .catch(() => undefined);
};

const handleComplete = (row: Order) => {
  if (!row.id) return;
  ElMessageBox.confirm(texts.completeMessage, texts.completeTitle, {
    type: "warning",
    confirmButtonText: texts.completeConfirm,
    cancelButtonText: texts.completeCancel
  })
    .then(async () => {
      await orderApi.completeOrder(row.id!);
      ElMessage.success(texts.completeSuccess);
      await Promise.all([loadStatistics(), loadOrderList()]);
    })
    .catch(() => undefined);
};

const handleExport = async () => {
  exportLoading.value = true;
  try {
    syncDateRangeToQuery();
    const blob = await orderApi.exportOrders(queryForm);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = texts.exportFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    ElMessage.success(texts.exportSuccess);
  } finally {
    exportLoading.value = false;
  }
};

const canCancel = (row: Order) => row.status === 0 || row.status === 1;
const canDeliver = (row: Order) => row.status === 1;
const canComplete = (row: Order) => row.status === 2;

onMounted(async () => {
  await Promise.all([loadStatistics(), loadOrderList()]);
});
</script>

<template>
  <div class="app-container">
    <div class="stats-grid">
      <el-card v-loading="statsLoading" shadow="never">
        <el-statistic
          :title="texts.totalOrders"
          :value="statistics?.totalOrders || 0"
        />
      </el-card>
      <el-card v-loading="statsLoading" shadow="never">
        <el-statistic
          :title="texts.validSales"
          :value="Number(statistics?.totalSales || 0)"
          :precision="2"
          prefix="￥"
        />
      </el-card>
      <el-card v-loading="statsLoading" shadow="never">
        <el-statistic
          :title="texts.pendingShipment"
          :value="statistics?.pendingShipmentOrders || 0"
        />
      </el-card>
      <el-card v-loading="statsLoading" shadow="never">
        <el-statistic
          :title="texts.pendingReceipt"
          :value="statistics?.pendingReceiptOrders || 0"
        />
      </el-card>
    </div>

    <el-card shadow="never" class="search-card">
      <el-form :model="queryForm" inline>
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
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item :label="texts.status">
          <el-select
            v-model="queryForm.status"
            :placeholder="texts.allStatus"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="item in orderStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="texts.createdAt">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            :start-placeholder="texts.startTime"
            :end-placeholder="texts.endTime"
            :range-separator="texts.rangeTo"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            {{ texts.search }}
          </el-button>
          <el-button @click="handleReset">{{ texts.reset }}</el-button>
          <el-button :loading="exportLoading" @click="handleExport">
            {{ texts.export }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column
          prop="orderNo"
          :label="texts.orderNo"
          min-width="190"
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
            {{ formatCurrency(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="itemCount" :label="texts.items" width="90" />
        <el-table-column :label="texts.status" width="120">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusTagType(row.status)">
              {{ getOrderStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="texts.receiver" min-width="200">
          <template #default="{ row }">
            <div class="receiver-cell">
              <span>{{ row.receiverName }}</span>
              <el-text size="small" type="info">{{
                row.receiverPhone
              }}</el-text>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="texts.logistics" min-width="200">
          <template #default="{ row }">
            <div
              v-if="row.logisticsCompany || row.trackingNumber"
              class="receiver-cell"
            >
              <span>{{ row.logisticsCompany || "-" }}</span>
              <el-text size="small" type="info">{{
                row.trackingNumber || "-"
              }}</el-text>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          :label="texts.createdAt"
          width="180"
        />
        <el-table-column :label="texts.actions" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="router.push(`/kkmall/order/detail/${row.id}`)"
            >
              {{ texts.detail }}
            </el-button>
            <el-button
              v-if="canDeliver(row)"
              v-auth="'order:deliver'"
              type="success"
              size="small"
              link
              @click="openDeliverDialog(row)"
            >
              {{ texts.deliver }}
            </el-button>
            <el-button
              v-if="canComplete(row)"
              v-auth="'order:manage'"
              type="primary"
              size="small"
              link
              @click="handleComplete(row)"
            >
              {{ texts.complete }}
            </el-button>
            <el-button
              v-if="canCancel(row)"
              v-auth="'order:manage'"
              type="danger"
              size="small"
              link
              @click="handleCancel(row)"
            >
              {{ texts.cancel }}
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
      v-model="deliverDialogVisible"
      :title="texts.deliverTitle"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="deliverFormRef"
        :model="deliverForm"
        :rules="deliverRules"
        label-width="110px"
      >
        <el-form-item :label="texts.orderNo">
          <el-input :model-value="deliverForm.orderNo" disabled />
        </el-form-item>
        <el-form-item :label="texts.carrier" prop="expressCompany">
          <el-input
            v-model="deliverForm.expressCompany"
            :placeholder="texts.carrier"
          />
        </el-form-item>
        <el-form-item :label="texts.trackingNo" prop="expressNo">
          <el-input
            v-model="deliverForm.expressNo"
            :placeholder="texts.trackingNo"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deliverDialogVisible = false">
          {{ texts.cancel }}
        </el-button>
        <el-button
          type="primary"
          :loading="deliverLoading"
          @click="handleDeliver"
        >
          {{ texts.confirm }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.user-cell,
.receiver-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pagination {
  justify-content: flex-end;
  margin-top: 20px;
}

@media (width <= 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
