"use client";

import { useEffect } from "react";

// ====================================
// 기사 본문 복사 방지
// ------------------------------------
// 기사 상세 화면에서 본문이 무단으로 복사·저장되는 것을 어렵게 만듭니다.
//   - 마우스 오른쪽 클릭 메뉴 막기
//   - 글자 선택(드래그) 막기
//   - 이미지 끌어서 저장하기 막기
//   - 복사/전체선택/저장/인쇄/소스보기 단축키 막기
//
// [알아두실 점]
// 이 기능은 "실수로 또는 손쉽게" 퍼가는 것을 막아 주는 수준입니다.
// 화면을 캡처하거나 개발자 도구를 쓰는 방법까지 완전히 막을 수는 없습니다.
// 기사 상세 화면에서만 동작하며, 다른 화면을 열면 자동으로 해제됩니다.
// ====================================

export default function ContentProtection({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 막을 동작들 (기본 동작을 취소함)
    const block = (e: Event) => e.preventDefault();

    /** 복사와 관련된 키보드 단축키 막기 */
    const blockShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Ctrl+C(복사) / Ctrl+A(전체선택) / Ctrl+S(저장) / Ctrl+P(인쇄) / Ctrl+U(소스보기)
      const isCopyShortcut = e.ctrlKey && ["c", "a", "s", "p", "u"].includes(key);
      // 개발자 도구 열기 (F12, Ctrl+Shift+I/J/C)
      const isDevToolShortcut =
        key === "f12" || (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key));

      if (isCopyShortcut || isDevToolShortcut) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("selectstart", block);
    document.addEventListener("keydown", blockShortcuts);

    // 다른 화면으로 이동하면 위에서 건 제한을 모두 되돌립니다.
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("selectstart", block);
      document.removeEventListener("keydown", blockShortcuts);
    };
  }, []);

  // select-none: 마우스로 글자를 끌어서 선택할 수 없게 하는 스타일
  return <div className="select-none">{children}</div>;
}
