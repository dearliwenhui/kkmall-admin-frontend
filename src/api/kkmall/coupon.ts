import { http } from "@/utils/http";

interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

const unwrap = <T>(promise: Promise<ApiResult<T>>): Promise<T> => {
  return promise.then(res => res.data);
};

export interface CouponQueryParams {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  type?: number;
  status?: number;
}

export interface Coupon {
  id?: number;
  name: string;
  type: number;
  discountAmount?: number | null;
  discountRate?: number | null;
  minAmount: number;
  totalCount: number;
  receivedCount?: number;
  remainingCount?: number;
  validDays: number;
  startTime: string;
  endTime: string;
  status: number;
  typeName?: string;
  statusName?: string;
  createTime?: string;
  updateTime?: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export const getCouponList = (params: CouponQueryParams) => {
  return unwrap(
    http.request<ApiResult<PageResult<Coupon>>>("get", "/api/coupons", {
      params
    })
  );
};

export const getCouponDetail = (id: number) => {
  return unwrap(http.request<ApiResult<Coupon>>("get", `/api/coupons/${id}`));
};

export const createCoupon = (data: Coupon) => {
  return unwrap(
    http.request<ApiResult<Coupon>>("post", "/api/coupons", { data })
  );
};

export const updateCoupon = (id: number, data: Coupon) => {
  return unwrap(
    http.request<ApiResult<Coupon>>("put", `/api/coupons/${id}`, { data })
  );
};

export const deleteCoupon = (id: number) => {
  return http
    .request<ApiResult<void>>("delete", `/api/coupons/${id}`)
    .then(() => undefined);
};

export const batchDeleteCoupons = (ids: number[]) => {
  return http
    .request<ApiResult<void>>("post", "/api/coupons/batch-delete", {
      data: { ids }
    })
    .then(() => undefined);
};

export const enableCoupon = (id: number) => {
  return http
    .request<ApiResult<void>>("put", `/api/coupons/${id}/enable`)
    .then(() => undefined);
};

export const disableCoupon = (id: number) => {
  return http
    .request<ApiResult<void>>("put", `/api/coupons/${id}/disable`)
    .then(() => undefined);
};
