import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/login',
            name: 'Login',
            component: () =>
                import ("@/views/Login.vue")
        },
        {
            path: '/',
            name: 'Framework',
            component: () =>
                import ("@/views/Framework.vue"),
            children: [{
                    path: '/',
                    redirect: "/main/all"
                },
                {
                    path: '/main/:category',
                    name: '首页',
                    meta: {
                        needLogin: true,
                        menuCode: "main"
                    },
                    component: () =>
                        import ("@/views/main/Main.vue")
                },
                {
                    path: '/myshare',
                    name: '我的分享',
                    meta: {
                        needLogin: true,
                        menuCode: "share"
                    },
                    component: () =>
                        import ("@/views/share/Share.vue")
                },
                {
                    path: '/recycle',
                    name: '回收站',
                    meta: {
                        needLogin: true,
                        menuCode: "recycle"
                    },
                    component: () =>
                        import ("@/views/recycle/Recycle.vue")
                },
                {
                    path: '/settings/sysSetting',
                    name: '系统设置',
                    meta: {
                        needLogin: true,
                        menuCode: "settings"
                    },
                    component: () =>
                        import ("@/views/admin/SysSettings.vue")
                },
                {
                    path: '/settings/userList',
                    name: '用户管理',
                    meta: {
                        needLogin: true,
                        menuCode: "settings"
                    },
                    component: () =>
                        import ("@/views/admin/UserList.vue")
                },
                {
                    path: '/settings/fileList',
                    name: '用户文件',
                    meta: {
                        needLogin: true,
                        menuCode: "settings"
                    },
                    component: () =>
                        import ("@/views/admin/FileList.vue")
                },
            ]
        },
        {
            path: '/shareCheck/:shareId',
            name: '分享校验',
            component: () =>
                import ("@/views/webshare/ShareCheck.vue")
        },
        {
            path: '/share/:shareId',
            name: '分享',
            component: () =>
                import ("@/views/webshare/Share.vue")
        },
    ]
})

export default router