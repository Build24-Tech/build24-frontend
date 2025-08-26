'use client';

import { businessModelTemplates, calculateFinancialProjection, calculateFundingRequirements, optimizeFinancialModel } from '@/lib/financial-planning-utils';
import { useState } from 'react';

interface FinancialPlanningProps {
  onSave?: (data: any) => void;
  initialData?: any;
}

export default function FinancialPlanning({ onSave, initialData }: FinancialPlanningProps) {
  const [activeTab, setActiveTab] = useState('business-model');
  const [businessModel, setBusinessModel] = useState(initialData?.businessModel || businessModelTemplates.saas);
  const [cashFlowData, setCashFlowData] = useState(initialData?.cashFlowData || {
    timeframe: 'monthly' as const,
    periods: 12,
    startingCash: 50000,
    revenue: Array(12).fill(10000),
    expenses: Array(12).fill(8000)
  });
  const [pricingStrategy, setPricingStrategy] = useState(initialData?.pricingStrategy || {
    methodology: 'value-based' as const,
    basePrice: 99
  });

  const projection = calculateFinancialProjection(cashFlowData);
  const fundingRequirements = calculateFundingRequirements(cashFlowData);
  const optimizations = optimizeFinancialModel(cashFlowData);

  const handleSave = async () => {
    const data = {
      businessModel,
      cashFlowData,
      pricingStrategy,
      projection,
      fundingRequirements,
      optimizations,
      completedAt: new Date().toISOString()
    };

    if (onSave) {
      await onSave(data);
    }
  };

  const generateRevenue = () => {
    const newRevenue = Array.from({ length: 12 }, (_, i) =>
      Math.floor(10000 * (1 + i * 0.1) * (0.8 + Math.random() * 0.4))
    );
    setCashFlowData(prev => ({ ...prev, revenue: newRevenue }));
  };

  const generateExpenses = () => {
    const newExpenses = Array.from({ length: 12 }, (_, i) =>
      Math.floor(8000 * (1 + i * 0.05) * (0.9 + Math.random() * 0.2))
    );
    setCashFlowData(prev => ({ ...prev, expenses: newExpenses }));
  };

  const tabs = [
    { id: 'business-model', label: 'Business Model' },
    { id: 'revenue-model', label: 'Revenue Model' },
    { id: 'cash-flow', label: 'Cash Flow' },
    { id: 'pricing-strategy', label: 'Pricing Strategy' },
    { id: 'analysis', label: 'Analysis' }
  ];

  return (
    <div className="financial-planning">
      <h1>Financial Planning & Business Model</h1>

      <div className="tabs" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="tab-content">
        {activeTab === 'business-model' && (
          <div>
            <h2>Business Model Selection</h2>
            <div className="business-model-templates">
              {Object.entries(businessModelTemplates).map(([key, template]) => (
                <div
                  key={key}
                  className={`template-card ${businessModel.type === key ? 'selected' : ''}`}
                  onClick={() => setBusinessModel(template)}
                >
                  <h3>{key}</h3>
                  <p>Revenue Streams: {template.revenueStreams.join(', ')}</p>
                </div>
              ))}
            </div>

            <div className="cost-structure">
              <h3>Fixed Costs (Monthly)</h3>
              {Object.entries(businessModel.costStructure).map(([category, amount]) => (
                <div key={category} className="cost-item">
                  <span>{category}</span>
                  <span>${amount.toLocaleString()}</span>
                </div>
              ))}

              <h3>Variable Costs</h3>
              <p>Costs that scale with revenue and usage</p>
            </div>
          </div>
        )}

        {activeTab === 'revenue-model' && (
          <div>
            <h2>Revenue Model Configuration</h2>
            <div className="form-group">
              <label htmlFor="revenue-type">Revenue Type</label>
              <select id="revenue-type">
                <option value="subscription">Subscription</option>
                <option value="one-time">One-time</option>
                <option value="usage-based">Usage-based</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="mrr">Monthly Recurring Revenue (if applicable)</label>
              <input type="number" id="mrr" placeholder="10000" />
            </div>

            <div className="form-group">
              <label htmlFor="conversion-rate">Conversion Rate (%)</label>
              <input type="number" id="conversion-rate" placeholder="2.5" />
            </div>
          </div>
        )}

        {activeTab === 'cash-flow' && (
          <div>
            <h2>Cash Flow Projections</h2>

            <div className="form-group">
              <label htmlFor="projection-period">Projection Period</label>
              <select
                id="projection-period"
                value={cashFlowData.periods}
                onChange={(e) => setCashFlowData(prev => ({ ...prev, periods: parseInt(e.target.value) }))}
              >
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
                <option value={36}>36 months</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="starting-cash">Starting Cash</label>
              <input
                type="number"
                id="starting-cash"
                value={cashFlowData.startingCash}
                onChange={(e) => setCashFlowData(prev => ({ ...prev, startingCash: parseInt(e.target.value) }))}
              />
            </div>

            <div className="projections-section">
              <h3>Monthly Projections</h3>
              <div className="projection-controls">
                <button onClick={generateRevenue}>Generate Revenue</button>
                <button onClick={generateExpenses}>Generate Expenses</button>
              </div>

              <div className="projection-table">
                <div className="table-header">
                  <span>Month</span>
                  <span>Revenue</span>
                  <span>Expenses</span>
                  <span>Profit</span>
                </div>
                {projection.revenue.slice(0, 6).map((revenue, index) => (
                  <div key={index} className="table-row">
                    <span>{index + 1}</span>
                    <span>${revenue.toLocaleString()}</span>
                    <span>${projection.expenses[index].toLocaleString()}</span>
                    <span>${projection.profit[index].toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing-strategy' && (
          <div>
            <h2>Pricing Strategy</h2>
            <p>Determine optimal pricing using different methodologies</p>

            <div className="form-group">
              <label htmlFor="pricing-methodology">Pricing Methodology</label>
              <select
                id="pricing-methodology"
                role="combobox"
                value={pricingStrategy.methodology}
                onChange={(e) => setPricingStrategy(prev => ({ ...prev, methodology: e.target.value as any }))}
              >
                <option value="cost-plus">Cost Plus</option>
                <option value="value-based">Value Based</option>
                <option value="competitive">Competitive</option>
                <option value="penetration">Penetration</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="base-price">Base Price ($)</label>
              <input
                type="number"
                id="base-price"
                value={pricingStrategy.basePrice}
                onChange={(e) => setPricingStrategy(prev => ({ ...prev, basePrice: parseFloat(e.target.value) }))}
              />
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div>
            <h2>Financial Analysis</h2>

            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Break-even</h3>
                <p className="metric-value">Month {projection.breakEvenMonth}</p>
              </div>

              <div className="metric-card">
                <h3>ROI</h3>
                <p className="metric-value">{projection.roi}%</p>
              </div>

              <div className="metric-card">
                <h3>Payback Period</h3>
                <p className="metric-value">{projection.paybackPeriod} months</p>
              </div>
            </div>

            <div className="funding-section">
              <h3>Funding Requirements</h3>
              <div className="funding-details">
                <div className="funding-item">
                  <span>Total Funding Required</span>
                  <span>${fundingRequirements.totalRequired.toLocaleString()}</span>
                </div>
                <div className="funding-item">
                  <span>Runway</span>
                  <span>{fundingRequirements.runway.toFixed(1)} months</span>
                </div>
              </div>

              {fundingRequirements.fundingGap > 0 && (
                <div className="funding-gap">
                  <p>Additional ${fundingRequirements.fundingGap.toLocaleString()} needed to reach 18-month runway target</p>
                </div>
              )}
            </div>

            <div className="optimizations-section">
              <h3>Optimization Recommendations</h3>
              {optimizations.map((opt, index) => (
                <div key={index} className="optimization-item">
                  <h4>{opt.suggestion}</h4>
                  <p>{opt.expectedImprovement}</p>
                  <span className="impact-badge">{opt.impact} impact</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={handleSave} className="save-button">
        Save Progress
      </button>
    </div>
  );
}
