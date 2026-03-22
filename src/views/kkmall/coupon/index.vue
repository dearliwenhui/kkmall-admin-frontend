<script setup lang="ts">
import dayjs from "dayjs";
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { couponApi } from "@/api/kkmall";
import type { Coupon, CouponQueryParams } from "@/api/kkmall/coupon";

defineOptions({
  name: "Coupon"
});

const texts = {
  name: "\u4f18\u60e0\u5238\u540d\u79f0",
  type: "\u7c7b\u578b",
  status: "\u72b6\u6001",
  fullReduction: "\u6ee1\u51cf\u5238",
  discount: "\u6298\u6263\u5238",
  allType: "\u5168\u90e8\u7c7b\u578b",
  allStatus: "\u5168\u90e8\u72b6\u6001",
  enabled: "\u542f\u7528",
  disabled: "\u505c\u7528",
  search: "\u67e5\u8be2",
  reset: "\u91cd\u7f6e",
  create: "\u65b0\u589e\u4f18\u60e0\u5238",
  edit: "\u7f16\u8f91",
  delete: "\u5220\u9664",
  batchDelete: "\u6279\u91cf\u5220\u9664",
  actions: "\u64cd\u4f5c",
  couponRule: "\u4f18\u60e0\u89c4\u5219",
  issueInfo: "\u53d1\u653e\u4fe1\u606f",
  validWindow: "\u6709\u6548\u65f6\u95f4",
  validDays: "\u9886\u53d6\u540e\u6709\u6548\u5929\u6570",
  minAmount: "\u4f7f\u7528\u95e8\u69db",
  discountAmount: "\u51cf\u514d\u91d1\u989d",
  discountRate: "\u6298\u6263\u503c",
  totalCount: "\u53d1\u653e\u603b\u91cf",
  receivedCount: "\u5df2\u9886\u6570",
  remainingCount: "\u5269\u4f59\u6570",
  createdAt: "\u521b\u5efa\u65f6\u95f4",
  startTime: "\u5f00\u59cb\u65f6\u95f4",
  endTime: "\u7ed3\u675f\u65f6\u95f4",
  createTitle: "\u65b0\u589e\u4f18\u60e0\u5238",
  editTitle: "\u7f16\u8f91\u4f18\u60e0\u5238",
  confirm: "\u786e\u5b9a",
  cancel: "\u53d6\u6d88",
  placeholderName: "\u8bf7\u8f93\u5165\u4f18\u60e0\u5238\u540d\u79f0",
  discountRateHint:
    "\u652f\u6301 8 \u6216 0.8\uff0c\u540e\u7aef\u4f1a\u81ea\u52a8\u89c4\u6574\u4e3a 8 \u6298",
  minAmountHint: "\u586b 0 \u8868\u793a\u65e0\u4f7f\u7528\u95e8\u69db",
  deleteConfirm: "\u786e\u8ba4\u5220\u9664\u8be5\u4f18\u60e0\u5238\u5417\uff1f",
  batchDeleteConfirmPrefix: "\u786e\u8ba4\u5220\u9664\u5df2\u9009\u4e2d\u7684 ",
  batchDeleteConfirmSuffix: " \u5f20\u4f18\u60e0\u5238\u5417\uff1f",
  noSelection: "\u8bf7\u81f3\u5c11\u9009\u62e9\u4e00\u6761\u8bb0\u5f55",
  createdSuccess: "\u4f18\u60e0\u5238\u521b\u5efa\u6210\u529f",
  updatedSuccess: "\u4f18\u60e0\u5238\u66f4\u65b0\u6210\u529f",
  deletedSuccess: "\u5220\u9664\u6210\u529f",
  batchDeletedSuccess: "\u6279\u91cf\u5220\u9664\u6210\u529f",
  enabledSuccess: "\u4f18\u60e0\u5238\u5df2\u542f\u7528",
  disabledSuccess: "\u4f18\u60e0\u5238\u5df2\u505c\u7528",
  usedDeleteTip:
    "\u5df2\u6709\u9886\u53d6\u8bb0\u5f55\u7684\u4f18\u60e0\u5238\u4e0d\u53ef\u5220\u9664"
} as const;

