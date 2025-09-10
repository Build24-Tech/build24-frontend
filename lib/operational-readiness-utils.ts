import {
  LegalRequirement,
  OperationalGap,
  OperationalReadinessData,
  ProcessTemplate,
  RemediationAction,
  SupportChannel,
  TeamRole
} from '@/app/launch-essentials/components/OperationalReadiness';

export interface OperationalReadinessCalculations {
  teamReadiness: number;
  processReadiness: number;
  supportReadiness: number;
  legalReadiness: number;
  overallReadiness: number;
  criticalGaps: OperationalGap[];
  recommendations: string[];
}

export function calculateOperationalReadiness(data: OperationalReadinessData): OperationalReadinessCalculations {
  const teamReadiness = calculateTeamReadiness(data.teamStructure.roles);
  const processReadiness = calculateProcessReadiness([
    ...data.processes.development,
    ...data.processes.testing,
    ...data.processes.deployment
  ]);
  const supportReadiness = calculateSupportReadiness(data.customerSupport.channels);
  const legalReadiness = calculateLegalReadiness(data.legal.requirements);

  const overallReadiness = Math.round(
    (teamReadiness * 0.3 + processReadiness * 0.25 + supportReadiness * 0.2 + legalReadiness * 0.25)
  );

  const criticalGaps = identifyCriticalGaps(data);
  const recommendations = generateRecommendations(data, {
    teamReadiness,
    processReadiness,
    supportReadiness,
    legalReadiness,
    overallReadiness,
    criticalGaps,
    recommendations: []
  });

  return {
    teamReadiness,
    processReadiness,
    supportReadiness,
    legalReadiness,
    overallReadiness,
    criticalGaps,
    recommendations
  };
}

export function calculateTeamReadiness(roles: TeamRole[]): number {
  if (roles.length === 0) return 0;

  const criticalRoles = roles.filter(role => role.priority === 'critical');
  const filledCriticalRoles = criticalRoles.filter(role => role.status === 'filled');
  const totalFilledRoles = roles.filter(role => role.status === 'filled');

  // Weight critical roles more heavily
  const criticalWeight = 0.7;
  const overallWeight = 0.3;

  const criticalScore = criticalRoles.length > 0 ?
    (filledCriticalRoles.length / criticalRoles.length) * 100 : 100;
  const overallScore = (totalFilledRoles.length / roles.length) * 100;

  return Math.round(criticalScore * criticalWeight + overallScore * overallWeight);
}

export function calculateProcessReadiness(processes: ProcessTemplate[]): number {
  if (processes.length === 0) return 0;

  const completedProcesses = processes.filter(process => process.status === 'completed');
  const processesWithSteps = processes.filter(process => process.steps.length > 0);
  const processesWithTools = processes.filter(process => process.tools.length > 0);

  const completionScore = (completedProcesses.length / processes.length) * 100;
  const documentationScore = (processesWithSteps.length / processes.length) * 100;
  const toolingScore = (processesWithTools.length / processes.length) * 100;

  return Math.round((completionScore * 0.5 + documentationScore * 0.3 + toolingScore * 0.2));
}

export function calculateSupportReadiness(channels: SupportChannel[]): number {
  if (channels.length === 0) return 0;

  const activeChannels = channels.filter(channel => channel.status === 'active');
  const channelsWithStaffing = channels.filter(channel => channel.staffing > 0);
  const channelsWithTools = channels.filter(channel => channel.tools.length > 0);

  const activeScore = (activeChannels.length / channels.length) * 100;
  const staffingScore = (channelsWithStaffing.length / channels.length) * 100;
  const toolingScore = (channelsWithTools.length / channels.length) * 100;

  return Math.round((activeScore * 0.5 + staffingScore * 0.3 + toolingScore * 0.2));
}

