import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/backend/middleware/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ====================================
// 이미지 업로드 API
// POST /api/upload
// 로그인한 사용자만 업로드 가능
// 업로드된 이미지는 /public/uploads/ 에 저장
// ====================================

// 허용하는 이미지 MIME 타입
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

// 파일 크기 제한 (5MB)
const MAX_SIZE = 5 * 1024 * 1024;

/**
 * 이미지 파일 업로드 처리
 * multipart/form-data 형식으로 수신
 * 업로드 경로: /public/uploads/{타임스탬프}_{원본파일명}
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인 (로그인 필요)
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // FormData에서 파일 추출
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "파일을 선택해주세요." },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "JPG, PNG, WebP, GIF 형식만 업로드 가능합니다." },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "파일 크기는 5MB를 초과할 수 없습니다." },
        { status: 400 }
      );
    }

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 업로드 디렉토리 생성 (없으면 생성)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // 고유한 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_"); // 특수문자 제거
    const fileName = `${timestamp}_${originalName}`;
    const filePath = path.join(uploadDir, fileName);

    // 파일 저장
    await writeFile(filePath, buffer);

    // 클라이언트에서 접근할 수 있는 URL 반환
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      message: "이미지가 업로드되었습니다.",
      data: { url: fileUrl, fileName },
    });
  } catch (error) {
    console.error("[이미지 업로드 오류]", error);
    return NextResponse.json(
      { success: false, message: "이미지 업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
