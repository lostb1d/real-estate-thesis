import api from "../api/axios";

export const registerUser = async (data) => {
  const response = await api.post("/accounts/register/", data);
  return response.data;
};

export const verifyOtp = async (data) => {
  const response = await api.post("/accounts/verify-otp/", data);
  return response.data;
};

export const resendOtp = async (data) => {
  const response = await api.post("/accounts/resend-otp/", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/accounts/login/", data);

  console.log("LOGIN RESPONSE:", response.data);

  localStorage.setItem("access_token", response.data.access);
  localStorage.setItem("refresh_token", response.data.refresh);
  localStorage.setItem("user", JSON.stringify(response.data.user));

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

export const forgotPassword = async (data) => {
  const response = await api.post("/accounts/forgot-password/", data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/accounts/reset-password/", data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.post("/accounts/change-password/", data);
  return response.data;
};