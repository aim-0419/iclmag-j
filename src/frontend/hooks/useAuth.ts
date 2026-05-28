"use client";

import { useState, useEffect } from "react";
import { AuthUser } from "@/types";

// ====================================
// 인증 상태 관리 커스텀 훅
// 로그인 여부 확인, 사용자 정보 가져오기
// ====================================

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 현재 로그인 상태 확인
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  /**
   * 현재 로그인한 사용자 정보 가져오기
   * /api/auth/me 엔드포인트 호출
   */
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 쓰기 권한 여부 확인
   * WRITER 또는 ADMIN만 기사 작성 가능
   */
  const canWrite = user?.role === "WRITER" || user?.role === "ADMIN";

  /**
   * 관리자 여부 확인
   */
  const isAdmin = user?.role === "ADMIN";

  return {
    user,
    isLoading,
    isLoggedIn: !!user,
    canWrite,
    isAdmin,
    refetch: fetchCurrentUser,
  };
}
