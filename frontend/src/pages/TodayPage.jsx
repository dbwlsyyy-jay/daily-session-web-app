import { useEffect, useState } from "react";
import { api } from "../api.js";
import useAuthedRequest from "../hooks/useAuthedRequest.js";
import Spinner from "../components/Spinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import Toast from "../components/Toast.jsx";
import { todayKST, formatDateForDisplay } from "../lib/kst.js";

export default function TodayPage() {
  const authedRequest = useAuthedRequest();
  const date = todayKST();

  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    authedRequest((token) => api.getMyEntry(token, date))
      .then((entry) => {
        if (cancelled) return;
        setYesterday(entry?.yesterday ?? "");
        setToday(entry?.today ?? "");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "기록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authedRequest((token) => api.saveEntry(token, { date, yesterday, today }));
      setToastMessage("저장되었습니다.");
    } catch (err) {
      setError(err.message ?? "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h2>오늘 작성</h2>
      <p className="date-label">{formatDateForDisplay(date)}</p>

      {loading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSave} className="entry-form">
          <label className="field">
            <span>어제 한 일</span>
            <textarea
              rows={6}
              value={yesterday}
              onChange={(e) => setYesterday(e.target.value)}
              placeholder="어제 진행한 작업을 적어주세요"
            />
          </label>

          <label className="field">
            <span>오늘 할 일</span>
            <textarea
              rows={6}
              value={today}
              onChange={(e) => setToday(e.target.value)}
              placeholder="오늘 진행할 작업을 적어주세요"
            />
          </label>

          <ErrorBanner message={error} />

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </button>
        </form>
      )}

      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </div>
  );
}
