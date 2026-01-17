export interface Deal {
  id: string;
  dealname: string;
  dealstage: string;
  amount?: number;
  closedate?: string;
  pipeline: string;
  hs_deal_stage_probability?: number;
  days_to_close?: number;
  hubspot_owner_id?: string;
  createdate: string;
  hs_lastmodifieddate: string;
  // カスタムプロパティ（必要に応じて追加）
  meddic_score?: number;
  ai_probability?: number;
  blocker_status?: string;
}

export interface DealStage {
  id: string;
  label: string;
  probability: number;
  displayOrder: number;
}

export interface Pipeline {
  id: string;
  label: string;
  stages: DealStage[];
}

export interface DashboardMetrics {
  totalPipelineAmount: number;
  forecastAmount: number;
  conversionRate: number;
  staleDeals: number;
  averageMeddicScore: number;
}

export interface PipelineFunnelData {
  stage: string;
  amount: number;
  count: number;
}

export interface DealWithCompany extends Deal {
  companyName?: string;
  companyId?: string;
}
