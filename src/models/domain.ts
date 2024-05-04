export interface Domain {
  id: number;
  name: string;
  workspaceId: number;
  createdAt: string;
  updatedAt: string;
}

export interface DomainConfig {
  configured: bigint;
  name: string;
  apexName: string;
  projectId: string;
  updatedAt: number;
  createdAt: number;
  verified: boolean;
  verification?: {
    'type': string; // 'TXT'
    'domain': string; //'_vercel.luzen.app'
    'value': string; // 'vc-domain-verify=play.luzen.app,9daa3bcaa24038be9370'
    'reason': 'pending_domain_verification' | string;
  }[];
  verificationResponse?: {
    error: {
      code: string; // 'missing_required_txt_record'
      message: string;
    };
  };
}
