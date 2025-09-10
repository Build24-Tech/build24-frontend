'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { calculateRiskScore, generateRiskMatrix } from '@/lib/risk-management-utils';
import { Risk, RiskAssessment } from '@/types/launch-essentials';
import { AlertTriangle, Target, TrendingUp } from 'lucide-react';

interface RiskEvaluationProps {
  risks: Risk[];
  assessment: RiskAssessment;
  onChange: (assessment: RiskAssessment) => void;
}

export function RiskEvaluation({ risks, assessment }: RiskEvaluationProps) {
  const riskMatrix = generateRiskMatrix(risks);

  const getRisksByLevel = (level: 'low' | 'medium' | 'high' | 'critical') => {
    return risks.filter(risk => {
      const score = calculateRiskScore(risk.probability, risk.impact);
      return score.level === level;
    });
  };

  const criticalRisks = getRisksByLevel('critical');
  const highRisks = getRisksByLevel('high');
  const mediumRisks = getRisksByLevel('medium');
  const lowRisks = getRisksByLevel('low');

  const getRiskScoreColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOverallRiskColor = () => {
    switch (assessment.overallRiskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const calculateRiskDistribution = () => {
    const total = risks.length;
    if (total === 0) return { critical: 0, high: 0, medium: 0, low: 0 };

    return {
      critical: Math.round((criticalRisks.length / total) * 100),
      high: Math.round((highRisks.length / total) * 100),
      medium: Math.round((mediumRisks.length / total) * 100),
      low: Math.round((lowRisks.length / total) * 100)
    };
  };

  const distribution = calculateRiskDistribution();

  return (
    <div className="space-y-6">
      {/* Risk Evaluation Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Evaluation & Impact Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis of identified risks using probability and impact scoring methodologies.
          </p>
        </CardHeader>
      </Card>

      {/* Overall Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Overall Risk Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-medium">Risk Level:</span>
                <Badge className={`${getOverallRiskColor()} bg-transparent border`}>
                  {assessment.overallRiskLevel.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Critical Risks</span>
                  <span className="text-sm font-medium text-red-600">{criticalRisks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">High Priority Risks</span>
                  <span className="text-sm font-medium text-orange-600">{highRisks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Medium Priority Risks</span>
                  <span className="text-sm font-medium text-yellow-600">{mediumRisks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Low Priority Risks</span>
                  <span className="text-sm font-medium text-green-600">{lowRisks.length}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-4">Risk Distribution</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Critical ({distribution.critical}%)</span>
                    <span>{criticalRisks.length} risks</span>
                  </div>
                  <Progress value={distribution.critical} className="h-2 bg-red-100" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>High ({distribution.high}%)</span>
                    <span>{highRisks.length} risks</span>
                  </div>
                  <Progress value={distribution.high} className="h-2 bg-orange-100" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Medium ({distribution.medium}%)</span>
                    <span>{mediumRisks.length} risks</span>
                  </div>
                  <Progress value={distribution.medium} className="h-2 bg-yellow-100" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Low ({distribution.low}%)</span>
                    <span>{lowRisks.length} risks</span>
                  </div>
                  <Progress value={distribution.low} className="h-2 bg-green-100" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Risk Matrix</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Visual representation of risks plotted by probability and impact.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50 text-xs font-medium">Impact →<br />Probability ↓</th>
                  <th className="border p-2 bg-green-50 text-xs font-medium">Low</th>
                  <th className="border p-2 bg-yellow-50 text-xs font-medium">Medium</th>
                  <th className="border p-2 bg-red-50 text-xs font-medium">High</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 bg-red-50 text-xs font-medium">High</td>
                  <td className="border p-2 text-center bg-yellow-50">
                    <span className="inline-block w-6 h-6 rounded-full bg-yellow-200 text-xs leading-6">
                      {riskMatrix.high.low}
                    </span>
                  </td>
                  <td className="border p-2 text-center bg-orange-50">
                    <span className="inline-block w-6 h-6 rounded-full bg-orange-200 text-xs leading-6">
                      {riskMatrix.high.medium}
                    </span>
                  </td>
                  <td className="border p-2 text-center bg-red-50">
                    <span className="inline-block w-6 h-6 rounded-full bg-red-200 text-xs leading-6">
                      {riskMatrix.high.high}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 bg-yellow-50 text-xs font-medium">Medium</td>
                  <td className="border p-2 text-center bg-green-50">
                    <span className="inline-block w-6 h-6 rounded-full bg-green-200 text-xs leading-6">
                      {riskMatrix.medium.low}
                    </span>
                  </td>
                  <td className="border p-2 text-center bg-yellow-50">
                    <span className="inline-block w-6 h-6 rounded-full bg-yellow-200 text-xs leading-6">
                      {riskMatrix.medium.medium}
                    </span>
                  </td>
                  <td className="border p-2 text-center bg-orange-50">
                    <span className="inline-block w-6 h-6 rounded-full bg-orange-200 text-xs leading-6">
                      {riskMatrix.medium.high}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 bg-green-50 text-xs font-medium">Low</td>
                  <td className="border p-2 text-center bg-green-50">
                    <span className="inline-block w-6 h-6 rounded-full bg-green-200 text-xs leading-6">
                      {riskMatrix.low.low}
                    </span>
                  </td>
                  <td className="border p-2 text-center bg-green-50">
                    <span className="inline-block w-6 h-6 rounded-full bg-green-200 text-xs leading-6">
                      {riskMatrix.low.medium}
                    </span>
                  </td>
                  <td className="border p-2 text-center bg-yellow-50">
                    <span className="inline-block w-6 h-6 rounded-full bg-yellow-200 text-xs leading-6">
                      {riskMatrix.low.high}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Numbers represent the count of risks in each probability/impact combination.
          </div>
        </CardContent>
      </Card>

      {/* Prioritized Risk List */}
      <Card>
        <CardHeader>
          <CardTitle>Prioritized Risk List</CardTitle>
          <p className="text-sm text-muted-foreground">
            Risks ordered by priority score (probability × impact) for focused attention.
          </p>
        </CardHeader>
        <CardContent>
          {risks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No risks to evaluate. Add risks in the Assessment tab first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {risks.map((risk, index) => {
                const riskScore = calculateRiskScore(risk.probability, risk.impact);
                return (
                  <div key={risk.id} className={`border rounded-lg p-4 ${getRiskScoreColor(riskScore.level)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <h4 className="font-medium">{risk.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            Score: {riskScore.score}
                          </Badge>
                        </div>
                        <p className="text-sm opacity-80 mb-2">{risk.description}</p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span>Category: {risk.category}</span>
                          <span>Probability: {risk.probability}</span>
                          <span>Impact: {risk.impact}</span>
                          <span>Owner: {risk.owner}</span>
                        </div>
                      </div>
                      <Badge className={getRiskScoreColor(riskScore.level)}>
                        {riskScore.level.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Category Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Category Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['technical', 'market', 'financial', 'operational', 'legal'].map(category => {
              const categoryRisks = risks.filter(risk => risk.category === category);
              const criticalCount = categoryRisks.filter(risk => {
                const score = calculateRiskScore(risk.probability, risk.impact);
                return score.level === 'critical' || score.level === 'high';
              }).length;

              return (
                <div key={category} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{categoryRisks.length}</div>
                  <div className="text-sm text-muted-foreground capitalize">{category}</div>
                  {criticalCount > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      {criticalCount} high priority
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
