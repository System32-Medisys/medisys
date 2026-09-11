"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
export function ChangePasswordForm() {
  const router = useRouter(); const [message,setMessage]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const f=new FormData(event.currentTarget);const response=await fetch("/api/auth/change-password",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({currentPassword:f.get("currentPassword"),newPassword:f.get("newPassword")})});const data=await response.json();if(!response.ok)return setMessage(data.error);router.push("/dashboard");router.refresh()}
  return <form onSubmit={submit} className="card form"><label>Senha atual<input name="currentPassword" type="password" minLength={6} required/></label><label>Nova senha<input name="newPassword" type="password" minLength={6} required/></label>{message&&<p className="error">{message}</p>}<button>Alterar senha</button></form>;
}
