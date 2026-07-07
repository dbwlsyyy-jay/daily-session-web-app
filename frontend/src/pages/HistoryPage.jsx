import { useEffect, useState } from "react";
import { api } from "../api.js";
import useAuthedRequest from "../hooks/useAuthedRequest.js";
import MultilineText from "../components/MultilineText.jsx";
import Spinner from "../components/Spinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import ChevronIcon from "../components/ChevronIcon.jsx";
import Toast from "../components/Toast.jsx";
import { toKSTDateString, formatDateForDisplay } from "../lib/kst.js";

export default function HistoryPage() {
  const authedRequest = useAuthedRequest();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDate, setOpenDate] = useState(null);
  const [editingDate, setEditingDate] = useState(null);
  const [draft, setDraft] = useState({ yesterday: "", today: "" });
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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

  function startEdit(entry, dateStr) {
    setEditingDate(dateStr);
    setDraft({ yesterday: entry.yesterday ?? "", today: entry.today ?? "" });
    setEditError("");
  }

  function toggleOpen(dateStr) {
    setOpenDate((current) => (current === dateStr ? null : dateStr));
    setEditingDate(null);
    setEditError("");
  }

  async function handleEditSave(e, dateStr) {
    e.preventDefault();
    setSavingEdit(true);
    setEditError("");
    try {
      await authedRequest((token) =>
        api.saveEntry(token, { date: dateStr, yesterday: draft.yesterday, today: draft.today })
      );
      setEntries((prev) =>
        prev.map((entry) =>
          toKSTDateString(entry.date) === dateStr
            ? { ...entry, yesterday: draft.yesterday, today: draft.today }
            : entry
        )
      );
      setEditingDate(null);
      setToastMessage("저장되었습니다.");
    } catch (err) {
      setEditError(err.message ?? "저장에 실패했습니다.");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="card">
      <h2>내 기록</h2>

      {loading && <Spinner />}
      <ErrorBanner message={error} />
      {!loading && !error && entries.length === 0 && (
        <EmptyState message="아직 작성된 기록이 없어요." />
      )}

      <ul className="history-list">
        {entries.map((entry) => {
          const dateStr = toKSTDateString(entry.date);
          const isOpen = openDate === dateStr;
          const summary = (entry.today || entry.yesterday || "").split("\n")[0];

          const isEditing = editingDate === dateStr;

          return (
            <li key={dateStr} className="history-item">
              <button
                type="button"
                className="history-toggle"
                aria-expanded={isOpen}
                onClick={() => toggleOpen(dateStr)}
              >
                <span className="history-date">{formatDateForDisplay(dateStr)}</span>
                <span className="history-summary">{summary || "내용 없음"}</span>
                <ChevronIcon open={isOpen} />
              </button>

              <div className={`history-detail-wrapper${isOpen ? " open" : ""}`}>
                <div className="history-detail">
                  {isEditing ? (
                    <form
                      className="history-edit-form"
                      onSubmit={(e) => handleEditSave(e, dateStr)}
                    >
                      <label className="field">
                        <span>어제 한 일</span>
                        <textarea
                          rows={4}
                          value={draft.yesterday}
                          onChange={(e) => setDraft((d) => ({ ...d, yesterday: e.target.value }))}
                        />
                      </label>
                      <label className="field">
                        <span>오늘 할 일</span>
                        <textarea
                          rows={4}
                          value={draft.today}
                          onChange={(e) => setDraft((d) => ({ ...d, today: e.target.value }))}
                        />
                      </label>
                      <ErrorBanner message={editError} />
                      <div className="history-edit-actions">
                        <button type="submit" className="btn-primary" disabled={savingEdit}>
                          {savingEdit ? "저장 중..." : "저장"}
                        </button>
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => setEditingDate(null)}
                        >
                          취소
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
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
                      <button
                        type="button"
                        className="btn-link history-edit-trigger"
                        onClick={() => startEdit(entry, dateStr)}
                      >
                        수정
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </div>
  );
}
