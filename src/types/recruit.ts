export interface RecruitableOperator {
  id: string;
  name: string;
  rarity: number;
  tags: string[];
  potential?: number;
}

export interface RecruitmentResult {
  tags: string[];
  operators: RecruitableOperator[];
  guarantees: number[];
}
