const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json" }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Request failed");
  return body;
}

export const api = {
  getWorkspaces: () => request("/workspaces"),
  createWorkspace: (data) => request("/workspaces", { method: "POST", body: JSON.stringify(data) }),
  createProject: (workspaceId, data) => request(`/workspaces/${workspaceId}/projects`, { method: "POST", body: JSON.stringify(data) }),
  updateProject: (workspaceId, projectId, data) => request(`/workspaces/${workspaceId}/projects/${projectId}`, { method: "PATCH", body: JSON.stringify(data) }),
  addProjectMember: (workspaceId, projectId, memberId) => request(`/workspaces/${workspaceId}/projects/${projectId}/members`, { method: "POST", body: JSON.stringify({ memberId }) }),
  createTask: (workspaceId, projectId, data) => request(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, { method: "POST", body: JSON.stringify(data) }),
  updateTask: (workspaceId, projectId, taskId, data) => request(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTask: (workspaceId, projectId, taskId) => request(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" }),
  inviteMember: (workspaceId, data) => request(`/workspaces/${workspaceId}/members`, { method: "POST", body: JSON.stringify(data) }),
  addComment: (workspaceId, projectId, taskId, data) => request(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`, { method: "POST", body: JSON.stringify(data) }),
};
