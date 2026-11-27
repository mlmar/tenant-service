export class ApiError extends Error {
  constructor(public readonly status:number){super(`API request failed (${status})`);}
}
export function createApiClient(getToken:()=>Promise<string|null>,request:typeof fetch=fetch){
  const base=(process.env.EXPO_PUBLIC_API_URL??'http://localhost:3000/api').replace(/\/$/,'');
  return async function api<T>(path:string,options:{method?:string;file?:File|string;signal?:AbortSignal}={}):Promise<T>{
    const token=await getToken();options.signal?.throwIfAborted();if(!token)throw new ApiError(401);
    const body=options.file?typeof options.file==='string'?await(await request(options.file,{signal:options.signal})).blob():options.file:undefined;
    options.signal?.throwIfAborted();
    const response=await request(base+path,{method:options.method??'GET',headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':body.type}:{})},body,signal:options.signal});
    if(!response.ok)throw new ApiError(response.status);
    return response.json() as Promise<T>;
  };
}
export type ApiClient=ReturnType<typeof createApiClient>;
