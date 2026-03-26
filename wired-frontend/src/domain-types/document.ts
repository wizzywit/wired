export type WireDocument = {
  id: string;
  title: string;
  ownerId: string;
  role?: 'owner' | 'editor' | 'viewer';
  canEdit?: boolean;
  canShare?: boolean;
  canDelete?: boolean;
  createdAt: string;
  updatedAt: string;
};
