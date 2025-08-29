import React, { useState, useEffect, useRef } from 'react';
import { Search, Lightbulb, TrendingUp, Zap, ArrowRight, Clock } from 'lucide-react';
import useSmartSuggestions from '../hooks/useSmartSuggestions';

const SmartItemInput = ({ 
  value, 
  onChange, 
  materials, 
  quotations, 
  placeholder = "Enter item name...", 
  isDarkTheme = false 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const { 
    suggestions, 
    generateSuggestions, 
    getAutoComplete, 
    predictNextItems 
  } = useSmartSuggestions(materials, quotations);

  const [autoComplete, setAutoComplete] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    if (value) {
      generateSuggestions(value);
      setAutoComplete(getAutoComplete(value));
    } else {
      setAutoComplete([]);
    }
    
    // Generate predictions based on context
    const recentItems = materials.slice(-3).map(m => m.itemName);
    setPredictions(predictNextItems(recentItems));
  }, [value, generateSuggestions, getAutoComplete, predictNextItems, materials]);

  useEffect(() => {
    const shouldShow = value && (suggestions.length > 0 || autoComplete.length > 0 || predictions.length > 0);
    setShowSuggestions(shouldShow);
    setHighlightedIndex(-1);
  }, [value, suggestions, autoComplete, predictions]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const allSuggestions = [
      ...autoComplete.map(item => ({ text: item, type: 'autocomplete' })),
      ...suggestions.map(s => ({ ...s, type: 'smart' })),
      ...predictions.slice(0, 3).map(p => ({ text: p.item, type: 'prediction', ...p }))
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && allSuggestions[highlightedIndex]) {
          handleSuggestionClick(allSuggestions[highlightedIndex].text);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const renderSuggestionIcon = (type, confidence) => {
    switch (type) {
      case 'autocomplete':
        return <Search size={14} className="text-blue-500" />;
      case 'smart':
        return confidence > 0.8 
          ? <Zap size={14} className="text-yellow-500" />
          : <Lightbulb size={14} className="text-orange-500" />;
      case 'prediction':
        return <TrendingUp size={14} className="text-green-500" />;
      default:
        return <Search size={14} className="text-gray-400" />;
    }
  };

  const getSuggestionStyle = (type, confidence, isHighlighted) => {
    let baseStyle = `flex items-center justify-between p-2 cursor-pointer transition-all duration-150 ${
      isDarkTheme ? 'text-white' : 'text-gray-800'
    }`;

    if (isHighlighted) {
      baseStyle += isDarkTheme 
        ? ' bg-gray-600 shadow-lg' 
        : ' bg-blue-100 shadow-md';
    } else {
      baseStyle += isDarkTheme 
        ? ' hover:bg-gray-700' 
        : ' hover:bg-gray-50';
    }

    // Add type-specific styling
    switch (type) {
      case 'smart':
        if (confidence > 0.8) {
          baseStyle += ' border-l-4 border-yellow-400';
        }
        break;
      case 'prediction':
        baseStyle += ' border-l-4 border-green-400';
        break;
    }

    return baseStyle;
  };

  const allSuggestions = [
    ...autoComplete.map(item => ({ text: item, type: 'autocomplete' })),
    ...suggestions.map(s => ({ ...s, type: 'smart' })),
    ...predictions.slice(0, 3).map(p => ({ text: p.item, type: 'prediction', ...p }))
  ];

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          }`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {value && (suggestions.length > 0 || predictions.length > 0) && (
            <Zap size={16} className="text-blue-500 animate-pulse" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && allSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg border max-h-80 overflow-y-auto ${
            isDarkTheme 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Auto-complete section */}
          {autoComplete.length > 0 && (
            <div className={`border-b ${isDarkTheme ? 'border-gray-600' : 'border-gray-100'}`}>
              <div className={`px-3 py-2 text-xs font-medium ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Search size={12} className="inline mr-1" />
                Auto-complete
              </div>
              {autoComplete.map((item, index) => (
                <div
                  key={`auto-${index}`}
                  className={getSuggestionStyle('autocomplete', 1, highlightedIndex === index)}
                  onClick={() => handleSuggestionClick(item)}
                >
                  <div className="flex items-center gap-2">
                    {renderSuggestionIcon('autocomplete')}
                    <span className="font-medium">{item}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-400" />
                </div>
              ))}
            </div>
          )}

          {/* Smart suggestions section */}
          {suggestions.length > 0 && (
            <div className={`border-b ${isDarkTheme ? 'border-gray-600' : 'border-gray-100'}`}>
              <div className={`px-3 py-2 text-xs font-medium ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Lightbulb size={12} className="inline mr-1" />
                AI Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={`smart-${index}`}
                  className={getSuggestionStyle('smart', suggestion.confidence, highlightedIndex === autoComplete.length + index)}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  <div className="flex items-center gap-2">
                    {renderSuggestionIcon('smart', suggestion.confidence)}
                    <div>
                      <div className="font-medium">{suggestion.text}</div>
                      <div className={`text-xs ${
                        isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {suggestion.reason}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs px-2 py-1 rounded ${
                      suggestion.confidence > 0.8 
                        ? 'bg-green-100 text-green-700' 
                        : suggestion.confidence > 0.6 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {Math.round(suggestion.confidence * 100)}%
                    </div>
                    <ArrowRight size={14} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Predictions section */}
          {predictions.length > 0 && (
            <div>
              <div className={`px-3 py-2 text-xs font-medium ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <TrendingUp size={12} className="inline mr-1" />
                Trending / Predictions
              </div>
              {predictions.slice(0, 3).map((prediction, index) => (
                <div
                  key={`pred-${index}`}
                  className={getSuggestionStyle('prediction', prediction.confidence, 
                    highlightedIndex === autoComplete.length + suggestions.length + index)}
                  onClick={() => handleSuggestionClick(prediction.item)}
                >
                  <div className="flex items-center gap-2">
                    {renderSuggestionIcon('prediction')}
                    <div>
                      <div className="font-medium">{prediction.item}</div>
                      <div className={`text-xs ${
                        isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Clock size={10} className="inline mr-1" />
                        {prediction.reason}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`text-xs px-2 py-1 rounded ${
                      prediction.category === 'workflow' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {prediction.category}
                    </div>
                    <ArrowRight size={14} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer hint */}
          <div className={`px-3 py-2 text-xs ${
            isDarkTheme ? 'text-gray-500' : 'text-gray-400'
          } border-t ${isDarkTheme ? 'border-gray-600' : 'border-gray-100'}`}>
            💡 Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartItemInput;
