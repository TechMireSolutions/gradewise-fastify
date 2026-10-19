import apiClient from "@/lib/apiClient.js";

export const fetchAdminOverviewAPI = async () => {
  return apiClient.get("/admin/overview");
};

export const fetchAdminUsersAPI = async (params = {}) => {
  return apiClient.get("/admin/users", { params });
};

export const changeUserRoleAPI = async (userId, newRole) => {
  return apiClient.put(`/admin/users/${userId}/role`, { newRole });
};

export const deleteAdminUserAPI = async (userId) => {
  return apiClient.delete(`/admin/users/${userId}`);
};
