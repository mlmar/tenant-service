import{createApplicationApi}from'../api/application';
import{createAppStore}from'./createAppStore';
export type{AppState,Screen}from'./createAppStore';
export const appStore=createAppStore(createApplicationApi);
