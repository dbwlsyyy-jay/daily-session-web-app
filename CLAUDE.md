# CLAUDE.md — 사내 데일리 세션 웹앱

Claude Code는 이 파일을 매 세션 자동으로 읽는다. 아래 규칙을 항상 지킬 것.

## 프로젝트 한 줄

각 직원이 매일 "어제 한 일 / 오늘 할 일"을 기록하고, 팀이 날짜별로 모아보는 웹앱. 온보딩 과제이며 오늘 안(수 시간)에 MVP 완성이 목표.

## ⚠️ 보안 규칙 (최우선 — 위반은 채점 감점)

1. **시크릿 값을 절대 출력·커밋하지 않는다.** DB 비밀번호, JWT 시크릿, PEM 키 내용을 코드·로그·커밋 메시지·터미널 출력에 넣지 말 것. 실제 값은 사람이 직접 `.env`에 넣는다. 너는 `.env.example`에 이름/용도만 관리한다.
2. **`.env`, `*.pem`, `node_modules`는 커밋 금지.** 이미 `.gitignore`에 있음. 커밋 전 `git status`로 이 파일들이 스테이징에 없는지 확인.
3. **RDS는 퍼블릭 접근 차단, EC2 경유로만 접속.** RDS 접속 정보를 프론트에 절대 넣지 않는다.
4. **프론트 번들에 시크릿 금지.** 프론트 env엔 `VITE_API_URL`(API 주소)만. DB 비번·JWT 시크릿은 백엔드에만.
5. **AWS 작업은 onboarding-test-3 계정에서만.** 회사 prod 리소스는 건드리지 않는다.
6. AWS 콘솔 설정 변경, `git push`, 시크릿 입력 등 사람 인증이 필요한 작업은 **명령어/절차만 안내하고 사람이 직접 실행**하게 한다.

## 기술 스택 (확정)

- 프론트: React + Vite (정적 빌드 → Vercel)
- 백엔드: Express (Node.js, ESM) + JWT 인증 (EC2, pm2)
- DB: RDS MySQL (드라이버: `mysql2/promise`)
- 인증: JWT (Authorization: Bearer), 비밀번호 bcrypt 해시

## 데이터 모델 (schema.sql 참고)

**users**: id BIGINT PK AI / email VARCHAR(255) UNIQUE NOT NULL / password_hash VARCHAR(255) NOT NULL (bcrypt) / name VARCHAR(100) NOT NULL / created_at DATETIME

**standup_entries**: id BIGINT PK AI / user_id BIGINT FK→users.id / date DATE / yesterday TEXT / today TEXT / created_at / updated_at (ON UPDATE) / **UNIQUE(user_id, date)**
- 하루 한 행. 저장은 UPSERT: `INSERT ... ON DUPLICATE KEY UPDATE`
- 어제/오늘 여러 줄은 TEXT + 줄바꿈으로 저장. 렌더링할 때만 `\n`으로 쪼갠다. charset utf8mb4.

## API 엔드포인트

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | /auth/signup | 회원가입 (email, password, name) | X |
| POST | /auth/login | 로그인 → { token } | X |
| GET | /entries/me?date=YYYY-MM-DD | 내 특정 날짜 기록 | O |
| PUT | /entries | 오늘 작성/수정 (body: date, yesterday, today) UPSERT | O |
| GET | /entries?date=YYYY-MM-DD | 그날 전원 기록 (각 항목에 작성자 name 포함) | O |
| GET | /entries/me/history | 내 지난 기록, date 내림차순 | O |

- 응답은 JSON. 에러는 적절한 HTTP 상태코드 + `{ error: "메시지" }`.
- 날짜 기준 KST. 서버에서 오늘 날짜 계산 시 KST 기준.
- 비밀번호는 최소 8자만 검증. 이메일 형식 최소 검증.

## 화면 (React, 4개)

1. 로그인 / 회원가입 — 이메일·비번(·이름). 로그인 성공 시 토큰 저장(localStorage), 오늘 작성으로 이동.
2. 오늘 작성 — 어제/오늘 textarea 2개. 진입 시 오늘 내 기록 불러와 채움(있으면). 저장 = PUT(UPSERT).
3. 날짜별 팀 뷰 — 날짜 선택(기본 오늘) → 그날 전원 카드 [이름 / 어제 / 오늘].
4. 내 기록 — 내 지난 기록 리스트, 날짜 내림차순.

- 로그인 후 상단 네비게이션으로 2~4 이동. 토큰 없으면 로그인으로 리다이렉트.
- 스타일링은 최소한, 기능 우선. textarea 내용 렌더 시 XSS 주의(React 기본 이스케이프 사용, dangerouslySetInnerHTML 금지).

## 폴더 구조

```
backend/    Express API (index.js, db.js, routes/, middleware/)
frontend/   React + Vite (src/)
schema.sql  DB 테이블 생성
README.md   실행/배포 방법
CLAUDE.md   이 파일
```

## 작업 순서 (블록마다 끝나면 멈추고 사람에게 검증 요청)

1. **백엔드 구현** — mysql2 연결(db.js), 인증(signup/login + JWT 미들웨어), entries CRUD. `.env.example`에 필요한 키 추가. → 로컬에서 curl로 전부 검증 후 멈춤.
2. (사람) RDS에 schema.sql 실행 + 백엔드 로컬 연결 확인.
3. (사람) EC2 배포 (pm2). 절차 안내.
4. **프론트 구현** — 4개 화면 + API 연동. → 로컬 동작 확인 후 멈춤.
5. (사람) Vercel 배포. CORS 확인.
6. README(실행/배포) 마무리.

각 블록이 끝나면 무엇을 어떻게 검증하면 되는지(예: 실행할 curl 명령) 알려주고, 다음으로 넘어가기 전에 사람의 확인을 기다린다. 한 번에 전부 만들지 말 것.

## 완료 조건 (채점)

- [ ] 공개 URL → 로그인 → 오늘 어제/오늘 작성·수정
- [ ] 날짜 선택 → 그날 전원 기록 표시
- [ ] 내 지난 기록 조회
- [ ] RDS 퍼블릭 노출 없음, 시크릿 git/프론트 노출 없음
