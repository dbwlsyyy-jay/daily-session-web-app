import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 셋업 확인용 hello 엔드포인트
app.get("/", (req, res) => {
  res.json({ message: "hello from standup-app API" });
});

// 헬스체크 (배포 후 살아있는지 확인용)
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// TODO: 다음 블록에서 추가
// - POST /auth/signup, POST /auth/login
// - PUT /entries, GET /entries, GET /entries/me, GET /entries/me/history

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
