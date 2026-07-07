import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "올바른 이메일 형식이 아닙니다." });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "비밀번호는 8자 이상이어야 합니다." });
  }
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "이름을 입력하세요." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
      [email, passwordHash, name.trim()]
    );
    res.status(201).json({ id: result.insertId, email, name: name.trim() });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "이미 가입된 이메일입니다." });
    }
    console.error(err);
    res.status(500).json({ error: "회원가입 처리 중 오류가 발생했습니다." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "이메일과 비밀번호를 입력하세요." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, password_hash FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0];
    const match = user && (await bcrypt.compare(password, user.password_hash));
    if (!match) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "로그인 처리 중 오류가 발생했습니다." });
  }
});

export default router;
