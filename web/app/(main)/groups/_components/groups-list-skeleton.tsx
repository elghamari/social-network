export default function GroupListSkeleton() {
  return (
    <div className="groups-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="group-card group-card--skeleton">
          <div className="skeleton group-card__cover" />
          <div className="group-card__content">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--line-short" />
            <div className="group-card__footer">
              <div className="skeleton skeleton--badge" />
              <div className="skeleton skeleton--btn" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
