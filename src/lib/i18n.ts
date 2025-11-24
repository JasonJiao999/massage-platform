// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav.login": "Login",
      "nav.register": "Register",
      "nav.logout": "Logout",
      "nav.adminDashboard": "Admin Dashboard",
      "nav.shopDashboard": "Shop Dashboard",
      "nav.workerDashboard": "Worker Dashboard",
      "nav.profile": "Profile",
    }
  },
  th: {
    translation: {
      "nav.login": "เข้าสู่ระบบ",
      "nav.register": "สมัครสมาชิก",
      "nav.logout": "ออกจากระบบ",
      "nav.adminDashboard": "แผงควบคุมผู้ดูแล",
      "nav.shopDashboard": "แดชบอร์ดร้านค้า",
      "nav.workerDashboard": "แดชบอร์ดพนักงาน",
      "nav.profile": "โปรไฟล์",
    }
  },
  'zh-TW': {
    translation: {
      "nav.login": "登入",
      "nav.register": "註冊",
      "nav.logout": "登出",
      "nav.adminDashboard": "管理員儀表板",
      "nav.shopDashboard": "商店儀表板",
      "nav.workerDashboard": "員工儀表板",
      "nav.profile": "個人資料",
    }
  }
};

// 确保只在客户端初始化
if (typeof window !== 'undefined') {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: navigator.language,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: false
      }
    });
}

export default i18n;