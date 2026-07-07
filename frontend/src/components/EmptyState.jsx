export default function EmptyState({ icon = "🗒️", message }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">
        {icon}
      </span>
      <p className="empty-text">{message}</p>
    </div>
  );
}
