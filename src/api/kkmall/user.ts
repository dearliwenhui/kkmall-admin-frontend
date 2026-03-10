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
 * User query params.
 */
export interface UserQueryParams {
  pageNum?: number;
  pageSize?: number;
  username?: string;
  nickname?: string;
  status?: number;
}

/**
 * User create data.
 */
export interface UserCreateData {
  username: string;
  password: string;
  nickname: string;
  email?: string;
  phone?: string;
  status: number;
  roleIds?: number[];
}

/**
 * User update data.
 */
export interface UserUpdateData {
  nickname: string;
  email?: string;
  phone?: string;
  status: number;
  roleIds?: number[];
}

/**
 * Role info.
 */
export interface RoleInfo {
  id: number;
  roleName: string;
  roleCode: string;
}

/**
 * User info.
 */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  email?: string;
  phone?: string;
  status: number;
  createTime: string;
  updateTime: string;
  roles: RoleInfo[];
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
 * Fetch user list.
 */
export const getUserList = (params: UserQueryParams) => {
  return unwrap(
    http.request<ApiResult<PageResult<UserInfo>>>("get", "/api/users", {
      params
    })
  );
};

/**
 * Fetch user detail.
 */
export const getUserDetail = (id: number) => {
  return unwrap(
    http.request<ApiResult<UserInfo>>("get", `/api/users/${id}`)
  );
};

/**
 * Create user.
 */
export const createUser = (data: UserCreateData) => {
  return unwrap(
    http.request<ApiResult<UserInfo>>("post", "/api/users", { data })
  );
};

/**
 * Update user.
 */
export const updateUser = (id: number, data: UserUpdateData) => {
  return unwrap(
    http.request<ApiResult<UserInfo>>("put", `/api/users/${id}`, { data })
  );
};

/**
 * Delete user.
 */
export const deleteUser = (id: number) => {
  return http
    .request<ApiResult<void>>("delete", `/api/users/${id}`)
    .then(() => undefined);
};

/**
 * Batch delete users.
 */
export const batchDeleteUsers = (ids: number[]) => {
  return http
    .request<ApiResult<void>>("post", "/api/users/batch-delete", {
      data: { ids }
    })
    .then(() => undefined);
};

/**
 * Enable user.
 */
export const enableUser = (id: number) => {
  return http
    .request<ApiResult<void>>("put", `/api/users/${id}/enable`)
    .then(() => undefined);
};

/**
 * Disable user.
 */
export const disableUser = (id: number) => {
  return http
    .request<ApiResult<void>>("put", `/api/users/${id}/disable`)
    .then(() => undefined);
};

/**
 * Reset user password.
 */
export const resetPassword = (id: number, newPassword: string) => {
  return http
    .request<ApiResult<void>>("put", `/api/users/${id}/reset-password`, {
      data: { newPassword }
    })
    .then(() => undefined);
};

/**
 * Assign roles to user.
 */
export const assignRoles = (id: number, roleIds: number[]) => {
  return http
    .request<ApiResult<void>>("put", `/api/users/${id}/roles`, {
      data: { roleIds }
    })
    .then(() => undefined);
};

/**
 * Get all roles for selection.
 */
export const getAllRoles = () => {
  return unwrap(
    http.request<ApiResult<RoleInfo[]>>("get", "/api/roles")
  );
};