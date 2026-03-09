import { http } from "@/utils/http";

export type UserResult = {
  code: number;
  message: string;
  data: {
    /** JWT Token */
    token: string;
    /** 用户信息 */
    userInfo: {
      /** 用户ID */
      id: number;
      /** 头像 */
      avatar: string;
      /** 用户名 */
      username: string;
      /** 昵称 */
      nickname: string;
      /** 邮箱 */
      email: string;
      /** 手机号 */
      phone: string;
      /** 当前登录用户的角色 */
      roles: Array<string>;
      /** 按钮级别权限 */
      permissions: Array<string>;
    };
  };
};

export type RefreshTokenResult = {
  code: number;
  message: string;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type UserInfo = {
  /** 头像 */
  avatar: string;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickname: string;
  /** 邮箱 */
  email: string;
  /** 联系电话 */
  phone: string;
  /** 简介 */
  description: string;
};

export type UserInfoResult = {
  code: number;
  message: string;
  data: UserInfo;
};

type ResultTable = {
  code: number;
  message: string;
  data?: {
    /** 列表数据 */
    list: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    pageSize?: number;
    /** 当前页数 */
    currentPage?: number;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/api/auth/login", { data });
};

/** 刷新`token` */
export const refreshTokenApi = () => {
  return http.request<RefreshTokenResult>("post", "/api/auth/refresh", {});
};

/** 获取当前用户信息 */
export const getCurrentUserInfo = () => {
  return http.request<UserInfoResult>("get", "/api/auth/info", {});
};

/** 登出 */
export const logoutApi = () => {
  return http.request("post", "/api/auth/logout", {});
};

/** 账户设置-个人信息 */
export const getMine = (data?: object) => {
  return http.request<UserInfoResult>("get", "/mine", { data });
};

/** 账户设置-个人安全日志 */
export const getMineLogs = (data?: object) => {
  return http.request<ResultTable>("get", "/mine-logs", { data });
};
