import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import entriesRouter from "./routes/entries.js";
import usersRouter from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// 셋업 확인용 hello 엔드포인트
app.get("/", (req, res) => {
  res.json({ message: "hello from standup-app API" });
});

// 헬스체크 (배포 후 살아있는지 확인용)
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/auth", authRouter);
app.use("/entries", entriesRouter);
app.use("/users", usersRouter);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