const couponTypeOptions = [
  { label: texts.fullReduction, value: 1 },
  { label: texts.discount, value: 2 }
];

const statusOptions = [
  { label: texts.enabled, value: 1 },
  { label: texts.disabled, value: 0 }
];

const buildDefaultTimeRange = () =>
  [
    dayjs().format("YYYY-MM-DD HH:mm:ss"),
    dayjs().add(30, "day").format("YYYY-MM-DD HH:mm:ss")
  ] as [string, string];

const buildDefaultForm = (): Coupon => {
  const [startTime, endTime] = buildDefaultTimeRange();
  return {
    name: "",
    type: 1,
    discountAmount: 10,
    discountRate: null,
    minAmount: 0,
    totalCount: 100,
    validDays: 30,
    startTime,
    endTime,
    status: 1
  };
};

const queryForm = reactive<CouponQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: "",
  type: undefined,
  status: undefined
});

const tableData = ref<Coupon[]>([]);
const total = ref(0);
const loading = ref(false);
const selectedRows = ref<Coupon[]>([]);

const dialogVisible = ref(false);
const dialogLoading = ref(false);
const isEdit = ref(false);
const currentEditId = ref<number>();
const formRef = ref<FormInstance>();
const couponForm = reactive<Coupon>(buildDefaultForm());
const timeRange = ref<string[]>(buildDefaultTimeRange());

const syncTimeRangeToForm = () => {
  couponForm.startTime = timeRange.value?.[0] || "";
  couponForm.endTime = timeRange.value?.[1] || "";
};

const resetFormData = () => {
  Object.assign(couponForm, buildDefaultForm());
  timeRange.value = [couponForm.startTime, couponForm.endTime];
};

const normalizeDateTime = (value?: string) => {
  if (!value) return "";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : value;
};

const formatMoney = (value?: number | null) =>
  `\uffe5${Number(value || 0).toFixed(2)}`;

const formatCouponType = (type?: number) =>
  type === 1 ? texts.fullReduction : texts.discount;

const formatCouponRule = (row: Coupon) => {
  if (row.type === 1) {
    return `${texts.minAmount}${formatMoney(row.minAmount)} / ${texts.discountAmount}${formatMoney(row.discountAmount)}`;
  }
  const rate =
    row.discountRate == null ? "-" : `${Number(row.discountRate)} \u6298`;
  return `${texts.discountRate}${rate}`;
};

const formatStatusType = (status?: number) =>
  status === 1 ? "success" : "info";

const formatDateTime = (value?: string) =>
  value ? normalizeDateTime(value) : "-";

const validateDiscountAmount = (
  _rule: any,
  value: number | null,
  callback: any
) => {
  if (couponForm.type !== 1) {
    callback();
    return;
  }
  if (value == null || Number(value) <= 0) {
    callback(
      new Error(
        "\u8bf7\u8f93\u5165\u5927\u4e8e 0 \u7684\u51cf\u514d\u91d1\u989d"
      )
    );
    return;
  }
  callback();
};

const validateDiscountRate = (
  _rule: any,
  value: number | null,
  callback: any
) => {
  if (couponForm.type !== 2) {
    callback();
    return;
  }
  if (value == null || Number(value) <= 0 || Number(value) >= 10) {
    callback(
      new Error(
        "\u8bf7\u8f93\u5165 0 \u5230 10 \u4e4b\u95f4\u7684\u6298\u6263\u503c"
      )
    );
    return;
  }
  callback();
};

const validateTimeRange = (_rule: any, _value: string, callback: any) => {
  if (!timeRange.value || timeRange.value.length !== 2) {
    callback(
      new Error("\u8bf7\u9009\u62e9\u5b8c\u6574\u7684\u6709\u6548\u65f6\u95f4")
    );
    return;
  }
  const [startTime, endTime] = timeRange.value;
  if (!startTime || !endTime) {
    callback(
      new Error("\u8bf7\u9009\u62e9\u5b8c\u6574\u7684\u6709\u6548\u65f6\u95f4")
    );
    return;
  }
  if (
    dayjs(startTime).isAfter(dayjs(endTime)) ||
    dayjs(startTime).isSame(dayjs(endTime))
  ) {
    callback(
      new Error(
        "\u5f00\u59cb\u65f6\u95f4\u5fc5\u987b\u65e9\u4e8e\u7ed3\u675f\u65f6\u95f4"
      )
    );
    return;
  }
  callback();
};

