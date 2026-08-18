import bcrypt from "bcryptjs";
import { prisma } from "@/backend/lib/db";

// ====================================
// 회원 관련 기능 모음 (가입 · 로그인 확인 · 조회)
// ------------------------------------
// 비밀번호는 절대 원문 그대로 저장하지 않습니다.
// bcrypt 라는 방식으로 알아볼 수 없게 변환(해시)해서 저장하고,
// 로그인할 때는 "입력한 비밀번호를 같은 방식으로 변환한 결과"를 비교합니다.
// 그래서 데이터베이스가 유출되어도 비밀번호 원문은 알 수 없습니다.
// ====================================

/** 비밀번호 변환 강도 (숫자가 클수록 안전하지만 조금 느려집니다) */
const SALT_ROUNDS = 12;

/** 화면에 돌려줄 때 비밀번호를 제외한 안전한 항목들 */
const SAFE_USER_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

/**
 * 이메일로 회원 찾기
 * 로그인·비밀번호 찾기에서 계정 존재 여부를 확인할 때 사용합니다.
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

/**
 * 회원 번호로 회원 찾기 (비밀번호는 제외하고 가져옴)
 * 로그인 증명서를 확인한 뒤 최신 회원 정보를 볼 때 사용합니다.
 */
export async function findUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: SAFE_USER_FIELDS,
  });
}

/**
 * 회원가입 처리
 * 같은 이메일이 이미 있으면 가입을 거절하고,
 * 비밀번호는 변환(해시)해서 저장합니다.
 *
 * @returns 생성된 회원 정보 (비밀번호 제외)
 */
export async function createUser(email: string, password: string, name: string) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("이미 사용 중인 이메일입니다.");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.user.create({
    data: { email, password: hashedPassword, name },
    select: SAFE_USER_FIELDS,
  });
}

/**
 * 로그인 정보가 맞는지 확인
 * 이메일 대신 이름으로도 로그인할 수 있도록 두 가지를 모두 확인합니다.
 * 이메일 인증 완료 여부(emailVerified)도 함께 돌려주어
 * 로그인 API가 미인증 계정을 막을 수 있게 합니다.
 *
 * @returns 회원 정보(비밀번호 제외), 아이디·비밀번호가 틀리면 null
 */
export async function validateLogin(email: string, password: string) {
  // 1) 이메일로 찾고, 없으면 2) 이름으로 다시 찾기
  const user =
    (await findUserByEmail(email)) ??
    (await prisma.user.findFirst({ where: { name: email } }));

  if (!user) return null;

  // 입력한 비밀번호를 같은 방식으로 변환해서 저장된 값과 비교
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  // 비밀번호 항목만 빼고 돌려주기
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * 저장된 비밀번호가 맞는지 확인 (회원탈퇴·비밀번호 변경 시 본인 확인용)
 *
 * @returns 맞으면 true
 */
export async function verifyUserPassword(userId: number, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  if (!user) return false;

  return bcrypt.compare(password, user.password);
}

/**
 * 비밀번호를 새 값으로 바꾸기 (변환 후 저장)
 */
export async function updateUserPassword(userId: number, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

/**
 * 가입 입력값이 올바른지 검사하기
 * 화면에서도 검사하지만, 서버에서 반드시 다시 검사합니다.
 *
 * @param name - 회원가입일 때만 전달 (로그인 시에는 생략)
 * @returns 문제가 있으면 안내 문구 목록, 없으면 빈 목록
 */
export function validateUserInput(email: string, password: string, name?: string): string[] {
  const errors: string[] = [];

  // 이메일 형식 (문자@문자.문자) 확인
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("올바른 이메일 형식을 입력해주세요.");
  }

  // 비밀번호는 최소 8자
  if (!password || password.length < 8) {
    errors.push("비밀번호는 최소 8자 이상이어야 합니다.");
  }

  // 이름은 최소 2자 (회원가입 시에만 검사)
  if (name !== undefined && (!name || name.trim().length < 2)) {
    errors.push("이름은 최소 2자 이상이어야 합니다.");
  }

  return errors;
}
