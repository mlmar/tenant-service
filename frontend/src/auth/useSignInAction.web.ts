import {useClerkSignInApi}from'./clerkSignInApi.web';
export function useSignInAction():()=>Promise<void>{const api=useClerkSignInApi();return async()=>{api.openRecovery();};}