const rules: FormRules = {
  name: [
    {
      required: true,
      message: "\u8bf7\u8f93\u5165\u4f18\u60e0\u5238\u540d\u79f0",
      trigger: "blur"
    }
  ],
  type: [
    {
      required: true,
      message: "\u8bf7\u9009\u62e9\u4f18\u60e0\u5238\u7c7b\u578b",
      trigger: "change"
    }
  ],
  discountAmount: [{ validator: validateDiscountAmount, trigger: "blur" }],
  discountRate: [{ validator: validateDiscountRate, trigger: "blur" }],
  totalCount: [
    {
      required: true,
      message: "\u8bf7\u8f93\u5165\u53d1\u653e\u603b\u91cf",
      trigger: "blur"
    }
  ],
  validDays: [
    {
      required: true,
      message: "\u8bf7\u8f93\u5165\u6709\u6548\u5929\u6570",
      trigger: "blur"
    }
  ],
  startTime: [{ validator: validateTimeRange, trigger: "change" }],
  status: [
    {
      required: true,
      message: "\u8bf7\u9009\u62e9\u72b6\u6001",
      trigger: "change"
    }
  ]
};

const buildSubmitPayload = (): Coupon => {
  syncTimeRangeToForm();
  return {
    name: couponForm.name.trim(),
    type: couponForm.type,
    discountAmount:
      couponForm.type === 1 ? Number(couponForm.discountAmount || 0) : null,
    discountRate:
      couponForm.type === 2 ? Number(couponForm.discountRate || 0) : null,
    minAmount: Number(couponForm.minAmount || 0),
    totalCount: Number(couponForm.totalCount || 0),
    validDays: Number(couponForm.validDays || 0),
    startTime: couponForm.startTime,
    endTime: couponForm.endTime,
    status: couponForm.status
  };
};

