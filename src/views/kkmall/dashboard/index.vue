<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { orderApi } from "@/api/kkmall";
import type { Order, OrderStatistics } from "@/api/kkmall/order";
import {
  formatCurrency,
  getOrderCustomerName,
  getOrderStatusLabel,
  getOrderStatusTagType
} from "../order/helper";

defineOptions({
  name: "KKMallDashboard"
});

const texts = {
  title: "\u8FD0\u8425\u6982\u89C8",
  subtitle:
    "\u805A\u7126\u8BA2\u5355\u6D41\u8F6C\u3001\u9500\u552E\u989D\u548C\u5F85\u5904\u7406\u4E8B\u9879\u3002",
  openOrders: "\u67E5\u770B\u8BA2\u5355",
  openProducts: "\u5546\u54C1\u7BA1\u7406",
  totalOrders: "\u603B\u8BA2\u5355\u6570",
  todayOrders: "\u4ECA\u65E5\u8BA2\u5355",
  validSales: "\u6709\u6548\u9500\u552E\u989D",
  todaySales: "\u4ECA\u65E5\u9500\u552E\u989D",
  pendingPayment: "\u5F85\u4ED8\u6B3E",
  pendingShipment: "\u5F85\u53D1\u8D27",
  pendingReceipt: "\u5F85\u6536\u8D27",
  cancelled: "\u5DF2\u53D6\u6D88",
  recentOrders: "\u6700\u8FD1\u8BA2\u5355",
  allOrders: "\u5168\u90E8\u8BA2\u5355",
  orderNo: "\u8BA2\u5355\u53F7",
  customer: "\u7528\u6237",
  amount: "\u91D1\u989D",
  status: "\u72B6\u6001",
  createdAt: "\u521B\u5EFA\u65F6\u95F4",
  action: "\u64CD\u4F5C",
  detail: "\u8BE6\u60C5"
};

const router = useRouter();
const loading = ref(false);
const statistics = ref<OrderStatistics>();
const recentOrders = ref<Order[]>([]);

const loadData = async () => {
  loading.value = true;
  try {
    const [stats, recent] = await Promise.all([
      orderApi.getOrderStatistics(),
      orderApi.getOrderList({ pageNum: 1, pageSize: 5 })
    ]);
    statistics.value = stats;
    recentOrders.value = recent.records || [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div v-loading="loading" class="app-container">
    <div class="hero-card">
      <div>
        <div class="hero-title">KKMall {{ texts.title }}</div>
        <div class="hero-subtitle">
          {{ texts.subtitle }}
        </div>
      </div>
      <div class="hero-actions">
        <el-button type="primary" @click="router.push('/kkmall/order')">
          {{ texts.openOrders }}
        </el-button>
        <el-button @click="router.push('/kkmall/product')">
          {{ texts.openProducts }}
        </el-button>
      </div>
    </div>

    <div class="stats-grid">
      <el-card shadow="never">
        <el-statistic
          :title="texts.totalOrders"
          :value="statistics?.totalOrders || 0"
        />
      </el-card>
      <el-card shadow="never">
        <el-statistic
          :title="texts.todayOrders"
          :value="statistics?.todayOrders || 0"
        />
      </el-card>
      <el-card shadow="never">
        <el-statistic
          :title="texts.validSales"
          :value="Number(statistics?.totalSales || 0)"
          prefix="￥"
          :precision="2"
        />
      </el-card>
      <el-card shadow="never">
        <el-statistic
          :title="texts.todaySales"
          :value="Number(statistics?.todaySales || 0)"
          prefix="￥"
          :precision="2"
        />
      </el-card>
      <el-card shadow="never">
        <el-statistic
          :title="texts.pendingPayment"
          :value="statistics?.pendingPaymentOrders || 0"
        />
      </el-card>
      <el-card shadow="never">
        <el-statistic
          :title="texts.pendingShipment"
          :value="statistics?.pendingShipmentOrders || 0"
        />
      </el-card>
      <el-card shadow="never">
        <el-statistic
          :title="texts.pendingReceipt"
          :value="statistics?.pendingReceiptOrders || 0"
        />
      </el-card>
      <el-card shadow="never">
        <el-statistic
          :title="texts.cancelled"
          :value="statistics?.cancelledOrders || 0"
        />
      </el-card>
    </div>

    <el-card shadow="never" class="panel-card">
      <template #header>
        <div class="panel-header">
          <span>{{ texts.recentOrders }}</span>
          <el-button link type="primary" @click="router.push('/kkmall/order')">
            {{ texts.allOrders }}
          </el-button>
        </div>
      </template>

      <el-table :data="recentOrders" border stripe>
        <el-table-column
          prop="orderNo"
          :label="texts.orderNo"
          min-width="180"
        />
        <el-table-column :label="texts.customer" min-width="150">
          <template #default="{ row }">
            {{ getOrderCustomerName(row) }}
          </template>
        </el-table-column>
        <el-table-column :label="texts.amount" width="120">
          <template #default="{ row }">
            {{ formatCurrency(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column :label="texts.status" width="140">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusTagType(row.status)">
              {{ getOrderStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          :label="texts.createdAt"
          width="180"
        />
        <el-table-column :label="texts.action" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="router.push(`/kkmall/order/detail/${row.id}`)"
            >
              {{ texts.detail }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.hero-card {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  margin-bottom: 20px;
  background: linear-gradient(
    135deg,
    rgb(255 248 235 / 100%) 0%,
    rgb(245 250 255 / 100%) 100%
  );
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
}

.hero-title {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.hero-subtitle {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.panel-card {
  margin-top: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (width <= 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 768px) {
  .hero-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
