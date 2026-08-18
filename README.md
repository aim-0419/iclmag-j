# 이끌림필라테스매거진 (ICL MAG-J)

기사를 작성·발행하고 독자가 카테고리별로 읽을 수 있는 온라인 매거진 홈페이지입니다.

- 독자: 회원가입 → 이메일 인증 → 기사 열람
- 관리자: 기사 작성 · 수정 · 삭제, 썸네일 이미지 업로드

---

## 1. 무엇으로 만들어졌나요

| 구분 | 사용 기술 | 하는 일 |
|------|-----------|---------|
| 화면 + 서버 | **Next.js 15** (App Router) | 화면을 그리고 서버 기능도 함께 처리합니다 |
| 언어 | **TypeScript** | 오타·타입 실수를 실행 전에 잡아 줍니다 |
| 데이터 저장 | **MySQL + Prisma** | 회원과 기사를 저장합니다 |
| 디자인 | **Tailwind CSS** | 색상·여백·반응형 화면을 담당합니다 |
| 로그인 | **JWT (httpOnly 쿠키)** | 로그인 상태를 안전하게 유지합니다 |
| 메일 발송 | **Nodemailer (SMTP)** | 인증 코드·비밀번호 재설정 메일을 보냅니다 |

---

## 2. 화면 구성

| 주소 | 화면 | 누가 볼 수 있나요 |
|------|------|-------------------|
| `/` | 홈 (대표 기사 + 최신 기사) | 누구나 |
| `/articles` | 전체 기사 목록 | 누구나 |
| `/articles/[번호]` | 기사 상세 | 누구나 |
| `/category/[분야]` | 카테고리별 목록 | 누구나 |
| `/policy/[문서]` | 약관·법적고지 | 누구나 |
| `/login`, `/register` | 로그인 / 회원가입 | 누구나 |
| `/verify-email` | 이메일 인증 | 가입한 사람 |
| `/reset-password` | 새 비밀번호 설정 | 메일 링크로 들어온 사람 |
| `/mypage` | 내 정보 수정 · 회원탈퇴 | 로그인한 회원 |
| `/write` | 기사 작성 | **관리자만** |

### 카테고리

정치(`politics`) · 경제(`economy`) · 사회(`society`) · 생활/문화(`culture`) · IT/과학(`tech`) · 세계(`world`)

### 회원 권한

| 권한 | 설명 |
|------|------|
| `USER` | 일반 회원. 기사를 읽을 수 있습니다. **회원가입 시 기본값** |
| `WRITER` | 예전 데이터 호환용. 기사 작성 권한은 없습니다 |
| `ADMIN` | 관리자. 기사 작성·수정·삭제, 이미지 업로드 가능 |

> **관리자 임명 방법**: 데이터베이스의 `users` 테이블에서 해당 계정의 `role` 값을 `ADMIN` 으로 바꾸면 됩니다.
> ```sql
> UPDATE users SET role = 'ADMIN' WHERE email = '관리자이메일@example.com';
> ```

---

## 3. 폴더 구조

기능이 어디에 있는지 바로 찾을 수 있도록 역할별로 나누어 두었습니다.

```
src/
├── app/                        화면 주소와 서버 기능 (Next.js 라우팅)
│   ├── api/                    서버 기능 (브라우저가 호출하는 창구)
│   │   ├── auth/               로그인·회원가입·이메일 인증·비밀번호 찾기
│   │   ├── articles/           기사 목록·등록·수정·삭제
│   │   ├── user/               내 정보 수정·회원탈퇴
│   │   └── upload/             이미지 업로드
│   ├── (auth)/                 로그인·회원가입 화면
│   ├── articles/               전체 기사 목록 + 기사 상세
│   ├── category/[slug]/        카테고리별 기사 목록
│   ├── policy/[type]/          약관·법적고지
│   ├── mypage/                 마이페이지
│   ├── write/                  기사 작성 (관리자)
│   ├── layout.tsx              모든 화면의 공통 틀 (헤더 + 내용 + 푸터)
│   └── globals.css             전체 공통 디자인
│
├── backend/                    서버 쪽 실제 처리 로직
│   ├── lib/
│   │   ├── db.ts               데이터베이스 연결
│   │   ├── env.ts              환경변수 안전성 검사 (비밀 열쇠 검증)
│   │   ├── jwt.ts              로그인 증명서 발급·검증
│   │   ├── rateLimit.ts        반복 시도 차단 (무차별 대입 방어)
│   │   ├── email.ts            안내 메일 발송
│   │   └── apiResponse.ts      서버 응답 형식 통일
│   ├── middleware/auth.ts      로그인·관리자 여부 확인
│   └── services/               기능별 처리 (기사·회원·이메일인증·비밀번호재설정)
│
├── frontend/                   화면을 이루는 부품들
│   ├── components/
│   │   ├── layout/             헤더, 푸터
│   │   ├── articles/           기사 카드·격자·에디터·삭제버튼·복사방지
│   │   ├── auth/               로그인 카드, 인증코드 폼, 찾기 팝업
│   │   └── common/             페이지 이동 버튼, 팝업 틀, 빈 화면 안내
│   └── hooks/useAuth.ts        로그인 상태 확인 도구
│
├── constants/                  자주 바뀌는 설정값 (여기만 고치면 전체 반영)
│   ├── categories.ts           카테고리 목록·한글이름·색상
│   └── site.ts                 매체명·발행인·주소·대표번호
│
├── content/policies.ts         약관 본문 전체
└── types/index.ts              공통 타입 정의
```

