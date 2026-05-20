import api from "../api/axios";

export const getSuperAdminDashboard = async () => {
  const res = await api.get("/accounts/superadmin/dashboard/");
  return res.data;
};

export const getSuperAdminUsers = async ({
  page = 1,
  pageSize = 10,
  search = "",
}) => {
  const res = await api.get("/accounts/superadmin/users/", {
    params: {
      page,
      page_size: pageSize,
      search,
    },
  });

  return res.data;
};


export const getSuperAdminAgencies = async ({
  page = 1,
  pageSize = 10,
  search = "",
}) => {
  const res = await api.get("/accounts/superadmin/agencies/", {
    params: {
      page,
      page_size: pageSize,
      search,
    },
  });

  return res.data;
};