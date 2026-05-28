"use client";

// 회원가입 비활성화 - 직접 접근 시 로그인으로 리다이렉트
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/login"); }, [router]);
  return null;
}
