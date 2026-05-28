"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/frontend/components/articles/Editor";

// ====================================
// 기사 작성 페이지
// 로그인한 WRITER/ADMIN만 접근 가능
// ====================================

export default function WritePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 페이지 진입 시 권한 확인
  useEffect(() => {
    checkPermission();
  }, []);

  /**
   * 기사 작성 권한 확인
   * 로그인하지 않았거나 권한 없으면 리다이렉트
   */
  const checkPermission = async () => {
    try {
      const res = await fetch("/api/auth/me");

      if (!res.ok) {
        // 로그인 안 된 경우 → 로그인 페이지로
        router.push("/login");
        return;
      }

      const data = await res.json();
      const user = data.data;

      // WRITER 또는 ADMIN만 접근 가능
      if (user.role !== "WRITER" && user.role !== "ADMIN") {
        alert("기사 작성 권한이 없습니다. 관리자에게 문의하세요.");
        router.push("/");
        return;
      }
    } catch {
      router.push("/login");
    } finally {
      setIsAuthChecking(false);
    }
  };

  /**
   * 기사 저장 처리
   * Editor 컴포넌트에서 제출 시 호출됨
   *
   * @param data - 기사 데이터 (제목, 본문, 카테고리 등)
   */
  const handleSubmit = async (data: {
    title: string;
    content: string;
    summary: string;
    category: string;
    thumbnail: string;
    status: "DRAFT" | "PUBLISHED";
  }) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "기사 저장에 실패했습니다.");
        return;
      }

      // 저장 성공 → 기사 상세 페이지로 이동
      const message = data.status === "PUBLISHED" ? "기사가 발행되었습니다!" : "임시저장되었습니다.";
      alert(message);
      router.push(`/articles/${result.data.id}`);
    } catch {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 권한 확인 중 로딩
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">권한 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 페이지 헤더 */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">기사 작성</h1>
        <p className="text-gray-500 text-sm mt-1">
          카테고리를 선택하고 기사를 작성하세요. 임시저장 후 나중에 발행할 수 있습니다.
        </p>
      </div>

      {/* 에디터 컴포넌트 */}
      <Editor onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
