import Cookies from "js-cookie";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal, isString, isIncludeAllChildren } from "@pureadmin/utils";

export interface DataInfo<T> {
  accessToken: string;
  expires: T;
  refreshToken: string;
  avatar?: string;
  username?: string;
  nickname?: string;
  roles?: Array<string>;
  permissions?: Array<string>;
}

export const userKey = "user-info";
export const TokenKey = "authorized-token";
export const multipleTabsKey = "multiple-tabs";

export function getToken(): DataInfo<number> {
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey) as string)
    : storageLocal().getItem(userKey);
}

export function setToken(data: DataInfo<Date | number>) {
  let expires = 0;
  const { accessToken, refreshToken } = data;
  const { isRemembered, loginDay } = useUserStoreHook();
  expires =
    typeof data.expires === "number"
      ? data.expires
      : new Date(data.expires).getTime();

  const cookieString = JSON.stringify({ accessToken, expires, refreshToken });

  if (expires > 0) {
    Cookies.set(TokenKey, cookieString, {
      expires: (expires - Date.now()) / 86400000
    });
  } else {
    Cookies.set(TokenKey, cookieString);
  }

  Cookies.set(
    multipleTabsKey,
    "true",
    isRemembered
      ? {
          expires: loginDay
        }
      : {}
  );

  function setUserKey({
    avatar,
    username,
    nickname,
    roles,
    permissions
  }: Partial<DataInfo<number>>) {
    useUserStoreHook().SET_AVATAR(avatar ?? "");
    useUserStoreHook().SET_USERNAME(username ?? "");
    useUserStoreHook().SET_NICKNAME(nickname ?? "");
    useUserStoreHook().SET_ROLES(roles ?? []);
    useUserStoreHook().SET_PERMS(permissions ?? []);
    storageLocal().setItem(userKey, {
      refreshToken,
      expires,
      avatar,
      username,
      nickname,
      roles,
      permissions
    });
  }

  if (data.username && data.roles) {
    const { username, roles } = data;
    setUserKey({
      avatar: data.avatar ?? "",
      username,
      nickname: data.nickname ?? "",
      roles,
      permissions: data.permissions ?? []
    });
  } else {
    const currentUser = storageLocal().getItem<DataInfo<number>>(userKey);
    setUserKey({
      avatar: currentUser?.avatar ?? "",
      username: currentUser?.username ?? "",
      nickname: currentUser?.nickname ?? "",
      roles: currentUser?.roles ?? [],
      permissions: currentUser?.permissions ?? []
    });
  }
}

export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(multipleTabsKey);
  storageLocal().removeItem(userKey);
}

export const formatToken = (token: string): string => {
  return `Bearer ${token}`;
};

export const hasPerms = (value: string | Array<string>): boolean => {
  if (!value) return false;
  const allPerms = "*:*:*";
  const { permissions } = useUserStoreHook();
  if (!permissions) return false;
  if (permissions.length === 1 && permissions[0] === allPerms) return true;
  return isString(value)
    ? permissions.includes(value)
    : isIncludeAllChildren(value, permissions);
};
