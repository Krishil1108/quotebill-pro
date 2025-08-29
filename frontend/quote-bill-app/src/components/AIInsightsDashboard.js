import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Lightbulb, AlertCircle, Target, Clock, Zap, BarChart3, PieChart } from 'lucide-react';

const AIInsightsDashboard = ({ materials, quotations, isDarkTheme }) => {
  const [insights, setInsights] = useState({
    patterns: [],
    suggestions: [],
    predictions: [],
    analytics: {}
  });

  useEffect(() => {
    generateInsights();
  }, [materials, quotations]);

  const generateInsights = () => {
    const newInsights = {
      patterns: analyzePatterns(),
      suggestions: generateSmartSuggestions(),
      predictions: makePredictions(),
      analytics: calculateAnalytics()
    };
    setInsights(newInsights);
  };

  const analyzePatterns = () => {
    const patterns = [];
    
    // 1. Most frequent item combinations
    const itemPairs = new Map();
    quotations.forEach(quotation => {
      if (quotation.materials && quotation.materials.length > 1) {
        for (let i = 0; i < quotation.materials.length; i++) {
          for (let j = i + 1; j < quotation.materials.length; j++) {
            const item1 = quotation.materials[i].itemName.toLowerCase();
            const item2 = quotation.materials[j].itemName.toLowerCase();
            const pair = [item1, item2].sort().join(' + ');
            itemPairs.set(pair, (itemPairs.get(pair) || 0) + 1);
          }
        }
      }
    });

    const topPairs = Array.from(itemPairs.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pair, count]) => ({
        pattern: pair,
        frequency: count,
        confidence: Math.min(count / quotations.length * 100, 100)
      }));

    if (topPairs.length > 0) {
      patterns.push({
        type: 'combinations',
        title: 'Most Common Item Combinations',
        data: topPairs,
        icon: 'link'
      });
    }

    // 2. Category trends
    const categoryUsage = new Map();
    materials.forEach(material => {
      const category = material.category || 'general';
      categoryUsage.set(category, (categoryUsage.get(category) || 0) + 1);
    });

    const topCategories = Array.from(categoryUsage.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    if (topCategories.length > 0) {
      patterns.push({
        type: 'categories',
        title: 'Top Material Categories',
        data: topCategories.map(([category, count]) => ({
          category,
          count,
          percentage: Math.round((count / materials.length) * 100)
        })),
        icon: 'pie-chart'
      });
    }

    // 3. Seasonal/Time-based patterns
    const monthlyUsage = new Map();
    materials.forEach(material => {
      const month = new Date(material.createdAt || material.purchaseDate || Date.now()).getMonth();
      const monthName = new Date(0, month).toLocaleString('default', { month: 'long' });
      monthlyUsage.set(monthName, (monthlyUsage.get(monthName) || 0) + 1);
    });

    if (monthlyUsage.size > 1) {
      patterns.push({
        type: 'temporal',
        title: 'Usage Patterns by Month',
        data: Array.from(monthlyUsage.entries()).map(([month, count]) => ({ month, count })),
        icon: 'clock'
      });
    }

    return patterns;
  };

  const generateSmartSuggestions = () => {
    const suggestions = [];

    // 1. Incomplete electrical setups
    const hasLights = materials.some(m => m.itemName.toLowerCase().includes('light'));
    const hasSwitches = materials.some(m => m.itemName.toLowerCase().includes('switch'));
    const hasWires = materials.some(m => m.itemName.toLowerCase().includes('wire'));
    const hasConduits = materials.some(m => m.itemName.toLowerCase().includes('conduit'));

    if (hasLights && !hasSwitches) {
      suggestions.push({
        type: 'completion',
        title: 'Missing Switches',
        description: 'You have lighting materials but no switches. Consider adding switches for complete installation.',
        action: 'Add switches',
        priority: 'high',
        icon: 'alert-circle'
      });
    }

    if ((hasLights || hasSwitches) && !hasWires) {
      suggestions.push({
        type: 'completion',
        title: 'Missing Wiring',
        description: 'Electrical components need wire coils for connections.',
        action: 'Add wire coils',
        priority: 'high',
        icon: 'alert-circle'
      });
    }

    if (hasWires && !hasConduits) {
      suggestions.push({
        type: 'safety',
        title: 'Consider Conduit Pipes',
        description: 'Conduit pipes protect wiring and provide professional installation.',
        action: 'Add conduit pipes',
        priority: 'medium',
        icon: 'lightbulb'
      });
    }

    // 2. Cost optimization suggestions
    const expensiveItems = materials
      .filter(m => m.rate > 500)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3);

    if (expensiveItems.length > 0) {
      suggestions.push({
        type: 'optimization',
        title: 'Cost Review Recommended',
        description: `Your most expensive items: ${expensiveItems.map(m => m.itemName).join(', ')}. Consider price comparison.`,
        action: 'Review pricing',
        priority: 'low',
        icon: 'target'
      });
    }

    // 3. Bulk purchase suggestions
    const frequentItems = materials.reduce((acc, material) => {
      const name = material.itemName.toLowerCase();
      acc[name] = (acc[name] || 0) + material.quantity;
      return acc;
    }, {});

    const topFrequent = Object.entries(frequentItems)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (topFrequent.length > 0 && topFrequent[0][1] > 10) {
      suggestions.push({
        type: 'bulk',
        title: 'Bulk Purchase Opportunity',
        description: `You frequently use ${topFrequent[0][0]} (${topFrequent[0][1]} units). Consider bulk purchasing for better rates.`,
        action: 'Optimize bulk buying',
        priority: 'medium',
        icon: 'trending-up'
      });
    }

    return suggestions;
  };

  const makePredictions = () => {
    const predictions = [];

    // 1. Next likely purchases based on current inventory
    const recentMaterials = materials
      .sort((a, b) => new Date(b.createdAt || b.purchaseDate || 0) - new Date(a.createdAt || a.purchaseDate || 0))
      .slice(0, 5);

    if (recentMaterials.length > 0) {
      const categories = [...new Set(recentMaterials.map(m => m.category))];
      predictions.push({
        type: 'purchase',
        title: 'Likely Next Purchases',
        description: `Based on recent activity in ${categories.join(', ')} categories`,
        items: getComplementaryItems(recentMaterials),
        confidence: 75
      });
    }

    // 2. Seasonal predictions
    const currentMonth = new Date().getMonth();
    const seasonalItems = getSeasonalRecommendations(currentMonth);
    
    if (seasonalItems.length > 0) {
      predictions.push({
        type: 'seasonal',
        title: 'Seasonal Recommendations',
        description: 'Items typically needed during this time of year',
        items: seasonalItems,
        confidence: 60
      });
    }

    // 3. Project completion predictions
    const incompleteProjects = identifyIncompleteProjects();
    if (incompleteProjects.length > 0) {
      predictions.push({
        type: 'completion',
        title: 'Project Completion Items',
        description: 'Items needed to complete ongoing projects',
        items: incompleteProjects,
        confidence: 85
      });
    }

    return predictions;
  };

  const calculateAnalytics = () => {
    const totalValue = materials.reduce((sum, m) => sum + (m.rate * m.quantity), 0);
    const avgItemValue = materials.length > 0 ? totalValue / materials.length : 0;
    
    const categoryDistribution = materials.reduce((acc, m) => {
      const category = m.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const quotationSuccess = quotations.filter(q => q.status === 'ready').length;
    const successRate = quotations.length > 0 ? (quotationSuccess / quotations.length) * 100 : 0;

    return {
      totalValue,
      avgItemValue,
      categoryDistribution,
      successRate,
      totalItems: materials.length,
      totalQuotations: quotations.length
    };
  };

  const getComplementaryItems = (recentMaterials) => {
    const complementary = {
      'tubelights': ['choke', 'starter', 'holder'],
      'wire': ['conduit pipe', 'junction box', 'tape'],
      'switch': ['socket', 'switch box', 'wire coil'],
      'fan': ['regulator', 'fan box', 'switch']
    };

    const suggestions = [];
    recentMaterials.forEach(material => {
      const category = material.category;
      if (complementary[category]) {
        suggestions.push(...complementary[category]);
      }
    });

    return [...new Set(suggestions)].slice(0, 5);
  };

  const getSeasonalRecommendations = (month) => {
    const seasonal = {
      // Summer months (March-June)
      2: ['fan', 'cooler', 'exhaust fan'],
      3: ['fan', 'cooler', 'exhaust fan'],
      4: ['fan', 'cooler', 'exhaust fan'],
      5: ['fan', 'cooler', 'exhaust fan'],
      // Monsoon (July-September)
      6: ['waterproof socket', 'rccb', 'earthing'],
      7: ['waterproof socket', 'rccb', 'earthing'],
      8: ['waterproof socket', 'rccb', 'earthing'],
      // Festival season (October-November)
      9: ['decorative lights', 'extension cord', 'outdoor socket'],
      10: ['decorative lights', 'extension cord', 'outdoor socket'],
      // Winter (December-February)
      11: ['heater', 'room heater socket', 'heavy duty wire'],
      0: ['heater', 'room heater socket', 'heavy duty wire'],
      1: ['heater', 'room heater socket', 'heavy duty wire']
    };

    return seasonal[month] || [];
  };

  const identifyIncompleteProjects = () => {
    // Logic to identify incomplete electrical setups
    const hasItems = (keywords) => materials.some(m => 
      keywords.some(keyword => m.itemName.toLowerCase().includes(keyword))
    );

    const incomplete = [];
    
    if (hasItems(['light']) && !hasItems(['switch'])) {
      incomplete.push('switches for lighting');
    }
    
    if (hasItems(['switch', 'socket']) && !hasItems(['wire'])) {
      incomplete.push('wire coils for connections');
    }
    
    if (hasItems(['wire']) && !hasItems(['conduit'])) {
      incomplete.push('conduit pipes for protection');
    }

    return incomplete;
  };

  const renderInsightCard = (insight, index) => {
    const icons = {
      'link': <Zap className="text-blue-500" size={20} />,
      'pie-chart': <PieChart className="text-green-500" size={20} />,
      'clock': <Clock className="text-purple-500" size={20} />,
      'alert-circle': <AlertCircle className="text-red-500" size={20} />,
      'lightbulb': <Lightbulb className="text-yellow-500" size={20} />,
      'target': <Target className="text-indigo-500" size={20} />,
      'trending-up': <TrendingUp className="text-green-500" size={20} />
    };

    return (
      <div
        key={index}
        className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-lg ${
          isDarkTheme
            ? 'bg-gray-800 border-gray-600 hover:border-gray-500'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          {icons[insight.icon] || <Brain className="text-blue-500" size={20} />}
          <h4 className="font-medium">{insight.title}</h4>
        </div>
        <p className={`text-sm mb-3 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
          {insight.description}
        </p>
        {insight.action && (
          <button className={`text-sm px-3 py-1 rounded-full transition-colors ${
            insight.priority === 'high' 
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : insight.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}>
            {insight.action}
          </button>
        )}
      </div>
    );
  };

  if (materials.length === 0 && quotations.length === 0) {
    return (
      <div className={`p-6 rounded-lg border text-center ${
        isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <Brain size={48} className="mx-auto mb-4 text-gray-400" />
        <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
          Add some materials and create quotations to see AI insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-blue-500" size={24} />
        <h3 className="text-xl font-semibold">AI Insights & Suggestions</h3>
      </div>

      {/* Quick Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <div className="text-2xl font-bold text-blue-600">
            ₹{insights.analytics.totalValue?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-500">Total Inventory Value</div>
        </div>
        <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-green-50'}`}>
          <div className="text-2xl font-bold text-green-600">
            {insights.analytics.totalItems || 0}
          </div>
          <div className="text-sm text-gray-500">Total Items</div>
        </div>
        <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-purple-50'}`}>
          <div className="text-2xl font-bold text-purple-600">
            {insights.analytics.totalQuotations || 0}
          </div>
          <div className="text-sm text-gray-500">Quotations</div>
        </div>
        <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-yellow-50'}`}>
          <div className="text-2xl font-bold text-yellow-600">
            {Math.round(insights.analytics.successRate || 0)}%
          </div>
          <div className="text-sm text-gray-500">Success Rate</div>
        </div>
      </div>

      {/* Smart Suggestions */}
      {insights.suggestions.length > 0 && (
        <div>
          <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={20} />
            Smart Suggestions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.suggestions.map(renderInsightCard)}
          </div>
        </div>
      )}

      {/* Patterns */}
      {insights.patterns.length > 0 && (
        <div>
          <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={20} />
            Usage Patterns
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.patterns.map((pattern, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isDarkTheme
                    ? 'bg-gray-800 border-gray-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <h5 className="font-medium mb-3">{pattern.title}</h5>
                <div className="space-y-2">
                  {pattern.data.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{pattern.type === 'combinations' ? item.pattern : item.category || item.month}</span>
                      <span className="font-medium">
                        {pattern.type === 'combinations' 
                          ? `${item.frequency} times`
                          : pattern.type === 'categories'
                            ? `${item.percentage}%`
                            : item.count
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictions */}
      {insights.predictions.length > 0 && (
        <div>
          <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="text-green-500" size={20} />
            AI Predictions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.predictions.map((prediction, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isDarkTheme
                    ? 'bg-gray-800 border-gray-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{prediction.title}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    prediction.confidence > 80
                      ? 'bg-green-100 text-green-700'
                      : prediction.confidence > 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {prediction.confidence}% confidence
                  </span>
                </div>
                <p className={`text-sm mb-3 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  {prediction.description}
                </p>
                {prediction.items && (
                  <div className="flex flex-wrap gap-1">
                    {prediction.items.map((item, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-1 rounded-full ${
                          isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightsDashboard;
