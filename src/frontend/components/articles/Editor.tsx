"use client";

import { useState, useRef } from "react";

// ====================================
// 기사 작성 에디터 컴포넌트
// 제목, 카테고리, 요약, 본문, 이미지 업로드를 한 화면에서 처리
// ====================================

// 카테고리 선택 옵션
const CATEGORY_OPTIONS = [
  { value: "POLITICS", label: "정치" },
  { value: "ECONOMY", label: "경제" },
  { value: "SOCIETY", label: "사회" },
  { value: "CULTURE", label: "생활/문화" },
  { value: "TECH", label: "IT/과학" },
  { value: "WORLD", label: "세계" },
];

interface EditorProps {
  // 초기값 (수정 시 기존 데이터 넘겨줌)
  initialData?: {
    title?: string;
    content?: string;
    summary?: string;
    category?: string;
    thumbnail?: string;
  };
  onSubmit: (data: {
    title: string;
    content: string;
    summary: string;
    category: string;
    thumbnail: string;
    status: "DRAFT" | "PUBLISHED";
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function Editor({ initialData, onSubmit, isLoading }: EditorProps) {
  // 에디터 상태 관리
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [thumbnailPreview, setThumbnailPreview] = useState(initialData?.thumbnail || "");
  const [isUploading, setIsUploading] = useState(false);

  // 파일 입력 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 썸네일 이미지 업로드 처리
   * 서버의 /api/upload 엔드포인트로 이미지 전송
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB를 초과할 수 없습니다.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("업로드 실패");

      const data = await res.json();
      setThumbnail(data.data.url);
      setThumbnailPreview(data.data.url);
    } catch (err) {
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 임시저장 처리
   * status를 DRAFT로 설정하여 저장
   */
  const handleSaveDraft = async () => {
    await handleSubmit("DRAFT");
  };

  /**
   * 발행 처리
   * status를 PUBLISHED로 설정하여 저장
   */
  const handlePublish = async () => {
    await handleSubmit("PUBLISHED");
  };

  /**
   * 폼 제출 처리
   * 유효성 검증 후 부모 컴포넌트의 onSubmit 호출
   */
  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    // 필수 입력값 검증
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!category) {
      alert("카테고리를 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("본문을 입력해주세요.");
      return;
    }

    await onSubmit({ title, content, summary, category, thumbnail, status });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 제목 입력 */}
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="기사 제목을 입력하세요"
          className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent"
          maxLength={500}
        />
        <div className="flex items-center justify-between mt-1">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400 ml-2">{title.length}/500</span>
        </div>
      </div>

      {/* 카테고리 선택 + 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 카테고리 드롭다운 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리 <span className="text-accent">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">카테고리 선택</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 요약 입력 (선택) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            요약 <span className="text-gray-400 font-normal">(선택, 목록에 표시됨)</span>
          </label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="기사 요약을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            maxLength={300}
          />
        </div>
      </div>

      {/* 썸네일 이미지 업로드 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          썸네일 이미지 <span className="text-gray-400 font-normal">(선택, 최대 5MB)</span>
        </label>

        {thumbnailPreview ? (
          // 이미지 미리보기
          <div className="relative">
            <img
              src={thumbnailPreview}
              alt="썸네일 미리보기"
              className="w-full max-h-64 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => { setThumbnail(""); setThumbnailPreview(""); }}
              className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-opacity-80"
            >
              ✕
            </button>
          </div>
        ) : (
          // 업로드 버튼
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
                <span className="text-3xl">🖼️</span>
                <span className="text-gray-500 text-sm">클릭하여 이미지 업로드</span>
                <span className="text-gray-400 text-xs">JPG, PNG, WebP 지원</span>
              </>
            )}
          </button>
        )}

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* 본문 에디터 */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          본문 <span className="text-accent">*</span>
        </label>
        <textarea
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

      {/* 하단 버튼 */}
      <div className="flex items-center justify-end gap-3 border-t pt-6">
        {/* 임시저장 */}
        <button
          onClick={handleSaveDraft}
          disabled={isLoading}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
        >
          임시저장
        </button>

        {/* 발행 */}
        <button
          onClick={handlePublish}
          disabled={isLoading}
          className="px-8 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "처리 중..." : "발행하기"}
        </button>
      </div>
    </div>
  );
}