export function calculateLegalReadiness(requirements: LegalRequirement[]): number {
  if (requirements.length === 0) return 0;

  const criticalRequirements = requirements.filter(req => req.priority === 'critical');
  const completedCriticalRequirements = criticalRequirements.filter(req => req.status === 'completed');
  const totalCompletedRequirements = requirements.filter(req => req.status === 'completed');

  // Weight critical requirements more heavily
  const criticalWeight = 0.8;
  const overallWeight = 0.2;

  const criticalScore = criticalRequirements.length > 0 ?
    (completedCriticalRequirements.length / criticalRequirements.length) * 100 : 100;
  const overallScore = (totalCompletedRequirements.length / requirements.length) * 100;

  return Math.round(criticalScore * criticalWeight + overallScore * overallWeight);
}

export function identifyCriticalGaps(data: OperationalReadinessData): OperationalGap[] {
  const gaps: OperationalGap[] = [];
  let gapId = 1;

  // Team gaps
  const criticalRoles = data.teamStructure.roles.filter(role => role.priority === 'critical');
  const unfilledCriticalRoles = criticalRoles.filter(role => role.status !== 'filled');

  if (unfilledCriticalRoles.length > 0) {
    gaps.push({
      id: `critical-gap-${gapId++}`,
      category: 'team',
      title: 'Critical Roles Unfilled',
      description: `${unfilledCriticalRoles.length} critical roles need to be filled before launch`,
      impact: 'high',
      effort: 'high',
      priority: 1,
      status: 'identified'
    });
  }

  // Process gaps
  const hasDeploymentProcess = data.processes.deployment.some(process => process.status === 'completed');
  if (!hasDeploymentProcess) {
    gaps.push({
      id: `critical-gap-${gapId++}`,
      category: 'process',
      title: 'No Deployment Process',
      description: 'No completed deployment process exists, which is critical for launch',
      impact: 'high',
      effort: 'medium',
      priority: 1,
      status: 'identified'
    });
  }

  // Support gaps
  const activeSupportChannels = data.customerSupport.channels.filter(channel => channel.status === 'active');
  if (activeSupportChannels.length === 0) {
    gaps.push({
      id: `critical-gap-${gapId++}`,
      category: 'support',
      title: 'No Active Support Channels',
      description: 'At least one support channel must be active before launch',
      impact: 'high',
      effort: 'medium',
      priority: 1,
      status: 'identified'
    });
  }

  // Legal gaps
  const criticalLegalRequirements = data.legal.requirements.filter(req => req.priority === 'critical');
  const incompleteCriticalLegal = criticalLegalRequirements.filter(req => req.status !== 'completed');

  if (incompleteCriticalLegal.length > 0) {
    gaps.push({
      id: `critical-gap-${gapId++}`,
      category: 'legal',
      title: 'Critical Legal Requirements Incomplete',
      description: `${incompleteCriticalLegal.length} critical legal requirements must be completed`,
      impact: 'high',
      effort: 'medium',
      priority: 1,
      status: 'identified'
    });
  }

  return gaps;
}

export function generateRecommendations(
  data: OperationalReadinessData,
  calculations: OperationalReadinessCalculations
): string[] {
  const recommendations: string[] = [];

  // Team recommendations
  if (calculations.teamReadiness < 70) {
    const criticalRoles = data.teamStructure.roles.filter(role =>
      role.priority === 'critical' && role.status !== 'filled'
    );
    if (criticalRoles.length > 0) {
      recommendations.push(
        `Prioritize hiring for ${criticalRoles.length} critical roles: ${criticalRoles.map(r => r.title).join(', ')}`
      );
    }
  }

  // Process recommendations
  if (calculations.processReadiness < 70) {
    const incompleteProcesses = [
      ...data.processes.development,
      ...data.processes.testing,
      ...data.processes.deployment
    ].filter(process => process.status !== 'completed');

    if (incompleteProcesses.length > 0) {
      recommendations.push(
        `Complete documentation and implementation for ${incompleteProcesses.length} processes`
      );
    }
  }

  // Support recommendations
  if (calculations.supportReadiness < 70) {
    const inactiveChannels = data.customerSupport.channels.filter(channel =>
      channel.status !== 'active'
    );
    if (inactiveChannels.length > 0) {
      recommendations.push(
        `Activate ${inactiveChannels.length} support channels and ensure proper staffing`
      );
    }
  }

  // Legal recommendations
  if (calculations.legalReadiness < 70) {
    const incompleteRequirements = data.legal.requirements.filter(req =>
      req.status !== 'completed'
    );
    if (incompleteRequirements.length > 0) {
      recommendations.push(
        `Complete ${incompleteRequirements.length} legal requirements, prioritizing critical items`
      );
    }
  }

  // Overall recommendations
  if (calculations.overallReadiness < 80) {
    recommendations.push(
      'Consider delaying launch until operational readiness reaches at least 80%'
    );
  }

  if (calculations.criticalGaps.length > 0) {
    recommendations.push(
      `Address ${calculations.criticalGaps.length} critical gaps before proceeding with launch`
    );
  }

  return recommendations;
}

