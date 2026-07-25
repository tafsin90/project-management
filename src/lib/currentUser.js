import { useSelector } from "react-redux";

export function getCurrentUserId(workspace) {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("currentUserId");
    if (saved && workspace?.members?.some((member) => member.user.id === saved)) return saved;
  }
  return workspace?.members?.[0]?.user?.id || null;
}

export function useCurrentUserId() {
  const workspace = useSelector((state) => state.workspace.currentWorkspace);
  return getCurrentUserId(workspace);
}

export function useCurrentUser() {
  const workspace = useSelector((state) => state.workspace.currentWorkspace);
  const userId = getCurrentUserId(workspace);
  return workspace?.members?.find((member) => member.user.id === userId)?.user || null;
}
