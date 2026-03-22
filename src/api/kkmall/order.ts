import { http } from "@/utils/http";

interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

const unwrap = <T>(promise: Promise<ApiResult<T>>): Promise<T> => {
  return promise.then(res => res.data);
};

export interface OrderQueryParams {
  pageNum?: number;
  pageSize?: number;
  orderNo?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
  keyword?: string;
}

export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  totalAmount: number;
}

export interface Order {
  id?: number;
  orderNo: string;
  userId: number;
  username?: string;
  nickname?: string;
  totalAmount: number;
  payAmount?: number;
  status: number;
  statusText?: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  logisticsCompany?: string;
  trackingNumber?: string;
  remark?: string;
  itemCount?: number;
  items?: OrderItem[];
  payTime?: string;
  shipTime?: string;
  confirmTime?: string;
  createTime?: string;
  updateTime?: string;
}

export interface OrderStatistics {
  totalOrders: number;
  pendingPaymentOrders: number;
  pendingShipmentOrders: number;
  pendingReceiptOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  totalSales: number;
  todaySales: number;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export const getOrderList = (params: OrderQueryParams) => {
  return unwrap(
    http.request<ApiResult<PageResult<Order>>>("get", "/api/orders", {
      params
    })
  );
};

export const getOrderDetail = (id: number) => {
  return unwrap(http.request<ApiResult<Order>>("get", `/api/orders/${id}`));
};

export const getOrderByNo = (orderNo: string) => {
  return unwrap(
    http.request<ApiResult<Order>>("get", `/api/orders/no/${orderNo}`)
  );
};

export const deliverOrder = (
  id: number,
  data: { expressCompany: string; expressNo: string }
) => {
  return http
    .request<ApiResult<void>>("put", `/api/orders/${id}/deliver`, { data })
    .then(() => undefined);
};

export const cancelOrder = (id: number, reason?: string) => {
  return http
    .request<ApiResult<void>>("put", `/api/orders/${id}/cancel`, {
      data: { reason }
    })
    .then(() => undefined);
};

export const completeOrder = (id: number) => {
  return http
    .request<ApiResult<void>>("put", `/api/orders/${id}/complete`)
    .then(() => undefined);
};

export const exportOrders = (params: OrderQueryParams) => {
  return http.request<Blob>("get", "/api/orders/export", {
    params,
    responseType: "blob"
  });
};

export const getOrderStatistics = (params?: {
  startTime?: string;
  endTime?: string;
}) => {
  return unwrap(
    http.request<ApiResult<OrderStatistics>>("get", "/api/orders/statistics", {
      params
    })
  );
};
