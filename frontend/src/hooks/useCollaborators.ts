import type { User } from "../types";

interface UseCollaboratorsResult {
  allUsers: User[];
  peers: User[];
  localUser?: User;
}

export function useCollaborators(users: User[], localUserId: number): UseCollaboratorsResult {
  const localUser = users.find((item) => item.id === localUserId);
  const peers = users.filter((item) => item.id !== localUserId);
  return {
    allUsers: users,
    peers,
    localUser
  };
}
