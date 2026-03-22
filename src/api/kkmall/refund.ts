import { http } from "@/utils/http";

interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

const unwrap = <T>(promise: Promise<ApiResult<T>>): Promise<T> => {
  return promise.then(res => res.data);
};

export interface RefundQueryParams {
  pageNum?: number;
  pageSize?: number;
  refundNo?: string;
  orderNo?: string;
  status?: number;
  refundType?: number;
  keyword?: string;
}

export interface Refund {
  id: number;
  refundNo: string;
  orderId: number;
  orderNo: string;
  userId: number;
  username?: string;
  nickname?: string;
  refundAmount: number;
  refundType: number;
  refundTypeText?: string;
  reason?: string;
  description?: string;
  images?: string[];
  status: number;
  statusText?: string;
  rejectReason?: string;
  auditLogs?: RefundAuditLog[];
  refundTime?: string;
  createTime?: string;
  updateTime?: string;
}

export interface RefundAuditLog {
  id: number;
  actionCode: string;
  actionText?: string;
  operatorType?: string;
  operatorTypeText?: string;
  operatorId?: number;
  operatorName?: string;
  operatorDisplayName?: string;
  remark?: string;
  createTime?: string;
}

export interface RefundAuditRequest {
  approved: boolean;
  rejectReason?: string;
}

export interface RefundStatistics {
  totalRefunds: number;
  pendingRefunds: number;
  rejectedRefunds: number;
  refundedCount: number;
  totalRefundAmount: number;
  refundedAmount: number;
  pendingAmount: number;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export const getRefundList = (params: RefundQueryParams) => {
  return unwrap(
    http.request<ApiResult<PageResult<Refund>>>("get", "/api/refunds", {
      params
    })
  );
};

export const getRefundDetail = (id: number) => {
  return unwrap(http.request<ApiResult<Refund>>("get", `/api/refunds/${id}`));
};

export const auditRefund = (id: number, data: RefundAuditRequest) => {
  return http
    .request<ApiResult<void>>("put", `/api/refunds/${id}/audit`, { data })
    .then(() => undefined);
};

export const getRefundStatistics = () => {
  return unwrap(
    http.request<ApiResult<RefundStatistics>>("get", "/api/refunds/statistics")
  );
};
