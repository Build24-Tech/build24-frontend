'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { calculateRiskScore, RiskAlert } from '@/lib/risk-management-utils';
import { MonitoringPlan, Risk } from '@/types/launch-essentials';
import { AlertTriangle, Bell, Eye, Plus, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface RiskMonitoringProps {
  risks: Risk[];
  monitoringPlans: MonitoringPlan[];
  alerts: RiskAlert[];
  onChange: (monitoringPlans: MonitoringPlan[]) => void;
}

export function RiskMonitoring({ risks, monitoringPlans, alerts, onChange }: RiskMonitoringProps) {
  const [selectedRisk, setSelectedRisk] = useState<string>('');
  const [newPlan, setNewPlan] = useState<Partial<MonitoringPlan>>({
    indicators: [''],
    frequency: 'weekly',
    thresholds: [{ indicator: '', threshold: 0 }],
    escalation: ''
  });

  const unmonitoredRisks = risks.filter(risk =>
    !monitoringPlans.some(plan => plan.riskId === risk.id)
  );

  const addMonitoringPlan = () => {
    if (!selectedRisk || !newPlan.indicators?.[0] || !newPlan.escalation) return;

    const plan: MonitoringPlan = {
      riskId: selectedRisk,
      indicators: newPlan.indicators.filter(indicator => indicator.trim() !== ''),
      frequency: newPlan.frequency || 'weekly',
      thresholds: newPlan.thresholds?.filter(t => t.indicator && t.threshold > 0) || [],
      escalation: newPlan.escalation
    };

    onChange([...monitoringPlans, plan]);
    setSelectedRisk('');
    setNewPlan({
      indicators: [''],
      frequency: 'weekly',
      thresholds: [{ indicator: '', threshold: 0 }],
      escalation: ''
    });
  };

  const updatePlan = (index: number, updates: Partial<MonitoringPlan>) => {
    const updatedPlans = [...monitoringPlans];
    updatedPlans[index] = { ...updatedPlans[index], ...updates };
    onChange(updatedPlans);
  };

  const removePlan = (index: number) => {
    onChange(monitoringPlans.filter((_, i) => i !== index));
  };

  const addIndicator = (planIndex?: number) => {
    if (planIndex !== undefined) {
      const updatedPlans = [...monitoringPlans];
      updatedPlans[planIndex].indicators.push('');
      onChange(updatedPlans);
    } else {
      setNewPlan({
        ...newPlan,
        indicators: [...(newPlan.indicators || ['']), '']
      });
    }
  };

  const updateIndicator = (planIndex: number | undefined, indicatorIndex: number, value: string) => {
    if (planIndex !== undefined) {
      const updatedPlans = [...monitoringPlans];
      updatedPlans[planIndex].indicators[indicatorIndex] = value;
      onChange(updatedPlans);
    } else {
      const indicators = [...(newPlan.indicators || [''])];
      indicators[indicatorIndex] = value;
      setNewPlan({ ...newPlan, indicators });
    }
  };

  const removeIndicator = (planIndex: number | undefined, indicatorIndex: number) => {
    if (planIndex !== undefined) {
      const updatedPlans = [...monitoringPlans];
      updatedPlans[planIndex].indicators.splice(indicatorIndex, 1);
      onChange(updatedPlans);
    } else {
      const indicators = [...(newPlan.indicators || [''])];
      indicators.splice(indicatorIndex, 1);
      setNewPlan({ ...newPlan, indicators });
    }
  };

  const addThreshold = (planIndex?: number) => {
    if (planIndex !== undefined) {
      const updatedPlans = [...monitoringPlans];
      updatedPlans[planIndex].thresholds.push({ indicator: '', threshold: 0 });
      onChange(updatedPlans);
    } else {
      setNewPlan({
        ...newPlan,
        thresholds: [...(newPlan.thresholds || []), { indicator: '', threshold: 0 }]
      });
    }
  };

  const updateThreshold = (planIndex: number | undefined, thresholdIndex: number, field: 'indicator' | 'threshold', value: string | number) => {
    if (planIndex !== undefined) {
      const updatedPlans = [...monitoringPlans];
      updatedPlans[planIndex].thresholds[thresholdIndex] = {
        ...updatedPlans[planIndex].thresholds[thresholdIndex],
        [field]: value
      };
      onChange(updatedPlans);
    } else {
      const thresholds = [...(newPlan.thresholds || [])];
      thresholds[thresholdIndex] = {
        ...thresholds[thresholdIndex],
        [field]: value
      };
      setNewPlan({ ...newPlan, thresholds });
    }
  };

  const removeThreshold = (planIndex: number | undefined, thresholdIndex: number) => {
    if (planIndex !== undefined) {
      const updatedPlans = [...monitoringPlans];
      updatedPlans[planIndex].thresholds.splice(thresholdIndex, 1);
      onChange(updatedPlans);
    } else {
      const thresholds = [...(newPlan.thresholds || [])];
      thresholds.splice(thresholdIndex, 1);
      setNewPlan({ ...newPlan, thresholds });
    }
  };

  const getRiskById = (riskId: string) => risks.find(risk => risk.id === riskId);

  const getAlertSeverityColor = (severity: 'warning' | 'critical') => {
    return severity === 'critical' ? 'text-red-600' : 'text-yellow-600';
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning');

  return (
    <div className="space-y-6">
      {/* Risk Monitoring Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Risk Monitoring & Alert Systems</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set up tracking mechanisms and automated alerts for continuous risk monitoring.
          </p>
        </CardHeader>
      </Card>

      {/* Monitoring Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{monitoringPlans.length}</div>
              <div className="text-sm text-muted-foreground">Monitoring Plans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {risks.length - unmonitoredRisks.length}
              </div>
              <div className="text-sm text-muted-foreground">Risks Monitored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Critical Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{warningAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Warning Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <Bell className="h-5 w-5" />
              <span>Active Risk Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <Alert key={index} className={alert.severity === 'critical' ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'}>
                  <AlertTriangle className={`h-4 w-4 ${getAlertSeverityColor(alert.severity)}`} />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm mt-1">{alert.message}</div>
                        {alert.actionRequired && (
                          <div className="text-xs mt-2 font-medium">
                            Escalation Level: {alert.escalationLevel} - Immediate action required
                          </div>
                        )}
                      </div>
                      <Badge className={alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Monitoring Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Create Monitoring Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="select-risk-monitor">Select Risk to Monitor</Label>
            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a risk..." />
              </SelectTrigger>
              <SelectContent>
                {unmonitoredRisks.map((risk) => {
                  const riskScore = calculateRiskScore(risk.probability, risk.impact);
                  return (
                    <SelectItem key={risk.id} value={risk.id}>
                      <div className="flex items-center space-x-2">
                        <span>{risk.title}</span>
                        <Badge className={`text-xs ${riskScore.level === 'critical' ? 'bg-red-100 text-red-800' :
                            riskScore.level === 'high' ? 'bg-orange-100 text-orange-800' :
                              riskScore.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                          }`}>
                          {riskScore.level}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedRisk && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Monitoring Frequency</Label>
                  <Select
                    value={newPlan.frequency}
                    onValueChange={(value) => setNewPlan({ ...newPlan, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="escalation">Escalation Procedure</Label>
                  <Input
                    id="escalation"
                    value={newPlan.escalation}
                    onChange={(e) => setNewPlan({ ...newPlan, escalation: e.target.value })}
                    placeholder="Who to contact when thresholds are exceeded"
                  />
                </div>
              </div>

              <div>
                <Label>Key Indicators to Monitor</Label>
                <div className="space-y-2">
                  {newPlan.indicators?.map((indicator, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={indicator}
                        onChange={(e) => updateIndicator(undefined, index, e.target.value)}
                        placeholder="e.g., Server response time, User complaints, Budget variance"
                      />
                      {newPlan.indicators!.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIndicator(undefined, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addIndicator()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Indicator
                  </Button>
                </div>
              </div>

              <div>
                <Label>Alert Thresholds</Label>
                <div className="space-y-2">
                  {newPlan.thresholds?.map((threshold, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={threshold.indicator}
                        onChange={(e) => updateThreshold(undefined, index, 'indicator', e.target.value)}
                        placeholder="Indicator name"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={threshold.threshold}
                        onChange={(e) => updateThreshold(undefined, index, 'threshold', Number(e.target.value))}
                        placeholder="Threshold value"
                        className="w-32"
                      />
                      {newPlan.thresholds!.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeThreshold(undefined, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addThreshold()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Threshold
                  </Button>
                </div>
              </div>

              <Button
                onClick={addMonitoringPlan}
                disabled={!selectedRisk || !newPlan.indicators?.[0] || !newPlan.escalation}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Monitoring Plan
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Active Monitoring Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Active Monitoring Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {monitoringPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No monitoring plans created yet. Set up monitoring for your identified risks above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monitoringPlans.map((plan, index) => {
                const risk = getRiskById(plan.riskId);
                if (!risk) return null;

                const riskScore = calculateRiskScore(risk.probability, risk.impact);
                const riskAlerts = alerts.filter(alert => alert.riskId === plan.riskId);

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{risk.title}</h4>
                          <Badge className={`text-xs ${riskScore.level === 'critical' ? 'bg-red-100 text-red-800' :
                              riskScore.level === 'high' ? 'bg-orange-100 text-orange-800' :
                                riskScore.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                            }`}>
                            {riskScore.level}
                          </Badge>
                          {riskAlerts.length > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              {riskAlerts.length} Alert{riskAlerts.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Frequency: {plan.frequency}</span>
                          <span>Indicators: {plan.indicators.length}</span>
                          <span>Thresholds: {plan.thresholds.length}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlan(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Monitoring Indicators:</Label>
                        <div className="space-y-1 mt-1">
                          {plan.indicators.map((indicator, indicatorIndex) => (
                            <div key={indicatorIndex} className="flex items-center space-x-2">
                              <Input
                                value={indicator}
                                onChange={(e) => updateIndicator(index, indicatorIndex, e.target.value)}
                                className="text-sm"
                              />
                              {plan.indicators.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeIndicator(index, indicatorIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addIndicator(index)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Indicator
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Alert Thresholds:</Label>
                        <div className="space-y-1 mt-1">
                          {plan.thresholds.map((threshold, thresholdIndex) => (
                            <div key={thresholdIndex} className="flex items-center space-x-2">
                              <Input
                                value={threshold.indicator}
                                onChange={(e) => updateThreshold(index, thresholdIndex, 'indicator', e.target.value)}
                                placeholder="Indicator"
                                className="text-sm flex-1"
                              />
                              <Input
                                type="number"
                                value={threshold.threshold}
                                onChange={(e) => updateThreshold(index, thresholdIndex, 'threshold', Number(e.target.value))}
                                placeholder="Value"
                                className="text-sm w-20"
                              />
                              {plan.thresholds.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeThreshold(index, thresholdIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addThreshold(index)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Threshold
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label className="text-sm font-medium">Escalation Procedure:</Label>
                      <Textarea
                        value={plan.escalation}
                        onChange={(e) => updatePlan(index, { escalation: e.target.value })}
                        className="mt-1 text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unmonitored Risks Alert */}
      {unmonitoredRisks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <TrendingUp className="h-5 w-5" />
              <span>Unmonitored Risks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700 mb-3">
              The following risks do not have monitoring plans. Consider setting up monitoring for high-priority risks.
            </p>
            <div className="space-y-2">
              {unmonitoredRisks.map((risk) => {
                const riskScore = calculateRiskScore(risk.probability, risk.impact);
                return (
                  <div key={risk.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{risk.title}</span>
                      <Badge className={`text-xs ${riskScore.level === 'critical' ? 'bg-red-100 text-red-800' :
                          riskScore.level === 'high' ? 'bg-orange-100 text-orange-800' :
                            riskScore.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                        }`}>
                        {riskScore.level}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRisk(risk.id)}
                    >
                      Create Plan
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
