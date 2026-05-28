import bcrypt from "bcryptjs";
import prisma from "@/backend/lib/db";

// ====================================
// 사용자 관련 비즈니스 로직
// 회원가입, 로그인 검증, 사용자 조회 등
// ====================================

// 비밀번호 해시 복잡도 (높을수록 보안 강하지만 느림)
const SALT_ROUNDS = 12;

/**
 * 이메일로 사용자 조회
 * 로그인 시 사용자 존재 여부 확인에 사용
 *
 * @param email - 조회할 이메일 주소
 * @returns 사용자 정보 또는 null
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * ID로 사용자 조회
 * 토큰 검증 후 사용자 정보 가져올 때 사용
 *
 * @param id - 사용자 ID
 * @returns 비밀번호 제외한 사용자 정보 또는 null
 */
export async function findUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
}

/**
 * 회원가입 처리
 * 이메일 중복 확인 후 비밀번호 해시화하여 저장
 *
 * @param email - 이메일 주소
 * @param password - 평문 비밀번호 (해시화 후 저장)
 * @param name - 사용자 이름
 * @returns 생성된 사용자 정보 (비밀번호 제외)
 */
export async function createUser(email: string, password: string, name: string) {
  // 이메일 중복 확인
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("이미 사용 중인 이메일입니다.");
  }

  // 비밀번호 해시화 (원문 비밀번호는 DB에 저장하지 않음)
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 사용자 생성
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * 로그인 검증
 * 이메일로 사용자 찾고 비밀번호 일치 여부 확인
 * emailVerified 여부도 함께 반환 (로그인 라우트에서 체크)
 *
 * @param email - 로그인 이메일
 * @param password - 입력한 평문 비밀번호
 * @returns 사용자 정보(emailVerified 포함) 또는 null (로그인 실패)
 */
export async function validateLogin(email: string, password: string) {
  // 이메일 또는 이름으로 사용자 조회
  let user = await findUserByEmail(email);
  if (!user) {
    user = await prisma.user.findFirst({ where: { name: email } });
  }
  if (!user) return null;

  // 입력한 비밀번호와 해시된 비밀번호 비교
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  // 비밀번호 필드 제외하고 반환 (emailVerified 포함)
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * 입력값 유효성 검증
 *
 * @param email - 이메일
 * @param password - 비밀번호
 * @param name - 이름 (회원가입 시)
 * @returns 에러 메시지 배열
 */
export function validateUserInput(email: string, password: string, name?: string): string[] {
  const errors: string[] = [];

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("올바른 이메일 형식을 입력해주세요.");
  }

  // 비밀번호 길이 검증 (최소 8자)
  if (!password || password.length < 8) {
    errors.push("비밀번호는 최소 8자 이상이어야 합니다.");
  }

  // 이름 검증 (회원가입 시에만)
  if (name !== undefined && (!name || name.trim().length < 2)) {
    errors.push("이름은 최소 2자 이상이어야 합니다.");
  }

  return errors;
}
