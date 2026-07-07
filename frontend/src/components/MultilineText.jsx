// 줄바꿈(\n)이 포함된 텍스트를 안전하게(React 기본 이스케이프) 렌더링한다.
// dangerouslySetInnerHTML을 쓰지 않아 XSS로부터 안전하다.
export default function MultilineText({ text }) {
  const lines = (text ?? "").split("\n");

  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}
