import { useContext, createContext } from 'react';
export type LangKey = 'en' | 'ko';
export const AdminLangContext = createContext<{adminLang: LangKey, setAdminLang: (lang: LangKey) => void}>({adminLang: 'en', setAdminLang: ()=>{}});
export function useAdminLang(): [LangKey, (lang: LangKey) => void] {
  const ctx = useContext(AdminLangContext);
  return [ctx.adminLang, ctx.setAdminLang];
} 