export default function ShimmerLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass rounded-2xl p-5 space-y-4 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="flex justify-between">
            <div className="space-y-2 flex-1">
              <div className="shimmer h-5 w-3/4 rounded-lg" />
              <div className="shimmer h-3 w-1/2 rounded-lg" />
            </div>
            <div className="shimmer h-8 w-8 rounded-xl" />
          </div>
          <div className="shimmer h-3 w-full rounded-lg" />
          <div className="space-y-2">
            <div className="flex justify-between"><div className="shimmer h-3 w-24 rounded" /><div className="shimmer h-3 w-10 rounded" /></div>
            <div className="shimmer h-1.5 w-full rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="shimmer h-6 w-16 rounded-lg" />
            <div className="shimmer h-6 w-16 rounded-lg" />
            <div className="shimmer h-6 w-16 rounded-lg" />
          </div>
          <div className="shimmer h-10 w-full rounded-xl" />
          <div className="flex gap-2">
            <div className="shimmer h-10 flex-1 rounded-xl" />
            <div className="shimmer h-10 flex-1 rounded-xl" />
          </div>
        </div>
      ))}
      <div className="col-span-full flex items-center justify-center gap-3 py-4">
        <div className="spinner w-5 h-5" />
        <p className="text-sm text-muted">AI is cooking up recipes for you...</p>
      </div>
    </div>
  );
}
