import { http } from "@/utils/http";

/**
 * 用户查询参数
 */
export interface UserQueryParams {
  pageNum?: number;
  pageSize?: number;
  username?: string;
  phone?: string;
  email?: string;
  status?: number;
}

/**
 * 用户信息
 */
export interface User {
  id?: number;
  username: string;
  phone?: string;
  email?: string;
  avatar?: string;
  nickname?: string;
  gender?: number;
  birthday?: string;
  status: number;
  registerIp?: string;
  lastLoginTime?: string;
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
 * 获取用户列表
 */
export const getUserList = (params: UserQueryParams) => {
  return http.request<PageResult<User>>("get", "/api/users", {
    params
  });
};

/**
 * 获取用户详情
 */
export const getUserDetail = (id: number) => {
  return http.request<User>("get", `/api/users/${id}`);
};

/**
 * 创建用户
 */
export const createUser = (data: User) => {
  return http.request<User>("post", "/api/users", { data });
};

/**
 * 更新用户
 */
export const updateUser = (id: number, data: Partial<User>) => {
  return http.request<User>("put", `/api/users/${id}`, { data });
};

/**
 * 删除用户
 */
export const deleteUser = (id: number) => {
  return http.request<void>("delete", `/api/users/${id}`);
};

/**
 * 启用/禁用用户
 */
export const updateUserStatus = (id: number, status: number) => {
  return http.request<void>("put", `/api/users/${id}/status`, {
    data: { status }
  });
};

/**
 * 重置用户密码
 */
export const resetUserPassword = (id: number, newPassword: string) => {
  return http.request<void>("put", `/api/users/${id}/password`, {
    data: { password: newPassword }
  });
};