import{useStore}from'zustand';
import{appStore,type AppState}from'./appStore';
export function useAppStore<T>(selector:(state:AppState)=>T){return useStore(appStore,selector);}
