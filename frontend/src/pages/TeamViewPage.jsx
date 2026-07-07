import { useEffect, useState } from "react";
import { api } from "../api.js";
import useAuthedRequest from "../hooks/useAuthedRequest.js";
import MultilineText from "../components/MultilineText.jsx";
import Modal from "../components/Modal.jsx";
import Spinner from "../components/Spinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import { todayKST, formatDateForDisplay } from "../lib/kst.js";

export default function TeamViewPage() {
  const authedRequest = useAuthedRequest();
  const [date, setDate] = useState(todayKST());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setSelected(null);

    authedRequest((token) => api.getTeamEntries(token, date))
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <div>
      <div className="card team-header">
        <h2>날짜별 팀 뷰</h2>
        <label className="field inline">
          <span>날짜</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <p className="date-label">{formatDateForDisplay(date)}</p>
      </div>

      {loading && <Spinner />}
      <ErrorBanner message={error} />
      {!loading && !error && entries.length === 0 && (
        <EmptyState icon="📭" message="이 날짜엔 아직 작성된 기록이 없어요." />
      )}

      <div className="card-grid">
        {entries.map((entry, i) => (
          <div
            className="card team-card"
            key={`${entry.name}-${i}`}
            role="button"
            tabIndex={0}
            onClick={() => setSelected(entry)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected(entry);
              }
            }}
          >
            <h3>{entry.name}</h3>
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
        ))}
      </div>

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <h3>{selected.name}</h3>
          <div className="entry-section">
            <span className="entry-label">어제 한 일</span>
            <p>
              <MultilineText text={selected.yesterday} />
            </p>
          </div>
          <div className="entry-section">
            <span className="entry-label">오늘 할 일</span>
            <p>
              <MultilineText text={selected.today} />
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
