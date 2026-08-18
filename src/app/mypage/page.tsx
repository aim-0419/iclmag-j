"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/frontend/hooks/useAuth";
import FormMessage, { type Message } from "@/frontend/components/auth/FormMessage";
import Modal from "@/frontend/components/common/Modal";

// ====================================
// 마이페이지
// 주소: /mypage
// ------------------------------------
// 로그인한 사람만 들어올 수 있으며 세 가지 일을 할 수 있습니다.
//   1) 내 계정 정보 확인 (이름·이메일·권한)
//   2) 이름 변경 / 비밀번호 변경
//   3) 회원탈퇴
//
// 비밀번호 변경과 회원탈퇴는 본인 확인을 위해
// 현재 비밀번호를 한 번 더 입력받습니다.
// ====================================

/** 권한 코드를 사람이 읽을 수 있는 말로 바꿔 주는 표 */
const ROLE_LABELS: Record<string, string> = {
  USER: "일반 회원",
  WRITER: "기자",
  ADMIN: "관리자",
};

/** 마이페이지에서 반복해서 쓰는 작은 입력창 모양 */
const INPUT_CLASS =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading, refetch } = useAuth();

  // 프로필 수정 입력값
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 회원탈퇴 관련 입력값
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // 로그인하지 않았으면 로그인 화면으로 보냅니다.
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  // 사용자 정보를 불러오면 이름 입력칸을 현재 이름으로 채웁니다.
  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  /** 이름 변경 */
  const handleNameChange = async () => {
    const trimmed = name.trim();

    if (!trimmed || trimmed === user?.name) {
      setMessage({ type: "error", text: "변경할 새 이름을 입력해주세요." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "이름 변경에 실패했습니다." });
        return;
      }

      await refetch(); // 헤더에 표시되는 이름까지 최신으로 갱신
      setMessage({ type: "success", text: "이름이 변경되었습니다." });
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  /** 비밀번호 변경 */
  const handlePasswordChange = async () => {
    // 보내기 전에 화면에서 먼저 확인
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setMessage({ type: "error", text: "모든 비밀번호 항목을 입력해주세요." });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "새 비밀번호는 최소 8자 이상이어야 합니다." });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setMessage({ type: "error", text: "새 비밀번호가 일치하지 않습니다." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "비밀번호 변경에 실패했습니다." });
        return;
      }

      // 입력칸 비우기
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setMessage({ type: "success", text: "비밀번호가 변경되었습니다." });
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  /** 회원탈퇴 (되돌릴 수 없음) */
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("비밀번호를 입력해주세요.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.message || "회원탈퇴에 실패했습니다.");
        return;
      }

      // 탈퇴 완료 → 화면 전체를 새로 불러와 로그인 흔적을 완전히 지웁니다.
      window.location.href = "/";
    } catch {
      setDeleteError("서버 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  /** 탈퇴 확인 창 닫기 */
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteError("");
  };

  // 사용자 정보를 불러오는 중이거나, 로그인하지 않아 이동하는 중
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">불러오는 중</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">마이페이지</h1>

      {/* ============ 계정 정보 ============ */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          계정 정보
        </h2>
        <div className="flex items-center gap-3">
          {/* 이름 첫 글자로 만든 간단한 프로필 */}
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-lg truncate">{user.name}</p>
            <p className="text-sm text-gray-500 break-all">{user.email}</p>
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>
        </div>
      </section>

      {/* ============ 프로필 수정 ============ */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">
          프로필 수정
        </h2>

        <FormMessage message={message} />

        {/* 이름 변경 */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-2">
            이름 변경
          </label>
          {/* 좁은 화면에서는 버튼이 아래로 내려가 입력칸이 찌그러지지 않습니다 */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="새 이름"
              maxLength={50}
              className={`${INPUT_CLASS} sm:flex-1`}
            />
            <button
              type="button"
              onClick={handleNameChange}
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            >
              변경
            </button>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-3">비밀번호 변경</span>
          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호"
              autoComplete="current-password"
              className={INPUT_CLASS}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (8자 이상)"
              autoComplete="new-password"
              className={INPUT_CLASS}
            />
            <input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              placeholder="새 비밀번호 확인"
              autoComplete="new-password"
              className={INPUT_CLASS}
            />
            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={isSaving}
              className="w-full py-2.5 bg-primary hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "비밀번호 변경"}
            </button>
          </div>
        </div>
      </section>

      {/* ============ 회원탈퇴 ============ */}
      <section className="bg-white rounded-2xl border border-red-100 p-6">
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-2">
          회원탈퇴
        </h2>
        <p className="text-sm text-gray-500 mb-4 break-keep">
          탈퇴 시 계정 및 작성하신 모든 기사가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 border border-red-400 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
        >
          회원탈퇴 신청
        </button>
      </section>

      {/* 탈퇴 확인 창 */}
      {showDeleteModal && (
        <Modal title="정말 탈퇴하시겠습니까?" onClose={closeDeleteModal}>
          <p className="text-sm text-gray-500 mb-5 break-keep">
            확인을 위해 현재 비밀번호를 입력해주세요. 탈퇴 후 데이터는 복구되지 않습니다.
          </p>

          {deleteError && <p className="alert-error mb-4">{deleteError}</p>}

          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDeleteAccount()}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent mb-4"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isDeleting ? "처리 중..." : "탈퇴하기"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
