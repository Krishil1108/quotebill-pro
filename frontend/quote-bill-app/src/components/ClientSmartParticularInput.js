import React, { useState, useEffect, useRef } from 'react';
import { Search, Lightbulb, TrendingUp, Zap, ArrowRight, Clock, ChevronDown, Star } from 'lucide-react';
import particularSequenceManager from '../utils/ParticularSequenceManager';

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

  // Enhanced electrical work patterns specifically for client quotes
  const electricalPatterns = {
    // 1. Points (Electrical Outlets/Switches) - Main sequence
    pointsSequence: {
      triggers: ['light point', 'fan point', 'two way point', 'plug point', '15 ampere point'],
      sequence: [
        { item: 'Light point', next: ['Fan point', 'Two way point', 'Plug point', '15 ampere point'] },
        { item: 'Fan point', next: ['Two way point', 'Plug point', '15 ampere point', 'Fan hook fitting', 'Ceiling fan fitting'] },
        { item: 'Two way point', next: ['Plug point', '15 ampere point'] },
        { item: 'Plug point', next: ['15 ampere point'] },
        { item: '15 ampere point', next: ['1.0 sq mm line', '1.5 sq mm line'] }
      ],
      confidence: 0.95
    },
    
    // 2. Wiring (by Wire Size / Phase) - Progressive sequence
    wiringSequence: {
      triggers: ['sq mm line', 'wire', 'wiring'],
      sequence: [
        { item: '1.0 sq mm line', next: ['1.5 sq mm line'] },
        { item: '1.5 sq mm line', next: ['2.5 sq mm line single phase', '2.5 sq mm line three phase'] },
        { item: '2.5 sq mm line single phase', next: ['4.0 sq mm line single phase', 'Single phase distribution'] },
        { item: '2.5 sq mm line three phase', next: ['4.0 sq mm line three phase', 'Three phase distribution'] },
        { item: '4.0 sq mm line single phase', next: ['6.0 sq mm line three phase', 'Single phase distribution'] },
        { item: '4.0 sq mm line three phase', next: ['6.0 sq mm line three phase', 'Three phase distribution'] },
        { item: '6.0 sq mm line three phase', next: ['10.0 sq mm line three phase', 'Three phase distribution'] },
        { item: '10.0 sq mm line three phase', next: ['Three phase distribution'] }
      ],
      confidence: 0.9
    },

    // 3. Distribution Systems
    distributionSequence: {
      triggers: ['distribution', 'phase distribution'],
      sequence: [
        { item: 'Single phase distribution', next: ['Networking cable', 'CC tv cable'] },
        { item: 'Three phase distribution', next: ['Networking cable', 'CC tv cable'] }
      ],
      confidence: 0.85
    },

    // 4. Cabling (Low Voltage / Data / CCTV)
    cablingSequence: {
      triggers: ['networking cable', 'cc tv cable', 'cctv cable'],
      sequence: [
        { item: 'Networking cable', next: ['CC tv cable'] },
        { item: 'CC tv cable', next: ['Ground earthing work'] }
      ],
      confidence: 0.8
    },

    // 5. Fittings (Lighting Fixtures & Accessories)
    fittingsSequence: {
      triggers: ['fitting', 'light fitting', 'fan fitting'],
      lightFittings: ['LED light fitting', 'Panel light fitting', 'Cob light fitting', 'Wall light fitting', 'Hanging light fitting', 'Zoomer fitting'],
      fanFittings: ['Fan hook fitting', 'Ceiling fan fitting'],
      confidence: 0.85
    },

    // 6. Special Work - Final items
    specialWork: {
      triggers: ['earthing', 'ground earthing'],
      sequence: [
        { item: 'Ground earthing work', next: [] } // Final item
      ],
      confidence: 0.9
    }
  };

  // Enhanced electrical items following the specified sequence ONLY
  const commonElectricalItems = [
    // 1. Points (Electrical Outlets/Switches) - Main sequence
    'Light point', 'Fan point', 'Two way point', 'Plug point', '15 ampere point',
    
    // 2. Wiring (by Wire Size / Phase) - Progressive sequence
    '1.0 sq mm line', '1.5 sq mm line', 
    '2.5 sq mm line single phase', '2.5 sq mm line three phase',
    '4.0 sq mm line single phase', '4.0 sq mm line three phase',
    '6.0 sq mm line three phase', '10.0 sq mm line three phase',
    
    // 3. Distribution Systems
    'Single phase distribution', 'Three phase distribution',
    
    // 4. Cabling (Low Voltage / Data / CCTV)
    'Networking cable', 'CC tv cable',
    
    // 5. Fittings (Lighting Fixtures & Accessories)
    'Fan hook fitting', 'Ceiling fan fitting',
    'LED light fitting', 'Panel light fitting', 'Cob light fitting',
    'Wall light fitting', 'Hanging light fitting', 'Zoomer fitting',
    
    // 6. Special Work
    'Ground earthing work'
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
    
    // 1. PRIORITY: Custom PDF sequence suggestions
    if (particularSequenceManager.hasCustomSequence()) {
      const customSuggestions = particularSequenceManager.findInSequence(input, 5);
      customSuggestions.forEach(suggestion => {
        if (!particulars.some(p => p.toLowerCase() === suggestion.particular.toLowerCase())) {
          suggestions.add({
            text: suggestion.particular,
            confidence: suggestion.confidence,
            reason: `PDF Sequence #${suggestion.sequence}`,
            category: 'pdf-sequence'
          });
        }
      });

      // Get next items based on current items in the document
      if (currentItems.length > 0) {
        const lastItem = currentItems[currentItems.length - 1];
        if (lastItem?.particular) {
          const nextInSequence = particularSequenceManager.getNextItemsInSequence(lastItem.particular, 3);
          nextInSequence.forEach(suggestion => {
            if (suggestion.particular.toLowerCase().includes(input) && 
                !particulars.some(p => p.toLowerCase() === suggestion.particular.toLowerCase())) {
              suggestions.add({
                text: suggestion.particular,
                confidence: suggestion.confidence,
                reason: `Next in PDF sequence`,
                category: 'pdf-next'
              });
            }
          });
        }
      }
    }

    // 2. DISABLED OLD PATTERNS - Use new electrical sequence only
    // Object.entries(electricalPatterns).forEach(([patternName, pattern]) => {
    //   const isTriggered = pattern.triggers.some(trigger => 
    //     input.includes(trigger.toLowerCase()) || 
    //     trigger.toLowerCase().includes(input)
    //   );
      
    //   if (isTriggered) {
    //     pattern.sequence.forEach(item => {
    //       if (!particulars.some(p => p.toLowerCase() === item.toLowerCase()) &&
    //           item.toLowerCase().includes(input) && 
    //           item.toLowerCase() !== input) {
    //         suggestions.add({
    //           text: item,
    //           confidence: particularSequenceManager.hasCustomSequence() ? pattern.confidence * 0.7 : pattern.confidence,
    //           reason: `Common in ${patternName.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
    //           category: 'pattern'
    //         });
    //       }
    //     });
    //   }
    // });

    // 3. Common items matching input (ONLY from new electrical sequence)
    commonElectricalItems.forEach(item => {
      if (item.toLowerCase().includes(input) && 
          item.toLowerCase() !== input &&
          !particulars.some(p => p.toLowerCase() === item.toLowerCase())) {
        suggestions.add({
          text: item,
          confidence: 0.7,
          reason: 'New electrical sequence item',
          category: 'common'
        });
      }
    });

    // 4. NO HISTORICAL USAGE - Focus on new sequence only
    // Removed historical suggestions to focus on new electrical sequence

    // 5. Sequential suggestions based on current document items (NEW ELECTRICAL SEQUENCE ONLY)
    const currentItems = getCurrentDocumentItems();
    if (currentItems.length > 0) {
      const sequentialSuggestions = getSequentialSuggestions(currentItems, input);
      sequentialSuggestions.forEach(sugg => suggestions.add(sugg));
    }

    return Array.from(suggestions)
      .sort((a, b) => {
        // HIGHEST PRIORITY: New electrical sequence suggestions
        if (a.category === 'electrical-sequence' && b.category !== 'electrical-sequence') return -1;
        if (b.category === 'electrical-sequence' && a.category !== 'electrical-sequence') return 1;
        
        // SECOND PRIORITY: PDF sequence suggestions
        if (a.category === 'pdf-sequence' && b.category !== 'pdf-sequence' && b.category !== 'electrical-sequence') return -1;
        if (b.category === 'pdf-sequence' && a.category !== 'pdf-sequence' && a.category !== 'electrical-sequence') return 1;
        if (a.category === 'pdf-next' && b.category !== 'pdf-next' && b.category !== 'pdf-sequence' && b.category !== 'electrical-sequence') return -1;
        if (b.category === 'pdf-next' && a.category !== 'pdf-next' && a.category !== 'pdf-sequence' && a.category !== 'electrical-sequence') return 1;
        
        // THIRD PRIORITY: Common items from new sequence
        if (a.category === 'common' && b.category !== 'common' && !['electrical-sequence', 'pdf-sequence', 'pdf-next'].includes(b.category)) return -1;
        if (b.category === 'common' && a.category !== 'common' && !['electrical-sequence', 'pdf-sequence', 'pdf-next'].includes(a.category)) return 1;
        
        // Then sort by confidence
        return b.confidence - a.confidence;
      })
      .slice(0, 8);
  };

  const getCurrentDocumentItems = () => {
    // Return the current items from the document being created
    return currentItems || [];
  };

  const getSequentialSuggestions = (currentItems, input) => {
    const suggestions = [];
    
    // Get the last added item for context
    const lastItem = currentItems[currentItems.length - 1]?.particular?.toLowerCase() || '';
    const existingItems = currentItems.map(item => item.particular?.toLowerCase() || '');
    
    // Enhanced electrical work suggestion engine following the specified sequence
    const generateElectricalSuggestions = (lastItem) => {
      if (!lastItem) return [];
      
      const sequenceSuggestions = [];
      const itemLower = lastItem.toLowerCase();

      // 1. Points Sequence Logic: Light → Fan → Two way → Plug → 15A
      if (itemLower.includes('light point')) {
        sequenceSuggestions.push(
          { item: 'Fan point', reason: 'Next in electrical points sequence', confidence: 0.95 },
          { item: 'Two way point', reason: 'Common after light point', confidence: 0.9 },
          { item: 'Plug point', reason: 'Standard outlet installation', confidence: 0.85 },
          { item: '15 ampere point', reason: 'High power outlet', confidence: 0.8 },
          { item: 'LED light fitting', reason: 'Light fitting for light point', confidence: 0.85 },
          { item: 'Panel light fitting', reason: 'Panel light fitting option', confidence: 0.8 },
          { item: 'Wall light fitting', reason: 'Wall mounted light fitting', confidence: 0.8 }
        );
      }
      
      if (itemLower.includes('fan point')) {
        sequenceSuggestions.push(
          { item: 'Two way point', reason: 'Next in sequence after fan point', confidence: 0.9 },
          { item: 'Plug point', reason: 'Standard outlet installation', confidence: 0.85 },
          { item: '15 ampere point', reason: 'High power outlet', confidence: 0.8 },
          { item: 'Fan hook fitting', reason: 'Fan fitting for fan point', confidence: 0.9 },
          { item: 'Ceiling fan fitting', reason: 'Ceiling fan installation', confidence: 0.85 }
        );
      }
      
      if (itemLower.includes('two way point')) {
        sequenceSuggestions.push(
          { item: 'Plug point', reason: 'Next in electrical points sequence', confidence: 0.9 },
          { item: '15 ampere point', reason: 'High power outlet', confidence: 0.85 }
        );
      }
      
      if (itemLower.includes('plug point')) {
        sequenceSuggestions.push(
          { item: '15 ampere point', reason: 'Complete points sequence', confidence: 0.85 }
        );
      }
      
      if (itemLower.includes('15 ampere point')) {
        sequenceSuggestions.push(
          { item: '1.0 sq mm line', reason: 'Start wiring sequence', confidence: 0.9 },
          { item: '1.5 sq mm line', reason: 'Standard wiring', confidence: 0.85 }
        );
      }

      // 2. Wiring Sequence Logic: Progressive wire sizes
      if (itemLower.includes('1.0 sq mm line')) {
        sequenceSuggestions.push(
          { item: '1.5 sq mm line', reason: 'Next wire size in sequence', confidence: 0.95 }
        );
      }
      
      if (itemLower.includes('1.5 sq mm line')) {
        sequenceSuggestions.push(
          { item: '2.5 sq mm line single phase', reason: 'Next wire size - single phase', confidence: 0.9 },
          { item: '2.5 sq mm line three phase', reason: 'Next wire size - three phase', confidence: 0.9 }
        );
      }
      
      if (itemLower.includes('2.5 sq mm line')) {
        const isSinglePhase = itemLower.includes('single');
        sequenceSuggestions.push(
          { item: '4.0 sq mm line single phase', reason: 'Next wire size - single phase', confidence: 0.85 },
          { item: '4.0 sq mm line three phase', reason: 'Next wire size - three phase', confidence: 0.85 },
          { item: isSinglePhase ? 'Single phase distribution' : 'Three phase distribution', 
            reason: 'Distribution system for current wiring', confidence: 0.8 }
        );
      }
      
      if (itemLower.includes('4.0 sq mm line')) {
        const isSinglePhase = itemLower.includes('single');
        sequenceSuggestions.push(
          { item: '6.0 sq mm line three phase', reason: 'Next wire size in sequence', confidence: 0.85 },
          { item: isSinglePhase ? 'Single phase distribution' : 'Three phase distribution', 
            reason: 'Distribution system for current wiring', confidence: 0.85 }
        );
      }
      
      if (itemLower.includes('6.0 sq mm line')) {
        sequenceSuggestions.push(
          { item: '10.0 sq mm line three phase', reason: 'Final wire size in sequence', confidence: 0.8 },
          { item: 'Three phase distribution', reason: 'Distribution for heavy wiring', confidence: 0.9 }
        );
      }
      
      if (itemLower.includes('10.0 sq mm line')) {
        sequenceSuggestions.push(
          { item: 'Three phase distribution', reason: 'Distribution for heavy duty wiring', confidence: 0.95 }
        );
      }

      // 3. Distribution to Cabling Logic
      if (itemLower.includes('distribution')) {
        sequenceSuggestions.push(
          { item: 'Networking cable', reason: 'Data cabling after power distribution', confidence: 0.85 },
          { item: 'CC tv cable', reason: 'Security cabling after power distribution', confidence: 0.8 }
        );
      }

      // 4. Cabling Sequence Logic
      if (itemLower.includes('networking cable')) {
        sequenceSuggestions.push(
          { item: 'CC tv cable', reason: 'Complete low voltage cabling', confidence: 0.8 }
        );
      }
      
      if (itemLower.includes('cc tv cable') || itemLower.includes('cctv cable')) {
        sequenceSuggestions.push(
          { item: 'Ground earthing work', reason: 'Safety earthing for complete installation', confidence: 0.9 }
        );
      }

      // 6. Final Special Work - Ground earthing
      const hasElectricalWork = existingItems.some(item => 
        item.includes('point') || 
        item.includes('distribution') ||
        item.includes('cable') ||
        item.includes('line')
      );
      
      if (hasElectricalWork && !existingItems.some(item => item.includes('earthing'))) {
        sequenceSuggestions.push(
          { item: 'Ground earthing work', reason: 'Essential safety work for electrical installation', confidence: 0.85 }
        );
      }

      return sequenceSuggestions.slice(0, 5); // Return top 5 suggestions
    };

    // Generate sequence-based suggestions using ONLY the new electrical sequence
    if (lastItem) {
      const electricalSuggs = generateElectricalSuggestions(lastItem);
      electricalSuggs.forEach(sugg => {
        if (sugg.item.toLowerCase().includes(input) &&
            !existingItems.includes(sugg.item.toLowerCase())) {
          suggestions.push({
            text: sugg.item,
            confidence: sugg.confidence,
            reason: sugg.reason,
            category: 'electrical-sequence'
          });
        }
      });
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions only
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

  const renderSuggestionIcon = (type, confidence, category) => {
    switch (category || type) {
      case 'pdf-sequence':
      case 'pdf-next':
        return <Star size={14} className="text-purple-500" />;
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

  const getSuggestionStyle = (type, confidence, isHighlighted, category) => {
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

    // Add category-specific styling
    if (category === 'pdf-sequence' || category === 'pdf-next') {
      baseStyle += ' border-l-4 border-purple-400';
    } else if (type === 'ai' && confidence > 0.8) {
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
                    {particularSequenceManager.hasCustomSequence() && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        PDF Sequence Active
                      </span>
                    )}
                  </div>
                  {aiSuggestions.map((suggestion, index) => (
                    <div
                      key={`ai-${index}`}
                      className={getSuggestionStyle('ai', suggestion.confidence, 
                        highlightedIndex === suggestions.length + index, suggestion.category)}
                      onClick={() => handleSelect(suggestion.text)}
                    >
                      <div className="flex items-center gap-2">
                        {renderSuggestionIcon('ai', suggestion.confidence, suggestion.category)}
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
                          suggestion.category === 'pdf-sequence' || suggestion.category === 'pdf-next'
                            ? 'bg-purple-100 text-purple-700'
                            : suggestion.confidence > 0.8 
                              ? 'bg-green-100 text-green-700' 
                              : suggestion.confidence > 0.6 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                          {suggestion.category === 'pdf-sequence' || suggestion.category === 'pdf-next' 
                            ? 'PDF' 
                            : Math.round(suggestion.confidence * 100) + '%'
                          }
                        </div>
                        <ArrowRight size={14} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}          {/* Footer hint */}
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
