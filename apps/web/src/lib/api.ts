import axios from "axios";
import { supabase } from "./supabase";

const baseURL = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

export const api = axios.create({
  baseURL: baseURL && baseURL.length > 0 ? baseURL : "http://localhost:3000",
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await supabase.auth.signOut();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
