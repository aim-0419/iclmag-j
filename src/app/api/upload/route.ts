import { NextRequest } from "next/server";
import { requireAuth, isAdmin } from "@/backend/middleware/auth";
import { ok, fail, serverError, MESSAGES } from "@/backend/lib/apiResponse";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

// ====================================
// 이미지 업로드 API
// POST /api/upload
// ------------------------------------
// 기사 썸네일 이미지를 서버에 저장합니다. (관리자만 사용 가능)
// 저장 위치: public/uploads/ 폴더
//
// [보안: 왜 이렇게까지 확인하나요?]
// public/uploads 폴더에 올라간 파일은 인터넷에서 누구나 주소로 열 수 있습니다.
// 만약 이미지인 척하면서 실제로는 웹페이지(.html)나 스크립트 파일을 올릴 수 있다면,
// 그 주소로 접속한 방문자의 브라우저에서 공격자의 코드가 실행됩니다.
// 그래서 아래 세 단계로 확인합니다.
//   1) 브라우저가 알려준 파일 종류가 이미지인지
//   2) 파일 안쪽 첫 몇 바이트가 진짜 이미지 형식인지 (종류는 위조할 수 있으므로)
//   3) 저장할 파일 이름과 확장자를 서버가 직접 새로 만들기 (원본 이름을 믿지 않음)
// ====================================

/** 허용하는 이미지 종류와, 서버가 붙일 확장자 */
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/** 허용하는 최대 파일 크기 (5MB) */
const MAX_SIZE = 5 * 1024 * 1024;

/**
 * 파일 내용의 맨 앞부분을 확인해 진짜 이미지가 맞는지 검사합니다.
 *
 * 모든 이미지 파일은 맨 앞에 "나는 이 형식이다"를 나타내는 고유한 표식이 있습니다.
 * (사진 파일의 지문 같은 것으로, 시그니처 또는 매직 넘버라고 부릅니다.)
 * 파일 이름이나 종류는 얼마든지 속일 수 있지만 이 표식은 속이기 어렵습니다.
 *
 * @returns 진짜 이미지면 true
 */
function looksLikeRealImage(bytes: Uint8Array): boolean {
  const startsWith = (...signature: number[]) =>
    signature.every((byte, i) => bytes[i] === byte);

  // JPEG: FF D8 FF
  if (startsWith(0xff, 0xd8, 0xff)) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return true;

  // GIF: "GIF87a" 또는 "GIF89a"
  if (startsWith(0x47, 0x49, 0x46, 0x38)) return true;

  // WebP: "RIFF" (0~3) + "WEBP" (8~11)
  if (
    startsWith(0x52, 0x49, 0x46, 0x46) &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    // 1) 관리자 확인
    const user = await requireAuth(request);
    if (!user) return fail(MESSAGES.loginRequired, 401);
    if (!isAdmin(user)) return fail("관리자만 이미지를 업로드할 수 있습니다.", 403);

    // 2) 전송된 파일 꺼내기
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return fail("파일을 선택해주세요.", 400);
    }

    // 3) 파일 종류 확인 (브라우저가 알려준 값)
    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return fail("JPG, PNG, WebP, GIF 형식만 업로드 가능합니다.", 400);
    }

    // 4) 크기 확인
    if (file.size > MAX_SIZE) {
      return fail("파일 크기는 5MB를 초과할 수 없습니다.", 400);
    }

    // 5) 파일 내용이 진짜 이미지인지 확인 (종류 위장 차단)
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!looksLikeRealImage(buffer)) {
      return fail("이미지 파일이 아니거나 손상된 파일입니다.", 400);
    }

    // 6) 저장 폴더 준비 (없으면 만듦)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // 7) 파일 이름을 서버가 직접 새로 만들기
    //    사용자가 보낸 원본 이름은 아예 쓰지 않습니다.
    //    이렇게 하면 상위 폴더로 빠져나가려는 이름(../../)이나
    //    실행 가능한 확장자(.html, .js)를 넣으려는 시도가 원천 차단됩니다.
    const fileName = `${Date.now()}_${randomUUID()}${extension}`;

    // 8) 저장
    await writeFile(path.join(uploadDir, fileName), buffer);

    return ok({ url: `/uploads/${fileName}`, fileName }, "이미지가 업로드되었습니다.");
  } catch (error) {
    return serverError("이미지 업로드", error);
  }
}
