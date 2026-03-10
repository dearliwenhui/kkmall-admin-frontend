import { http } from "@/utils/http";

export interface RoleQueryParams {
  pageNum?: number;
  pageSize?: number;
  roleName?: string;
  roleCode?: string;
}

export interface RoleCreateData {
  roleName: string;
  roleCode: string;
  description?: string;
  permissionIds?: number[];
}

export interface RoleUpdateData {
  roleName: string;
  description?: string;
  permissionIds?: number[];
}

export interface PermissionInfo {
  id: number;
  permissionName: string;
  permissionCode: string;
  resourceType: number;
  path: string;
}

export interface RoleInfo {
  id: number;
  roleName: string;
  roleCode: string;
  description: string;
  createTime: string;
  updateTime: string;
  permissions: PermissionInfo[];
}

export interface PageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export const roleApi = {
  /**
   * Get all roles (for dropdown).
   */
  getAllRoles() {
    return http.request<any>("get", "/api/roles/all");
  },

  /**
   * Get role list with pagination.
   */
  getRoleList(params: RoleQueryParams) {
    return http.request<any>("get", "/api/roles", { params });
  },

  /**
   * Get role detail.
   */
  getRoleDetail(id: number) {
    return http.request<any>("get", `/api/roles/${id}`);
  },

  /**
   * Create role.
   */
  createRole(data: RoleCreateData) {
    return http.request<any>("post", "/api/roles", { data });
  },

  /**
   * Update role.
   */
  updateRole(id: number, data: RoleUpdateData) {
    return http.request<any>("put", `/api/roles/${id}`, { data });
  },

  /**
   * Delete role.
   */
  deleteRole(id: number) {
    return http.request<any>("delete", `/api/roles/${id}`);
  },

  /**
   * Batch delete roles.
   */
  batchDeleteRoles(ids: number[]) {
    return http.request<any>("post", "/api/roles/batch-delete", { data: ids });
  },

  /**
   * Assign permissions to role.
   */
  assignPermissions(id: number, permissionIds: number[]) {
    return http.request<any>("put", `/api/roles/${id}/permissions`, {
      data: { permissionIds }
    });
  }
};
