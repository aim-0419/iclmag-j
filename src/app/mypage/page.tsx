"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ====================================
// 마이페이지
// 프로필 수정 (이름, 비밀번호) + 회원탈퇴
// 로그인한 사용자만 접근 가능
// ====================================

interface UserInfo {
  id: number;
  email: string;
  name: string;
  role: string;
}

// 역할 레이블 매핑
const ROLE_LABELS: Record<string, string> = {
  USER: "일반 회원",
  WRITER: "기자",
  ADMIN: "관리자",
};

export default function MyPage() {
  const router = useRouter();

  // 사용자 정보
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 프로필 수정 폼 상태
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [isSaving, setIsSaving] = useState(false);

  // 탈퇴 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    fetchUserInfo();
  }, []);

  /**
   * 현재 로그인 사용자 정보 조회
   */
  const fetchUserInfo = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        // 로그인 안 된 경우 로그인 페이지로 이동
        router.replace("/login");
        return;
      }
      const data = await res.json();
      setUser(data.data);
      setName(data.data.name);
    } catch {
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 이름 변경 처리
   */
  const handleNameChange = async () => {
    if (!name.trim() || name.trim() === user?.name) {
      setProfileMessage({ type: "error", text: "변경할 이름을 입력해주세요." });
      return;
    }
    setIsSaving(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => prev ? { ...prev, name: data.data.name } : null);
        setProfileMessage({ type: "success", text: "이름이 변경되었습니다." });
      } else {
        setProfileMessage({ type: "error", text: data.message });
      }
    } catch {
      setProfileMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 비밀번호 변경 처리
   */
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setProfileMessage({ type: "error", text: "모든 비밀번호 항목을 입력해주세요." });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setProfileMessage({ type: "error", text: "새 비밀번호가 일치하지 않습니다." });
      return;
    }
    if (newPassword.length < 8) {
      setProfileMessage({ type: "error", text: "새 비밀번호는 최소 8자 이상이어야 합니다." });
      return;
    }

    setIsSaving(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
        setProfileMessage({ type: "success", text: "비밀번호가 변경되었습니다." });
      } else {
        setProfileMessage({ type: "error", text: data.message });
      }
    } catch {
      setProfileMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 회원탈퇴 처리
   * 비밀번호 확인 후 계정 영구 삭제
   */
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteMessage("비밀번호를 입력해주세요.");
      return;
    }

    setIsDeleting(true);
    setDeleteMessage("");

    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();

      if (data.success) {
        alert("회원탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
        window.location.href = "/";
      } else {
        setDeleteMessage(data.message);
      }
    } catch {
      setDeleteMessage("서버 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">마이페이지</h1>

      {/* ============================
          계정 정보 카드
          ============================ */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          계정 정보
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================
          프로필 수정 카드
          ============================ */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">
          프로필 수정
        </h2>

        {/* 피드백 메시지 */}
        {profileMessage.text && (
          <div className={`text-sm rounded-lg px-4 py-3 mb-5 ${
            profileMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {profileMessage.text}
          </div>
        )}

        {/* 이름 변경 */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">이름 변경</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="새 이름"
              maxLength={50}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              onClick={handleNameChange}
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              변경
            </button>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">비밀번호 변경</label>
          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (8자 이상)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              placeholder="새 비밀번호 확인"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              onClick={handlePasswordChange}
              disabled={isSaving}
              className="w-full py-2.5 bg-primary hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "비밀번호 변경"}
            </button>
          </div>
        </div>
      </div>

      {/* ============================
          회원탈퇴 카드
          ============================ */}
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-2">
          회원탈퇴
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          탈퇴 시 계정 및 작성하신 모든 기사가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 border border-red-400 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
        >
          회원탈퇴 신청
        </button>
      </div>

      {/* ============================
          탈퇴 확인 모달
          ============================ */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteMessage(""); }}
          />
          {/* 모달 박스 */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <h3 className="text-lg font-bold text-gray-900 mb-2">정말 탈퇴하시겠습니까?</h3>
            <p className="text-sm text-gray-500 mb-5">
              확인을 위해 현재 비밀번호를 입력해주세요. 탈퇴 후 데이터는 복구되지 않습니다.
            </p>

            {deleteMessage && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {deleteMessage}
              </p>
            )}

            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent mb-4"
              onKeyDown={(e) => e.key === "Enter" && handleDeleteAccount()}
            />

            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteMessage(""); }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
