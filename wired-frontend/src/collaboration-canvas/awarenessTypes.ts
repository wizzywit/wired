export type AwarenessUser = {
  id: string;
  email: string;
  displayName: string;
};

export type RemotePeerAwareness = {
  user: AwarenessUser;
  cursor?: { wx: number; wy: number; tool?: string };
  selectedId?: string | null;
  tool?: string;
  at: number;
};
