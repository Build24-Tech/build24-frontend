'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  calculateRiskScore,
  evaluateMitigationEffectiveness,
  generateMitigationTemplates
} from '@/lib/risk-management-utils';
import { MitigationStrategy, Risk } from '@/types/launch-essentials';
import { AlertTriangle, DollarSign, Plus, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface MitigationPlanningProps {
  risks: Risk[];
  strategies: MitigationStrategy[];
  onChange: (strategies: MitigationStrategy[]) => void;
}

export function MitigationPlanning({ risks, strategies, onChange }: MitigationPlanningProps) {
  const [selectedRisk, setSelectedRisk] = useState<string>('');
  const [newStrategy, setNewStrategy] = useState<Partial<MitigationStrategy>>({
    strategy: 'mitigate',
    actions: [''],
    timeline: '',
    cost: 0,
    responsible: ''
  });

  const mitigationTemplates = generateMitigationTemplates();
  const unmitigatedRisks = risks.filter(risk =>
    !strategies.some(strategy => strategy.riskId === risk.id)
  );

  const addStrategy = () => {
    if (!selectedRisk || !newStrategy.actions?.[0] || !newStrategy.responsible) return;

    const strategy: MitigationStrategy = {
      riskId: selectedRisk,
      strategy: newStrategy.strategy as MitigationStrategy['strategy'],
      actions: newStrategy.actions.filter(action => action.trim() !== ''),
      timeline: newStrategy.timeline || 'TBD',
      cost: newStrategy.cost || 0,
      responsible: newStrategy.responsible
    };

    onChange([...strategies, strategy]);
    setSelectedRisk('');
    setNewStrategy({
      strategy: 'mitigate',
      actions: [''],
      timeline: '',
      cost: 0,
      responsible: ''
    });
  };

  const updateStrategy = (index: number, updates: Partial<MitigationStrategy>) => {
    const updatedStrategies = [...strategies];
    updatedStrategies[index] = { ...updatedStrategies[index], ...updates };
    onChange(updatedStrategies);
  };

  const removeStrategy = (index: number) => {
    onChange(strategies.filter((_, i) => i !== index));
  };

  const addActionToStrategy = (strategyIndex: number) => {
    const updatedStrategies = [...strategies];
    updatedStrategies[strategyIndex].actions.push('');
    onChange(updatedStrategies);
  };

  const updateAction = (strategyIndex: number, actionIndex: number, value: string) => {
    const updatedStrategies = [...strategies];
    updatedStrategies[strategyIndex].actions[actionIndex] = value;
    onChange(updatedStrategies);
  };

  const removeAction = (strategyIndex: number, actionIndex: number) => {
    const updatedStrategies = [...strategies];
    updatedStrategies[strategyIndex].actions.splice(actionIndex, 1);
    onChange(updatedStrategies);
  };

  const addActionToNewStrategy = () => {
    setNewStrategy({
      ...newStrategy,
      actions: [...(newStrategy.actions || ['']), '']
    });
  };

  const updateNewStrategyAction = (index: number, value: string) => {
    const actions = [...(newStrategy.actions || [''])];
    actions[index] = value;
    setNewStrategy({ ...newStrategy, actions });
  };

  const removeNewStrategyAction = (index: number) => {
    const actions = [...(newStrategy.actions || [''])];
    actions.splice(index, 1);
    setNewStrategy({ ...newStrategy, actions });
  };

  const addTemplateAction = (templateAction: string) => {
    if (!newStrategy.actions?.includes(templateAction)) {
      setNewStrategy({
        ...newStrategy,
        actions: [...(newStrategy.actions || ['']), templateAction]
      });
    }
  };

  const getStrategyColor = (strategy: MitigationStrategy['strategy']) => {
    switch (strategy) {
      case 'avoid': return 'bg-red-100 text-red-800';
      case 'mitigate': return 'bg-blue-100 text-blue-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      case 'accept': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskById = (riskId: string) => risks.find(risk => risk.id === riskId);

  return (
    <div className="space-y-6">
      {/* Mitigation Planning Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Mitigation Strategy Planning</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create action plans and assign responsibilities for managing identified risks.
          </p>
        </CardHeader>
      </Card>

      {/* Mitigation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Mitigation Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{strategies.length}</div>
              <div className="text-sm text-muted-foreground">Strategies Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {risks.length - unmitigatedRisks.length}
              </div>
              <div className="text-sm text-muted-foreground">Risks Covered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{unmitigatedRisks.length}</div>
              <div className="text-sm text-muted-foreground">Unmitigated Risks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${strategies.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Mitigation Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Create Mitigation Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="select-risk">Select Risk to Mitigate</Label>
            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a risk..." />
              </SelectTrigger>
              <SelectContent>
                {unmitigatedRisks.map((risk) => {
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
                  <Label htmlFor="strategy-type">Mitigation Strategy</Label>
                  <Select
                    value={newStrategy.strategy}
                    onValueChange={(value) => setNewStrategy({ ...newStrategy, strategy: value as MitigationStrategy['strategy'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avoid">Avoid - Eliminate the risk</SelectItem>
                      <SelectItem value="mitigate">Mitigate - Reduce probability/impact</SelectItem>
                      <SelectItem value="transfer">Transfer - Share or outsource risk</SelectItem>
                      <SelectItem value="accept">Accept - Monitor and manage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="responsible">Responsible Person</Label>
                  <Input
                    id="responsible"
                    value={newStrategy.responsible}
                    onChange={(e) => setNewStrategy({ ...newStrategy, responsible: e.target.value })}
                    placeholder="Who will execute this strategy?"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={newStrategy.timeline}
                    onChange={(e) => setNewStrategy({ ...newStrategy, timeline: e.target.value })}
                    placeholder="e.g., 2 weeks, Before launch"
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Estimated Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={newStrategy.cost}
                    onChange={(e) => setNewStrategy({ ...newStrategy, cost: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label>Action Items</Label>
                <div className="space-y-2">
                  {newStrategy.actions?.map((action, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={action}
                        onChange={(e) => updateNewStrategyAction(index, e.target.value)}
                        placeholder="Describe specific action to take"
                      />
                      {newStrategy.actions!.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNewStrategyAction(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addActionToNewStrategy}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>
              </div>

              {/* Template Actions */}
              {newStrategy.strategy && (
                <div>
                  <Label>Template Actions (click to add)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mitigationTemplates
                      .find(template => template.strategy === newStrategy.strategy)
                      ?.templates.map((template, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => addTemplateAction(template)}
                          className="text-xs"
                        >
                          {template}
                        </Button>
                      ))}
                  </div>
                </div>
              )}

              <Button
                onClick={addStrategy}
                disabled={!selectedRisk || !newStrategy.actions?.[0] || !newStrategy.responsible}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Strategy
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Current Mitigation Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Active Mitigation Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          {strategies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No mitigation strategies created yet. Create strategies for your identified risks above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {strategies.map((strategy, index) => {
                const risk = getRiskById(strategy.riskId);
                if (!risk) return null;

                const effectiveness = evaluateMitigationEffectiveness(risk, strategy);

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{risk.title}</h4>
                          <Badge className={getStrategyColor(strategy.strategy)}>
                            {strategy.strategy.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Cost-Benefit: {effectiveness.costBenefit.toFixed(1)}x
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Owner: {strategy.responsible}</span>
                          <span>Timeline: {strategy.timeline}</span>
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {strategy.cost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStrategy(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Action Items:</Label>
                      {strategy.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center space-x-2">
                          <Input
                            value={action}
                            onChange={(e) => updateAction(index, actionIndex, e.target.value)}
                            className="text-sm"
                          />
                          {strategy.actions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAction(index, actionIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addActionToStrategy(index)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Action
                      </Button>
                    </div>

                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                      <strong>Effectiveness Analysis:</strong> {effectiveness.recommendation}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unmitigated Risks Alert */}
      {unmitigatedRisks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Unmitigated Risks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700 mb-3">
              The following risks do not have mitigation strategies. Consider creating strategies for high-priority risks.
            </p>
            <div className="space-y-2">
              {unmitigatedRisks.map((risk) => {
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
                      Create Strategy
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
