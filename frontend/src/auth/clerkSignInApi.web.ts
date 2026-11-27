import{useMemo,useRef}from'react';
import{useClerk}from'@clerk/expo';
import type{SignInApi}from'./signInApi';
import{createClerkSignInApi}from'./clerkSignInAdapter';

export function useClerkSignInApi(): SignInApi {
  const clerk = useClerk();
  const current = useRef(clerk);
  current.current = clerk;
  return useMemo(() => createClerkSignInApi(() => current.current), []);
}
