"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ArticleEditor, { type ArticleFormData } from "@/frontend/components/articles/ArticleEditor";
import { useAuth } from "@/frontend/hooks/useAuth";

// ====================================
// 기사 작성 화면
// 주소: /write
// ------------------------------------
// 관리자만 들어올 수 있습니다.
//   로그인하지 않았으면  → 로그인 화면으로 보냄
//   관리자가 아니면      → 안내 후 홈으로 보냄
//
// 실제 입력 화면은 ArticleEditor 컴포넌트가 담당하고,
// 이 파일은 "권한 확인"과 "저장 요청"만 처리합니다.
// ====================================

export default function WritePage() {
  const router = useRouter();
  const { user, isLoading: isCheckingAuth, isAdmin } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 로그인·권한 확인이 끝나면 자격이 없는 사람을 내보냅니다.
  useEffect(() => {
    if (isCheckingAuth) return;

    if (!user) {
      router.replace("/login");
    } else if (!isAdmin) {
      router.replace("/");
    }
  }, [isCheckingAuth, user, isAdmin, router]);

  /**
   * 저장 버튼을 눌렀을 때 서버에 기사를 보냅니다.
   * 저장에 성공하면 방금 쓴 기사 화면으로 이동합니다.
   */
  const handleSubmit = async (data: ArticleFormData) => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.message || "기사 저장에 실패했습니다.");
        return;
      }

      // 임시저장한 기사는 아직 공개되지 않아 상세 화면에서 볼 수 없으므로 홈으로 이동
      if (data.status === "PUBLISHED") {
        router.push(`/articles/${result.data.id}`);
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  // 권한을 확인하는 동안, 또는 자격이 없어 이동하는 동안 보여 줄 화면
  if (isCheckingAuth || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">권한 확인 중</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">기사 작성</h1>
        <p className="text-gray-500 text-sm mt-1 break-keep">
          카테고리를 선택하고 기사를 작성하세요. 임시저장 후 나중에 발행할 수 있습니다.
        </p>
      </div>

      {errorMessage && <div className="alert-error mb-6">{errorMessage}</div>}

      <ArticleEditor onSubmit={handleSubmit} isLoading={isSaving} />
    </div>
  );
}
