"use client";

import { useEffect } from "react";

// ====================================
// 콘텐츠 보호 컴포넌트
// 기사 본문에서 우클릭, 드래그, 복사 방지
// ====================================

export default function ContentProtection({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 우클릭 방지
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 드래그 방지
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 텍스트 선택 방지
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    // 키보드 단축키 방지 (Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P, F12)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && ["c", "a", "s", "p", "u"].includes(e.key.toLowerCase())) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
      }}
    >
      {children}
    </div>
  );
}
