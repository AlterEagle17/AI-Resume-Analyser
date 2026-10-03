function formatDate(dateValue) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

export default function RecentAnalyses({ analyses, loading, error }) {
  return (
    <section aria-labelledby="recent-analyses-heading" className="mt-8">
      <div className="flex items-baseline justify-between gap-4 border-b border-stone-300 pb-3">
        <h2 className="font-serif text-2xl" id="recent-analyses-heading">Recent Analyses</h2>
        <span className="text-xs text-stone-500">Latest 10</span>
      </div>
      {loading && <p className="py-4 text-sm text-stone-500">Loading history...</p>}
      {!loading && error && <p className="py-4 text-sm text-stone-500">History is temporarily unavailable.</p>}
      {!loading && !error && analyses.length === 0 && (
        <p className="py-4 text-sm text-stone-500">No saved analyses yet.</p>
      )}
      {!loading && !error && analyses.length > 0 && (
        <ul className="divide-y divide-stone-200">
          {analyses.map((analysis) => (
            <li className="flex items-start justify-between gap-4 py-4" key={`${analysis.createdAt}-${analysis.targetRole}`}>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{analysis.targetRole}</p>
                <p className="mt-1 text-xs text-stone-500">{formatDate(analysis.createdAt)}</p>
              </div>
              <p className="shrink-0 text-right text-sm font-medium text-stone-700">
                {analysis.fallback ? 'Skill match only' : `Score: ${analysis.score}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
