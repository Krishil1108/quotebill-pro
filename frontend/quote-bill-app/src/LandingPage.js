import React from 'react';
import {
  FileText, Calculator, Sun, Moon, Sparkles, Zap, Users,
  BarChart2, Download, RefreshCw, Check
} from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, title: 'AI Suggestions', desc: 'Smart electrical item sequencing', color: 'from-violet-500 to-purple-600' },
  { icon: RefreshCw, title: 'Auto-Save',      desc: 'Never lose your work again',     color: 'from-blue-500 to-cyan-600'   },
  { icon: Download,  title: 'PDF & CSV',       desc: 'Professional export formats',    color: 'from-emerald-500 to-teal-600'},
  { icon: BarChart2, title: 'Analytics',       desc: 'Usage patterns & insights',      color: 'from-orange-500 to-red-500'  },
];

const LandingPage = ({ onNavigate, isDarkTheme, toggleTheme }) => {
  const dark = isDarkTheme;

  return (
    <div className={`min-h-screen no-overscroll transition-colors duration-500 ${
      dark
        ? 'bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>

      {/* ── Decorative blobs ───────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden>
        <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          dark ? 'bg-blue-600/15' : 'bg-blue-300/30'
        }`} />
        <div className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          dark ? 'bg-purple-600/15' : 'bg-purple-300/30'
        }`} style={{ animationDelay: '2s' }} />
      </div>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 backdrop-blur-xl border-b
        bg-white/20 dark:bg-black/20 border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className={`text-base font-black ${dark ? 'text-white' : 'text-gray-800'}`}>QuoteBill Pro</span>
        </div>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl transition-all duration-300 active:scale-90 ${
            dark ? 'bg-white/10 text-yellow-300 hover:bg-white/20' : 'bg-gray-900/10 text-gray-600 hover:bg-gray-900/15'
          }`}
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* ── Hero section ────────────────────────────────────────── */}
      <div className="px-4 pt-10 pb-6 text-center animate-fade-in-up">
        <div className="relative inline-flex mb-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600
            flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500
            flex items-center justify-center shadow-lg shadow-orange-400/40 animate-bounce">
            <Zap className="w-4 h-4 text-white" />
          </div>
        </div>

        <h1 className={`text-3xl sm:text-4xl font-black mb-2 leading-tight ${
          dark ? 'text-white' : 'text-gray-900'
        }`}>
          QuoteBill&nbsp;<span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Pro</span>
        </h1>
        <p className={`text-sm sm:text-base max-w-xs mx-auto leading-relaxed ${
          dark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Professional quotations &amp; billing for electrical contractors
        </p>
      </div>

      {/* ── Navigation cards ────────────────────────────────────── */}
      <div className="px-4 pb-6 space-y-4 max-w-md mx-auto">

        {/* Personal card */}
        <button
          onClick={() => onNavigate('personal')}
          className={`nav-card group relative w-full rounded-3xl overflow-hidden text-left shadow-xl
            active:scale-[0.97] transition-all duration-200 ${
            dark
              ? 'bg-gradient-to-br from-purple-900/60 to-pink-900/40 border border-purple-500/30'
              : 'bg-gradient-to-br from-white to-purple-50 border border-purple-100'
          }`}
        >
          {/* shimmer on hover */}
          <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative p-5 flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600
              flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className={`text-lg font-black ${dark ? 'text-white' : 'text-gray-900'}`}>Personal Use</h2>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-500/20 text-purple-400">FREE</span>
              </div>
              <p className={`text-sm mb-3 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                Track materials &amp; create personal quotations
              </p>
              <div className={`flex flex-wrap gap-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                {['Material tracking', 'Personal quotes', 'Analytics'].map(tag => (
                  <span key={tag} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                    dark ? 'bg-white/10' : 'bg-purple-50 text-purple-800'
                  }`}>
                    <Check size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className={`flex-shrink-0 self-center rounded-xl p-2 transition-all duration-200 group-hover:translate-x-1 ${
              dark ? 'bg-white/10 text-white' : 'bg-purple-100 text-purple-700'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Client Business card */}
        <button
          onClick={() => onNavigate('client')}
          className={`nav-card group relative w-full rounded-3xl overflow-hidden text-left shadow-xl
            active:scale-[0.97] transition-all duration-200 ${
            dark
              ? 'bg-gradient-to-br from-blue-900/60 to-indigo-900/40 border border-blue-500/30'
              : 'bg-gradient-to-br from-white to-blue-50 border border-blue-100'
          }`}
        >
          <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative p-5 flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600
              flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className={`text-lg font-black ${dark ? 'text-white' : 'text-gray-900'}`}>Client Business</h2>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400">PRO</span>
              </div>
              <p className={`text-sm mb-3 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                Professional quotes &amp; bills for clients
              </p>
              <div className={`flex flex-wrap gap-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                {['Client mgmt', 'PDF export', 'AI powered'].map(tag => (
                  <span key={tag} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                    dark ? 'bg-white/10' : 'bg-blue-50 text-blue-800'
                  }`}>
                    <Check size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className={`flex-shrink-0 self-center rounded-xl p-2 transition-all duration-200 group-hover:translate-x-1 ${
              dark ? 'bg-white/10 text-white' : 'bg-blue-100 text-blue-700'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* ── Feature chips ────────────────────────────────────────── */}
      <div className="px-4 pb-8 max-w-md mx-auto">
        <p className={`text-xs font-semibold uppercase tracking-widest text-center mb-3 ${
          dark ? 'text-gray-500' : 'text-gray-400'
        }`}>Everything you need</p>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={`p-4 rounded-2xl transition-all duration-300 ${
              dark
                ? 'bg-white/5 border border-white/10'
                : 'bg-white/80 border border-gray-100 shadow-sm'
            }`}>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className={`text-sm font-bold mb-0.5 ${dark ? 'text-white' : 'text-gray-800'}`}>{title}</p>
              <p className={`text-xs leading-tight ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className={`pb-8 pt-2 text-center text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
        © 2025 QuoteBill Pro · Built for electrical professionals
      </div>
    </div>
  );
};

export default LandingPage;
