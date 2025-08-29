import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Clock, Zap } from 'lucide-react';

const SmartSuggestionEngine = ({ 
  currentItemName, 
  materials, 
  quotations, 
  onSuggestionSelect, 
  isDarkTheme 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Define intelligent item relationships and patterns
  const itemRelationships = {
    // Electrical patterns
    'light': ['fan point', 'switch', 'wire coil', 'socket', 'led tubelight'],
    'fan': ['switch', 'wire coil', 'socket', 'regulator'],
    'switch': ['socket', 'wire coil', 'conduit pipe', 'switch box'],
    'socket': ['switch', 'wire coil', 'conduit pipe', 'socket box'],
    'wire': ['conduit pipe', 'junction box', 'switch', 'socket'],
    'tubelight': ['holder', 'choke', 'starter', 'wire coil'],
    'led': ['driver', 'holder', 'wire coil', 'switch'],
    
    // Common electrical work sequences
    'point': ['wire coil', 'conduit pipe', 'switch', 'socket', 'junction box'],
    'wiring': ['wire coil', 'conduit pipe', 'tape', 'cable ties'],
    'panel': ['mcb', 'rccb', 'isolator', 'wire coil', 'meter'],
    'mcb': ['rccb', 'isolator', 'neutral link', 'phase link'],
    
    // Tools and safety
    'pipe': ['bend', 'coupling', 'saddle', 'clip'],
    'conduit': ['bend', 'coupling', 'junction box', 'saddle'],
  };

  // Electrical work patterns based on common practices
  const workPatterns = [
    {
      trigger: ['light point', 'fan point'],
      suggestions: ['wire coil', 'switch', 'socket', 'conduit pipe', 'junction box']
    },
    {
      trigger: ['switch', 'socket'],
      suggestions: ['switch box', 'socket box', 'wire coil', 'conduit pipe']
    },
    {
      trigger: ['tubelight', 'led'],
      suggestions: ['holder', 'wire coil', 'switch', 'choke', 'starter']
    },
    {
      trigger: ['panel work', 'distribution'],
      suggestions: ['mcb', 'rccb', 'isolator', 'neutral link', 'phase link', 'meter']
    }
  ];

  useEffect(() => {
    if (currentItemName && currentItemName.length > 2) {
      generateSuggestions(currentItemName);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [currentItemName, materials, quotations]);

  const generateSuggestions = (itemName) => {
    const suggestions = new Set();
    const itemLower = itemName.toLowerCase();

    // 1. Historical Co-occurrence Analysis
    const historicalSuggestions = findHistoricalPatterns(itemLower);
    historicalSuggestions.forEach(s => suggestions.add(s));

    // 2. Semantic Relationship Suggestions
    const semanticSuggestions = findSemanticRelationships(itemLower);
    semanticSuggestions.forEach(s => suggestions.add(s));

    // 3. Frequency-based Suggestions
    const frequentSuggestions = findFrequentlyUsedItems(itemLower);
    frequentSuggestions.forEach(s => suggestions.add(s));

    // 4. Work Pattern Suggestions
    const patternSuggestions = findWorkPatterns(itemLower);
    patternSuggestions.forEach(s => suggestions.add(s));

    // Convert to array and rank by relevance
    const rankedSuggestions = Array.from(suggestions)
      .map(item => ({
        itemName: item,
        confidence: calculateConfidence(item, itemLower),
        reason: getReasonForSuggestion(item, itemLower)
      }))
      .filter(s => s.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);

    setSuggestions(rankedSuggestions);
    setShowSuggestions(rankedSuggestions.length > 0);
  };

  const findHistoricalPatterns = (itemName) => {
    const suggestions = [];
    
    // Find quotations that contain similar items
    quotations.forEach(quotation => {
      if (quotation.materials) {
        const hasRelatedItem = quotation.materials.some(material => 
          material.itemName.toLowerCase().includes(itemName) ||
          itemName.includes(material.itemName.toLowerCase().split(' ')[0])
        );
        
        if (hasRelatedItem) {
          quotation.materials.forEach(material => {
            if (!material.itemName.toLowerCase().includes(itemName)) {
              suggestions.push(material.itemName);
            }
          });
        }
      }
    });

    return [...new Set(suggestions)];
  };

  const findSemanticRelationships = (itemName) => {
    const suggestions = [];
    
    // Check item relationships
    Object.keys(itemRelationships).forEach(key => {
      if (itemName.includes(key)) {
        suggestions.push(...itemRelationships[key]);
      }
    });

    return suggestions;
  };

  const findFrequentlyUsedItems = (itemName) => {
    const suggestions = [];
    
    // Find most frequently used items in the same category
    const itemFrequency = {};
    materials.forEach(material => {
      const name = material.itemName.toLowerCase();
      itemFrequency[name] = (itemFrequency[name] || 0) + 1;
    });

    // Get top frequent items that aren't the current item
    const frequentItems = Object.entries(itemFrequency)
      .filter(([name]) => !name.includes(itemName) && !itemName.includes(name))
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name);

    return frequentItems;
  };

  const findWorkPatterns = (itemName) => {
    const suggestions = [];
    
    workPatterns.forEach(pattern => {
      const isTriggered = pattern.trigger.some(trigger => 
        itemName.includes(trigger.toLowerCase()) || 
        trigger.toLowerCase().includes(itemName)
      );
      
      if (isTriggered) {
        suggestions.push(...pattern.suggestions);
      }
    });

    return suggestions;
  };

  const calculateConfidence = (suggestedItem, currentItem) => {
    let confidence = 0.1; // Base confidence
    
    // Historical usage boost
    const timesUsedTogether = countUsageTogether(suggestedItem, currentItem);
    confidence += timesUsedTogether * 0.3;
    
    // Semantic relationship boost
    const hasSemanticRelation = Object.values(itemRelationships).flat().includes(suggestedItem);
    if (hasSemanticRelation) confidence += 0.4;
    
    // Frequency boost
    const usage = materials.filter(m => m.itemName.toLowerCase().includes(suggestedItem.toLowerCase())).length;
    confidence += Math.min(usage * 0.1, 0.3);
    
    return Math.min(confidence, 1.0);
  };

  const countUsageTogether = (item1, item2) => {
    let count = 0;
    quotations.forEach(quotation => {
      if (quotation.materials) {
        const hasItem1 = quotation.materials.some(m => 
          m.itemName.toLowerCase().includes(item1.toLowerCase())
        );
        const hasItem2 = quotation.materials.some(m => 
          m.itemName.toLowerCase().includes(item2.toLowerCase())
        );
        if (hasItem1 && hasItem2) count++;
      }
    });
    return count;
  };

  const getReasonForSuggestion = (suggestedItem, currentItem) => {
    const timesUsed = countUsageTogether(suggestedItem, currentItem);
    if (timesUsed > 0) return `Used together ${timesUsed} times`;
    
    const hasSemanticRelation = Object.values(itemRelationships).flat().includes(suggestedItem);
    if (hasSemanticRelation) return 'Commonly used together';
    
    return 'Frequently used item';
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
  };

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`mt-2 p-3 rounded-lg border ${
      isDarkTheme 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Zap size={16} className="text-blue-600" />
        <span className="text-sm font-medium text-blue-600">AI Suggestions</span>
        <TrendingUp size={14} className="text-green-500" />
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className={`flex items-center justify-between p-2 rounded-md transition-all duration-200 text-left ${
              isDarkTheme
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-white hover:bg-blue-100 text-gray-800 border border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-yellow-500" />
              <span className="font-medium">{suggestion.itemName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 text-xs ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Clock size={10} />
                <span>{suggestion.reason}</span>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                suggestion.confidence > 0.7 
                  ? 'bg-green-100 text-green-700' 
                  : suggestion.confidence > 0.5 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {Math.round(suggestion.confidence * 100)}%
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className={`mt-2 text-xs ${
        isDarkTheme ? 'text-gray-400' : 'text-gray-500'
      }`}>
        💡 Based on your historical usage patterns and electrical work best practices
      </div>
    </div>
  );
};

export default SmartSuggestionEngine;
