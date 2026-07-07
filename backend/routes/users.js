import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name FROM users ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "사용자 목록 조회 중 오류가 발생했습니다." });
  }
});

export default router;
