"use client";

import { useState, useRef } from "react";
import { CATEGORIES } from "@/constants/categories";

// ====================================
// 기사 작성 화면 (에디터)
// ------------------------------------
// 관리자가 기사를 쓸 때 사용하는 입력 화면입니다.
// 위에서부터 제목, 카테고리/요약, 썸네일 이미지, 본문, 저장 버튼 순서입니다.
//
// 저장 방식은 두 가지입니다.
//   임시저장(DRAFT)    : 나중에 이어서 쓰기 위해 보관 (독자에게는 보이지 않음)
//   발행하기(PUBLISHED): 홈과 카테고리 목록에 공개
// ====================================

/** 이미지 최대 용량 (5MB) */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/** 부모 화면(기사 작성 페이지)에 넘겨줄 기사 내용 */
export interface ArticleFormData {
  title: string;
  content: string;
  summary: string;
  category: string;
  thumbnail: string;
  status: "DRAFT" | "PUBLISHED";
}

interface ArticleEditorProps {
  /** 수정 화면에서 기존 내용을 미리 채워 넣을 때 사용 */
  initialData?: Partial<Omit<ArticleFormData, "status">>;
  /** 저장 버튼을 눌렀을 때 실행할 동작 */
  onSubmit: (data: ArticleFormData) => Promise<void>;
  /** 저장 처리 중인지 여부 (버튼 잠금용) */
  isLoading?: boolean;
}

export default function ArticleEditor({
  initialData,
  onSubmit,
  isLoading,
}: ArticleEditorProps) {
  // 입력 중인 기사 내용
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");

  // 이미지 업로드 진행 상태와 안내 문구
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 숨겨 둔 파일 선택창을 버튼으로 열기 위한 연결고리
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 썸네일 이미지 올리기
   * 서버(/api/upload)로 파일을 보내고, 저장된 주소를 받아 미리보기에 표시합니다.
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");

    // 보내기 전에 화면에서 먼저 확인 (불필요한 전송을 줄임)
    if (!file.type.startsWith("image/")) {
      setErrorMessage("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("이미지 크기는 5MB를 초과할 수 없습니다.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.message || "이미지 업로드에 실패했습니다.");
        return;
      }

      setThumbnail(result.data.url);
    } catch {
      setErrorMessage("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      // 같은 파일을 다시 선택해도 반응하도록 입력창을 비웁니다.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /**
   * 저장 버튼을 눌렀을 때 실행
   * 필수 항목이 비어 있으면 저장하지 않고 안내 문구를 보여 줍니다.
   */
  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    setErrorMessage("");

    if (!title.trim()) return setErrorMessage("제목을 입력해주세요.");
    if (!category) return setErrorMessage("카테고리를 선택해주세요.");
    if (!content.trim()) return setErrorMessage("본문을 입력해주세요.");

    await onSubmit({ title, content, summary, category, thumbnail, status });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 안내 문구 (입력 누락 / 업로드 실패) */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
          {errorMessage}
        </div>
      )}

      {/* ---------- 제목 ---------- */}
      <div className="mb-6">
        <label htmlFor="article-title" className="sr-only">기사 제목</label>
        <input
          id="article-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="기사 제목을 입력하세요"
          maxLength={500}
          className="w-full text-2xl sm:text-3xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent break-keep"
        />
        <div className="flex items-center justify-between mt-1">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{title.length}/500</span>
        </div>
      </div>

      {/* ---------- 카테고리 + 요약 ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="article-category" className="block text-sm font-medium text-gray-700 mb-1">
            카테고리 <span className="text-accent">*</span>
          </label>
          <select
            id="article-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">카테고리 선택</option>
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="article-summary" className="block text-sm font-medium text-gray-700 mb-1">
            요약 <span className="text-gray-400 font-normal">(선택, 목록에 표시됨)</span>
          </label>
          <input
            id="article-summary"
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="기사 요약을 입력하세요"
            maxLength={300}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* ---------- 썸네일 이미지 ---------- */}
      <div className="mb-6">
        <span className="block text-sm font-medium text-gray-700 mb-2">
          썸네일 이미지 <span className="text-gray-400 font-normal">(선택, 최대 5MB)</span>
        </span>

        {thumbnail ? (
          // 올린 이미지 미리보기 (오른쪽 위 버튼으로 지울 수 있음)
          <div className="relative">
            {/* 방금 올린 파일을 즉시 보여 주는 미리보기라 일반 img 태그를 사용합니다 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt="썸네일 미리보기"
              className="w-full max-h-64 object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => setThumbnail("")}
              aria-label="썸네일 삭제"
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              X
            </button>
          </div>
        ) : (
          // 아직 이미지가 없을 때: 누르면 파일 선택창이 열립니다
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-10 flex flex-col items-center justify-center gap-2 hover:border-accent transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <span className="text-gray-500 text-sm">업로드 중...</span>
            ) : (
              <>
                <span className="text-gray-500 text-sm">클릭하여 이미지 업로드</span>
                <span className="text-gray-400 text-xs">JPG, PNG, WebP, GIF 지원 (최대 5MB)</span>
              </>
            )}
          </button>
        )}

        {/* 화면에는 보이지 않는 실제 파일 선택창 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* ---------- 본문 ---------- */}
      <div className="mb-8">
        <label htmlFor="article-content" className="block text-sm font-medium text-gray-700 mb-2">
          본문 <span className="text-accent">*</span>
        </label>
        <textarea
          id="article-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="기사 본문을 작성하세요..."
          rows={20}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-400">{content.length}자</span>
        </div>
      </div>

      {/* ---------- 저장 버튼 ---------- */}
      {/* 좁은 화면에서는 버튼이 세로로 쌓여 화면 밖으로 밀려나지 않습니다 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => handleSubmit("DRAFT")}
          disabled={isLoading || isUploading}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
        >
          임시저장
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("PUBLISHED")}
          disabled={isLoading || isUploading}
          className="px-8 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "처리 중..." : "발행하기"}
        </button>
      </div>
    </div>
  );
}
