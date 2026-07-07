import { useEffect } from "react";

// 저장 성공 등 짧은 확인 피드백을 화면 하단에 잠깐 띄운다. duration 후 자동으로 사라진다.
export default function Toast({ message, onClose, duration = 2200 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <svg
        className="toast-icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 8.5l3 3 7-7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}
