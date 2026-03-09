import { http } from "@/utils/http";

interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

const unwrap = <T>(promise: Promise<ApiResult<T>>): Promise<T> => {
  return promise.then(res => res.data);
};

/**
 * Product list query params.
 */
export interface ProductQueryParams {
  pageNum?: number;
  pageSize?: number;
  productName?: string;
  categoryId?: number;
  status?: number;
}

/**
 * Product model.
 */
export interface Product {
  id?: number;
  productName: string;
  productCode: string;
  categoryId: number;
  price: number;
  stock: number;
  description?: string;
  status: number;
  images?: string[];
  createTime?: string;
  updateTime?: string;
}

/**
 * Pagination payload.
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * Fetch product list.
 */
export const getProductList = (params: ProductQueryParams) => {
  return unwrap(
    http.request<ApiResult<PageResult<Product>>>("get", "/api/products", {
      params
    })
  );
};

/**
 * Fetch product detail.
 */
export const getProductDetail = (id: number) => {
  return unwrap(
    http.request<ApiResult<Product>>("get", `/api/products/${id}`)
  );
};

/**
 * Create product.
 */
export const createProduct = (data: Product) => {
  return unwrap(
    http.request<ApiResult<Product>>("post", "/api/products", { data })
  );
};

/**
 * Update product.
 */
export const updateProduct = (id: number, data: Product) => {
  return unwrap(
    http.request<ApiResult<Product>>("put", `/api/products/${id}`, { data })
  );
};

/**
 * Delete product.
 */
export const deleteProduct = (id: number) => {
  return http
    .request<ApiResult<void>>("delete", `/api/products/${id}`)
    .then(() => undefined);
};

/**
 * Batch delete products.
 */
export const batchDeleteProducts = (ids: number[]) => {
  return http
    .request<ApiResult<void>>("post", "/api/products/batch-delete", {
      data: { ids }
    })
    .then(() => undefined);
};

/**
 * Put on sale.
 */
export const putOnSale = (id: number) => {
  return http
    .request<ApiResult<void>>("put", `/api/products/${id}/on-sale`)
    .then(() => undefined);
};

/**
 * Put off sale.
 */
export const putOffSale = (id: number) => {
  return http
    .request<ApiResult<void>>("put", `/api/products/${id}/off-sale`)
    .then(() => undefined);
};

/**
 * Update stock.
 */
export const updateStock = (id: number, stock: number) => {
  return http
    .request<ApiResult<void>>("put", `/api/products/${id}/stock`, {
      data: { stock }
    })
    .then(() => undefined);
};
