import { Injectable } from '@angular/core';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'ar';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly STORAGE_KEY = 'investpro_language';
  private currentLanguage: SupportedLanguage = 'en';

  private readonly translations: Record<SupportedLanguage, Record<string, string>> = {
    en: {
      dashboard: 'Dashboard',
      investments: 'Investments',
      wallet: 'Wallet',
      deposit: 'Deposit',
      withdraw: 'Withdraw',
      profile: 'Profile',
      settings: 'Settings',
      notifications: 'Notifications',
      security: 'Security',
      referrals: 'Referrals',
      activity: 'Activity',
      plans: 'Plans'
    },
    es: {
      dashboard: 'Panel',
      investments: 'Inversiones',
      wallet: 'Billetera',
      deposit: 'Depositar',
      withdraw: 'Retirar',
      profile: 'Perfil',
      settings: 'Configuración',
      notifications: 'Notificaciones',
      security: 'Seguridad',
      referrals: 'Referidos',
      activity: 'Actividad',
      plans: 'Planes'
    },
    fr: {
      dashboard: 'Tableau de bord',
      investments: 'Investissements',
      wallet: 'Portefeuille',
      deposit: 'Déposer',
      withdraw: 'Retirer',
      profile: 'Profil',
      settings: 'Paramètres',
      notifications: 'Notifications',
      security: 'Sécurité',
      referrals: 'Parrainages',
      activity: 'Activité',
      plans: 'Plans'
    },
    ar: {
      dashboard: 'لوحة التحكم',
      investments: 'الاستثمارات',
      wallet: 'المحفظة',
      deposit: 'إيداع',
      withdraw: 'سحب',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      notifications: 'الإشعارات',
      security: 'الأمان',
      referrals: 'الإحالات',
      activity: 'النشاط',
      plans: 'الخطط'
    }
  };

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY) as SupportedLanguage | null;
    if (stored && this.translations[stored]) {
      this.currentLanguage = stored;
    }
  }

  setLanguage(lang: SupportedLanguage): void {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
  }

  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  translate(key: string): string {
    return this.translations[this.currentLanguage]?.[key] ?? key;
  }
}
