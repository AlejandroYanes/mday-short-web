export interface UserInWorkspace {
  workspaceId: number;
  userId: number;
  role: WorkspaceRole;
  status: WorkspaceStatus;
  createdAt: string;
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  USER = 'USER',
  GUEST = 'GUEST',
}

export enum WorkspaceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  INVITED = 'INVITED',
}
