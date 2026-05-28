# ICLMAG - 매거진 홈페이지

## 기술 스택
- **프레임워크**: Next.js 15 (TypeScript)
- **데이터베이스**: MySQL + Prisma ORM
- **스타일링**: Tailwind CSS
- **인증**: JWT (httpOnly 쿠키)

## 폴더 구조

```
src/
├── app/                    # Next.js 라우팅
│   ├── api/                # 백엔드 API 엔드포인트
│   │   ├── auth/           # 로그인, 회원가입, 로그아웃
│   │   ├── articles/       # 기사 CRUD
│   │   └── upload/         # 이미지 업로드
│   ├── (auth)/             # 인증 페이지 (로그인, 회원가입)
│   ├── articles/[id]/      # 기사 상세
│   ├── category/[slug]/    # 카테고리별 기사 목록
│   ├── write/              # 기사 작성
│   └── page.tsx            # 홈
├── backend/                # 백엔드 비즈니스 로직
│   ├── lib/                # DB, JWT 유틸
│   ├── middleware/         # 인증 미들웨어
│   └── services/           # 비즈니스 로직
├── frontend/               # 프론트엔드 코드
│   ├── components/         # React 컴포넌트
│   └── hooks/              # 커스텀 훅
└── types/                  # 공통 타입 정의
```

## 카테고리
- 정치 (POLITICS) → `/category/politics`
- 경제 (ECONOMY) → `/category/economy`
- 사회 (SOCIETY) → `/category/society`
- 생활/문화 (CULTURE) → `/category/culture`
- IT/과학 (TECH) → `/category/tech`
- 세계 (WORLD) → `/category/world`

## 사용자 권한
- **USER**: 일반 회원 (기사 읽기만 가능)
- **WRITER**: 기자/작성자 (기사 작성/수정/삭제)
- **ADMIN**: 관리자 (모든 권한)

> 기사 작성을 원하는 회원은 DB에서 role을 WRITER로 변경해야 합니다.

## 시작하기

### 1. 의존성 설치
\`\`\`bash
npm install
\`\`\`

### 2. 환경변수 설정
\`\`\`bash
cp .env.example .env.local
# .env.local 파일을 열어 DB 정보와 JWT_SECRET 수정
\`\`\`

### 3. MySQL 데이터베이스 생성
\`\`\`sql
CREATE DATABASE iclmag CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

### 4. Prisma 마이그레이션
\`\`\`bash
npm run db:push
\`\`\`

### 5. 개발 서버 실행
\`\`\`bash
npm run dev
\`\`\`

## 배포 (EC2)
\`\`\`bash
npm run build
pm2 start npm --name "iclmag" -- start
\`\`\`
