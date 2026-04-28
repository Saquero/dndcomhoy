import api from "./api";
import type { SugerenciaPayload } from "../types";

export async function enviarSugerencia(payload: SugerenciaPayload): Promise<void> {
  await api.post("/sugerencias", payload);
}
