import { http } from "@/utils/http";

export interface PermissionQueryParams {
  pageNum?: number;
  pageSize?: number;
  permissionName?: string;
  permissionCode?: string;
  resourceType?: number;
}

export interface PermissionCreateData {
  permissionName: string;
  permissionCode: string;
  resourceType: number;
  path?: string;
  description?: string;
}

export interface PermissionUpdateData {
  permissionName: string;
  resourceType: number;
  path?: string;
  description?: string;
}

export interface PermissionInfo {
  id: number;
  permissionName: string;
  permissionCode: string;
  resourceType: number;
  path: string;
  description: string;
  createTime: string;
  updateTime: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export const permissionApi = {
  /**
   * Get all permissions (for dropdown).
   */
  getAllPermissions() {
    return http.request<any>("get", "/api/permissions/all");
  },

  /**
   * Get permission list with pagination.
   */
  getPermissionList(params: PermissionQueryParams) {
    return http.request<any>("get", "/api/permissions", { params });
  },

  /**
   * Get permission detail.
   */
  getPermissionDetail(id: number) {
    return http.request<any>("get", `/api/permissions/${id}`);
  },

  /**
   * Create permission.
   */
  createPermission(data: PermissionCreateData) {
    return http.request<any>("post", "/api/permissions", { data });
  },

  /**
   * Update permission.
   */
  updatePermission(id: number, data: PermissionUpdateData) {
    return http.request<any>("put", `/api/permissions/${id}`, { data });
  },

  /**
   * Delete permission.
   */
  deletePermission(id: number) {
    return http.request<any>("delete", `/api/permissions/${id}`);
  },

  /**
   * Batch delete permissions.
   */
  batchDeletePermissions(ids: number[]) {
    return http.request<any>("post", "/api/permissions/batch-delete", {
      data: ids
    });
  }
};
