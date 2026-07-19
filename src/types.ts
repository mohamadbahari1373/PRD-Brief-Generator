export interface PrdSection {
  details: string;
  source: string;
  impact: string;
}

export interface PrdGoal {
  outcome: string;
  kpi: string;
}

export interface PrdTargetUser {
  segment: string;
  scenario: string;
  painPoint: string;
}

export interface PrdCurrentStatus {
  flow: string;
  friction: string;
}

export interface PrdDesiredStatus {
  change: string;
  success: string;
}

export interface PrdConstraints {
  timeline: string;
  technical: string;
  dependencies: string;
}

export interface PrdEvidence {
  data: string;
  feedback: string;
  competitors: string;
  links: string;
}

export interface PrdData {
  title: string;
  team: string;
  owner: string;
  date: string;
  priority: "low" | "medium" | "high" | "critical";
  problem: PrdSection;
  goal: PrdGoal;
  targetUser: PrdTargetUser;
  currentStatus: PrdCurrentStatus;
  desiredStatus: PrdDesiredStatus;
  constraints: PrdConstraints;
  evidence: PrdEvidence;
  isFallback?: boolean;
  targetTeam?: string;
  userIdea?: string;
}

export interface SavedPrd {
  id: string;
  timestamp: number;
  data: PrdData;
}
