import React, { useState, useEffect, useRef } from 'react';
import { Search, Lightbulb, TrendingUp, Zap, ArrowRight, Clock, ChevronDown } from 'lucide-react';

const ClientSmartParticularInput = ({ 
  value, 
  onChange, 
  particulars, 
  onAddParticular,
  allDocuments = [],
  currentItems = [],
  isDarkTheme = false,
  placeholder = "Select or enter particulars"
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Electrical work patterns specifically for client quotes
  const electricalPatterns = {
    // Common electrical installation patterns for client work
    lightingWork: {
      triggers: ['light point', 'tubelight', 'led light', 'bulb point', 'light fixture'],
      sequence: ['fan point', 'switch board', 'wire and cable', 'conduit pipe', 'junction box', 'earthing'],
      confidence: 0.9
    },
    fanInstallation: {
      triggers: ['fan point', 'ceiling fan', 'exhaust fan'],
      sequence: ['light point', 'regulator', 'switch board', 'wire and cable', 'conduit pipe'],
      confidence: 0.85
    },
    switchSocketWork: {
      triggers: ['switch', 'socket', '5 amp socket', '15 amp socket', 'switch board'],
      sequence: ['wire and cable', 'conduit pipe', 'junction box', 'earthing', 'mcb'],
      confidence: 0.8
    },
    panelWork: {
      triggers: ['panel', 'distribution board', 'mcb', 'main switch', 'meter'],
      sequence: ['rccb', 'isolator', 'earthing', 'neutral link', 'phase link', 'wire and cable'],
      confidence: 0.95
    },
    wiringWork: {
      triggers: ['wire', 'cable', 'wiring work', 'house wiring'],
      sequence: ['conduit pipe', 'junction box', 'switch board', 'light point', 'fan point', 'earthing'],
      confidence: 0.7
    },
    // Common completion patterns
    completionWork: {
      triggers: ['testing', 'completion', 'final'],
      sequence: ['earthing', 'safety check', 'installation certificate', 'warranty'],
      confidence: 0.6
    }
  };

  // Common electrical items for client quotes
  const commonElectricalItems = [
    // Lighting
    'Light point', 'Fan point', 'LED tubelight', 'CFL holder', 'Batten holder',
    'Decorative light', 'Spotlight', 'Street light', 'Flood light',
    
    // Switches and Sockets
    'Switch board', '5 amp socket', '15 amp socket', 'Modular switch',
    'Fan regulator', 'Dimmer switch', 'Bell push', 'Indicator lamp',
    
    // Wiring and Cables
    'Wire and cable', '2.5 sq mm wire', '1.5 sq mm wire', '4 sq mm wire',
    'Flexible wire', 'Armoured cable', 'Coaxial cable',
    
    // Conduits and Accessories
    'Conduit pipe', 'PVC conduit', 'GI conduit', 'Flexible conduit',
    'Junction box', 'Cable tray', 'Cable tie', 'Insulation tape',
    
    // Panel and Protection
    'Distribution board', 'MCB', 'RCCB', 'Isolator', 'Main switch',
    'Meter', 'Energy meter', 'Neutral link', 'Phase link', 'Earthing',
    
    // Installation and Services
    'Installation charges', 'Labour charges', 'Testing charges',
    'Transportation', 'Material handling', 'Site preparation',
    
    // Finishing Work
    'Wall cutting', 'Wall making', 'Plastering', 'Painting touch-up',
    'Cleaning work', 'Debris removal'
  ];

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    if (searchTerm) {
      generateSuggestions(searchTerm);
    } else {
      setSuggestions([]);
      setAiSuggestions([]);
    }
  }, [searchTerm, particulars, allDocuments]);

  const generateSuggestions = (input) => {
    if (!input || input.length < 1) {
      setSuggestions([]);
      setAiSuggestions([]);
      return;
    }

    const inputLower = input.toLowerCase();
    
    // 1. Filter existing particulars
    const filteredParticulars = particulars.filter(particular =>
      particular.toLowerCase().includes(inputLower) && 
      particular.toLowerCase() !== inputLower
    );

    // 2. Generate AI suggestions
    const aiSuggs = generateAISuggestions(inputLower);
    
    setSuggestions(filteredParticulars.slice(0, 5));
    setAiSuggestions(aiSuggs);
  };

  const generateAISuggestions = (input) => {
    const suggestions = new Set();
    
    // 1. Pattern-based suggestions
    Object.entries(electricalPatterns).forEach(([patternName, pattern]) => {
      const isTriggered = pattern.triggers.some(trigger => 
        input.includes(trigger.toLowerCase()) || 
        trigger.toLowerCase().includes(input)
      );
      
      if (isTriggered) {
        pattern.sequence.forEach(item => {
          if (!particulars.some(p => p.toLowerCase() === item.toLowerCase()) &&
              item.toLowerCase().includes(input) && 
              item.toLowerCase() !== input) {
            suggestions.add({
              text: item,
              confidence: pattern.confidence,
              reason: `Common in ${patternName.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
              category: 'pattern'
            });
          }
        });
      }
    });

    // 2. Common items matching input
    commonElectricalItems.forEach(item => {
      if (item.toLowerCase().includes(input) && 
          item.toLowerCase() !== input &&
          !particulars.some(p => p.toLowerCase() === item.toLowerCase())) {
        suggestions.add({
          text: item,
          confidence: 0.7,
          reason: 'Common electrical item',
          category: 'common'
        });
      }
    });

    // 3. Historical usage from documents
    if (allDocuments.length > 0) {
      const historicalItems = new Map();
      allDocuments.forEach(doc => {
        if (doc.items) {
          doc.items.forEach(item => {
            if (item.particular && item.particular.toLowerCase().includes(input)) {
              const key = item.particular.toLowerCase();
              historicalItems.set(key, (historicalItems.get(key) || 0) + 1);
            }
          });
        }
      });

      Array.from(historicalItems.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .forEach(([itemName, count]) => {
          if (itemName !== input && !particulars.some(p => p.toLowerCase() === itemName)) {
            suggestions.add({
              text: itemName,
              confidence: Math.min(0.8, count * 0.2),
              reason: `Used ${count} times before`,
              category: 'history'
            });
          }
        });
    }

    // 4. Sequential suggestions based on current document items
    const currentItems = getCurrentDocumentItems();
    if (currentItems.length > 0) {
      const sequentialSuggestions = getSequentialSuggestions(currentItems, input);
      sequentialSuggestions.forEach(sugg => suggestions.add(sugg));
    }

    return Array.from(suggestions)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);
  };

  const getCurrentDocumentItems = () => {
    // Return the current items from the document being created
    return currentItems || [];
  };

  const getSequentialSuggestions = (currentItems, input) => {
    const suggestions = [];
    
    // Analyze current items and suggest what typically comes next
    const lastItem = currentItems[currentItems.length - 1]?.particular?.toLowerCase() || '';
    
    const sequences = {
      'light point': ['fan point', 'switch board', 'wire and cable'],
      'fan point': ['light point', 'regulator', 'switch board'],
      'switch board': ['wire and cable', 'conduit pipe', 'mcb'],
      'wire and cable': ['conduit pipe', 'junction box', 'testing'],
      'conduit pipe': ['junction box', 'wire and cable', 'earthing'],
      'mcb': ['rccb', 'neutral link', 'phase link'],
      'distribution board': ['mcb', 'rccb', 'main switch'],
      'socket': ['switch board', 'wire and cable'],
      'regulator': ['fan point', 'switch board'],
      'junction box': ['earthing', 'wire and cable'],
      'rccb': ['mcb', 'neutral link', 'earthing'],
      'main switch': ['distribution board', 'meter', 'earthing'],
      'testing': ['earthing', 'completion certificate'],
      'earthing': ['testing', 'safety check']
    };

    if (sequences[lastItem]) {
      sequences[lastItem].forEach(item => {
        if (item.toLowerCase().includes(input) && 
            !currentItems.some(ci => ci.particular?.toLowerCase() === item.toLowerCase())) {
          suggestions.push({
            text: item,
            confidence: 0.8,
            reason: 'Next in sequence',
            category: 'sequence'
          });
        }
      });
    }

    // Also check if any item in current list suggests the input
    currentItems.forEach(currentItem => {
      const currentParticular = currentItem.particular?.toLowerCase() || '';
      if (sequences[currentParticular]) {
        sequences[currentParticular].forEach(suggestion => {
          if (suggestion.toLowerCase().includes(input) && 
              !currentItems.some(ci => ci.particular?.toLowerCase() === suggestion.toLowerCase())) {
            suggestions.push({
              text: suggestion,
              confidence: 0.75,
              reason: `Often comes after "${currentParticular}"`,
              category: 'sequence'
            });
          }
        });
      }
    });

    return suggestions;
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSelect = (selectedValue) => {
    setSearchTerm(selectedValue);
    onChange(selectedValue);
    setShowSuggestions(false);
    
    // Add to particulars if it's new
    if (!particulars.includes(selectedValue)) {
      onAddParticular(selectedValue);
    }
  };

  const handleKeyDown = (e) => {
    const allSuggestions = [
      ...suggestions.map(s => ({ text: s, type: 'existing' })),
      ...aiSuggestions.map(s => ({ ...s, type: 'ai' }))
    ];

    if (!showSuggestions || allSuggestions.length === 0) return;

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
          handleSelect(allSuggestions[highlightedIndex].text);
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
      case 'existing':
        return <Search size={14} className="text-blue-500" />;
      case 'ai':
        return confidence > 0.8 
          ? <Zap size={14} className="text-yellow-500" />
          : <Lightbulb size={14} className="text-orange-500" />;
      default:
        return <Search size={14} className="text-gray-400" />;
    }
  };

  const getSuggestionStyle = (type, confidence, isHighlighted) => {
    let baseStyle = `flex items-center justify-between p-3 cursor-pointer transition-all duration-150 ${
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
    if (type === 'ai' && confidence > 0.8) {
      baseStyle += ' border-l-4 border-yellow-400';
    }

    return baseStyle;
  };

  const allSuggestions = [
    ...suggestions.map(s => ({ text: s, type: 'existing' })),
    ...aiSuggestions.map(s => ({ ...s, type: 'ai' }))
  ];

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className={`w-full p-4 pr-12 border rounded-xl focus:ring-3 transition-all duration-300 shadow-sm hover:shadow-md ${
            isDarkTheme 
              ? 'border-white/20 bg-black/30 text-white placeholder-white/50 focus:ring-blue-500/30 focus:border-blue-400' 
              : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-100 focus:border-blue-400'
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-blue-500 transition-colors duration-200">
          {aiSuggestions.length > 0 && (
            <Zap size={16} className="text-blue-500 animate-pulse mr-2" />
          )}
          <ChevronDown size={16} />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && allSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className={`absolute z-50 w-full mt-1 rounded-xl shadow-lg border max-h-80 overflow-y-auto ${
            isDarkTheme 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Existing particulars section */}
          {suggestions.length > 0 && (
            <div className={`border-b ${isDarkTheme ? 'border-gray-600' : 'border-gray-100'}`}>
              <div className={`px-3 py-2 text-xs font-medium ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Search size={12} className="inline mr-1" />
                Existing Particulars
              </div>
              {suggestions.map((item, index) => (
                <div
                  key={`existing-${index}`}
                  className={getSuggestionStyle('existing', 1, highlightedIndex === index)}
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-center gap-2">
                    {renderSuggestionIcon('existing')}
                    <span className="font-medium">{item}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-400" />
                </div>
              ))}
            </div>
          )}

          {/* AI suggestions section */}
          {aiSuggestions.length > 0 && (
            <div>
              <div className={`px-3 py-2 text-xs font-medium ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Lightbulb size={12} className="inline mr-1" />
                AI Suggestions
              </div>
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={`ai-${index}`}
                  className={getSuggestionStyle('ai', suggestion.confidence, 
                    highlightedIndex === suggestions.length + index)}
                  onClick={() => handleSelect(suggestion.text)}
                >
                  <div className="flex items-center gap-2">
                    {renderSuggestionIcon('ai', suggestion.confidence)}
                    <div>
                      <div className="font-medium">{suggestion.text}</div>
                      <div className={`text-xs ${
                        isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Clock size={10} className="inline mr-1" />
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

export default ClientSmartParticularInput;
