'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { calculateRiskScore, generateRiskCategories } from '@/lib/risk-management-utils';
import { Risk } from '@/types/launch-essentials';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface RiskAssessmentFrameworkProps {
  risks: Risk[];
  onChange: (risks: Risk[]) => void;
}

export function RiskAssessmentFramework({ risks, onChange }: RiskAssessmentFrameworkProps) {
  const [newRisk, setNewRisk] = useState<Partial<Risk>>({
    title: '',
    description: '',
    category: 'technical',
    probability: 'medium',
    impact: 'medium',
    owner: ''
  });

  const riskCategories = generateRiskCategories();

  const addRisk = () => {
    if (!newRisk.title || !newRisk.description) return;

    const risk: Risk = {
      id: `risk-${Date.now()}`,
      title: newRisk.title,
      description: newRisk.description,
      category: newRisk.category as Risk['category'],
      probability: newRisk.probability as Risk['probability'],
      impact: newRisk.impact as Risk['impact'],
      priority: risks.length + 1,
      owner: newRisk.owner || 'Unassigned'
    };

    onChange([...risks, risk]);
    setNewRisk({
      title: '',
      description: '',
      category: 'technical',
      probability: 'medium',
      impact: 'medium',
      owner: ''
    });
  };

  const updateRisk = (id: string, updates: Partial<Risk>) => {
    onChange(risks.map(risk =>
      risk.id === id ? { ...risk, ...updates } : risk
    ));
  };

  const removeRisk = (id: string) => {
    onChange(risks.filter(risk => risk.id !== id));
  };

  const addCommonRisk = (category: string, riskTitle: string) => {
    const risk: Risk = {
      id: `risk-${Date.now()}`,
      title: riskTitle,
      description: `Common ${category} risk that should be evaluated for your project`,
      category: category as Risk['category'],
      probability: 'medium',
      impact: 'medium',
      priority: risks.length + 1,
      owner: 'Unassigned'
    };

    onChange([...risks, risk]);
  };

  const getRiskScoreColor = (probability: Risk['probability'], impact: Risk['impact']) => {
    const score = calculateRiskScore(probability, impact);
    switch (score.level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Assessment Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Framework</CardTitle>
          <p className="text-sm text-muted-foreground">
            Identify and assess potential risks that could impact your product launch.
            Use the comprehensive framework below to ensure all risk categories are considered.
          </p>
        </CardHeader>
      </Card>

      {/* Add New Risk */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Risk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="risk-title">Risk Title</Label>
              <Input
                id="risk-title"
                value={newRisk.title}
                onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                placeholder="Enter risk title"
              />
            </div>
            <div>
              <Label htmlFor="risk-owner">Risk Owner</Label>
              <Input
                id="risk-owner"
                value={newRisk.owner}
                onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })}
                placeholder="Who is responsible for this risk?"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="risk-description">Risk Description</Label>
            <Textarea
              id="risk-description"
              value={newRisk.description}
              onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
              placeholder="Describe the risk in detail"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="risk-category">Category</Label>
              <Select
                value={newRisk.category}
                onValueChange={(value) => setNewRisk({ ...newRisk, category: value as Risk['category'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="risk-probability">Probability</Label>
              <Select
                value={newRisk.probability}
                onValueChange={(value) => setNewRisk({ ...newRisk, probability: value as Risk['probability'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (10-30%)</SelectItem>
                  <SelectItem value="medium">Medium (30-70%)</SelectItem>
                  <SelectItem value="high">High (70-90%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="risk-impact">Impact</Label>
              <Select
                value={newRisk.impact}
                onValueChange={(value) => setNewRisk({ ...newRisk, impact: value as Risk['impact'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={addRisk} disabled={!newRisk.title || !newRisk.description}>
            <Plus className="h-4 w-4 mr-2" />
            Add Risk
          </Button>
        </CardContent>
      </Card>

      {/* Common Risk Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Common Risk Templates</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on any common risk to add it to your risk register for customization.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskCategories.map((category) => (
              <div key={category.category}>
                <h4 className="font-medium mb-2 capitalize">{category.category} Risks</h4>
                <div className="flex flex-wrap gap-2">
                  {category.commonRisks.map((risk, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => addCommonRisk(category.category, risk)}
                      className="text-xs"
                    >
                      {risk}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Risks */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Register ({risks.length} risks identified)</CardTitle>
        </CardHeader>
        <CardContent>
          {risks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No risks identified yet. Add risks using the form above or select from common risk templates.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {risks.map((risk) => {
                const riskScore = calculateRiskScore(risk.probability, risk.impact);
                return (
                  <div key={risk.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{risk.title}</h4>
                          <Badge className={getRiskScoreColor(risk.probability, risk.impact)}>
                            {riskScore.level.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{risk.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                        <p className="text-xs text-muted-foreground">Owner: {risk.owner}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRisk(risk.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Probability</Label>
                        <Select
                          value={risk.probability}
                          onValueChange={(value) => updateRisk(risk.id, { probability: value as Risk['probability'] })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Impact</Label>
                        <Select
                          value={risk.impact}
                          onValueChange={(value) => updateRisk(risk.id, { impact: value as Risk['impact'] })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
