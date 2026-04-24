export default function LayoutSkeleton() {
  return (
    <div className="gd">
      <div
        className="skeleton gd__cover"
        style={{ borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }}
      />

      <div className="gd__info">
        <div className="gd__info-text">
          <div
            className="skeleton"
            style={{ height: 26, width: "40%", marginBottom: 12 }}
          />
          <div
            className="skeleton"
            style={{ height: 14, width: "80%", marginBottom: 6 }}
          />
          <div
            className="skeleton"
            style={{ height: 14, width: "60%", marginBottom: 10 }}
          />
          <div className="skeleton" style={{ height: 13, width: 80 }} />
        </div>
        <div
          className="skeleton"
          style={{
            height: 42,
            width: 100,
            borderRadius: "var(--radius-md)",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Sections tabs */}
      <div className="gd__sections" style={{ marginTop: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 14, width: 70, margin: "12px 16px" }}
          />
        ))}
      </div>
    </div>
  );
}
