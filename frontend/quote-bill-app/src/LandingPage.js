import React from 'react';
import { Users, User, ShoppingCart, FileText, Sun, Moon } from 'lucide-react';

const LandingPage = ({ onNavigate, isDarkTheme, toggleTheme }) => {
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`text-5xl font-bold mb-6 transition-colors duration-500 ${
            isDarkTheme ? 'text-white' : 'text-gray-800'
          }`}>
            QuoteBill Pro
          </h1>
          <p className={`text-xl mb-8 transition-colors duration-500 ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Professional quotation and billing solution for your business
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Personal Use Card */}
          <div 
            onClick={() => onNavigate('personal')}
            className={`p-8 rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              isDarkTheme 
                ? 'bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20' 
                : 'bg-white shadow-lg hover:shadow-xl border border-gray-200'
            }`}
          >
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                isDarkTheme 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                <User size={40} />
              </div>
              <h2 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${
                isDarkTheme ? 'text-white' : 'text-gray-800'
              }`}>
                Personal Use
              </h2>
              <p className={`text-lg mb-6 transition-colors duration-500 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Track material purchases and create personal quotations
              </p>
              <div className="space-y-3">
                <div className={`flex items-center justify-center space-x-2 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <ShoppingCart size={18} />
                  <span>Material Purchase Tracking</span>
                </div>
                <div className={`flex items-center justify-center space-x-2 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <FileText size={18} />
                  <span>Personal Quotations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Use Card */}
          <div 
            onClick={() => onNavigate('client')}
            className={`p-8 rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              isDarkTheme 
                ? 'bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20' 
                : 'bg-white shadow-lg hover:shadow-xl border border-gray-200'
            }`}
          >
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                isDarkTheme 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-green-100 text-green-600'
              }`}>
                <Users size={40} />
              </div>
              <h2 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${
                isDarkTheme ? 'text-white' : 'text-gray-800'
              }`}>
                Client Use
              </h2>
              <p className={`text-lg mb-6 transition-colors duration-500 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Create and manage client quotations and bills
              </p>
              <div className="space-y-3">
                <div className={`flex items-center justify-center space-x-2 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <FileText size={18} />
                  <span>Client Quotations</span>
                </div>
                <div className={`flex items-center justify-center space-x-2 ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <Users size={18} />
                  <span>Client Management</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
              isDarkTheme 
                ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
                : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
            }`}
          >
            {isDarkTheme ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
