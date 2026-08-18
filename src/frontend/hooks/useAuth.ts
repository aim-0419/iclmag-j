"use client";

import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@/types";

// ====================================
// 로그인 상태 확인 도구 (커스텀 훅)
// ------------------------------------
// "지금 로그인한 사람이 누구인지"를 서버에 물어보고 결과를 보관합니다.
// 헤더의 사용자 메뉴, 기사 쓰기 버튼 노출 여부 등 여러 화면에서
// 똑같은 코드를 반복하지 않도록 이 파일 하나로 모았습니다.
//
// 사용 예)
//   const { user, isLoading, isAdmin } = useAuth();
// ====================================

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** 서버에 현재 로그인한 사용자 정보를 요청합니다. */
  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        // 401 응답 = 로그인하지 않은 상태 (오류가 아님)
        setUser(null);
      }
    } catch {
      // 네트워크 오류 등 = 로그인하지 않은 것으로 처리
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** 로그아웃 후 보관 중인 로그인 정보를 비웁니다. */
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  // 화면이 처음 열릴 때 한 번 확인
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    user,                            // 로그인한 사용자 정보 (없으면 null)
    isLoading,                       // 아직 확인 중인지
    isLoggedIn: !!user,              // 로그인 여부
    isAdmin: user?.role === "ADMIN", // 관리자 여부 (기사 작성 권한)
    refetch,
    logout,
  };
}
