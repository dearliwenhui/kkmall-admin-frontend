<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { orderApi } from "@/api/kkmall";
import type { Order } from "@/api/kkmall/order";
import {
  formatCurrency,
  getOrderCustomerName,
  getOrderStatusLabel,
  getOrderStatusTagType
} from "./helper";

defineOptions({
  name: "OrderDetail"
});

const texts = {
  title: "\u8BA2\u5355\u8BE6\u60C5",
  detailInfo: "\u8BA2\u5355\u4FE1\u606F",
  receiverInfo: "\u6536\u8D27\u4E0E\u7269\u6D41",
  items: "\u5546\u54C1\u660E\u7EC6",
  orderNo: "\u8BA2\u5355\u53F7",
  status: "\u8BA2\u5355\u72B6\u6001",
  customer: "\u4E0B\u5355\u7528\u6237",
  username: "\u7528\u6237\u8D26\u53F7",
  itemCount: "\u5546\u54C1\u4EF6\u6570",
  amount: "\u8BA2\u5355\u91D1\u989D",
  createdAt: "\u521B\u5EFA\u65F6\u95F4",
  updatedAt: "\u66F4\u65B0\u65F6\u95F4",
  paidAt: "\u652F\u4ED8\u65F6\u95F4",
  shippedAt: "\u53D1\u8D27\u65F6\u95F4",
  completedAt: "\u5B8C\u6210\u65F6\u95F4",
  remark: "\u8BA2\u5355\u5907\u6CE8",
  receiver: "\u6536\u8D27\u4EBA",
  phone: "\u8054\u7CFB\u7535\u8BDD",
  address: "\u6536\u8D27\u5730\u5740",
  carrier: "\u7269\u6D41\u516C\u53F8",
  trackingNo: "\u7269\u6D41\u5355\u53F7",
  productId: "\u5546\u54C1 ID",
  image: "\u56FE\u7247",
  productName: "\u5546\u54C1\u540D\u79F0",
  price: "\u5355\u4EF7",
  quantity: "\u6570\u91CF",
  subtotal: "\u5C0F\u8BA1",
  deliver: "\u53D1\u8D27",
  complete: "\u5B8C\u6210",
  cancel: "\u53D6\u6D88",
  back: "\u8FD4\u56DE",
  deliverTitle: "\u8BA2\u5355\u53D1\u8D27",
  deliverSuccess: "\u53D1\u8D27\u6210\u529F",
  cancelSuccess: "\u8BA2\u5355\u5DF2\u53D6\u6D88",
  completeSuccess: "\u8BA2\u5355\u5DF2\u5B8C\u6210",
  invalidOrderId: "\u8BA2\u5355 ID \u65E0\u6548",
  deliverCarrierRequired: "\u8BF7\u8F93\u5165\u7269\u6D41\u516C\u53F8",
  deliverTrackingRequired: "\u8BF7\u8F93\u5165\u7269\u6D41\u5355\u53F7",
  confirm: "\u786E\u8BA4",
  completeTitle: "\u5B8C\u6210\u8BA2\u5355",
  completeMessage:
    "\u786E\u8BA4\u5C06\u8BE5\u8BA2\u5355\u6807\u8BB0\u4E3A\u5DF2\u5B8C\u6210\u5417\uFF1F",
  cancelTitle: "\u53D6\u6D88\u8BA2\u5355",
  cancelPrompt:
    "\u8BF7\u8F93\u5165\u53D6\u6D88\u539F\u56E0\uFF0C\u53EF\u7559\u7A7A",
  cancelPlaceholder: "\u53EF\u9009\uFF1A\u53D6\u6D88\u539F\u56E0",
  noData: "\u6682\u65E0\u8BA2\u5355\u6570\u636E"
};

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const order = ref<Order | null>(null);