### 자주 바뀌는 값은 어디서 고치나요

| 바꾸고 싶은 것 | 고칠 파일 |
|----------------|-----------|
| 발행인·주소·전화번호·저작권 문구 | `src/constants/site.ts` |
| 약관 문구 (개인정보처리방침 등) | `src/content/policies.ts` |
| 카테고리 추가·삭제·이름 변경 | `src/constants/categories.ts` (+ `prisma/schema.prisma`) |
| 사이트 색상 | `tailwind.config.ts` |
| 한 페이지에 보여 줄 기사 수 | `src/backend/services/articleService.ts` 의 `PAGE_SIZE` |
| 로그인 등 반복 시도 허용 횟수 | `src/backend/lib/rateLimit.ts` 의 `RATE_LIMITS` |

---

## 4. 처음 실행하는 방법

### 1) 필요한 프로그램 설치

- Node.js 20 이상
- MySQL 8 이상

### 2) 소스 내려받기 & 라이브러리 설치

```bash
git clone https://github.com/aim-0419/iclmag-j.git
cd iclmag-j
npm install
```

### 3) 환경변수 파일 만들기

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 아래 값을 채웁니다.

```env
# 데이터베이스 (mysql://아이디:비밀번호@주소:포트/DB이름)
DATABASE_URL="mysql://root:비밀번호@localhost:3306/iclmag"

# 로그인 증명서 서명용 비밀 열쇠 (32자 이상 무작위 문자열)
JWT_SECRET="여기에-길고-무작위한-문자열을-넣으세요"
JWT_EXPIRES_IN="7d"

# 사이트 주소 (실제 배포 시 https 주소로 변경)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 메일 발송 계정 (Gmail 사용 시 앱 비밀번호 필요)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="465"
EMAIL_USER="보내는계정@gmail.com"
EMAIL_PASS="앱-비밀번호"
EMAIL_FROM="이끌림필라테스매거진 <보내는계정@gmail.com>"
```

> `.env.local` 은 비밀번호가 들어 있어 git 에 올라가지 않습니다. 절대 공유하지 마세요.

### 4) 데이터베이스 만들기

