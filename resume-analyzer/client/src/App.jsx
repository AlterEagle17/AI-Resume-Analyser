import { useState } from 'react';
import AnalysisResult from './components/AnalysisResult.jsx';
import ResumeForm from './components/ResumeForm.jsx';
import { analyzeResume } from './lib/api.js';

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

const MOCK_ANALYSIS = {
  score: 82,
  verdict: 'Strong match',
  targetRole: 'Full-stack developer',
  skillsFound: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
  skillsMissing: ['Testing', 'Docker'],
  topFixes: [
    'Add testing experience to your projects.',
    'Mention Docker or containerization experience.',
    'Add measurable results to your project descriptions.',
  ],
};

const TARGET_ROLES = [
  'Frontend developer',
  'Backend developer',
  'Full-stack developer',
  'AI engineer',
];

export default function App() {
  const [appState, setAppState] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Full-stack developer');
  const [errorMessage, setErrorMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);

  function handleFileChange(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    const isPdf =
      file.type === 'application/pdf' && file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setSelectedFile(null);
      setErrorMessage('That file is not a PDF. Choose a PDF resume to continue.');
      setAppState('error');
      event.currentTarget.value = '';
      return;
    }

    if (file.size >= MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setErrorMessage('Your PDF must be smaller than 4 MB. Choose a smaller file to continue.');
      setAppState('error');
      event.currentTarget.value = '';
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setAppState('idle');
  }

  async function handleAnalyse(event) {
    event.preventDefault();
    if (!selectedFile || appState === 'loading') return;

    setAppState('loading');
    setErrorMessage('');

    try {
      const response = await analyzeResume(selectedFile, targetRole);
      setAnalysis({
        ...MOCK_ANALYSIS,
        targetRole: response.targetRole,
        characters: response.characters,
      });
      setAppState('done');
    } catch (error) {
      setErrorMessage(error.message || 'The analysis could not be completed. Please try again.');
      setAppState('error');
    }
  }

  function handleTryAgain() {
    setSelectedFile(null);
    setAnalysis(null);
    setErrorMessage('');
    setAppState('idle');
  }

  function handleAnalyseAnother() {
    setSelectedFile(null);
    setAnalysis(null);
    setErrorMessage('');
    setAppState('idle');
  }

  return (
    <main className="min-h-screen bg-[#f4f4ef] px-4 py-8 text-stone-900 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[640px]">
        <header className="mb-8 flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#d4f34a] text-sm font-black text-stone-900">
            RA
          </div>
          <div>
            <p className="text-sm font-bold">Resume Analyzer</p>
            <p className="text-xs text-stone-500">ROLE-FOCUSED REVIEW</p>
          </div>
        </header>

        <section className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase text-emerald-800">A sharper next step</p>
          <h1 className="max-w-xl font-serif text-3xl leading-tight sm:text-4xl">
            See how your resume fits the role.
          </h1>
        </section>

        {appState === 'idle' && (
          <ResumeForm
            selectedFile={selectedFile}
            targetRole={targetRole}
            targetRoles={TARGET_ROLES}
            onFileChange={handleFileChange}
            onRoleChange={setTargetRole}
            onSubmit={handleAnalyse}
          />
        )}

        {appState === 'loading' && (
          <section
            aria-busy="true"
            aria-live="polite"
            className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center shadow-sm"
          >
            <span className="mb-5 size-9 animate-spin rounded-full border-[3px] border-stone-200 border-t-emerald-800" />
            <p className="font-medium">Reading your resume like a recruiter would...</p>
          </section>
        )}

        {appState === 'done' && analysis && (
          <AnalysisResult analysis={analysis} onAnalyseAnother={handleAnalyseAnother} />
        )}

        {appState === 'error' && (
          <section
            aria-live="assertive"
            className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <p className="text-xs font-bold uppercase text-rose-700">Unable to continue</p>
            <h2 className="mt-2 font-serif text-2xl">Check your resume file</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">{errorMessage}</p>
            <button
              className="mt-6 min-h-12 w-full rounded-xl border border-stone-300 px-5 text-sm font-semibold transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 sm:w-auto"
              onClick={handleTryAgain}
              type="button"
            >
              Try again
            </button>
          </section>
        )}

        <p className="mt-5 text-center text-xs text-stone-500">Demo mode · your PDF is not uploaded.</p>
      </div>
    </main>
  );
}
