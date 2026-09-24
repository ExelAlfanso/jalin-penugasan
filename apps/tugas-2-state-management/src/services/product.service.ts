import api from "@/services/api";
import type { Product, ProductResponse } from "@/types/product";

export const productService = {
  async getProducts(limit: number, skip: number): Promise<ProductResponse> {
    const { data } = await api.get<ProductResponse>("/products", { params: { limit, skip } });
    return data;
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async searchProducts(query: string, limit: number, skip: number): Promise<ProductResponse> {
    const { data } = await api.get<ProductResponse>("/products/search", {
      params: { q: query, limit, skip },
    });
    return data;
  },
  
  async getCategories(): Promise<string[]> {
    const { data } = await api.get<string[]>("/products/category-list");
    return data;
  },

  async getProductsByCategory(
    category: string,
    limit: number,
    skip: number,
  ): Promise<ProductResponse> {
    const { data } = await api.get<ProductResponse>(`/products/category/${category}`, {
      params: { limit, skip },
    });
    return data;
  },
};
