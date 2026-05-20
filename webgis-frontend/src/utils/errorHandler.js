export const getErrorMessage = (err) => {
  const data = err.response?.data;

  if (!data) return "Server error. Please try again.";

  if (data.message) return data.message;
  if (data.detail) return data.detail;

  const firstKey = Object.keys(data)[0];

  if (Array.isArray(data[firstKey])) {
    return data[firstKey][0];
  }

  return "Something went wrong.";
};