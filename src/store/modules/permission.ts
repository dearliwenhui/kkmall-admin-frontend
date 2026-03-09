import { defineStore } from "pinia";
import {
  type cacheType,
  store,
  ascending,
  getConfig,
  getKeyList,
  filterTree,
  constantMenus,
  filterNoPermissionTree,
  formatFlatteningRoutes
} from "../utils";
import { useMultiTagsStoreHook } from "./multiTags";

const DEFAULT_MENU_ROOT_WHITELIST = ["/kkmall"];

function getMenuRootWhitelist(): string[] {
  const configuredWhitelist = getConfig()?.MenuRootWhitelist;
  if (Array.isArray(configuredWhitelist) && configuredWhitelist.length > 0) {
    return configuredWhitelist.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0
    );
  }
  return DEFAULT_MENU_ROOT_WHITELIST;
}

function filterMenuByRoot(menus: any[], whitelist: string[]) {
  if (!Array.isArray(menus) || menus.length === 0) return [];
  return menus.filter(menu => {
    const menuPath = String(menu?.path ?? "");
    return whitelist.some(prefix => menuPath === prefix);
  });
}

export const usePermissionStore = defineStore("pure-permission", {
  state: () => ({
    // 静态路由生成的菜单
    constantMenus,
    // 整体路由生成的菜单（静态、动态）
    wholeMenus: [],
    // 整体路由（一维数组格式）
    flatteningRoutes: [],
    // 缓存页面keepAlive
    cachePageList: []
  }),
  actions: {
    /** 组装整体路由生成的菜单 */
    handleWholeMenus(routes: any[]) {
      const allMenus = this.constantMenus.concat(routes);
      const scopedMenus = filterMenuByRoot(allMenus, getMenuRootWhitelist());
      this.wholeMenus = filterNoPermissionTree(filterTree(ascending(scopedMenus)));
      this.flatteningRoutes = formatFlatteningRoutes(allMenus as any);
    },
    /** 监听缓存页面是否存在于标签页，不存在则删除 */
    clearCache() {
      let cacheLength = this.cachePageList.length;
      const nameList = getKeyList(useMultiTagsStoreHook().multiTags, "name");
      while (cacheLength > 0) {
        nameList.findIndex(v => v === this.cachePageList[cacheLength - 1]) ===
          -1 &&
          this.cachePageList.splice(
            this.cachePageList.indexOf(this.cachePageList[cacheLength - 1]),
            1
          );
        cacheLength--;
      }
    },
    cacheOperate({ mode, name }: cacheType) {
      const delIndex = this.cachePageList.findIndex(v => v === name);
      switch (mode) {
        case "refresh":
          this.cachePageList = this.cachePageList.filter(v => v !== name);
          this.clearCache();
          break;
        case "add":
          this.cachePageList.push(name);
          break;
        case "delete":
          delIndex !== -1 && this.cachePageList.splice(delIndex, 1);
          this.clearCache();
          break;
      }
    },
    /** 清空缓存页面 */
    clearAllCachePage() {
      this.wholeMenus = [];
      this.cachePageList = [];
    }
  }
});

export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
