import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { isValidDateString, todayKST } from "../lib/kst.js";

const router = Router();

router.put("/", requireAuth, async (req, res) => {
  const { date, yesterday, today } = req.body ?? {};
  const targetDate = date || todayKST();

  if (!isValidDateString(targetDate)) {
    return res.status(400).json({ error: "date는 YYYY-MM-DD 형식이어야 합니다." });
  }

  try {
    await pool.query(
      `INSERT INTO standup_entries (user_id, date, yesterday, today)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE yesterday = VALUES(yesterday), today = VALUES(today)`,
      [req.userId, targetDate, yesterday ?? "", today ?? ""]
    );
    res.json({ date: targetDate, yesterday: yesterday ?? "", today: today ?? "" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "기록 저장 중 오류가 발생했습니다." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const date = req.query.date || todayKST();

  if (!isValidDateString(date)) {
    return res.status(400).json({ error: "date는 YYYY-MM-DD 형식이어야 합니다." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT date, yesterday, today FROM standup_entries WHERE user_id = ? AND date = ?",
      [req.userId, date]
    );
    res.json(rows[0] ?? null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "기록 조회 중 오류가 발생했습니다." });
  }
});

router.get("/me/history", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT date, yesterday, today FROM standup_entries WHERE user_id = ? ORDER BY date DESC",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "기록 조회 중 오류가 발생했습니다." });
  }
});

router.get("/", requireAuth, async (req, res) => {
  const date = req.query.date || todayKST();

  if (!isValidDateString(date)) {
    return res.status(400).json({ error: "date는 YYYY-MM-DD 형식이어야 합니다." });
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.name AS name, e.yesterday, e.today
       FROM standup_entries e
       JOIN users u ON u.id = e.user_id
       WHERE e.date = ?
       ORDER BY u.name ASC`,
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "기록 조회 중 오류가 발생했습니다." });
  }
});

export default router;
