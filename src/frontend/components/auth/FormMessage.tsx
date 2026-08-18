// ====================================
// 안내 문구 표시 (성공 / 실패)
// ------------------------------------
// 입력 화면에서 "저장되었습니다", "비밀번호가 틀렸습니다" 같은 문구를
// 초록색(성공) 또는 빨간색(실패) 상자로 보여 줍니다.
// 여러 화면에서 같은 모양을 쓰도록 한 곳에 모았습니다.
// ====================================

/** 안내 문구 한 건 (종류 + 내용) */
export interface Message {
  type: "success" | "error";
  text: string;
}

export default function FormMessage({ message }: { message: Message | null }) {
  // 보여 줄 문구가 없으면 아무것도 그리지 않습니다.
  if (!message) return null;

  return (
    <div
      // whitespace-pre-line: 서버가 여러 줄로 보낸 안내를 줄바꿈 그대로 표시
      className={`${message.type === "success" ? "alert-success" : "alert-error"} whitespace-pre-line break-keep mb-5`}
      role={message.type === "error" ? "alert" : "status"}
    >
      {message.text}
    </div>
  );
}
