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
 * Category list query params.
 */
export interface CategoryQueryParams {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  parentId?: number;
  level?: number;
}

/**
 * Category model.
 */
export interface Category {
  id?: number;
  name: string;
  parentId: number;
  level: number;
  sort?: number;
  icon?: string;
  createTime?: string;
  updateTime?: string;
  children?: Category[];
}

/**
 * Category tree node for cascader.
 */
export interface CategoryTreeNode {
  value: number;
  label: string;
  level: number;
  children?: CategoryTreeNode[];
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
 * Fetch category list.
 */
export const getCategoryList = (params: CategoryQueryParams) => {
  return unwrap(
    http.request<ApiResult<PageResult<Category>>>("get", "/api/categories", {
      params
    })
  );
};

/**
 * Fetch category tree.
 */
export const getCategoryTree = () => {
  return unwrap(
    http.request<ApiResult<Category[]>>("get", "/api/categories/tree")
  );
};

/**
 * Fetch category tree nodes for cascader.
 */
export const getCategoryTreeNodes = () => {
  return unwrap(
    http.request<ApiResult<CategoryTreeNode[]>>(
      "get",
      "/api/categories/tree-nodes"
    )
  );
};

/**
 * Fetch category detail.
 */
export const getCategoryDetail = (id: number) => {
  return unwrap(
    http.request<ApiResult<Category>>("get", `/api/categories/${id}`)
  );
};

/**
 * Create category.
 */
export const createCategory = (data: Category) => {
  return unwrap(
    http.request<ApiResult<Category>>("post", "/api/categories", { data })
  );
};

/**
 * Update category.
 */
export const updateCategory = (id: number, data: Category) => {
  return unwrap(
    http.request<ApiResult<Category>>("put", `/api/categories/${id}`, { data })
  );
};

/**
 * Delete category.
 */
export const deleteCategory = (id: number) => {
  return http
    .request<ApiResult<void>>("delete", `/api/categories/${id}`)
    .then(() => undefined);
};

/**
 * Batch delete categories.
 */
export const batchDeleteCategories = (ids: number[]) => {
  return http
    .request<ApiResult<void>>("post", "/api/categories/batch-delete", {
      data: { ids }
    })
    .then(() => undefined);
};

/**
 * Update category sort.
 */
export const updateCategorySort = (id: number, sort: number) => {
  return http
    .request<ApiResult<void>>("put", `/api/categories/${id}/sort`, {
      data: { sort }
    })
    .then(() => undefined);
};
