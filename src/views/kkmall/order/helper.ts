import type { TagProps } from "element-plus";

type CustomerInfo = {
  nickname?: string;
  username?: string;
  userId: number;
};

export const orderStatusOptions = [
  { label: "\u5F85\u4ED8\u6B3E", value: 0 },
  { label: "\u5F85\u53D1\u8D27", value: 1 },
  { label: "\u5F85\u6536\u8D27", value: 2 },
  { label: "\u5DF2\u5B8C\u6210", value: 3 },
  { label: "\u5DF2\u53D6\u6D88", value: 4 }
];

export const getOrderStatusLabel = (status?: number) => {
  const item = orderStatusOptions.find(option => option.value === status);
  return item?.label ?? "\u672A\u77E5";
};

export const getOrderStatusTagType = (status?: number): TagProps["type"] => {
  switch (status) {
    case 0:
      return "warning";
    case 1:
      return "primary";
    case 2:
      return "success";
    case 3:
      return "success";
    case 4:
      return "info";
    default:
      return "info";
  }
};

export const formatCurrency = (amount?: number) => {
  return `\u00A5${Number(amount || 0).toFixed(2)}`;
};

export const getOrderCustomerName = (record: CustomerInfo) => {
  return record.nickname || record.username || `\u7528\u6237 #${record.userId}`;
};