const loadCouponList = async () => {
  loading.value = true;
  try {
    const res = await couponApi.getCouponList(queryForm);
    tableData.value = res.records || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryForm.pageNum = 1;
  loadCouponList();
};

const handleReset = () => {
  queryForm.name = "";
  queryForm.type = undefined;
  queryForm.status = undefined;
  queryForm.pageNum = 1;
  queryForm.pageSize = 10;
  loadCouponList();
};

const handlePageChange = (page: number) => {
  queryForm.pageNum = page;
  loadCouponList();
};

const handleSizeChange = (size: number) => {
  queryForm.pageSize = size;
  queryForm.pageNum = 1;
  loadCouponList();
};

const handleSelectionChange = (rows: Coupon[]) => {
  selectedRows.value = rows;
};

const handleTypeChange = (value: number) => {
  couponForm.type = value;
  if (value === 1) {
    couponForm.discountAmount = Number(couponForm.discountAmount || 10);
    couponForm.discountRate = null;
  } else {
    couponForm.discountRate = Number(couponForm.discountRate || 8);
    couponForm.discountAmount = null;
  }
};

const openCreateDialog = () => {
  isEdit.value = false;
  currentEditId.value = undefined;
  resetFormData();
  dialogVisible.value = true;
};

const openEditDialog = async (row: Coupon) => {
  if (!row.id) return;
  isEdit.value = true;
  currentEditId.value = row.id;
  const detail = await couponApi.getCouponDetail(row.id);
  Object.assign(couponForm, {
    id: detail.id,
    name: detail.name,
    type: detail.type,
    discountAmount: detail.discountAmount ?? null,
    discountRate: detail.discountRate ?? null,
    minAmount: Number(detail.minAmount || 0),
    totalCount: detail.totalCount,
    validDays: detail.validDays,
    startTime: normalizeDateTime(detail.startTime),
    endTime: normalizeDateTime(detail.endTime),
    status: detail.status
  });
  timeRange.value = [couponForm.startTime, couponForm.endTime];
  dialogVisible.value = true;
};

const handleDialogClosed = () => {
  formRef.value?.clearValidate();
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  syncTimeRangeToForm();
  await formRef.value.validate();

  dialogLoading.value = true;
  try {
    const payload = buildSubmitPayload();
    if (isEdit.value && currentEditId.value) {
      await couponApi.updateCoupon(currentEditId.value, payload);
      ElMessage.success(texts.updatedSuccess);
    } else {
      await couponApi.createCoupon(payload);
      ElMessage.success(texts.createdSuccess);
    }
    dialogVisible.value = false;
    await loadCouponList();
  } finally {
    dialogLoading.value = false;
  }
};

const handleDelete = (row: Coupon) => {
  if (!row.id) return;
  ElMessageBox.confirm(texts.deleteConfirm, texts.delete, {
    type: "warning",
    confirmButtonText: texts.confirm,
    cancelButtonText: texts.cancel
  })
    .then(async () => {
      await couponApi.deleteCoupon(row.id!);
      ElMessage.success(texts.deletedSuccess);
      await loadCouponList();
    })
    .catch(() => undefined);
};

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning(texts.noSelection);
    return;
  }
  const ids = selectedRows.value
    .map(item => item.id)
    .filter((id): id is number => typeof id === "number");
  if (ids.length === 0) {
    ElMessage.warning(texts.noSelection);
    return;
  }

  ElMessageBox.confirm(
    `${texts.batchDeleteConfirmPrefix}${ids.length}${texts.batchDeleteConfirmSuffix}`,
    texts.batchDelete,
    {
      type: "warning",
      confirmButtonText: texts.confirm,
      cancelButtonText: texts.cancel
    }
  )
    .then(async () => {
      await couponApi.batchDeleteCoupons(ids);
      ElMessage.success(texts.batchDeletedSuccess);
      await loadCouponList();
    })
    .catch(() => undefined);
};

const handleToggleStatus = async (row: Coupon) => {
  if (!row.id) return;
  if (row.status === 1) {
    await couponApi.disableCoupon(row.id);
    ElMessage.success(texts.disabledSuccess);
  } else {
    await couponApi.enableCoupon(row.id);
    ElMessage.success(texts.enabledSuccess);
  }
  await loadCouponList();
};

