const Layout = () => import("@/layout/index.vue");

export default {
  path: "/kkmall",
  name: "KKMall",
  component: Layout,
  redirect: "/kkmall/dashboard",
  meta: {
    icon: "ep:shopping-cart",
    title: "商城管理",
    rank: 10
  },
  children: [
    {
      path: "/kkmall/dashboard",
      name: "KKMallDashboard",
      component: () => import("@/views/kkmall/dashboard/index.vue"),
      meta: {
        title: "数据概览",
        icon: "ep:data-analysis"
      }
    },
    {
      path: "/kkmall/product",
      name: "Product",
      component: () => import("@/views/kkmall/product/index.vue"),
      meta: {
        title: "商品管理",
        icon: "ep:goods",
        showParent: true
      }
    },
    {
      path: "/kkmall/product/detail/:id?",
      name: "ProductDetail",
      component: () => import("@/views/kkmall/product/detail.vue"),
      meta: {
        title: "商品详情",
        showLink: false,
        activePath: "/kkmall/product"
      }
    },
    {
      path: "/kkmall/order",
      name: "Order",
      component: () => import("@/views/kkmall/order/index.vue"),
      meta: {
        title: "订单管理",
        icon: "ep:tickets",
        showParent: true
      }
    },
    {
      path: "/kkmall/order/detail/:id",
      name: "OrderDetail",
      component: () => import("@/views/kkmall/order/detail.vue"),
      meta: {
        title: "订单详情",
        showLink: false,
        activePath: "/kkmall/order"
      }
    },
    {
      path: "/kkmall/user",
      name: "User",
      component: () => import("@/views/kkmall/user/index.vue"),
      meta: {
        title: "用户管理",
        icon: "ep:user"
      }
    }
  ]
} satisfies RouteConfigsTable;