```sql
CREATE DATABASE iclmag CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5) 테이블 생성

```bash
npm run db:push
```

### 6) 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속합니다.

---

## 5. 자주 쓰는 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (코드를 고치면 화면이 자동 새로고침) |
| `npm run build` | 배포용으로 최적화해서 빌드 |
| `npm run start` | 빌드된 결과물로 서버 실행 |
| `npm run db:push` | 스키마 변경 내용을 데이터베이스에 반영 |
| `npm run db:studio` | 브라우저로 데이터베이스 내용 확인·수정 |
| `npm run db:generate` | Prisma 관련 코드 다시 생성 |

---

## 6. 배포

`main` 브랜치에 push 하면 GitHub Actions가 자동으로 EC2 서버에 배포합니다.
(설정 파일: `.github/workflows/deploy.yml`)

배포 시 서버에서 실행되는 작업:

```bash
set -e            # 한 단계라도 실패하면 즉시 중단
git pull origin main
npm ci
npx prisma generate
npm run build     # 빌드가 실패하면 여기서 멈춤
pm2 restart iclmag-j
```

> `set -e` 덕분에 빌드가 실패하면 서버를 교체하지 않습니다.
> 즉 배포가 실패해도 **기존에 돌아가던 사이트는 그대로 유지**됩니다.

### 서버에 처음 올릴 때

```bash
npm run build
pm2 start npm --name "iclmag-j" -- start
pm2 save
```

> **주의**: 업로드된 이미지는 서버의 `public/uploads/` 폴더에 저장되며 git 에 포함되지 않습니다.
> 서버를 옮길 때는 이 폴더를 함께 복사해야 기존 기사의 이미지가 유지됩니다.

---

## 7. 보안

### 적용되어 있는 보호 장치

| 항목 | 방법 |
|------|------|
| 비밀번호 보관 | bcrypt 로 알아볼 수 없게 변환해 저장 (원문 저장 안 함) |
| 로그인 유지 | JWT 를 `httpOnly` 쿠키에 저장해 자바스크립트가 읽지 못하게 함 |
| 서명 방식 고정 | 토큰 검증 시 `HS256` 만 허용 (서명 없는 위조 토큰 차단) |
| 비밀 열쇠 검증 | 서버 시작 시 `JWT_SECRET` 이 없거나 공개된 예시값이면 **실행을 중단** |
| 위조 요청 방지 | 쿠키에 `sameSite: lax` 적용 |
| 권한 확인 | 화면뿐 아니라 **서버 API에서 다시 한 번** 관리자 여부 확인 |
| 입력값 검사 | 화면과 서버 양쪽에서 검사 |
| 반복 시도 차단 | 로그인·인증코드·메일발송·가입에 횟수 제한 (아래 표) |
| 계정 존재 노출 방지 | 비밀번호 찾기·인증코드 재발송은 가입 여부와 상관없이 같은 응답 |
| 이메일 인증 | 인증을 마치기 전에는 로그인 불가 (코드 10분 유효) |
| 비밀번호 재설정 | 무작위 64자리 열쇠, 30분 후 만료, 1회용 |
| 업로드 검증 | 종류·크기 확인 + **파일 내용의 시그니처 확인** + 파일명을 서버가 새로 생성 |
| 보안 응답 헤더 | 클릭재킹·MIME 스니핑·리퍼러 유출 방지, HSTS |

### 반복 시도 제한 기준

| 기능 | 제한 |
|------|------|
| 로그인 | 10분에 10번 (성공하면 초기화) |
| 이메일 인증코드 확인 | 10분에 10번 |
| 인증코드 재발송 / 비밀번호 찾기 | 10분에 5번 |
| 아이디 찾기 | 10분에 10번 |
| 회원가입 | 1시간에 5번 |

> 시도 기록은 서버 메모리에 보관됩니다. 서버를 재시작하면 초기화되며,
> 서버를 여러 대로 늘릴 경우 Redis 같은 공용 저장소로 옮겨야 합니다.
> 설정 위치: `src/backend/lib/rateLimit.ts` 의 `RATE_LIMITS`

### 절대 git 에 올리면 안 되는 것

`.gitignore` 로 차단되어 있습니다.

- `.env`, `.env.local` — DB 비밀번호, JWT 열쇠, 메일 계정 비밀번호
- `.claude/` — 승인한 명령어가 그대로 기록되며, 그 안에 비밀번호가 들어갈 수 있습니다

> **과거 사례**: `.claude/settings.json` 에 MySQL root 비밀번호가 평문으로 담긴 채
> 공개 저장소에 커밋된 적이 있습니다. 해당 기록은 git 히스토리에서 제거했고,
> 재발 방지를 위해 `.claude/` 폴더 전체를 추적 대상에서 제외했습니다.

### 서버 운영 시 확인할 것

1. **`JWT_SECRET` 은 반드시 무작위 값으로 설정**해야 합니다. 설정하지 않으면 서버가 시작되지 않습니다.
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
2. **도메인에 SSL(https)을 적용**하고 `NEXT_PUBLIC_APP_URL` 을 https 주소로 바꿔 주세요.
   https 일 때만 로그인 쿠키에 `secure` 옵션이 켜지고 HSTS 헤더가 효과를 냅니다.
3. **DB 계정은 root 대신 전용 계정**을 만들어 이 데이터베이스에만 권한을 주는 것을 권장합니다.
   ```sql
   CREATE USER 'iclmag'@'localhost' IDENTIFIED BY '강력한비밀번호';
   GRANT SELECT, INSERT, UPDATE, DELETE ON iclmag.* TO 'iclmag'@'localhost';
   ```

---

## 8. 화면 반응형 기준

| 화면 크기 | 기사 목록 배치 | 상단 메뉴 |
|-----------|----------------|-----------|
| 휴대폰 (~640px) | 1줄에 1개 | 햄버거 버튼으로 펼침 |
| 태블릿 (640~1024px) | 1줄에 2개 | 항상 표시 |
| 노트북 (1024~1280px) | 1줄에 3개 | 항상 표시 |
| 큰 모니터 (1280px~) | 1줄에 4개 | 항상 표시 |

카테고리가 화면 너비를 넘칠 때는 옆으로 밀어서 볼 수 있고,
기사가 많아져 페이지가 늘어나도 페이지 번호는 `1 … 4 5 6 … 20` 형태로 줄여서 표시하므로
가로 스크롤이 생기지 않습니다.