onMounted(() => {
  loadCouponList();
});
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item :label="texts.name">
          <el-input
            v-model="queryForm.name"
            :placeholder="texts.placeholderName"
            clearable
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item :label="texts.type">
          <el-select
            v-model="queryForm.type"
            :placeholder="texts.allType"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="option in couponTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="texts.status">
          <el-select
            v-model="queryForm.status"
            :placeholder="texts.allStatus"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            {{ texts.search }}
          </el-button>
          <el-button @click="handleReset">{{ texts.reset }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="table-header">
          <el-button
            v-auth="'coupon:add'"
            type="primary"
            @click="openCreateDialog"
          >
            {{ texts.create }}
          </el-button>
          <el-button
            v-auth="'coupon:delete'"
            type="danger"
            plain
            @click="handleBatchDelete"
          >
            {{ texts.batchDelete }}
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" :label="texts.name" min-width="180" />
        <el-table-column :label="texts.type" width="120">
          <template #default="{ row }">
            {{ formatCouponType(row.type) }}
          </template>
        </el-table-column>
        <el-table-column :label="texts.couponRule" min-width="220">
          <template #default="{ row }">
            {{ formatCouponRule(row) }}
          </template>
        </el-table-column>
        <el-table-column :label="texts.issueInfo" width="180">
          <template #default="{ row }">
            <div class="issue-cell">
              <span>{{ texts.totalCount }}: {{ row.totalCount || 0 }}</span>
              <span
                >{{ texts.receivedCount }}: {{ row.receivedCount || 0 }}</span
              >
              <span
                >{{ texts.remainingCount }}: {{ row.remainingCount || 0 }}</span
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="texts.validDays" width="140">
          <template #default="{ row }">
            {{ row.validDays || 0 }}
          </template>
        </el-table-column>
        <el-table-column :label="texts.validWindow" min-width="320">
          <template #default="{ row }">
            <div class="time-cell">
              <span>{{ formatDateTime(row.startTime) }}</span>
              <span>{{ formatDateTime(row.endTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="texts.status" width="110">
          <template #default="{ row }">
            <el-tag :type="formatStatusType(row.status)">
              {{ row.status === 1 ? texts.enabled : texts.disabled }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          :label="texts.createdAt"
          width="180"
        />
        <el-table-column :label="texts.actions" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              v-auth="'coupon:edit'"
              type="primary"
              size="small"
              link
              @click="openEditDialog(row)"
            >
              {{ texts.edit }}
            </el-button>
            <el-button
              v-auth="'coupon:edit'"
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? texts.disabled : texts.enabled }}
            </el-button>
            <el-button
              v-auth="'coupon:delete'"
              type="danger"
              size="small"
              link
              :disabled="Number(row.receivedCount || 0) > 0"
              @click="handleDelete(row)"
            >
              {{ texts.delete }}
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
      v-model="dialogVisible"
      :title="isEdit ? texts.editTitle : texts.createTitle"
      width="720px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form
        ref="formRef"
        :model="couponForm"
        :rules="rules"
        label-width="130px"
      >
        <el-form-item :label="texts.name" prop="name">
          <el-input
            v-model="couponForm.name"
            :placeholder="texts.placeholderName"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item :label="texts.type" prop="type">
          <el-radio-group v-model="couponForm.type" @change="handleTypeChange">
            <el-radio
              v-for="option in couponTypeOptions"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="couponForm.type === 1"
          :label="texts.discountAmount"
          prop="discountAmount"
        >
          <el-input-number
            v-model="couponForm.discountAmount"
            :min="0.01"
            :precision="2"
            :step="1"
          />
        </el-form-item>
        <el-form-item v-else :label="texts.discountRate" prop="discountRate">
          <div class="field-with-tip">
            <el-input-number
              v-model="couponForm.discountRate"
              :min="0.1"
              :max="9.99"
              :precision="2"
              :step="0.1"
            />
            <el-text type="info">{{ texts.discountRateHint }}</el-text>
          </div>
        </el-form-item>
        <el-form-item :label="texts.minAmount">
          <div class="field-with-tip">
            <el-input-number
              v-model="couponForm.minAmount"
              :min="0"
              :precision="2"
              :step="10"
            />
            <el-text type="info">{{ texts.minAmountHint }}</el-text>
          </div>
        </el-form-item>
        <el-form-item :label="texts.totalCount" prop="totalCount">
          <el-input-number
            v-model="couponForm.totalCount"
            :min="1"
            :precision="0"
            :step="10"
          />
        </el-form-item>
        <el-form-item :label="texts.validDays" prop="validDays">
          <el-input-number
            v-model="couponForm.validDays"
            :min="1"
            :precision="0"
            :step="1"
          />
        </el-form-item>
        <el-form-item :label="texts.validWindow" prop="startTime">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            :start-placeholder="texts.startTime"
            :end-placeholder="texts.endTime"
            range-separator="~"
            style="width: 100%"
            @change="syncTimeRangeToForm"
          />
        </el-form-item>
        <el-form-item :label="texts.status" prop="status">
          <el-radio-group v-model="couponForm.status">
            <el-radio
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ texts.cancel }}</el-button>
        <el-button
          type="primary"
          :loading="dialogLoading"
          @click="handleSubmit"
        >
          {{ texts.confirm }}
        </el-button>
      </template>
    </el-dialog>

    <el-alert
      class="delete-tip"
      type="info"
      :closable="false"
      :title="texts.usedDeleteTip"
    />
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
  gap: 8px;
  align-items: center;
}

.issue-cell,
.time-cell,
.field-with-tip {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pagination {
  justify-content: flex-end;
  margin-top: 20px;
}

.delete-tip {
  margin-top: 16px;
}
</style>
