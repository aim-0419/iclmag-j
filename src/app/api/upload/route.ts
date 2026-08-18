import { NextRequest } from "next/server";
import { requireAuth, isAdmin } from "@/backend/middleware/auth";
import { ok, fail, serverError, MESSAGES } from "@/backend/lib/apiResponse";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ====================================
// 이미지 업로드 API
// POST /api/upload
// ------------------------------------
// 기사 썸네일 이미지를 서버에 저장합니다. (관리자만 사용 가능)
// 저장 위치: public/uploads/ 폴더
// 저장 이름: 업로드시각_원본파일명 (같은 이름 파일이 서로 덮어쓰지 않도록)
// 저장 후 화면에서 쓸 수 있는 주소(/uploads/파일명)를 돌려줍니다.
// ====================================

/** 업로드를 허용하는 이미지 형식 */
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

/** 허용하는 최대 파일 크기 (5MB) */
const MAX_SIZE = 5 * 1024 * 1024;

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

    // 3) 형식·크기 확인
    if (!ALLOWED_TYPES.includes(file.type)) {
      return fail("JPG, PNG, WebP, GIF 형식만 업로드 가능합니다.", 400);
    }
    if (file.size > MAX_SIZE) {
      return fail("파일 크기는 5MB를 초과할 수 없습니다.", 400);
    }

    // 4) 저장 폴더 준비 (없으면 만듦)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // 5) 안전한 파일 이름 만들기
    //    파일명에 한글·공백·특수문자가 있으면 주소가 깨질 수 있어 _ 로 바꿉니다.
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}_${safeName}`;

    // 6) 저장
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);

    return ok({ url: `/uploads/${fileName}`, fileName }, "이미지가 업로드되었습니다.");
  } catch (error) {
    return serverError("이미지 업로드", error);
  }
}
