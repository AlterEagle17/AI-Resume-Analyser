export default function AnalysisResult({ analysis, onAnalyseAnother }) {
  const isFallback = analysis.fallback === true;

  return (
    <section aria-labelledby="result-title" className="space-y-4">
      {isFallback && (
        <div
          aria-live="polite"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          AI analysis is temporarily unavailable. This result is a skill match only.
        </div>
      )}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <div className={`flex flex-col gap-5 ${isFallback ? '' : 'sm:flex-row sm:items-center sm:justify-between'}`}>
          {!isFallback && (
            <div>
              <p className="text-xs font-bold uppercase text-emerald-800">Resume score</p>
              <h2 className="mt-2 flex items-baseline gap-2" id="result-title">
                <span className="font-serif text-6xl leading-none">{analysis.score}</span>
                <span className="text-lg text-stone-500">/100</span>
              </h2>
            </div>
          )}
          <div className={isFallback ? '' : 'sm:text-right'}>
            {isFallback ? (
              <h2 className="font-serif text-2xl" id="result-title">{analysis.verdict}</h2>
            ) : (
              <span className="inline-flex rounded-full bg-[#edf7c7] px-3 py-1.5 text-sm font-semibold text-emerald-950">
                {analysis.verdict}
              </span>
            )}
            <p className="mt-2 text-sm text-stone-500">For {analysis.targetRole}</p>
          </div>
        </div>
        {!isFallback && (
          <div
            aria-label={`Score ${analysis.score} out of 100`}
            className="mt-6 h-2 overflow-hidden rounded-full bg-stone-100"
            role="img"
          >
            <div
              className="h-full rounded-full bg-[#b5d72e]"
              style={{ width: `${analysis.score}%` }}
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold">Skills found</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {analysis.skillsFound.map((skill) => (
              <li
                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-900"
                key={skill}
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold">Skills missing</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {analysis.skillsMissing.map((skill) => (
              <li
                className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm text-rose-900"
                key={skill}
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="font-serif text-2xl">
          {isFallback ? 'Skill match suggestions' : 'Three ways to strengthen it'}
        </h3>
        {analysis.characters !== undefined && (
          <p className="mt-2 text-sm text-stone-500">
            {analysis.characters.toLocaleString()} resume characters reviewed
          </p>
        )}
        <ol className="mt-5 space-y-4">
          {analysis.topFixes.map((suggestion, index) => (
            <li className="flex gap-3 text-sm leading-6 text-stone-700" key={suggestion}>
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-bold text-stone-600">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ol>
        <button
          className="mt-7 min-h-12 w-full rounded-xl bg-[#d4f34a] px-5 text-sm font-bold text-stone-900 transition hover:bg-[#c7e83d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          onClick={onAnalyseAnother}
          type="button"
        >
          Analyse another
        </button>
      </section>
    </section>
  );
}