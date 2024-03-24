import type { WorkspaceRole, WorkspaceStatus } from './user-in-workspace';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ExtendedUser extends User {
  role: WorkspaceRole;
  status: WorkspaceStatus;
}
