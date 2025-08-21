import React from 'react';
import { FileText, Calculator, Sun, Moon, Sparkles, Zap, Users } from 'lucide-react';

const LandingPage = ({ onNavigate, isDarkTheme, toggleTheme }) => {
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="relative inline-block">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 transition-colors duration-500 ${
              isDarkTheme ? 'text-white' : 'text-gray-800'
            }`}>
              QuoteBill Pro
            </h1>
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Sparkles className={`w-6 h-6 ${isDarkTheme ? 'text-yellow-400' : 'text-blue-500'}`} />
            </div>
          </div>
          <p className={`text-lg sm:text-xl mb-6 sm:mb-8 transition-colors duration-500 max-w-2xl mx-auto ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Professional quotation and billing solution for modern businesses
          </p>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
              isDarkTheme 
                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
            }`}
          >
            {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{isDarkTheme ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Personal Use Card */}
          <div 
            onClick={() => onNavigate('personal')}
            className={`group relative p-6 sm:p-8 rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:rotate-1 ${
              isDarkTheme 
                ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:from-purple-500/30 hover:to-pink-500/30' 
                : 'bg-gradient-to-br from-white to-purple-50 shadow-xl hover:shadow-2xl border border-purple-100 hover:border-purple-200'
            }`}
          >
            {/* Animated Background Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative text-center">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${
                isDarkTheme 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                  : 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
              }`}>
                <div className="relative">
                  <Calculator size={32} className="sm:w-10 sm:h-10" />
                  <Zap className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
              </div>
              
              <h2 className={`text-2xl sm:text-3xl font-bold mb-4 transition-colors duration-500 ${
                isDarkTheme ? 'text-white' : 'text-gray-800'
              }`}>
                Personal Use
              </h2>
              
              <p className={`text-base sm:text-lg mb-6 transition-colors duration-500 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Track materials and create personal quotations
              </p>
              
              <div className="space-y-3 mb-6">
                <div className={`flex items-center justify-center space-x-3 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <FileText size={18} className="flex-shrink-0" />
                  <span className="text-sm sm:text-base">Material tracking</span>
                </div>
                <div className={`flex items-center justify-center space-x-3 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <Calculator size={18} className="flex-shrink-0" />
                  <span className="text-sm sm:text-base">Personal quotes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Use Card */}
          <div 
            onClick={() => onNavigate('client')}
            className={`group relative p-6 sm:p-8 rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:rotate-1 ${
              isDarkTheme 
                ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:from-blue-500/30 hover:to-purple-500/30' 
                : 'bg-gradient-to-br from-white to-blue-50 shadow-xl hover:shadow-2xl border border-blue-100 hover:border-blue-200'
            }`}
          >
            {/* Animated Background Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative text-center">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${
                isDarkTheme 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
              }`}>
                <div className="relative">
                  <FileText size={32} className="sm:w-10 sm:h-10" />
                  <Zap className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
              </div>
              
              <h2 className={`text-2xl sm:text-3xl font-bold mb-4 transition-colors duration-500 ${
                isDarkTheme ? 'text-white' : 'text-gray-800'
              }`}>
                Client Business
              </h2>
              
              <p className={`text-base sm:text-lg mb-6 transition-colors duration-500 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Professional quotations and bills for clients
              </p>
              
              <div className="space-y-3 mb-6">
                <div className={`flex items-center justify-center space-x-3 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <Users size={18} className="flex-shrink-0" />
                  <span className="text-sm sm:text-base">Client management</span>
                </div>
                <div className={`flex items-center justify-center space-x-3 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <FileText size={18} className="flex-shrink-0" />
                  <span className="text-sm sm:text-base">PDF export ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mt-12 sm:mt-16">
          {[
            { title: 'Dynamic UI', desc: 'Responsive design for all devices' },
            { title: 'Auto-Save', desc: 'Never lose your work again' },
            { title: 'PDF Export', desc: 'Professional document output' }
          ].map((feature, idx) => (
            <div key={idx} className={`p-4 sm:p-6 rounded-2xl text-center transition-all duration-500 hover:scale-105 ${
              isDarkTheme 
                ? 'bg-white/5 border border-white/10 hover:bg-white/10' 
                : 'bg-white/70 border border-white/50 hover:bg-white/90 backdrop-blur-sm'
            }`}>
              <h3 className={`font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-12 sm:mt-16 max-w-2xl mx-auto">
          <div className={`p-6 rounded-2xl transition-all duration-500 ${
            isDarkTheme 
              ? 'bg-white/5 border border-white/10' 
              : 'bg-white/70 border border-white/50 backdrop-blur-sm'
          }`}>
            <h3 className={`text-lg font-bold mb-4 text-center ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
              ⌨️ Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className={`flex justify-between ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Navigate Back:</span>
                <code className={`px-2 py-1 rounded text-xs ${
                  isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>ESC</code>
              </div>
              <div className={`flex justify-between ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Browser Back:</span>
                <code className={`px-2 py-1 rounded text-xs ${
                  isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>Alt + ←</code>
              </div>
              <div className={`flex justify-between ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Close Modals:</span>
                <code className={`px-2 py-1 rounded text-xs ${
                  isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>Alt + →</code>
              </div>
              <div className={`flex justify-between ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Browser Navigation:</span>
                <code className={`px-2 py-1 rounded text-xs ${
                  isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>Back/Forward</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
