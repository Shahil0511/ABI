import apiClient from "./apiClient";

// Frontend News form type
export interface NewsForm {
  title: string;
  summary: string;
  content: string;
  contentType: "article" | "video" | "short" | "gallery" | "podcast";
  tags: string[];
  category: string;
  subcategory: string;
  featuredImage?: File | null;
  videoUrl?: File | null;
  galleryImages?: (File | null)[];
  readTime: number;
  status: "draft" | "published" | "archived";
  currentTag?: string; // frontend only, not sent to backend
}

// API response type
export type NewsResponse = {
  success: boolean;
  message: string;
  data: any; // Replace with your News model type
};

// Debug function to log FormData contents


// Convert frontend form into FormData for multipart upload
function toFormData(data: Partial<NewsForm>): FormData {
  const formData = new FormData();

  // Append all required fields - even if empty to pass validation
  formData.append("title", data.title || "");
  formData.append("summary", data.summary || "");
  formData.append("content", data.content || "");
  formData.append("contentType", data.contentType || "article");
  formData.append("category", data.category || "");
  formData.append("subcategory", data.subcategory || "");
  formData.append("readTime", String(data.readTime || 0));
  formData.append("status", data.status || "draft");
  
  // Handle tags - ensure it's always an array and stringified
const tags = data.tags && data.tags.length > 0 ? data.tags : [];
formData.append("tags", JSON.stringify(tags));


  // Optional files - only append if they exist
  if (data.featuredImage instanceof File) {
    formData.append("featuredImage", data.featuredImage);
  }
  
  if (data.videoUrl instanceof File) {
    formData.append("videoUrl", data.videoUrl);
  }
  
  // Handle gallery images
  if (data.galleryImages && data.galleryImages.length > 0) {
    data.galleryImages.forEach(file => {
      if (file instanceof File) {
        formData.append("galleryImages", file);
      }
    });
  }

  return formData;
}

// Create news
export async function createNews(data: NewsForm) {
  const formData = toFormData(data);

  try {
   const response = await apiClient.post<NewsResponse>("/news", formData);
   
    return response.data;
  } catch (error: any) {
    console.error("❌ [createNews] API call failed:", error.response?.data || error.message);
    throw error;
  }
}

// Get single news by ID
export async function getNewsById(id: string) {
  try {
    const response = await apiClient.get<NewsResponse>(`/news/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ [getNewsById] API call failed:", error.response?.data || error.message);
    throw error;
  }
}

// Build query string for getAllNews
function buildQuery(params?: Record<string, any>): string {
  if (!params) return "";
  const query = new URLSearchParams();
  for (const key in params) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

// Get all news
export async function getAllNews(params?: {
  page?: number;
  limit?: number;
  contentType?: string;
  category?: string;
  subcategory?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  try {
    const query = buildQuery(params);
    const response = await apiClient.get<NewsResponse>(`/news${query}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ [getAllNews] API call failed:", error.response?.data || error.message);
    throw error;
  }
}

// Update news
export async function updateNews(id: string, data: Partial<NewsForm>) {
  const formData = toFormData(data);

  try {
    const response = await apiClient.put<NewsResponse>(`/news/${id}`, formData);
    return response.data;
  } catch (error: any) {
    console.error("❌ [updateNews] API call failed:", error.response?.data || error.message);
    throw error;
  }
}

// Delete news
export async function deleteNews(id: string) {
  try {
    const response = await apiClient.delete<NewsResponse>(`/news/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ [deleteNews] API call failed:", error.response?.data || error.message);
    throw error;
  }
}

// Helper for file preview
export function createFilePreview(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeFilePreview(url: string): void {
  URL.revokeObjectURL(url);
}