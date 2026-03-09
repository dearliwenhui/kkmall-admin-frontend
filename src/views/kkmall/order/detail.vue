<script setup lang="ts">
import { useRoute } from "vue-router";

defineOptions({
  name: "OrderDetail"
});

const route = useRoute();
const orderId = route.params.id;
</script>

<template>
  <div class="app-container">
    <el-card shadow="never">
      <h1>订单详情</h1>
      <p>订单ID: {{ orderId }}</p>
      <p>这里将展示订单的详细信息</p>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}
</style>