import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/$/, "");

const normalizeUrl = (url = "") => {
  const trimmed = String(url).replace(/^\/+/, "");
  return trimmed.replace(/^api\//, "");
};

const resolveConfig = (config = {}) => {
  if (Object.prototype.hasOwnProperty.call(config, "headers")) {
    const { headers = {}, ...rest } = config;
    return {
      ...rest,
      headers: {
        Accept: "application/json",
        ...headers,
      },
    };
  }

  return {
    headers: {
      Accept: "application/json",
      ...config,
    },
  };
};

const Api = {
  get: async (url, config = {}) => {
    return axios.get(
      `${API_BASE_URL}/${normalizeUrl(url)}`,
      resolveConfig(config)
    );
  },

  post: async (url, data, config = {}) => {
    return axios.post(
      `${API_BASE_URL}/${normalizeUrl(url)}`,
      data,
      resolveConfig(config)
    );
  },

  delete: async (url, config = {}) => {
    return axios.delete(
      `${API_BASE_URL}/${normalizeUrl(url)}`,
      resolveConfig(config)
    );
  },

  put: async (url, data, config = {}) => {
    return axios.put(
      `${API_BASE_URL}/${normalizeUrl(url)}`,
      data,
      resolveConfig(config)
    );
  },
};

export default Api;
