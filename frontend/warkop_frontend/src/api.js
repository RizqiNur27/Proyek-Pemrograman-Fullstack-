const BASE = 'http://172.16.14.127:5000/api'; //syarat agar qris nye bisa ganti ip sesuai jaringan yang digunakan
const UPLOADS_URL = 'http://localhost:5000/uploads';

function headers(withAuth = false) {
  const h = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = localStorage.getItem('token');
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

async function request(method, path, body, withAuth = false) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(withAuth),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan');
  return data;
}

export async function uploadImage(file) {
  const form = new FormData();
  form.append('gambar', file);
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal upload');
  return data;
}

export { UPLOADS_URL };

export const register = (body) => request('POST', '/auth/register', body);

export const login = (body) => request('POST', '/auth/login', body);

export const getKategori = () => request('GET', '/kategori');

export const getMenu = () => request('GET', '/menu');

export const getMenuById = (id) => request('GET', `/menu/${id}`);

export const createMenu = (body) => request('POST', '/menu', body, true);

export const updateMenu = (id, body) => request('PUT', `/menu/${id}`, body, true);

export const deleteMenu = (id) => request('DELETE', `/menu/${id}`, null, true);

export const createOrder = (body) => request('POST', '/orders', body);

export const getStrukUrl = (id) => `${BASE}/orders/${id}/struk`;

export const bayar = (body) => request('POST', '/transaksi', body, true);

export const getOrders = () => request('GET', '/orders', null, true);

export const deleteOrder = (id) => request('DELETE', `/orders/${id}`, null, true);

export const getTransaksi = () => request('GET', '/transaksi', null, true);

export const lunas = (id) => request('PATCH', `/transaksi/${id}/lunas`, null, true);

export const getHarian = () => request('GET', '/dashboard/harian', null, true);

export async function downloadPdf() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/dashboard/pdf`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    let msg = 'Gagal download PDF';
    try {
      const err = await res.json();
      msg = err.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-harian-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
