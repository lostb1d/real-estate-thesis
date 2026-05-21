import api from "../api/axios";

const buildParams = ({ page = 1, pageSize = 10, search = "" } = {}) => ({
  page,
  page_size: pageSize,
  search,
});

export const getLayerCategories = (params) =>
  api.get("/gis-layers/layer-categories/", { params: buildParams(params) }).then(res => res.data);

export const createLayerCategory = (data) =>
  api.post("/gis-layers/layer-categories/", data).then(res => res.data);

export const updateLayerCategory = (id, data) =>
  api.patch(`/gis-layers/layer-categories/${id}/`, data).then(res => res.data);

export const deleteLayerCategory = (id) =>
  api.delete(`/gis-layers/layer-categories/${id}/`);


export const getSpatialLayers = (params) =>
  api.get("/gis-layers/spatial-layers/", { params: buildParams(params) }).then(res => res.data);

export const createSpatialLayer = (data) =>
  api.post("/gis-layers/spatial-layers/", data).then(res => res.data);

export const updateSpatialLayer = (id, data) =>
  api.patch(`/gis-layers/spatial-layers/${id}/`, data).then(res => res.data);

export const deleteSpatialLayer = (id) =>
  api.delete(`/gis-layers/spatial-layers/${id}/`);


export const getLayerAttributes = (params) =>
  api.get("/gis-layers/layer-attributes/", { params: buildParams(params) }).then(res => res.data);

export const getSpatialFeatures = (params) =>
  api.get("/gis-layers/spatial-features/", { params: buildParams(params) }).then(res => res.data);

export const getFeatureAttributeValues = (params) =>
  api.get("/gis-layers/feature-attribute-values/", { params: buildParams(params) }).then(res => res.data);

export const getRasterLayers = (params) =>
  api.get("/gis-layers/raster-layers/", { params: buildParams(params) }).then(res => res.data);

export const getLayerUploads = (params) =>
  api.get("/gis-layers/layer-uploads/", { params: buildParams(params) }).then(res => res.data);

export const createLayerAttribute = (data) =>
  api.post("/gis-layers/layer-attributes/", data).then(res => res.data);
export const updateLayerAttribute = (id, data) =>
  api.patch(`/gis-layers/layer-attributes/${id}/`, data).then(res => res.data);
export const deleteLayerAttribute = (id) =>
  api.delete(`/gis-layers/layer-attributes/${id}/`);

export const createSpatialFeature = (data) =>
  api.post("/gis-layers/spatial-features/", data).then(res => res.data);
export const updateSpatialFeature = (id, data) =>
  api.patch(`/gis-layers/spatial-features/${id}/`, data).then(res => res.data);
export const deleteSpatialFeature = (id) =>
  api.delete(`/gis-layers/spatial-features/${id}/`);

export const createFeatureAttributeValue = (data) =>
  api.post("/gis-layers/feature-attribute-values/", data).then(res => res.data);
export const updateFeatureAttributeValue = (id, data) =>
  api.patch(`/gis-layers/feature-attribute-values/${id}/`, data).then(res => res.data);
export const deleteFeatureAttributeValue = (id) =>
  api.delete(`/gis-layers/feature-attribute-values/${id}/`);

export const createRasterLayer = (data) =>
  api.post("/gis-layers/raster-layers/", data).then(res => res.data);
export const updateRasterLayer = (id, data) =>
  api.patch(`/gis-layers/raster-layers/${id}/`, data).then(res => res.data);
export const deleteRasterLayer = (id) =>
  api.delete(`/gis-layers/raster-layers/${id}/`);

export const createLayerUpload = (data) =>
  api.post("/gis-layers/layer-uploads/", data).then(res => res.data);
export const updateLayerUpload = (id, data) =>
  api.patch(`/gis-layers/layer-uploads/${id}/`, data).then(res => res.data);
export const deleteLayerUpload = (id) =>
  api.delete(`/gis-layers/layer-uploads/${id}/`);

export const getSpatialLayersByCategory = async (categoryId) => {
  const res = await api.get(
    `/gis-layers/layer-categories/${categoryId}/spatial-layers/`
  );
  return res.data;
};
export const getSpatialFeaturesByLayer = async (layerId) => {
  const res = await api.get(`/gis-layers/spatial-layers/${layerId}/features/`);
  return res.data;
};

export const getLayerAttributesByLayer = async (layerId) => {
  const res = await api.get(`/gis-layers/spatial-layers/${layerId}/attributes/`);
  return res.data;
};

// export const createSpatialFeature = (data) =>
//   api.post("/gis-layers/spatial-features/", data).then((res) => res.data);

// export const updateSpatialFeature = (id, data) =>
//   api.patch(`/gis-layers/spatial-features/${id}/`, data).then((res) => res.data);

// export const deleteSpatialFeature = (id) =>
//   api.delete(`/gis-layers/spatial-features/${id}/`);
export const getSpatialLayerDetail = async (layerId) => {
  const res = await api.get(`/gis-layers/spatial-layers/${layerId}/`);
  return res.data;
};