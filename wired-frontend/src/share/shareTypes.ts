export type ShareRole = 'owner' | 'editor' | 'viewer';
export type LinkAccess = 'none' | 'viewer' | 'editor';

export type ShareUser = {
  userId: string;
  email: string;
  displayName: string;
  role: ShareRole;
};

export type ShareInvite = {
  email: string;
  role: Exclude<ShareRole, 'owner'>;
};

export type DocumentShareState = {
  documentId: string;
  documentTitle: string;
  meUserId: string;
  meRole: ShareRole;
  canShare: boolean;
  linkAccess: LinkAccess;
  users: ShareUser[];
  invites: ShareInvite[];
};
