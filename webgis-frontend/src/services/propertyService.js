import api from "../api/axios";

export const getPropertyTypes = async () => {
  const res = await api.get("/properties/property-types/");
  return res.data;
};

export const getPropertyFeatures = async () => {
  const res = await api.get("/properties/property-features/");
  return res.data;
};

export const createProperty = async (data) => {
  const res = await api.post("/properties/properties/", data);
  return res.data;
};