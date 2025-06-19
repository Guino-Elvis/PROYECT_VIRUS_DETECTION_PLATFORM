export const API_ENDPOINTS = {
    BASE_URL: 'http://localhost:8000',

    get AUTH_LOGIN() {
        return `${this.BASE_URL}/api/auth/login`;
    },
    get AUTH_REGISTER() {
        return `${this.BASE_URL}/api/auth/register`;
    },
    get AUTH_LOGOUT() {
        return `${this.BASE_URL}/api/admin/auth/logout`;
    },

    get AUTH_USER() {
        return `${this.BASE_URL}/api/admin/auth/user`;
    },

    get AUTH_REFRESH_TOKEN() {
        return `${this.BASE_URL}/api/admin/auth/refresh`;
    },


    get ADMINISTRATION_USERS() {
        return `${this.BASE_URL}/api/admin/administration_user`;
    },

    get COMPANIES() {
        return `${this.BASE_URL}/api/admin/companies`;
    },
    get DELIVERED_FOODS() {
        return `${this.BASE_URL}/api/admin/delivered_foods`;
    },


    get ROLES() {
        return `${this.BASE_URL}/api/admin/role`;
    },

    get PROJECTS() {
        return `${this.BASE_URL}/api/admin/projects`;
    },

    get MENU_LINKS() {
        return `${this.BASE_URL}/api/admin/data/menu`;
    },


};