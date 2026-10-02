function formatFileSize(sizeInBytes) {
  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ResumeForm({
  selectedFile,
  targetRole,
  targetRoles,
  onFileChange,
  onRoleChange,
  onSubmit,
}) {
  return (
    <form
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
      onSubmit={onSubmit}
    >
      <div className="mb-6">
        <h2 className="font-serif text-2xl">Start with your resume</h2>
        <p className="mt-1 text-sm text-stone-500">PDF only, smaller than 4 MB</p>
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-semibold"
          htmlFor="resume-file"
        >
          Resume PDF
        </label>
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-emerald-800 sm:p-5">
          <input
            accept="application/pdf,.pdf"
            className="sr-only"
            id="resume-file"
            onChange={onFileChange}
            type="file"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {selectedFile ? (
                <>
                  <p className="truncate text-sm font-semibold">{selectedFile.name}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-stone-600">No resume selected</p>
              )}
            </div>
            <label
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold transition hover:bg-stone-100"
              htmlFor="resume-file"
            >
              Choose PDF
            </label>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold" htmlFor="target-role">
          Target role
        </label>
        <select
          className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          id="target-role"
          onChange={(event) => onRoleChange(event.target.value)}
          value={targetRole}
        >
          {targetRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <button
        className="mt-7 min-h-12 w-full rounded-xl bg-[#d4f34a] px-5 text-sm font-bold text-stone-900 transition hover:bg-[#c7e83d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
        disabled={!selectedFile}
        type="submit"
      >
        Analyse resume
      </button>
    </form>
  );
}