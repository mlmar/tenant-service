import{useUser}from'@clerk/expo';import{useProfile}from'./useProfile';
export function useAccountIdentity(){const{user}=useUser();const account=useProfile();const email=account.profile?.email||user?.primaryEmailAddress?.emailAddress||'';const name=account.profile?.name||user?.fullName||email.split('@')[0]||'Your account';return{account,email,name};}
