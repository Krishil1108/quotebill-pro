import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, X, Lightbulb, TrendingUp, Zap, Clock, ArrowRight, Star } from 'lucide-react';
import particularSequenceManager from '../utils/ParticularSequenceManager';

const IntelligentItemSuggestions = ({ 
  lastAddedItem, 
  allItems, 
  allDocuments, 
  onAcceptSuggestion, 
  onRejectSuggestion,
  isDarkTheme = false 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Enhanced electrical work patterns following the specified sequence
  const electricalPatterns = {
    // 1. Points Sequence: Light → Fan → Two way → Plug → 15A
    'light point': {
      nextItems: [
        { 
          particular: 'Fan point', 
          quantityRatio: 1.0, 
          priceRatio: 0.9, 
          confidence: 0.95,
          reason: 'Next in electrical points sequence'
        },
        { 
          particular: 'Two way point', 
          quantityRatio: 0.5, 
          priceRatio: 1.2, 
          confidence: 0.9,
          reason: 'Common after light point installation'
        },
        { 
          particular: 'LED light fitting', 
          quantityRatio: 1.0, 
          priceRatio: 2.0, 
          confidence: 0.85,
          reason: 'Light fitting for light point'
        },
        { 
          particular: 'Panel light fitting', 
          quantityRatio: 0.3, 
          priceRatio: 3.0, 
          confidence: 0.8,
          reason: 'Premium light fitting option'
        }
      ]
    },
    'fan point': {
      nextItems: [
        { 
          particular: 'Two way point', 
          quantityRatio: 1.0, 
          priceRatio: 1.2, 
          confidence: 0.9,
          reason: 'Next in sequence after fan point'
        },
        { 
          particular: 'Fan hook fitting', 
          quantityRatio: 1.0, 
          priceRatio: 1.5, 
          confidence: 0.9,
          reason: 'Fan fitting for fan point'
        },
        { 
          particular: 'Ceiling fan fitting', 
          quantityRatio: 1.0, 
          priceRatio: 2.5, 
          confidence: 0.85,
          reason: 'Complete ceiling fan installation'
        },
        { 
          particular: 'Plug point', 
          quantityRatio: 1.0, 
          priceRatio: 0.8, 
          confidence: 0.85,
          reason: 'Standard outlet after fan point'
        }
      ]
    },
    'two way point': {
      nextItems: [
        { 
          particular: 'Plug point', 
          quantityRatio: 1.0, 
          priceRatio: 0.8, 
          confidence: 0.9,
          reason: 'Next in electrical points sequence'
        },
        { 
          particular: '15 ampere point', 
          quantityRatio: 0.5, 
          priceRatio: 1.5, 
          confidence: 0.85,
          reason: 'High power outlet'
        }
      ]
    },
    'plug point': {
      nextItems: [
        { 
          particular: '15 ampere point', 
          quantityRatio: 0.5, 
          priceRatio: 1.5, 
          confidence: 0.85,
          reason: 'Complete points sequence'
        },
        { 
          particular: '1.0 sq mm line', 
          quantityRatio: 10.0, 
          priceRatio: 0.2, 
          confidence: 0.8,
          reason: 'Start wiring sequence'
        }
      ]
    },
    '15 ampere point': {
      nextItems: [
        { 
          particular: '1.0 sq mm line', 
          quantityRatio: 15.0, 
          priceRatio: 0.15, 
          confidence: 0.9,
          reason: 'Start wiring for high power outlets'
        },
        { 
          particular: '1.5 sq mm line', 
          quantityRatio: 12.0, 
          priceRatio: 0.2, 
          confidence: 0.85,
          reason: 'Standard wiring for power outlets'
        }
      ]
    },
    
    // 2. Wiring Sequence: Progressive wire sizes
    '1.0 sq mm line': {
      nextItems: [
        { 
          particular: '1.5 sq mm line', 
          quantityRatio: 1.0, 
          priceRatio: 1.2, 
          confidence: 0.95,
          reason: 'Next wire size in sequence'
        }
      ]
    },
    '1.5 sq mm line': {
      nextItems: [
        { 
          particular: '2.5 sq mm line single phase', 
          quantityRatio: 0.8, 
          priceRatio: 1.5, 
          confidence: 0.9,
          reason: 'Next wire size - single phase'
        },
        { 
          particular: '2.5 sq mm line three phase', 
          quantityRatio: 0.6, 
          priceRatio: 2.0, 
          confidence: 0.9,
          reason: 'Next wire size - three phase'
        }
      ]
    },
    '2.5 sq mm line single phase': {
      nextItems: [
        { 
          particular: '4.0 sq mm line single phase', 
          quantityRatio: 0.7, 
          priceRatio: 1.8, 
          confidence: 0.85,
          reason: 'Next wire size in sequence'
        },
        { 
          particular: 'Single phase distribution', 
          quantityRatio: 0.1, 
          priceRatio: 15.0, 
          confidence: 0.8,
          reason: 'Distribution for single phase wiring'
        }
      ]
    },
    '2.5 sq mm line three phase': {
      nextItems: [
        { 
          particular: '4.0 sq mm line three phase', 
          quantityRatio: 0.7, 
          priceRatio: 2.2, 
          confidence: 0.85,
          reason: 'Next wire size in sequence'
        },
        { 
          particular: 'Three phase distribution', 
          quantityRatio: 0.1, 
          priceRatio: 20.0, 
          confidence: 0.8,
          reason: 'Distribution for three phase wiring'
        }
      ]
    },

    // 3. Distribution to Cabling
    'single phase distribution': {
      nextItems: [
        { 
          particular: 'Networking cable', 
          quantityRatio: 5.0, 
          priceRatio: 0.3, 
          confidence: 0.85,
          reason: 'Data cabling after power distribution'
        },
        { 
          particular: 'CC tv cable', 
          quantityRatio: 3.0, 
          priceRatio: 0.4, 
          confidence: 0.8,
          reason: 'Security cabling'
        }
      ]
    },
    'three phase distribution': {
      nextItems: [
        { 
          particular: 'Networking cable', 
          quantityRatio: 8.0, 
          priceRatio: 0.3, 
          confidence: 0.85,
          reason: 'Data cabling for commercial setup'
        },
        { 
          particular: 'CC tv cable', 
          quantityRatio: 5.0, 
          priceRatio: 0.4, 
          confidence: 0.8,
          reason: 'Security system cabling'
        }
      ]
    },

    // 4. Cabling sequence
    'networking cable': {
      nextItems: [
        { 
          particular: 'CC tv cable', 
          quantityRatio: 0.8, 
          priceRatio: 1.2, 
          confidence: 0.8,
          reason: 'Complete low voltage cabling'
        },
        { 
          particular: 'Ground earthing work', 
          quantityRatio: 0.1, 
          priceRatio: 8.0, 
          confidence: 0.75,
          reason: 'Earthing for complete installation'
        }
      ]
    },
    'cc tv cable': {
      nextItems: [
        { 
          particular: 'Ground earthing work', 
          quantityRatio: 0.1, 
          priceRatio: 8.0, 
          confidence: 0.9,
          reason: 'Safety earthing for complete installation'
        }
      ]
    }
  };

  useEffect(() => {
    if (lastAddedItem && lastAddedItem.particular && lastAddedItem.quantity && lastAddedItem.rate) {
      generateSuggestions(lastAddedItem);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [lastAddedItem, allItems, allDocuments]);

  const generateSuggestions = (lastItem) => {
    const suggestions = [];
    const lastParticular = lastItem.particular.toLowerCase().trim();
    
    // 1. PRIORITY: PDF Sequence suggestions
    if (particularSequenceManager.hasCustomSequence()) {
      const pdfSuggestions = particularSequenceManager.getNextItemsInSequence(lastItem.particular, 3);
      pdfSuggestions.forEach(pdfSuggestion => {
        // Check if this item is not already added
        const alreadyExists = allItems.some(item => 
          item.particular.toLowerCase().trim() === pdfSuggestion.particular.toLowerCase().trim()
        );
        
        if (!alreadyExists) {
          suggestions.push({
            particular: pdfSuggestion.particular,
            quantity: lastItem.quantity, // Same quantity as last item
            unit: lastItem.unit, // Same unit as previous item
            rate: Math.round(parseFloat(lastItem.rate) * 0.9), // Slight price variation
            amount: parseFloat(lastItem.quantity) * Math.round(parseFloat(lastItem.rate) * 0.9),
            confidence: pdfSuggestion.confidence,
            reason: `PDF sequence: ${pdfSuggestion.reason}`,
            type: 'pdf-sequence'
          });
        }
      });
    }

    // 2. Pattern-based suggestions (lower priority if PDF exists)
    const pattern = electricalPatterns[lastParticular];
    if (pattern && (!particularSequenceManager.hasCustomSequence() || suggestions.length < 3)) {
      pattern.nextItems.forEach(nextItem => {
        // Check if this item is not already added
        const alreadyExists = allItems.some(item => 
          item.particular.toLowerCase().trim() === nextItem.particular.toLowerCase().trim()
        );
        
        if (!alreadyExists) {
          const suggestedQuantity = Math.round(parseFloat(lastItem.quantity) * nextItem.quantityRatio);
          const suggestedRate = Math.round(parseFloat(lastItem.rate) * nextItem.priceRatio);
          
          suggestions.push({
            particular: nextItem.particular,
            quantity: suggestedQuantity || 1,
            unit: lastItem.unit, // Same unit as previous item initially
            rate: suggestedRate || 100,
            amount: (suggestedQuantity || 1) * (suggestedRate || 100),
            confidence: particularSequenceManager.hasCustomSequence() ? nextItem.confidence * 0.7 : nextItem.confidence,
            reason: nextItem.reason,
            type: 'pattern'
          });
        }
      });
    }

    // 3. Historical co-occurrence analysis
    if (allDocuments.length > 0 && suggestions.length < 3) {
      const historicalSuggestions = getHistoricalSuggestions(lastParticular, lastItem);
      suggestions.push(...historicalSuggestions);
    }

    // 4. Common electrical sequences (if no pattern found)
    if (suggestions.length === 0) {
      const commonSuggestions = getCommonElectricalSuggestions(lastParticular, lastItem);
      suggestions.push(...commonSuggestions);
    }

    // Sort by type priority and confidence and limit to top 3
    const finalSuggestions = suggestions
      .sort((a, b) => {
        // Prioritize PDF sequence suggestions
        if (a.type === 'pdf-sequence' && b.type !== 'pdf-sequence') return -1;
        if (b.type === 'pdf-sequence' && a.type !== 'pdf-sequence') return 1;
        // Then sort by confidence
        return b.confidence - a.confidence;
      })
      .slice(0, 3);

    setSuggestions(finalSuggestions);
  };

  const getHistoricalSuggestions = (lastParticular, lastItem) => {
    const coOccurrences = new Map();
    
    allDocuments.forEach(doc => {
      if (doc.items && doc.items.length > 1) {
        const items = doc.items;
        const lastItemIndex = items.findIndex(item => 
          item.particular && item.particular.toLowerCase().includes(lastParticular)
        );
        
        if (lastItemIndex !== -1 && lastItemIndex < items.length - 1) {
          // Look at items that came after this particular
          for (let i = lastItemIndex + 1; i < Math.min(lastItemIndex + 4, items.length); i++) {
            const nextItem = items[i];
            if (nextItem.particular) {
              const key = nextItem.particular.toLowerCase();
              if (!coOccurrences.has(key)) {
                coOccurrences.set(key, {
                  particular: nextItem.particular,
                  count: 0,
                  avgQuantity: 0,
                  avgRate: 0,
                  unit: nextItem.unit || lastItem.unit
                });
              }
              
              const entry = coOccurrences.get(key);
              entry.count++;
              entry.avgQuantity = (entry.avgQuantity + (parseFloat(nextItem.quantity) || 1)) / 2;
              entry.avgRate = (entry.avgRate + (parseFloat(nextItem.rate) || 100)) / 2;
            }
          }
        }
      }
    });

    return Array.from(coOccurrences.values())
      .filter(item => item.count >= 2) // Appeared at least twice
      .filter(item => !allItems.some(existing => 
        existing.particular.toLowerCase().trim() === item.particular.toLowerCase().trim()
      ))
      .slice(0, 2)
      .map(item => ({
        particular: item.particular,
        quantity: Math.round(item.avgQuantity),
        unit: item.unit,
        rate: Math.round(item.avgRate),
        amount: Math.round(item.avgQuantity) * Math.round(item.avgRate),
        confidence: Math.min(0.8, item.count * 0.2),
        reason: `Used ${item.count} times after ${lastParticular}`,
        type: 'historical'
      }));
  };

  const getCommonElectricalSuggestions = (lastParticular, lastItem) => {
    const commonItems = [
      { particular: 'wire and cable', quantityRatio: 2.0, priceRatio: 0.3 },
      { particular: 'conduit pipe', quantityRatio: 1.5, priceRatio: 0.4 },
      { particular: 'junction box', quantityRatio: 0.5, priceRatio: 1.2 },
      { particular: 'earthing', quantityRatio: 1.0, priceRatio: 2.0 },
      { particular: 'testing charges', quantityRatio: 1.0, priceRatio: 0.5 }
    ];

    return commonItems
      .filter(item => !allItems.some(existing => 
        existing.particular.toLowerCase().trim() === item.particular.toLowerCase().trim()
      ))
      .slice(0, 2)
      .map(item => ({
        particular: item.particular,
        quantity: Math.round(parseFloat(lastItem.quantity) * item.quantityRatio) || 1,
        unit: lastItem.unit,
        rate: Math.round(parseFloat(lastItem.rate) * item.priceRatio) || 100,
        amount: (Math.round(parseFloat(lastItem.quantity) * item.quantityRatio) || 1) * 
                (Math.round(parseFloat(lastItem.rate) * item.priceRatio) || 100),
        confidence: 0.6,
        reason: 'Common electrical component',
        type: 'common'
      }));
  };

  const handleAcceptSuggestion = (suggestion) => {
    onAcceptSuggestion(suggestion);
    setShowSuggestions(false);
  };

  const handleRejectSuggestion = (suggestionIndex) => {
    const newSuggestions = suggestions.filter((_, index) => index !== suggestionIndex);
    setSuggestions(newSuggestions);
    
    if (newSuggestions.length === 0) {
      setShowSuggestions(false);
      onRejectSuggestion?.();
    }
  };

  const handleRejectAll = () => {
    setShowSuggestions(false);
    onRejectSuggestion?.();
  };

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`mb-6 p-6 rounded-2xl border-2 border-dashed transition-all duration-500 ${
      isDarkTheme 
        ? 'border-blue-400/30 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-xl' 
        : 'border-blue-300/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            isDarkTheme ? 'bg-blue-500/20' : 'bg-blue-500/10'
          }`}>
            <Lightbulb className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${
              isDarkTheme ? 'text-white' : 'text-gray-800'
            }`}>
              Smart Suggestions
            </h3>
            <p className={`text-sm ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Based on your last item: <span className="font-medium text-blue-500">{lastAddedItem?.particular}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleRejectAll}
          className={`p-2 rounded-full transition-colors duration-200 ${
            isDarkTheme 
              ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' 
              : 'hover:bg-red-50 text-gray-500 hover:text-red-500'
          }`}
          title="Dismiss all suggestions"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              isDarkTheme 
                ? 'border-white/10 bg-black/20 hover:bg-black/30' 
                : 'border-gray-200 bg-white/80 hover:bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {suggestion.type === 'pattern' && <Zap className="w-4 h-4 text-yellow-500" />}
                {suggestion.type === 'historical' && <Clock className="w-4 h-4 text-blue-500" />}
                {suggestion.type === 'common' && <TrendingUp className="w-4 h-4 text-green-500" />}
                <span className={`text-xs px-2 py-1 rounded ${
                  suggestion.confidence > 0.8 
                    ? 'bg-green-100 text-green-700' 
                    : suggestion.confidence > 0.6 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>
              <button
                onClick={() => handleRejectSuggestion(index)}
                className={`p-1 rounded transition-colors duration-200 ${
                  isDarkTheme 
                    ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' 
                    : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className={`font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                {suggestion.particular}
              </h4>
              <div className={`grid grid-cols-2 gap-2 text-sm ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <div>
                  <span className="font-medium">Qty:</span> {suggestion.quantity}
                </div>
                <div>
                  <span className="font-medium">Unit:</span> {suggestion.unit}
                </div>
                <div>
                  <span className="font-medium">Rate:</span> ₹{suggestion.rate}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> ₹{suggestion.amount}
                </div>
              </div>
              <p className={`text-xs italic ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {suggestion.reason}
              </p>
            </div>

            <button
              onClick={() => handleAcceptSuggestion(suggestion)}
              className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                isDarkTheme 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } hover:scale-105`}
            >
              <CheckCircle className="w-4 h-4" />
              Accept Suggestion
            </button>
          </div>
        ))}
      </div>

      <div className={`mt-4 p-3 rounded-lg text-center ${
        isDarkTheme ? 'bg-black/20' : 'bg-gray-50'
      }`}>
        <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          💡 Tip: These suggestions are based on electrical work patterns and your past quotations
        </p>
      </div>
    </div>
  );
};

export default IntelligentItemSuggestions;