export function prioritizeGaps(gaps: OperationalGap[]): OperationalGap[] {
  return gaps.sort((a, b) => {
    // First sort by impact (high > medium > low)
    const impactOrder = { high: 3, medium: 2, low: 1 };
    const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];

    if (impactDiff !== 0) return impactDiff;

    // Then by effort (low > medium > high for easier wins)
    const effortOrder = { low: 3, medium: 2, high: 1 };
    const effortDiff = effortOrder[b.effort] - effortOrder[a.effort];

    if (effortDiff !== 0) return effortDiff;

    // Finally by priority number
    return b.priority - a.priority;
  });
}

export function generateRemediationActions(gaps: OperationalGap[]): RemediationAction[] {
  const actions: RemediationAction[] = [];

  gaps.forEach((gap, index) => {
    const baseAction: RemediationAction = {
      id: `action-${gap.id}`,
      gapId: gap.id,
      action: `Resolve ${gap.title}`,
      description: `Action plan to address: ${gap.description}`,
      assignee: '',
      dueDate: '',
      status: 'planned',
      priority: gap.priority,
      estimatedEffort: gap.effort === 'high' ? '2-4 weeks' : gap.effort === 'medium' ? '1-2 weeks' : '3-5 days',
      dependencies: []
    };

    // Customize actions based on gap category
    switch (gap.category) {
      case 'team':
        baseAction.action = `Hire for ${gap.title}`;
        baseAction.description = `Recruit and onboard team members to fill critical roles`;
        break;
      case 'process':
        baseAction.action = `Document and implement ${gap.title}`;
        baseAction.description = `Create detailed process documentation and ensure team adoption`;
        break;
      case 'support':
        baseAction.action = `Set up ${gap.title}`;
        baseAction.description = `Configure support channels and train support staff`;
        break;
      case 'legal':
        baseAction.action = `Complete ${gap.title}`;
        baseAction.description = `Work with legal team to fulfill compliance requirements`;
        break;
    }

    actions.push(baseAction);
  });

  return actions;
}

export function calculateGapImpactScore(gap: OperationalGap): number {
  const impactScore = gap.impact === 'high' ? 3 : gap.impact === 'medium' ? 2 : 1;
  const effortScore = gap.effort === 'low' ? 3 : gap.effort === 'medium' ? 2 : 1;

  // Higher impact and lower effort = higher score
  return impactScore * effortScore;
}

export function getReadinessLevel(percentage: number): {
  level: string;
  color: string;
  description: string;
} {
  if (percentage >= 90) {
    return {
      level: 'Excellent',
      color: 'text-green-600',
      description: 'Ready for launch with minimal risk'
    };
  } else if (percentage >= 80) {
    return {
      level: 'Good',
      color: 'text-blue-600',
      description: 'Ready for launch with acceptable risk'
    };
  } else if (percentage >= 70) {
    return {
      level: 'Fair',
      color: 'text-yellow-600',
      description: 'Consider addressing gaps before launch'
    };
  } else if (percentage >= 50) {
    return {
      level: 'Poor',
      color: 'text-orange-600',
      description: 'Significant gaps need attention'
    };
  } else {
    return {
      level: 'Critical',
      color: 'text-red-600',
      description: 'Not ready for launch - major gaps exist'
    };
  }
}
