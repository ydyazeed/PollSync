export interface Poll {
  id: string;
  admin_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  option_order: number;
  created_at: string;
}

export interface AccessCode {
  id: string;
  poll_id: string;
  code_hash: string;
  code_display: string;
  is_active: boolean;
  created_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  voter_uuid: string;
  voter_name?: string;
  voted_at: string;
}

export interface PollResult {
  option_id: string;
  option_text: string;
  option_order: number;
  vote_count: number;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
  access_code?: string;
  total_votes?: number;
}

export interface VoterInfo {
  voter_name: string;
  option_text: string;
  voted_at: string;
}


