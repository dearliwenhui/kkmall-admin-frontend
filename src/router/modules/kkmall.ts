const Layout = () => import("@/layout/index.vue");

export default {
  path: "/kkmall",
  name: "KKMall",
  component: Layout,
  redirect: "/kkmall/dashboard",
  meta: {
    icon: "ep:shopping-cart",
    title: "\u5546\u57CE\u7BA1\u7406",
    rank: 10
  },
  children: [
    {
      path: "/kkmall/dashboard",
      name: "KKMallDashboard",
      component: () => import("@/views/kkmall/dashboard/index.vue"),
      meta: {
        title: "\u8FD0\u8425\u6982\u89C8",
        icon: "ep:data-analysis"
      }
    },
    {
      path: "/kkmall/product",
      name: "Product",
      component: () => import("@/views/kkmall/product/index.vue"),
      meta: {
        title: "\u5546\u54C1\u7BA1\u7406",
        icon: "ep:goods",
        showParent: true
      }
    },
    {
      path: "/kkmall/product/detail/:id?",
      name: "ProductDetail",
      component: () => import("@/views/kkmall/product/detail.vue"),
      meta: {
        title: "\u5546\u54C1\u8BE6\u60C5",
        showLink: false,
        activePath: "/kkmall/product"
      }
    },
    {
      path: "/kkmall/category",
      name: "Category",
      component: () => import("@/views/kkmall/category/index.vue"),
      meta: {
        title: "\u5206\u7C7B\u7BA1\u7406",
        icon: "ep:menu",
        showParent: true,
        auths: [
          "category:manage",
          "category:add",
          "category:edit",
          "category:delete"
        ]
      }
    },
    {
      path: "/kkmall/coupon",
      name: "Coupon",
      component: () => import("@/views/kkmall/coupon/index.vue"),
      meta: {
        title: "\u4f18\u60e0\u5238\u7ba1\u7406",
        icon: "ep:discount",
        showParent: true,
        auths: ["coupon:manage", "coupon:add", "coupon:edit", "coupon:delete"]
      }
    },
    {
      path: "/kkmall/order",
      name: "Order",
      component: () => import("@/views/kkmall/order/index.vue"),
      meta: {
        title: "\u8BA2\u5355\u7BA1\u7406",
        icon: "ep:tickets",
        showParent: true,
        auths: ["order:manage", "order:deliver"]
      }
    },
    {
      path: "/kkmall/refund",
      name: "Refund",
      component: () => import("@/views/kkmall/refund-panel.vue"),
      meta: {
        title: "\u9000\u6B3E\u552E\u540E",
        icon: "ep:refresh-left",
        showParent: true,
        auths: ["order:manage"]
      }
    },
    {
      path: "/kkmall/order/detail/:id",
      name: "OrderDetail",
      component: () => import("@/views/kkmall/order/detail.vue"),
      meta: {
        title: "\u8BA2\u5355\u8BE6\u60C5",
        showLink: false,
        activePath: "/kkmall/order"
      }
    },
    {
      path: "/kkmall/user",
      name: "User",
      component: () => import("@/views/kkmall/user/index.vue"),
      meta: {
        title: "\u7528\u6237\u7BA1\u7406",
        icon: "ep:user",
        auths: ["user:manage", "user:add", "user:edit", "user:delete"]
      }
    },
    {
      path: "/kkmall/role",
      name: "Role",
      component: () => import("@/views/kkmall/role/index.vue"),
      meta: {
        title: "\u89D2\u8272\u7BA1\u7406",
        icon: "ep:avatar",
        auths: ["role:manage", "role:add", "role:edit", "role:delete"]
      }
    },
    {
      path: "/kkmall/permission",
      name: "Permission",
      component: () => import("@/views/kkmall/permission/index.vue"),
      meta: {
        title: "\u6743\u9650\u7BA1\u7406",
        icon: "ep:key",
        auths: [
          "permission:manage",
          "permission:add",
          "permission:edit",
          "permission:delete"
        ]
      }
    }
  ]
} satisfies RouteConfigsTable;
