import api from "./api";
import type { FiltrosRestaurante, Restaurante, RestaurantesResponse } from "../types";

export async function getRestaurantes(filtros: FiltrosRestaurante = {}): Promise<RestaurantesResponse> {
  const params: Record<string, string | number | boolean> = {};

  if (filtros.q)         params.q         = filtros.q;
  if (filtros.ciudad)    params.ciudad     = filtros.ciudad;
  if (filtros.localidad) params.localidad  = filtros.localidad;
  if (filtros.page)      params.page       = filtros.page;
  if (filtros.pageSize)  params.pageSize   = filtros.pageSize;
  if (filtros.sortBy)    params.sortBy     = filtros.sortBy;

  const boolKeys: (keyof FiltrosRestaurante)[] = [
    "zonaAmplia", "parqueCercano", "zonaInfantil", "tronaDisponible",
    "cambiadorDisponible", "sitioParaCarrito", "terrazaSegura",
    "actividadesParaNinos", "menuInfantil", "aptoVegetariano",
    "aptoVegano", "sinPantallas", "ambienteFamiliar", "accesibleConCarrito",
  ];

  for (const k of boolKeys) {
    if (filtros[k] === true) params[k] = true;
  }

  const { data } = await api.get<RestaurantesResponse>("/restaurantes", { params });
  return data;
}

export async function getRestauranteById(id: number): Promise<Restaurante> {
  const { data } = await api.get<Restaurante>(`/restaurantes/${id}`);
  return data;
}

export async function postFavorito(id: number): Promise<{ id: number; favoritos: number }> {
  const { data } = await api.post(`/restaurantes/${id}/favorito`);
  return data;
}
