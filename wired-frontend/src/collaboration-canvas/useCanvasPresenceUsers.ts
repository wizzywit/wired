import { useMemo } from 'react';
import type { AwarenessUser, RemotePeerAwareness } from './awarenessTypes';
import {
  buildPresenceUsers,
  getPresenceFaces,
  getPresenceOverflow,
  PRESENCE_FACE_MAX,
} from './canvasScreenLogic';

export function useCanvasPresenceUsers({
  meUser,
  remotePeers,
  localUserId,
  usersOnline,
}: {
  meUser: AwarenessUser | undefined;
  remotePeers: RemotePeerAwareness[];
  localUserId: string | null;
  usersOnline: number;
}) {
  const presenceUsers = useMemo(
    () => buildPresenceUsers(meUser, remotePeers, localUserId),
    [localUserId, meUser, remotePeers]
  );

  const presenceFaceUsers = useMemo(
    () => getPresenceFaces(presenceUsers, PRESENCE_FACE_MAX),
    [presenceUsers]
  );

  const presenceOverflow = useMemo(
    () => getPresenceOverflow(usersOnline, presenceFaceUsers.length),
    [presenceFaceUsers.length, usersOnline]
  );

  return {
    presenceUsers,
    presenceFaceUsers,
    presenceOverflow,
  };
}
