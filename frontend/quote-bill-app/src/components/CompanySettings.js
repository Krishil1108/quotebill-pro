import React, { useRef } from 'react';
import { Settings, Upload, Plus, Trash2, Package } from 'lucide-react';

const CompanySettings = ({
  isDarkTheme,
  toggleTheme,
  letterhead,
  setLetterhead,
  appSettings,
  setAppSettings,
  uploadLogo,
  saveSettings,
  autoSaveParticulars
}) => {
  const fileInputRef = useRef(null);
  const addParticularInputRef = useRef(null);

  const handleParticularAdd = (newParticular) => {
    if (newParticular && !appSettings.particulars.includes(newParticular)) {
      const updatedParticulars = [...appSettings.particulars, newParticular];
      setAppSettings({ ...appSettings, particulars: updatedParticulars });
      autoSaveParticulars(updatedParticulars);
    }
  };

  const handleParticularDelete = (indexToDelete) => {
    const updatedParticulars = appSettings.particulars.filter((_, i) => i !== indexToDelete);
    setAppSettings({ ...appSettings, particulars: updatedParticulars });
    autoSaveParticulars(updatedParticulars);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in-up">
      {/* Settings Header */}
      <div className={`backdrop-blur-xl rounded-2xl border p-6 shadow-xl transition-all duration-500 ${
        isDarkTheme 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <h2 className={`text-2xl font-black flex items-center transition-colors duration-500 ${
          isDarkTheme ? 'text-white' : 'text-gray-800'
        }`}>
          <Settings className="w-6 h-6 mr-3 text-blue-500 animate-spin" style={{ animationDuration: '6s' }} />
          Settings
        </h2>
        <p className={`text-sm mt-1 transition-colors duration-500 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Configure your application preferences and default letterhead
        </p>
      </div>

      {/* Theme Toggle */}
      <div className={`backdrop-blur-md rounded-2xl border p-6 shadow-lg transition-all duration-500 ${
        isDarkTheme 
          ? 'bg-black/20 border-white/20' 
          : 'bg-white/80 border-white/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className={`text-lg font-bold transition-colors duration-500 ${
              isDarkTheme ? 'text-white' : 'text-gray-800'
            }`}>
              Dark Mode
            </h3>
            <p className={`text-sm transition-colors duration-500 ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Toggle between light and dark themes
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 shadow-lg hover:scale-105 ${
              isDarkTheme ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
              isDarkTheme ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Letterhead Settings */}
      <div className={`backdrop-blur-md rounded-2xl border p-6 shadow-lg transition-all duration-500 ${
        isDarkTheme 
          ? 'bg-black/20 border-white/20' 
          : 'bg-white/80 border-white/30'
      }`}>
        <h3 className={`text-lg font-bold mb-4 transition-colors duration-500 ${
          isDarkTheme ? 'text-white' : 'text-gray-800'
        }`}>
          Company Letterhead
        </h3>
        <div className="space-y-4">
          {/* Logo Upload */}
          <div>
            <label className={`block text-sm font-medium mb-3 transition-colors duration-500 ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Company Logo
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    uploadLogo(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Upload size={20} className="mr-2" />
                Upload Logo
              </button>
              {letterhead.logo && (
                <div className="flex justify-center sm:justify-start">
                  <img src={letterhead.logo} alt="Current Logo" className="h-16 w-16 object-contain border-2 border-gray-200 rounded-lg shadow-sm" />
                </div>
              )}
            </div>
          </div>
          
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Firm Name
              </label>
              <input
                type="text"
                value={letterhead.firmName}
                onChange={(e) => setLetterhead({...letterhead, firmName: e.target.value})}
                className={`w-full p-4 border rounded-xl transition-all duration-300 focus:ring-3 text-base ${
                  isDarkTheme 
                    ? 'bg-black/30 border-white/20 text-white placeholder-white/50 focus:ring-blue-500/30 focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-100 focus:border-blue-500'
                }`}
                placeholder="Enter your firm name"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Phone Number
              </label>
              <input
                type="text"
                value={letterhead.phone || ''}
                onChange={(e) => setLetterhead({...letterhead, phone: e.target.value})}
                className={`w-full p-4 border rounded-xl transition-all duration-300 focus:ring-3 text-base ${
                  isDarkTheme 
                    ? 'bg-black/30 border-white/20 text-white placeholder-white/50 focus:ring-blue-500/30 focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-100 focus:border-blue-500'
                }`}
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Firm Address
              </label>
              <textarea
                value={letterhead.address}
                onChange={(e) => setLetterhead({...letterhead, address: e.target.value})}
                className={`w-full p-4 border rounded-xl transition-all duration-300 focus:ring-3 text-base resize-none ${
                  isDarkTheme 
                    ? 'bg-black/30 border-white/20 text-white placeholder-white/50 focus:ring-blue-500/30 focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-100 focus:border-blue-500'
                }`}
                rows="3"
                placeholder="Enter your firm address"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-500 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tagline
              </label>
              <input
                type="text"
                value={letterhead.tagline}
                onChange={(e) => setLetterhead({...letterhead, tagline: e.target.value})}
                className={`w-full p-4 border rounded-xl transition-all duration-300 focus:ring-3 text-base ${
                  isDarkTheme 
                    ? 'bg-black/30 border-white/20 text-white placeholder-white/50 focus:ring-blue-500/30 focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-100 focus:border-blue-500'
                }`}
                placeholder="Enter your tagline"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Particulars Management */}
      <div className={`backdrop-blur-md rounded-2xl border p-6 shadow-lg transition-all duration-500 ${
        isDarkTheme 
          ? 'bg-black/20 border-white/20' 
          : 'bg-white/80 border-white/30'
      }`}>
        <h3 className={`text-lg font-bold mb-4 transition-colors duration-500 ${
          isDarkTheme ? 'text-white' : 'text-gray-800'
        }`}>
          Manage Particulars
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Add new particular..."
              className={`flex-1 p-4 border rounded-xl transition-all duration-300 focus:ring-3 text-base ${
                isDarkTheme 
                  ? 'bg-black/30 border-white/20 text-white placeholder-white/50 focus:ring-green-500/30 focus:border-green-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-green-100 focus:border-green-500'
              }`}
              ref={addParticularInputRef}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleParticularAdd(e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={() => {
                const input = addParticularInputRef.current;
                if (!input) return;
                handleParticularAdd(input.value.trim());
                input.value = '';
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Plus size={20} className="inline mr-2" />
              Add
            </button>
          </div>
          
          {appSettings.particulars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {appSettings.particulars.map((particular, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                  isDarkTheme 
                    ? 'bg-black/30 border-white/10 hover:border-white/20' 
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}>
                  <span className={`font-semibold flex-1 truncate transition-colors duration-500 ${
                    isDarkTheme ? 'text-white' : 'text-gray-800'
                  }`}>
                    {particular}
                  </span>
                  <button
                    onClick={() => handleParticularDelete(index)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                      isDarkTheme 
                        ? 'text-red-400 hover:bg-red-500/20' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title="Delete particular"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 rounded-xl border-2 border-dashed ${
              isDarkTheme 
                ? 'border-white/20 text-white/60' 
                : 'border-gray-300 text-gray-500'
            }`}>
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm">No particulars added yet</p>
              <p className="text-xs mt-1">Add your first custom item above</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button 
        onClick={saveSettings}
        className="w-full py-4 px-6 rounded-xl font-black text-lg transition-all duration-300 hover:scale-[1.02] shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25"
      >
        💾 Save Company Settings
      </button>
    </div>
  );
};

export default CompanySettings;
