import { useEffect, useState } from "react";
import { api } from "../api.js";
import useAuthedRequest from "../hooks/useAuthedRequest.js";
import MultilineText from "../components/MultilineText.jsx";
import { toKSTDateString, formatDateForDisplay } from "../lib/kst.js";

export default function HistoryPage() {
  const authedRequest = useAuthedRequest();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDate, setOpenDate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    authedRequest((token) => api.getMyHistory(token))
      .then((data) => {
        if (!cancelled) setEntries(data ?? []);
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
  }, []);

  return (
    <div className="card">
      <h2>내 기록</h2>

      {loading && <p className="loading-text">불러오는 중...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && entries.length === 0 && (
        <p className="empty-text">아직 작성한 기록이 없습니다.</p>
      )}

      <ul className="history-list">
        {entries.map((entry) => {
          const dateStr = toKSTDateString(entry.date);
          const isOpen = openDate === dateStr;
          const summary = (entry.today || entry.yesterday || "").split("\n")[0];

          return (
            <li key={dateStr} className="history-item">
              <button
                type="button"
                className="history-toggle"
                onClick={() => setOpenDate(isOpen ? null : dateStr)}
              >
                <span className="history-date">{formatDateForDisplay(dateStr)}</span>
                <span className="history-summary">{summary || "내용 없음"}</span>
              </button>

              {isOpen && (
                <div className="history-detail">
                  <div className="entry-section">
                    <span className="entry-label">어제 한 일</span>
                    <p>
                      <MultilineText text={entry.yesterday} />
                    </p>
                  </div>
                  <div className="entry-section">
                    <span className="entry-label">오늘 할 일</span>
                    <p>
                      <MultilineText text={entry.today} />
                    </p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
