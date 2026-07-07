# 사내 데일리 세션 웹앱

각 직원이 매일 "어제 한 일 / 오늘 할 일"을 기록하고, 팀이 날짜별로 모아보는 웹앱.

## 스택
- 프론트: React + Vite (Vercel)
- 백엔드: Express + JWT (EC2)
- DB: RDS MySQL (퍼블릭 차단, EC2 경유 접속)

## 폴더
```
backend/    Express API 서버
frontend/   React + Vite
schema.sql  DB 테이블 생성 스크립트
```

## 로컬 실행 (backend)
```bash
cd backend
cp .env.example .env    # .env 에 실제 값 채우기 (커밋 금지)
npm install
npm run dev             # http://localhost:4000
```

## 로컬 실행 (frontend)
```bash
cd frontend
cp .env.example .env    # VITE_API_URL 설정
npm install
npm run dev             # http://localhost:5173
```

## 배포
- 백엔드: EC2에 배포, pm2로 실행 (상세는 배포 블록에서 작성)
- 프론트: Vercel 연결, 환경변수 VITE_API_URL = EC2 공개 URL

## 완료 조건
- [ ] 공개 URL → 로그인 → 오늘 어제/오늘 작성·수정
- [ ] 날짜 선택 → 그날 전원 기록 표시
- [ ] 내 지난 기록 조회
- [ ] RDS 퍼블릭 노출 없음, 시크릿 git/프론트 노출 없음
