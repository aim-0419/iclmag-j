# 보안 조치 안내 (읽고 나면 삭제하셔도 됩니다)

작업일: 2026-08-18

코드 쪽 보안 조치는 모두 끝내서 push 했습니다.
**사람이 직접 해야만 하는 일 두 가지**가 남아 있어 여기에 정리합니다.

---

## 1순위. 비밀번호 교체 (가장 중요 · 반드시 필요)

### 무슨 일이 있었나요

`.claude/settings.json` 파일에 아래 두 가지가 **가리지 않은 상태로** 들어 있었고,
그 파일이 GitHub 저장소에 올라가 있었습니다.

| 유출된 것 | 값 |
|-----------|-----|
| MySQL **root 비밀번호** | `.claude/settings.json` 내 `mysql -u root -p'...'` 명령에 포함 |
| 테스트 계정 비밀번호 | 같은 파일의 회원가입 테스트 명령에 포함 |

### 왜 "코드에서 지웠으니 괜찮다"가 아닌가요

git 은 과거 기록을 전부 보관합니다. 최신 파일에서 지워도
**과거 커밋을 열어 보면 그대로 남아 있습니다.**

게다가 한 번 GitHub 에 올라간 값은 아래 이유로 완전 회수가 불가능합니다.

- 저장소를 복제(clone)하거나 포크한 사람의 컴퓨터에 이미 남아 있음
- GitHub 내부에 한동안 남아 커밋 주소로 접근 가능
- 자동 수집 프로그램이 공개 저장소를 실시간으로 훑고 있음

> **그래서 유일하고 확실한 해결책은 "비밀번호를 바꾸는 것"입니다.**
> 아래 2순위(기록 삭제)는 그 다음 문제이고, 비밀번호 교체를 대신하지 못합니다.

### 해야 할 일

**(1) MySQL root 비밀번호 변경** — 개발 PC와 EC2 서버 양쪽 모두

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '새로운-강력한-비밀번호';
FLUSH PRIVILEGES;
```

변경 후 `.env.local` 의 `DATABASE_URL` 도 새 비밀번호로 맞춰 주세요.

**(2) 이왕이면 root 대신 전용 계정 사용을 권장합니다**

root 는 서버의 모든 데이터베이스를 다룰 수 있어, 새면 피해 범위가 너무 큽니다.
이 사이트 전용 계정을 따로 만들면 피해를 이 DB 하나로 묶을 수 있습니다.

```sql
CREATE USER 'iclmag'@'localhost' IDENTIFIED BY '전용-계정-비밀번호';
GRANT SELECT, INSERT, UPDATE, DELETE ON iclmag.* TO 'iclmag'@'localhost';
FLUSH PRIVILEGES;
```

```env
DATABASE_URL="mysql://iclmag:전용-계정-비밀번호@localhost:3306/iclmag"
```

**(3) 유출된 테스트 계정 비밀번호를 다른 곳에서도 쓰고 있다면 함께 변경해 주세요.**

**(4) 변경 후 서버 재시작**

```bash
pm2 restart iclmag-j
```

---

## 2순위. git 과거 기록에서 비밀번호 지우기

과거 기록 삭제는 되돌리기 어려운 작업이라 자동 실행이 차단되었습니다.
아래 명령을 **직접** 실행해 주세요. (1순위를 먼저 끝낸 뒤에 하셔도 됩니다)

### 실행 전 확인

- 다른 사람과 함께 작업 중이라면, 그 사람이 push 할 것이 없는 상태여야 합니다.
- 되돌릴 수 있도록 백업 브랜치를 이미 만들어 두었습니다: `backup/pre-secret-purge`

### 명령

```bash
cd "C:/Users/eldorado/Desktop/폴더/회사 폴더/iclmag_j"

# 1) 과거 모든 커밋에서 .claude 폴더를 삭제
FILTER_BRANCH_SQUELCH_WARNING=1 \
git filter-branch --force --index-filter \
  "git rm -r --cached --ignore-unmatch .claude" \
  --prune-empty --tag-name-filter cat -- --all

# 2) 삭제된 기록의 흔적 정리
rm -rf .git/refs/original
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3) 확인 - 아무것도 안 나와야 정상
git log --all -S "aim64016401" --oneline

# 4) GitHub 에 덮어쓰기
git push origin --force --all
```

### 실행 후

- GitHub 저장소 > Settings > **Secret scanning alerts** 확인
- 되돌리고 싶으면: `git reset --hard backup/pre-secret-purge`
- 다 끝나면 백업 삭제: `git branch -D backup/pre-secret-purge`

---

## 참고. 이번에 코드로 조치한 내용 (완료됨)

| 조치 | 내용 |
|------|------|
| JWT 서명키 폴백 제거 | 키 미설정 시 소스에 적힌 고정값으로 서명하던 문제. 누구나 관리자 토큰 위조 가능했음 |
| 토큰 서명방식 고정 | `HS256` 만 허용해 서명 없는 위조 토큰 차단 |
| 업로드 위장 차단 | 파일 내용까지 검사, 파일명은 서버가 새로 생성 |
| 반복 시도 차단 | 로그인·인증코드·메일발송·가입에 횟수 제한 |
| 보안 응답 헤더 | 클릭재킹·MIME 스니핑·리퍼러 유출 방지, HSTS |
| 재발 방지 | `.claude/` 폴더를 git 추적에서 제외 |
| 배포 안정화 | 빌드 실패 시 서버를 교체하지 않도록 `set -e` 추가 |

### 서버에서 확인해 주실 것

`JWT_SECRET` 이 **설정되어 있지 않거나 아래 값이면 서버가 시작되지 않습니다.**
(위조 가능한 상태로 운영되는 것을 막기 위한 의도된 동작입니다.)

- 값이 비어 있음
- `your-super-secret-jwt-key-change-this-in-production`
- `fallback-secret-key-change-this`
- 32자 미만

서버 로그(`pm2 logs iclmag-j`)에 `[보안 설정 오류]` 가 보이면 아래로 해결합니다.

```bash
# 새 열쇠 생성
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 서버의 .env.local 에 반영 후
pm2 restart iclmag-j
```

> 열쇠를 바꾸면 기존 로그인은 모두 풀립니다. (사용자는 다시 로그인하면 됩니다)

### 추가로 권장하는 것

- 도메인에 **SSL(https) 적용** 후 `.env.local` 의 `NEXT_PUBLIC_APP_URL` 을 https 로 변경
  → 그래야 로그인 쿠키에 `secure` 옵션이 켜지고 HSTS 헤더가 효과를 냅니다.
  현재는 http 라서 로그인 정보가 암호화되지 않은 채 오갑니다.
