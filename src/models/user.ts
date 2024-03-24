import type { WorkspaceRole, WorkspaceStatus } from './user-in-workspace';

export interface User {
  id: number;
  name: string;
}

export interface ExtendedUser extends User {
  role: WorkspaceRole;
  status: WorkspaceStatus;
}
