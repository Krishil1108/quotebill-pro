import React from 'react';
import { Plus, FileText, Upload, Settings, Sparkles } from 'lucide-react';

const Header = ({
  isDarkTheme,
  activeTab,
  handleTabChange,
  setShowPDFExtractor,
  onBack
}) => {
  return (
    <header className={`z-10 backdrop-blur-xl border-b sticky top-0 transition-all duration-500 ${
      isDarkTheme 
        ? 'bg-black/20 border-white/10' 
        : 'bg-white/30 border-gray-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center space-x-3">
            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDarkTheme 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            
            <div className="ml-3">
              <h1 className={`text-xl font-black bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 ${
                isDarkTheme 
                  ? 'from-white to-blue-200' 
                  : 'from-gray-800 to-blue-600'
              }`}>
                ElectroQuote
              </h1>
              <p className={`text-xs font-medium transition-colors duration-500 ${
                isDarkTheme ? 'text-blue-200/70' : 'text-gray-600'
              }`}>
                Professional Suite
              </p>
            </div>
          </div>
          
          {/* Desktop Navigation & Options */}
          <div className="hidden md:flex items-center space-x-3">
            <nav className={`flex space-x-1 backdrop-blur-md rounded-2xl p-1 transition-all duration-500 ${
              isDarkTheme ? 'bg-black/30' : 'bg-white/50'
            }`}>
              <button
                onClick={() => handleTabChange('create')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'create' 
                    ? (isDarkTheme ? 'bg-white text-purple-900 shadow-xl' : 'bg-blue-600 text-white shadow-xl')
                    : (isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-blue-600 hover:bg-white/70')
                }`}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Create
              </button>
              
              <button
                onClick={() => handleTabChange('history')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'history' 
                    ? (isDarkTheme ? 'bg-white text-purple-900 shadow-xl' : 'bg-blue-600 text-white shadow-xl')
                    : (isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-blue-600 hover:bg-white/70')
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                History
              </button>
              
              <button
                onClick={() => handleTabChange('settings')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'settings' 
                    ? (isDarkTheme ? 'bg-white text-purple-900 shadow-xl' : 'bg-blue-600 text-white shadow-xl')
                    : (isDarkTheme ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-blue-600 hover:bg-white/70')
                }`}
              >
                <Upload className="w-4 h-4 inline mr-1" />
                Settings
              </button>
            </nav>

            {/* Sequence Settings Extractor Button */}
            <button
              onClick={() => setShowPDFExtractor(true)}
              className={`p-3 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20 text-blue-300' 
                  : 'bg-black/10 hover:bg-black/20 text-blue-600'
              }`}
              title="PDF Sequence Settings"
            >
              <Settings className="w-5 h-5 animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
