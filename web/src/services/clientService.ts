const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ClientData {
  id?: number;
  name: string;
  contact: string;
  company: string;
}

export interface ClientResponse {
  status: string;
  data: ClientData | ClientData[];
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Fetch all clients
 */
export const getClientsApi = async (token: string): Promise<ClientData[]> => {
  const response = await fetch(`${API_BASE_URL}/clients`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: ClientResponse = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'Gagal mengambil data klien.');
  }

  return data.data as ClientData[];
};

/**
 * Create a new client
 */
export const createClientApi = async (token: string, client: ClientData): Promise<ClientData> => {
  const response = await fetch(`${API_BASE_URL}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(client),
  });

  const data: ClientResponse = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'Gagal menambahkan klien baru.');
  }

  return data.data as ClientData;
};

/**
 * Update an existing client
 */
export const updateClientApi = async (token: string, id: number, client: ClientData): Promise<ClientData> => {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(client),
  });

  const data: ClientResponse = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'Gagal memperbarui data klien.');
  }

  return data.data as ClientData;
};

/**
 * Delete a client
 */
export const deleteClientApi = async (token: string, id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: ClientResponse = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'Gagal menghapus data klien.');
  }
};
