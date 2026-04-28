import api from "./api";

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export async function loginAdmin(body: LoginBody): Promise<LoginResponse> {
  const { data } = await api.post("/admin/login", body);
  return data;
}
