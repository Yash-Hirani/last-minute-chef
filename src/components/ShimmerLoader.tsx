export default function ShimmerLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-surface-container-lowest shadow-ambient-1 p-5">
          {/* Title */}
          <div className="h-5 shimmer rounded-lg w-2/3 mb-3" />
          <div className="h-3 shimmer rounded-lg w-1/3 mb-5" />
          {/* Description */}
          <div className="h-3 shimmer rounded-lg w-full mb-2" />
          <div className="h-3 shimmer rounded-lg w-4/5 mb-5" />
          {/* Match bar */}
          <div className="h-2 shimmer rounded-full w-full mb-4" />
          {/* Chips */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-7 shimmer rounded-full w-16" />
            ))}
          </div>
          {/* Footer */}
          <div className="pt-4 border-t border-outline-variant/15 flex gap-3 justify-end">
            <div className="h-9 shimmer rounded-full w-28" />
            <div className="h-9 shimmer rounded-full w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
