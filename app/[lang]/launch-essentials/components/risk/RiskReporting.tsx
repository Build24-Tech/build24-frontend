'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  calculateRiskScore,
  evaluateMitigationEffectiveness,
  generateRiskReport,
  prioritizeRisks
} from '@/lib/risk-management-utils';
import { MitigationStrategy, MonitoringPlan, Risk, RiskAssessment } from '@/types/launch-essentials';
import { AlertTriangle, CheckCircle, Download, FileText, Share, TrendingUp } from 'lucide-react';

interface RiskReportingProps {
  risks: Risk[];
  assessment: RiskAssessment;
  mitigationStrategies: MitigationStrategy[];
  monitoringPlans: MonitoringPlan[];
}

export function RiskReporting({
  risks,
  assessment,
  mitigationStrategies,
  monitoringPlans
}: RiskReportingProps) {
  const report = generateRiskReport(risks, assessment, mitigationStrategies);
  const prioritizedRisks = prioritizeRisks(risks);

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

  const mitigatedRisks = risks.filter(risk =>
    mitigationStrategies.some(strategy => strategy.riskId === risk.id)
  );

  const monitoredRisks = risks.filter(risk =>
    monitoringPlans.some(plan => plan.riskId === risk.id)
  );

  const totalMitigationCost = mitigationStrategies.reduce((sum, strategy) => sum + strategy.cost, 0);

  const getOverallRiskColor = () => {
    switch (assessment.overallRiskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCompletionPercentage = () => {
    const totalTasks = 4; // assessment, mitigation, monitoring, reporting
    let completed = 0;

    if (risks.length > 0) completed++;
    if (mitigationStrategies.length > 0) completed++;
    if (monitoringPlans.length > 0) completed++;
    if (risks.length > 0 && mitigationStrategies.length > 0 && monitoringPlans.length > 0) completed++;

    return Math.round((completed / totalTasks) * 100);
  };

  const exportReport = () => {
    const reportContent = generateReportContent();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk-management-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    return `
RISK MANAGEMENT REPORT
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
${report.summary}

OVERALL RISK ASSESSMENT
Risk Level: ${assessment.overallRiskLevel.toUpperCase()}
Total Risks Identified: ${risks.length}
Critical Risks: ${criticalRisks.length}
High Priority Risks: ${highRisks.length}
Risks with Mitigation: ${mitigatedRisks.length}
Risks with Monitoring: ${monitoredRisks.length}
Total Mitigation Cost: $${totalMitigationCost.toLocaleString()}

KEY FINDINGS
${report.keyFindings.map(finding => `• ${finding}`).join('\n')}

RECOMMENDATIONS
${report.recommendations.map(rec => `• ${rec}`).join('\n')}

NEXT STEPS
${report.nextSteps.map(step => `• ${step}`).join('\n')}

DETAILED RISK REGISTER
${prioritizedRisks.map((risk, index) => {
      const riskScore = calculateRiskScore(risk.probability, risk.impact);
      const strategy = mitigationStrategies.find(s => s.riskId === risk.id);
      const monitoring = monitoringPlans.find(p => p.riskId === risk.id);

      return `
${index + 1}. ${risk.title}
   Category: ${risk.category}
   Probability: ${risk.probability} | Impact: ${risk.impact} | Level: ${riskScore.level}
   Description: ${risk.description}
   Owner: ${risk.owner}
   ${strategy ? `Mitigation: ${strategy.strategy} (Cost: $${strategy.cost})` : 'No mitigation strategy'}
   ${monitoring ? `Monitoring: ${monitoring.frequency} monitoring with ${monitoring.indicators.length} indicators` : 'No monitoring plan'}
`;
    }).join('\n')}
    `.trim();
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Risk Reporting Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Risk Management Report</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis and reporting of your risk management activities.
          </p>
        </CardHeader>
      </Card>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={exportReport} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Share className="h-4 w-4" />
              <span>Share with Team</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Generate PDF</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Overall Risk Level:</span>
                <Badge className={`${getOverallRiskColor()} bg-transparent border`}>
                  {assessment.overallRiskLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Completion:</span>
                <Badge variant={completionPercentage >= 75 ? 'default' : 'secondary'}>
                  {completionPercentage}%
                </Badge>
              </div>
            </div>

            <Progress value={completionPercentage} className="mb-4" />

            <p className="text-sm text-muted-foreground">{report.summary}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{risks.length}</div>
                <div className="text-xs text-blue-700">Total Risks</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">{criticalRisks.length + highRisks.length}</div>
                <div className="text-xs text-red-700">High Priority</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{mitigatedRisks.length}</div>
                <div className="text-xs text-green-700">Mitigated</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-600">${totalMitigationCost.toLocaleString()}</div>
                <div className="text-xs text-purple-700">Mitigation Cost</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Key Findings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.keyFindings.map((finding, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{finding}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Distribution Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">By Priority Level</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Critical</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${risks.length > 0 ? (criticalRisks.length / risks.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{criticalRisks.length}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">High</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${risks.length > 0 ? (highRisks.length / risks.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{highRisks.length}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Medium</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${risks.length > 0 ? (mediumRisks.length / risks.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{mediumRisks.length}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Low</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${risks.length > 0 ? (lowRisks.length / risks.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{lowRisks.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">By Category</h4>
              <div className="space-y-2">
                {['technical', 'market', 'financial', 'operational', 'legal'].map(category => {
                  const categoryRisks = risks.filter(risk => risk.category === category);
                  return (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${risks.length > 0 ? (categoryRisks.length / risks.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{categoryRisks.length}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.nextSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mitigation Effectiveness Analysis */}
      {mitigationStrategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mitigation Effectiveness Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mitigationStrategies.map((strategy, index) => {
                const risk = risks.find(r => r.id === strategy.riskId);
                if (!risk) return null;

                const effectiveness = evaluateMitigationEffectiveness(risk, strategy);

                return (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{risk.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        ROI: {effectiveness.costBenefit.toFixed(1)}x
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Strategy: {strategy.strategy} | Cost: ${strategy.cost.toLocaleString()}
                    </div>
                    <div className="text-xs bg-gray-50 p-2 rounded">
                      {effectiveness.recommendation}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Register Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Register Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {risks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No risks identified yet. Complete the risk assessment to generate a comprehensive report.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prioritizedRisks.slice(0, 10).map((risk, index) => {
                const riskScore = calculateRiskScore(risk.probability, risk.impact);
                const hasMitigation = mitigationStrategies.some(s => s.riskId === risk.id);
                const hasMonitoring = monitoringPlans.some(p => p.riskId === risk.id);

                return (
                  <div key={risk.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <div>
                        <div className="font-medium text-sm">{risk.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {risk.category} | {risk.probability} probability | {risk.impact} impact
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${riskScore.level === 'critical' ? 'bg-red-100 text-red-800' :
                          riskScore.level === 'high' ? 'bg-orange-100 text-orange-800' :
                            riskScore.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                        }`}>
                        {riskScore.level}
                      </Badge>
                      {hasMitigation && (
                        <Badge variant="outline" className="text-xs">
                          Mitigated
                        </Badge>
                      )}
                      {hasMonitoring && (
                        <Badge variant="outline" className="text-xs">
                          Monitored
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {risks.length > 10 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... and {risks.length - 10} more risks
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
