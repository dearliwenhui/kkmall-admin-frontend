import { http } from "@/utils/http";

interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

const unwrap = <T>(promise: Promise<ApiResult<T>>): Promise<T> => {
  return promise.then(res => res.data);
};

/**
 * Upload single file.
 */
export const uploadFile = (file: File, type?: string) => {
  const formData = new FormData();
  formData.append("file", file);
  if (type) {
    formData.append("type", type);
  }

  return unwrap(
    http.request<ApiResult<{ url: string }>>("post", "/api/common/upload", {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  );
};

/**
 * Upload batch files.
 */
export const uploadFiles = (files: File[], type?: string) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append("files", file);
  });
  if (type) {
    formData.append("type", type);
  }

  return unwrap(
    http.request<ApiResult<{ urls: string[] }>>("post", "/api/common/upload/batch", {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  );
};

/**
 * Get dictionary data.
 */
export const getDictData = (dictType: string) => {
  return http.request<Array<{ label: string; value: string }>>(
    "get",
    `/api/common/dict/${dictType}`
  );
};

/**
 * Get region data.
 */
export const getRegionData = (parentId?: number) => {
  return http.request<any[]>("get", "/api/common/region", {
    params: { parentId }
  });
};

/**
 * Get dashboard statistics.
 */
export const getDashboardStatistics = () => {
  return http.request<any>("get", "/api/common/dashboard/statistics");
};

/**
 * Get chart data.
 */
export const getChartData = (type: string, params?: any) => {
  return http.request<any>("get", `/api/common/chart/${type}`, {
    params
  });
};
