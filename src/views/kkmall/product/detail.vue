<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { productApi } from "@/api/kkmall";
import type { Product } from "@/api/kkmall/product";

defineOptions({
  name: "ProductDetail"
});

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const product = ref<Product | null>(null);

const productId = computed(() => {
  const rawId = route.params.id;
  const parsed = Number(rawId);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});

const formatPrice = (price?: number) => `￥${Number(price || 0).toFixed(2)}`;
const formatStatus = (status?: number) => (status === 1 ? "上架" : "下架");

const loadDetail = async () => {
  if (!productId.value) {
    ElMessage.error("商品ID无效");
    return;
  }
  loading.value = true;
  try {
    product.value = await productApi.getProductDetail(productId.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDetail();
});
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" v-loading="loading">
      <template #header>
        <div class="detail-header">
          <span>商品详情</span>
          <el-button @click="router.back()">返回</el-button>
        </div>
      </template>

      <el-empty v-if="!product" description="暂无商品数据" />

      <template v-else>
        <el-card v-if="product.images && product.images.length > 0" class="image-card" shadow="never">
          <template #header>商品图片</template>
          <el-carousel trigger="click" height="280px">
            <el-carousel-item v-for="(image, idx) in product.images" :key="`${image}-${idx}`">
              <div class="carousel-image-wrap">
                <el-image :src="image" fit="contain" class="carousel-image" />
              </div>
            </el-carousel-item>
          </el-carousel>
        </el-card>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="编号">{{ product.id }}</el-descriptions-item>
          <el-descriptions-item label="商品编码">{{ product.productCode }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ product.productName }}</el-descriptions-item>
          <el-descriptions-item label="分类ID">{{ product.categoryId }}</el-descriptions-item>
          <el-descriptions-item label="价格">
            {{ formatPrice(product.price) }}
          </el-descriptions-item>
          <el-descriptions-item label="库存">{{ product.stock }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            {{ formatStatus(product.status) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ product.createTime || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ product.updateTime || "-" }}
          </el-descriptions-item>
        </el-descriptions>

        <el-card class="rich-detail-card" shadow="never">
          <template #header>图文详情</template>
          <div
            v-if="product.description"
            class="rich-detail-content"
            v-html="product.description"
          />
          <el-empty v-else description="暂无图文详情" />
        </el-card>
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-card {
  margin-bottom: 16px;
}

.carousel-image-wrap {
  width: 100%;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-lighter);
}

.carousel-image {
  width: 100%;
  height: 100%;
}

.rich-detail-card {
  margin-top: 16px;
}

.rich-detail-content {
  line-height: 1.7;
  word-break: break-word;
}
</style>