const deliverDialogVisible = ref(false);
const deliverLoading = ref(false);
const deliverFormRef = ref<FormInstance>();
const deliverForm = reactive({
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

const orderId = computed(() => {
  const rawId = Number(route.params.id);
  return Number.isFinite(rawId) && rawId > 0 ? rawId : undefined;
});

const canDeliver = computed(() => order.value?.status === 1);
const canCancel = computed(
  () => order.value?.status === 0 || order.value?.status === 1
);
const canComplete = computed(() => order.value?.status === 2);

const loadDetail = async () => {
  if (!orderId.value) {
    ElMessage.error(texts.invalidOrderId);
    return;
  }

  loading.value = true;
  try {
    order.value = await orderApi.getOrderDetail(orderId.value);
  } finally {
    loading.value = false;
  }
};

const openDeliverDialog = () => {
  deliverForm.expressCompany = order.value?.logisticsCompany || "";
  deliverForm.expressNo = order.value?.trackingNumber || "";
  deliverDialogVisible.value = true;
};

const handleDeliver = async () => {
  if (!deliverFormRef.value || !orderId.value) return;
  await deliverFormRef.value.validate();

  deliverLoading.value = true;
  try {
    await orderApi.deliverOrder(orderId.value, {
      expressCompany: deliverForm.expressCompany,
      expressNo: deliverForm.expressNo
    });
    ElMessage.success(texts.deliverSuccess);
    deliverDialogVisible.value = false;
    await loadDetail();
  } finally {
    deliverLoading.value = false;
  }
};

const handleCancel = () => {
  if (!orderId.value) return;
  ElMessageBox.prompt(texts.cancelPrompt, texts.cancelTitle, {
    confirmButtonText: texts.confirm,
    cancelButtonText: texts.back,
    inputPlaceholder: texts.cancelPlaceholder,
    inputValue: ""
  })
    .then(async ({ value }) => {
      await orderApi.cancelOrder(orderId.value!, value || undefined);
      ElMessage.success(texts.cancelSuccess);
      await loadDetail();
    })
    .catch(() => undefined);
};

const handleComplete = () => {
  if (!orderId.value) return;
  ElMessageBox.confirm(texts.completeMessage, texts.completeTitle, {
    type: "warning",
    confirmButtonText: texts.confirm,
    cancelButtonText: texts.cancel
  })
    .then(async () => {
      await orderApi.completeOrder(orderId.value!);
      ElMessage.success(texts.completeSuccess);
      await loadDetail();
    })
    .catch(() => undefined);
};

onMounted(() => {
  loadDetail();
});
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <template #header>
        <div class="detail-header">
          <div class="header-main">
            <span>{{ texts.title }}</span>
            <el-tag v-if="order" :type="getOrderStatusTagType(order.status)">
              {{ getOrderStatusLabel(order.status) }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-button
              v-if="canDeliver"
              v-auth="'order:deliver'"
              type="success"
              @click="openDeliverDialog"
            >
              {{ texts.deliver }}
            </el-button>
            <el-button
              v-if="canComplete"
              v-auth="'order:manage'"
              type="primary"
              @click="handleComplete"
            >
              {{ texts.complete }}
            </el-button>
            <el-button
              v-if="canCancel"
              v-auth="'order:manage'"
              type="danger"
              plain
              @click="handleCancel"
            >
              {{ texts.cancel }}
            </el-button>
            <el-button @click="router.back()">{{ texts.back }}</el-button>
          </div>
        </div>
      </template>

      <el-empty v-if="!order" :description="texts.noData" />

      <template v-else>
        <div class="summary-grid">
          <el-card shadow="never">
            <template #header>{{ texts.detailInfo }}</template>
            <el-descriptions :column="2" border>
              <el-descriptions-item :label="texts.orderNo">
                {{ order.orderNo }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.status">
                {{ getOrderStatusLabel(order.status) }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.customer">
                {{ getOrderCustomerName(order) }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.username">
                {{ order.username || "-" }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.itemCount">
                {{ order.itemCount || 0 }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.amount">
                {{ formatCurrency(order.totalAmount) }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.createdAt">
                {{ order.createTime || "-" }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.updatedAt">
                {{ order.updateTime || "-" }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.paidAt">
                {{ order.payTime || "-" }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.shippedAt">
                {{ order.shipTime || "-" }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.completedAt">
                {{ order.confirmTime || "-" }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.remark">
                {{ order.remark || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card shadow="never">
            <template #header>{{ texts.receiverInfo }}</template>
            <el-descriptions :column="1" border>
              <el-descriptions-item :label="texts.receiver">
                {{ order.receiverName }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.phone">
                {{ order.receiverPhone }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.address">
                {{ order.receiverAddress }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.carrier">
                {{ order.logisticsCompany || "-" }}
              </el-descriptions-item>
              <el-descriptions-item :label="texts.trackingNo">
                {{ order.trackingNumber || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </div>

        <el-card shadow="never" class="items-card">
          <template #header>{{ texts.items }}</template>
          <el-table :data="order.items || []" border>
            <el-table-column
              prop="productId"
              :label="texts.productId"
              width="100"
            />
            <el-table-column :label="texts.image" width="100">
              <template #default="{ row }">
                <el-image
                  v-if="row.productImage"
                  :src="row.productImage"
                  fit="cover"
                  style="width: 48px; height: 48px; border-radius: 4px"
                />
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="productName"
              :label="texts.productName"
              min-width="220"
            />
            <el-table-column :label="texts.price" width="120">
              <template #default="{ row }">
                {{ formatCurrency(row.price) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="quantity"
              :label="texts.quantity"
              width="90"
            />
            <el-table-column :label="texts.subtotal" width="120">
              <template #default="{ row }">
                {{ formatCurrency(row.totalAmount) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </template>
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
        <el-button @click="deliverDialogVisible = false">{{
          texts.cancel
        }}</el-button>
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

.detail-header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.header-main,
.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
}

.items-card {
  margin-top: 16px;
}

@media (width <= 960px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
