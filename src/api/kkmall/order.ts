import { http } from "@/utils/http";

/**
 * 订单查询参数
 */
export interface OrderQueryParams {
  pageNum?: number;
  pageSize?: number;
  orderNo?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
  keyword?: string;
}

/**
 * 订单项
 */
export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  productCode: string;
  productImage: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

/**
 * 订单信息
 */
export interface Order {
  id?: number;
  orderNo: string;
  userId: number;
  username?: string;
  totalAmount: number;
  payAmount: number;
  status: number;
  paymentMethod?: string;
  paymentTime?: string;
  deliveryTime?: string;
  finishTime?: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  remark?: string;
  items?: OrderItem[];
  createTime?: string;
  updateTime?: string;
}

/**
 * 分页响应
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 获取订单列表
 */
export const getOrderList = (params: OrderQueryParams) => {
  return http.request<PageResult<Order>>("get", "/api/orders", {
    params
  });
};

/**
 * 获取订单详情
 */
export const getOrderDetail = (id: number) => {
  return http.request<Order>("get", `/api/orders/${id}`);
};

/**
 * 获取订单详情（通过订单号）
 */
export const getOrderByNo = (orderNo: string) => {
  return http.request<Order>("get", `/api/orders/no/${orderNo}`);
};

/**
 * 发货
 */
export const deliverOrder = (
  id: number,
  data: { expressCompany: string; expressNo: string }
) => {
  return http.request<void>("put", `/api/orders/${id}/deliver`, { data });
};

/**
 * 取消订单
 */
export const cancelOrder = (id: number, reason?: string) => {
  return http.request<void>("put", `/api/orders/${id}/cancel`, {
    data: { reason }
  });
};

/**
 * 完成订单
 */
export const completeOrder = (id: number) => {
  return http.request<void>("put", `/api/orders/${id}/complete`);
};

/**
 * 导出订单
 */
export const exportOrders = (params: OrderQueryParams) => {
  return http.request<Blob>("get", "/api/orders/export", {
    params,
    responseType: "blob"
  });
};

/**
 * 获取订单统计
 */
export const getOrderStatistics = (params?: {
  startTime?: string;
  endTime?: string;
}) => {
  return http.request<any>("get", "/api/orders/statistics", { params });
};