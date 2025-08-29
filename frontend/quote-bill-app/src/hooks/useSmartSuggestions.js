import { useState, useEffect, useCallback } from 'react';

const useSmartSuggestions = (materials, quotations) => {
  const [suggestions, setSuggestions] = useState([]);
  const [analytics, setAnalytics] = useState({
    patterns: [],
    trends: [],
    predictions: []
  });

  // Advanced pattern recognition for electrical work
  const electricalPatterns = {
    // Common electrical installation patterns
    lightingInstallation: {
      triggers: ['light point', 'tubelight', 'led', 'bulb holder'],
      sequence: ['wire coil', 'switch', 'conduit pipe', 'junction box', 'mcb'],
      confidence: 0.9
    },
    fanInstallation: {
      triggers: ['fan point', 'ceiling fan', 'exhaust fan'],
      sequence: ['fan box', 'regulator', 'switch', 'wire coil', 'conduit pipe'],
      confidence: 0.85
    },
    socketInstallation: {
      triggers: ['socket', '5 amp socket', '15 amp socket'],
      sequence: ['socket box', 'wire coil', 'switch', 'conduit pipe', 'mcb'],
      confidence: 0.8
    },
    panelWork: {
      triggers: ['panel', 'distribution board', 'mcb', 'main switch'],
      sequence: ['rccb', 'isolator', 'neutral link', 'phase link', 'meter', 'earthing'],
      confidence: 0.95
    },
    wiringWork: {
      triggers: ['wire coil', 'cable', 'wiring'],
      sequence: ['conduit pipe', 'junction box', 'tape', 'cable ties', 'bend'],
      confidence: 0.7
    }
  };

  // Machine learning-like pattern detection
  const analyzeUsagePatterns = useCallback(() => {
    const patterns = [];
    const itemFrequency = new Map();
    const coOccurrence = new Map();

    // Analyze frequency of items
    materials.forEach(material => {
      const name = material.itemName.toLowerCase();
      itemFrequency.set(name, (itemFrequency.get(name) || 0) + 1);
    });

    // Analyze co-occurrence in quotations
    quotations.forEach(quotation => {
      if (quotation.materials && quotation.materials.length > 1) {
        for (let i = 0; i < quotation.materials.length; i++) {
          for (let j = i + 1; j < quotation.materials.length; j++) {
            const item1 = quotation.materials[i].itemName.toLowerCase();
            const item2 = quotation.materials[j].itemName.toLowerCase();
            const pair = [item1, item2].sort().join('|');
            coOccurrence.set(pair, (coOccurrence.get(pair) || 0) + 1);
          }
        }
      }
    });

    // Generate insights
    const frequentItems = Array.from(itemFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const strongPairs = Array.from(coOccurrence.entries())
      .filter(([, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    patterns.push({
      type: 'frequency',
      data: frequentItems,
      insight: 'Most frequently used materials'
    });

    patterns.push({
      type: 'co-occurrence',
      data: strongPairs,
      insight: 'Items commonly used together'
    });

    return patterns;
  }, [materials, quotations]);

  // Predict what items user might need next
  const predictNextItems = useCallback((currentContext = []) => {
    const predictions = [];
    
    // Context-based predictions
    if (currentContext.length > 0) {
      const lastItem = currentContext[currentContext.length - 1]?.toLowerCase();
      
      // Check against electrical patterns
      Object.entries(electricalPatterns).forEach(([patternName, pattern]) => {
        const isTriggered = pattern.triggers.some(trigger => 
          lastItem?.includes(trigger) || trigger.includes(lastItem || '')
        );
        
        if (isTriggered) {
          pattern.sequence.forEach((item, index) => {
            if (!currentContext.some(ctx => ctx.toLowerCase().includes(item))) {
              predictions.push({
                item,
                confidence: pattern.confidence * (1 - index * 0.1),
                reason: `Part of ${patternName} workflow`,
                category: 'workflow'
              });
            }
          });
        }
      });
    }

    // Historical trend predictions
    const recentQuotations = quotations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const recentlyUsedItems = new Set();
    recentQuotations.forEach(q => {
      if (q.materials) {
        q.materials.forEach(m => recentlyUsedItems.add(m.itemName.toLowerCase()));
      }
    });

    Array.from(recentlyUsedItems).forEach(item => {
      if (!predictions.some(p => p.item.toLowerCase() === item)) {
        predictions.push({
          item,
          confidence: 0.6,
          reason: 'Recently used in other quotations',
          category: 'trend'
        });
      }
    });

    return predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);
  }, [quotations]);

  // Generate smart suggestions based on partial input
  const generateSuggestions = useCallback((partialInput, context = []) => {
    if (!partialInput || partialInput.length < 2) {
      setSuggestions([]);
      return;
    }

    const input = partialInput.toLowerCase();
    const newSuggestions = [];

    // 1. Exact and partial matches from existing materials
    materials.forEach(material => {
      const name = material.itemName.toLowerCase();
      if (name.includes(input) && name !== input) {
        newSuggestions.push({
          text: material.itemName,
          confidence: name.startsWith(input) ? 0.9 : 0.7,
          reason: 'From your materials',
          category: 'existing'
        });
      }
    });

    // 2. Pattern-based suggestions
    Object.entries(electricalPatterns).forEach(([patternName, pattern]) => {
      pattern.triggers.forEach(trigger => {
        if (trigger.includes(input) || input.includes(trigger)) {
          pattern.sequence.forEach(item => {
            if (item.includes(input) && !newSuggestions.some(s => s.text.toLowerCase() === item)) {
              newSuggestions.push({
                text: item,
                confidence: 0.8,
                reason: `Common in ${patternName}`,
                category: 'pattern'
              });
            }
          });
        }
      });
    });

    // 3. Common electrical items database
    const commonElectricalItems = [
      'wire coil', 'conduit pipe', 'junction box', 'switch box', 'socket box',
      'mcb', 'rccb', 'isolator', 'neutral link', 'phase link', 'earth link',
      'led tubelight', 'cfl holder', 'batten holder', 'ceiling rose',
      'fan regulator', 'dimmer switch', 'bell push', 'indicator lamp',
      '2.5 sq mm wire', '1.5 sq mm wire', '4 sq mm wire', '6 sq mm wire',
      'pvc conduit', 'gi conduit', 'flexible conduit', 'cable tray',
      'junction box 4x4', 'junction box 6x6', 'metal conduit box',
      '6 amp mcb', '10 amp mcb', '16 amp mcb', '32 amp mcb',
      '25 amp rccb', '40 amp rccb', '63 amp rccb', '100 amp rccb'
    ];

    commonElectricalItems.forEach(item => {
      if (item.includes(input) && !newSuggestions.some(s => s.text.toLowerCase() === item.toLowerCase())) {
        newSuggestions.push({
          text: item,
          confidence: 0.6,
          reason: 'Common electrical item',
          category: 'common'
        });
      }
    });

    // Sort by confidence and relevance
    const sortedSuggestions = newSuggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);

    setSuggestions(sortedSuggestions);
  }, [materials]);

  // Auto-complete functionality
  const getAutoComplete = useCallback((input) => {
    if (!input || input.length < 1) return [];
    
    const matches = materials
      .filter(material => 
        material.itemName.toLowerCase().startsWith(input.toLowerCase())
      )
      .map(material => material.itemName)
      .slice(0, 5);

    return [...new Set(matches)];
  }, [materials]);

  // Analyze trends and generate insights
  useEffect(() => {
    const patterns = analyzeUsagePatterns();
    const predictions = predictNextItems();
    
    setAnalytics({
      patterns,
      trends: predictions,
      predictions
    });
  }, [analyzeUsagePatterns, predictNextItems]);

  return {
    suggestions,
    analytics,
    generateSuggestions,
    getAutoComplete,
    predictNextItems,
    analyzeUsagePatterns
  };
};

export default useSmartSuggestions;
