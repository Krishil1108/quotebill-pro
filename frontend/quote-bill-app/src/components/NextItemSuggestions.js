import React, { useState, useEffect } from 'react';
import { Lightbulb, Plus, TrendingUp, Zap, Clock, ArrowRight, Sparkles } from 'lucide-react';

const NextItemSuggestions = ({ 
  items = [], 
  allDocuments = [], 
  onAddItem, 
  isDarkTheme = false 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Electrical work patterns for predicting next items
  const electricalSequences = {
    // Common electrical installation sequences
    lightingSequence: {
      pattern: ['light point', 'fan point', 'switch board', 'wire and cable', 'conduit pipe', 'junction box', 'earthing'],
      description: 'Standard lighting installation'
    },
    panelWork: {
      pattern: ['distribution board', 'mcb', 'rccb', 'main switch', 'neutral link', 'phase link', 'earthing'],
      description: 'Panel installation sequence'
    },
    wiringWork: {
      pattern: ['wire and cable', 'conduit pipe', 'junction box', 'switch board', 'socket', 'earthing'],
      description: 'Complete wiring work'
    },
    completionWork: {
      pattern: ['testing', 'earthing', 'safety check', 'installation certificate'],
      description: 'Project completion'
    }
  };

  // Common follow-up items for specific electricals
  const followUpItems = {
    'light point': ['fan point', 'switch board', 'regulator', 'wire and cable'],
    'fan point': ['light point', 'regulator', 'switch board', 'wire and cable'],
    'switch board': ['wire and cable', 'conduit pipe', 'socket', 'mcb'],
    'wire and cable': ['conduit pipe', 'junction box', 'earthing', 'testing'],
    'conduit pipe': ['junction box', 'wire and cable', 'earthing'],
    'distribution board': ['mcb', 'rccb', 'main switch', 'earthing'],
    'mcb': ['rccb', 'neutral link', 'phase link'],
    'socket': ['switch board', 'wire and cable', 'conduit pipe'],
    'junction box': ['earthing', 'wire and cable', 'testing'],
    'earthing': ['testing', 'safety check', 'completion']
  };

  useEffect(() => {
    if (items.length > 0) {
      generateNextItemSuggestions();
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [items, allDocuments]);

  const generateNextItemSuggestions = () => {
    const newSuggestions = [];
    const currentParticulars = items.map(item => item.particular?.toLowerCase() || '').filter(Boolean);
    
    if (currentParticulars.length === 0) {
      setIsVisible(false);
      return;
    }

    const lastItem = currentParticulars[currentParticulars.length - 1];
    
    // 1. Direct follow-up suggestions
    if (followUpItems[lastItem]) {
      followUpItems[lastItem].forEach(suggestion => {
        if (!currentParticulars.includes(suggestion.toLowerCase())) {
          newSuggestions.push({
            text: suggestion,
            reason: `Commonly follows "${lastItem}"`,
            confidence: 0.9,
            category: 'direct_followup',
            priority: 'high'
          });
        }
      });
    }

    // 2. Sequence-based suggestions
    Object.entries(electricalSequences).forEach(([sequenceName, sequence]) => {
      const pattern = sequence.pattern;
      
      // Find if current items match a sequence
      let matchIndex = -1;
      for (let i = 0; i < pattern.length; i++) {
        if (currentParticulars.includes(pattern[i])) {
          matchIndex = Math.max(matchIndex, i);
        }
      }
      
      // Suggest next items in sequence
      if (matchIndex >= 0 && matchIndex < pattern.length - 1) {
        for (let i = matchIndex + 1; i < Math.min(matchIndex + 4, pattern.length); i++) {
          if (!currentParticulars.includes(pattern[i])) {
            newSuggestions.push({
              text: pattern[i],
              reason: `Next in ${sequence.description}`,
              confidence: 0.8 - (i - matchIndex - 1) * 0.1,
              category: 'sequence',
              priority: i === matchIndex + 1 ? 'high' : 'medium'
            });
          }
        }
      }
    });

    // 3. Historical co-occurrence analysis
    if (allDocuments.length > 0) {
      const coOccurrences = analyzeHistoricalCoOccurrences(currentParticulars);
      coOccurrences.forEach(coOcc => {
        if (!currentParticulars.includes(coOcc.item.toLowerCase())) {
          newSuggestions.push({
            text: coOcc.item,
            reason: `Often used together (${coOcc.frequency} times)`,
            confidence: Math.min(0.8, coOcc.frequency * 0.1),
            category: 'historical',
            priority: coOcc.frequency > 3 ? 'high' : 'medium'
          });
        }
      });
    }

    // 4. Common missing essentials
    const essentials = ['earthing', 'wire and cable', 'conduit pipe', 'testing'];
    essentials.forEach(essential => {
      if (!currentParticulars.includes(essential) && currentParticulars.length > 2) {
        newSuggestions.push({
          text: essential,
          reason: 'Essential for electrical work',
          confidence: 0.7,
          category: 'essential',
          priority: 'medium'
        });
      }
    });

    // Remove duplicates and sort by priority and confidence
    const uniqueSuggestions = newSuggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
      )
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.confidence - a.confidence;
      })
      .slice(0, 6);

    setSuggestions(uniqueSuggestions);
  };

  const analyzeHistoricalCoOccurrences = (currentItems) => {
    const coOccurrences = new Map();
    
    allDocuments.forEach(doc => {
      if (doc.items && doc.items.length > 0) {
        const docItems = doc.items.map(item => item.particular?.toLowerCase()).filter(Boolean);
        
        // Check if this document contains any of the current items
        const hasCurrentItem = currentItems.some(currentItem => 
          docItems.includes(currentItem)
        );
        
        if (hasCurrentItem) {
          docItems.forEach(item => {
            if (!currentItems.includes(item)) {
              coOccurrences.set(item, (coOccurrences.get(item) || 0) + 1);
            }
          });
        }
      }
    });

    return Array.from(coOccurrences.entries())
      .map(([item, frequency]) => ({ item, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  };

  const handleAddSuggestion = (suggestion) => {
    onAddItem({
      particular: suggestion.text,
      quantity: '1',
      unit: 'Nos',
      rate: ''
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-green-400 bg-green-50 text-green-700';
      case 'medium': return 'border-yellow-400 bg-yellow-50 text-yellow-700';
      case 'low': return 'border-gray-400 bg-gray-50 text-gray-700';
      default: return 'border-gray-400 bg-gray-50 text-gray-700';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'direct_followup': return <ArrowRight size={14} className="text-green-600" />;
      case 'sequence': return <TrendingUp size={14} className="text-blue-600" />;
      case 'historical': return <Clock size={14} className="text-purple-600" />;
      case 'essential': return <Zap size={14} className="text-orange-600" />;
      default: return <Lightbulb size={14} className="text-gray-600" />;
    }
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`mt-6 p-6 rounded-2xl border-2 border-dashed transition-all duration-500 ${
      isDarkTheme 
        ? 'border-blue-400/30 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-xl' 
        : 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'
    }`}>
      <div className={`flex items-center gap-3 mb-4 ${
        isDarkTheme ? 'text-white' : 'text-gray-800'
      }`}>
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-blue-500 animate-pulse" />
          <h3 className="text-lg font-bold">AI Suggestions for Next Item</h3>
        </div>
        <div className={`text-sm px-3 py-1 rounded-full ${
          isDarkTheme ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
        }`}>
          {suggestions.length} suggestions
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              isDarkTheme
                ? 'border-white/20 bg-black/30 hover:bg-black/50 text-white'
                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
            }`}
            onClick={() => handleAddSuggestion(suggestion)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getCategoryIcon(suggestion.category)}
                <span className="font-semibold text-sm capitalize">{suggestion.text}</span>
              </div>
              <div className={`text-xs px-2 py-1 rounded ${getPriorityColor(suggestion.priority)}`}>
                {Math.round(suggestion.confidence * 100)}%
              </div>
            </div>
            
            <p className={`text-xs mb-3 ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {suggestion.reason}
            </p>
            
            <button
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isDarkTheme
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Plus size={14} />
              Add Item
            </button>
          </div>
        ))}
      </div>

      <div className={`mt-4 text-xs text-center ${
        isDarkTheme ? 'text-gray-400' : 'text-gray-500'
      }`}>
        💡 Suggestions based on electrical work patterns, historical data, and common sequences
      </div>
    </div>
  );
};

export default NextItemSuggestions;
