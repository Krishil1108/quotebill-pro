import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, CheckCircle, Plus, Sparkles, Zap, RefreshCw } from 'lucide-react';

const AIQuoteAuditor = ({ items, setItems, isDarkTheme }) => {
  const [warnings, setWarnings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditRun, setAuditRun] = useState(false);

  // Run audit when items change (if it has been run at least once)
  useEffect(() => {
    if (auditRun) {
      runAudit();
    }
  }, [items]);

  const runAudit = () => {
    setIsAuditing(true);
    setAuditRun(true);

    const newWarnings = [];
    const newRecommendations = [];

    // Helper to check if keyword is in items
    const hasItem = (keywords) => items.some(item => 
      keywords.some(keyword => (item.particular || '').toLowerCase().includes(keyword))
    );

    // Helper to find specific item index
    const findItemIndex = (keywords) => items.findIndex(item => 
      keywords.some(keyword => (item.particular || '').toLowerCase().includes(keyword))
    );

    // 1. SAFETY AUDIT: Distribution Panel vs safety switches (MCB/RCCB)
    const hasPanel = hasItem(['board', 'db', 'panel', 'distribution', 'mains']);
    const hasBreaker = hasItem(['mcb', 'rccb', 'elcb', 'breaker', 'fuse']);

    if (hasPanel && !hasBreaker) {
      newWarnings.push({
        id: 'safety_breakers',
        type: 'safety',
        title: 'Safety Hazard: Missing Circuit Breakers',
        description: 'You have listed a Main Panel or Distribution Board, but no MCBs (Miniature Circuit Breakers) or RCCBs (Residual Current Circuit Breakers) are included. Electrical panels require safety switches for overload and shock protection.',
        suggestions: [
          {
            label: 'Add 32A Double Pole RCCB (Main Safety Switch)',
            item: {
              particular: '32A Double Pole RCCB 30mA (residual current safety switch)',
              quantity: '1',
              unit: 'pcs',
              rate: '1850',
              amount: 1850
            }
          },
          {
            label: 'Add 16A SP MCBs (Pack of 6 for light circuits)',
            item: {
              particular: '16A Single Pole MCB (C-curve)',
              quantity: '6',
              unit: 'pcs',
              rate: '190',
              amount: 1140
            }
          }
        ]
      });
    }

    // 2. SAFETY AUDIT: High-power appliances vs dedicated sockets
    const hasHighPowerAppliance = hasItem(['geyser', 'ac', 'air conditioner', 'water heater', 'motor', 'pump']);
    const hasPowerSocket = hasItem(['socket', 'power plug', 'metal clad', '20a', '25a', 'power point']);

    if (hasHighPowerAppliance && !hasPowerSocket) {
      newWarnings.push({
        id: 'safety_socket',
        type: 'safety',
        title: 'Missing Power Socket outlets',
        description: 'High-power appliances like Geysers, ACs, or Motors are listed, but no heavy-duty socket outlets are present. Standard 6A sockets will burn under heavy loads.',
        suggestions: [
          {
            label: 'Add 20A Metal Clad Socket with MCB enclosure',
            item: {
              particular: '20A Metal Clad Socket + MCB unit (Heavy duty appliance power point)',
              quantity: '1',
              unit: 'pcs',
              rate: '850',
              amount: 850
            }
          }
        ]
      });
    }

    // 3. UNIT CONSISTENCY AUDIT: Wires/Pipes in pcs instead of meters
    items.forEach((item, index) => {
      const isLengthMaterial = ['wire', 'cable', 'pipe', 'conduit', 'casing'].some(keyword => 
        (item.particular || '').toLowerCase().includes(keyword)
      );
      const hasPcsUnit = ['pcs', 'nos', 'no'].includes((item.unit || '').toLowerCase());

      if (isLengthMaterial && hasPcsUnit) {
        newWarnings.push({
          id: `unit_wire_${index}`,
          type: 'consistency',
          title: `Inconsistent Unit: "${item.particular.substring(0, 25)}..."`,
          description: `Wiring materials and conduit pipes are typically measured in length (meters or feet) rather than individual pieces (pcs).`,
          action: {
            label: "Convert Unit to 'meters'",
            handler: () => {
              const updated = [...items];
              updated[index].unit = 'meters';
              setItems(updated);
            }
          }
        });
      }
    });

    // 4. PRICE AUDIT: Zero or Empty Rates
    items.forEach((item, index) => {
      const rateVal = parseFloat(item.rate);
      if (item.particular && (isNaN(rateVal) || rateVal <= 0)) {
        newWarnings.push({
          id: `zero_rate_${index}`,
          type: 'pricing',
          title: `Missing Pricing: "${item.particular.substring(0, 25)}..."`,
          description: 'This item has a rate of zero or is empty. Please enter a valid rate to ensure the total estimate is accurate.',
          highlightIndex: index
        });
      }
    });

    // 5. SMART ESTIMATOR: Wiring & Conduits based on point installation
    let totalPoints = 0;
    items.forEach(item => {
      const isPoint = ['point', 'pt'].some(keyword => 
        (item.particular || '').toLowerCase().includes(keyword)
      );
      if (isPoint) {
        totalPoints += (parseFloat(item.quantity) || 0);
      }
    });

    if (totalPoints > 0) {
      // Check if wire/conduit is already in the list
      const hasWireAlready = hasItem(['wire', 'cable']);
      const hasConduitAlready = hasItem(['conduit', 'pipe', 'casing']);

      if (!hasWireAlready || !hasConduitAlready) {
        const estWireQty = Math.round(totalPoints * 6); // ~6m wire per point
        const estConduitQty = Math.round(totalPoints * 3); // ~3m conduit per point
        const estBoxQty = Math.round(totalPoints * 1.2); // ~1.2 boxes/accessories per point

        const suggestedMaterials = [];
        if (!hasWireAlready) {
          suggestedMaterials.push({
            particular: '1.5 sqmm FR Copper Wire (Estimated lighting circuit wiring)',
            quantity: estWireQty.toString(),
            unit: 'meters',
            rate: '18',
            amount: estWireQty * 18
          });
        }
        if (!hasConduitAlready) {
          suggestedMaterials.push({
            particular: '20mm Heavy Duty PVC Conduit Pipes (Estimate for routing points)',
            quantity: estConduitQty.toString(),
            unit: 'meters',
            rate: '22',
            amount: estConduitQty * 22
          });
          suggestedMaterials.push({
            particular: '20mm Junction Box & bend accessories',
            quantity: estBoxQty.toString(),
            unit: 'pcs',
            rate: '35',
            amount: estBoxQty * 35
          });
        }

        newRecommendations.push({
          id: 'smart_material_estimate',
          title: `Smart Material Estimation (${totalPoints} Points Detected)`,
          description: `Based on your ${totalPoints} point installations, the AI estimated the required conduit pipes, wire length, and junction box accessories for this quote.`,
          materials: suggestedMaterials,
          action: {
            label: '⚡ Auto-add estimated materials to quote',
            handler: () => {
              const newItems = suggestedMaterials.map(mat => ({
                id: Date.now() + Math.random(),
                ...mat
              }));
              setItems([...items, ...newItems]);
            }
          }
        });
      }
    }

    setWarnings(newWarnings);
    setRecommendations(newRecommendations);
    setTimeout(() => {
      setIsAuditing(false);
    }, 400);
  };

  const handleAddSuggestedItem = (suggestedItem) => {
    const newItem = {
      id: Date.now(),
      particular: suggestedItem.particular,
      quantity: suggestedItem.quantity,
      unit: suggestedItem.unit,
      rate: suggestedItem.rate,
      amount: parseFloat(suggestedItem.amount) || 0
    };
    setItems([...items, newItem]);
  };

  return (
    <div className={`mt-6 p-5 rounded-2xl border transition-all duration-300 ${
      isDarkTheme 
        ? 'bg-gray-800/40 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-800 shadow-sm'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="text-purple-500 animate-pulse" size={24} />
          <div>
            <h3 className="text-lg font-bold flex items-center gap-1.5">
              AI Quote Auditor & Optimizer
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-normal border border-purple-500/20">
                Local Expert System
              </span>
            </h3>
            <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
              Scans electrical quote particulars to detect safety omissions and estimate missing materials.
            </p>
          </div>
        </div>
        <button
          onClick={runAudit}
          disabled={isAuditing}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-md ${
            isDarkTheme 
              ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-800' 
              : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-400'
          }`}
        >
          {isAuditing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Auditing...
            </>
          ) : (
            <>
              <Zap size={16} />
              {auditRun ? 'Re-Audit Quote' : 'AI Audit Quote'}
            </>
          )}
        </button>
      </div>

      {auditRun && (
        <div className="space-y-4 mt-2">
          {warnings.length === 0 && recommendations.length === 0 ? (
            <div className={`p-4 rounded-xl flex items-start gap-3 border ${
              isDarkTheme 
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <CheckCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Quote is Clean & Optimized</p>
                <p className="text-xs mt-0.5 opacity-90">
                  AI didn\'t detect any missing safety items, inconsistent units, or empty prices. Ready to export!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Warnings List */}
              {warnings.map((warn) => (
                <div 
                  key={warn.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all duration-200 ${
                    isDarkTheme 
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' 
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex gap-3">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-500" />
                    <div>
                      <p className="font-bold text-sm">{warn.title}</p>
                      <p className={`text-xs mt-1 leading-relaxed ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                        {warn.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 md:self-center">
                    {/* Action buttons */}
                    {warn.action && (
                      <button
                        onClick={warn.action.handler}
                        className="text-xs font-bold px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                      >
                        {warn.action.label}
                      </button>
                    )}

                    {/* Safety suggestion buttons */}
                    {warn.suggestions && warn.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddSuggestedItem(sug.item)}
                        className={`text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                          isDarkTheme
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                        }`}
                      >
                        <Plus size={14} />
                        {sug.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Recommendations (Smart Estimates) */}
              {recommendations.map((rec) => (
                <div 
                  key={rec.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all duration-200 ${
                    isDarkTheme 
                      ? 'bg-blue-950/20 border-blue-500/30 text-blue-300' 
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <div className="flex gap-3">
                    <Sparkles size={20} className="shrink-0 mt-0.5 text-blue-500" />
                    <div>
                      <p className="font-bold text-sm">{rec.title}</p>
                      <p className={`text-xs mt-1 leading-relaxed ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                        {rec.description}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {rec.materials.map((mat, i) => (
                          <span 
                            key={i} 
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${
                              isDarkTheme 
                                ? 'bg-gray-800 border-gray-700 text-gray-300' 
                                : 'bg-white border-gray-200 text-gray-600'
                            }`}
                          >
                            {mat.particular.split(' (')[0]} • {mat.quantity} {mat.unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 md:self-center">
                    {rec.action && (
                      <button
                        onClick={rec.action.handler}
                        className="text-xs font-bold px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                      >
                        {rec.action.label}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIQuoteAuditor;
