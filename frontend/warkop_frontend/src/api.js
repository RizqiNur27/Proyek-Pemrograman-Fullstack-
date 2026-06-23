// ============================================================
//  src/api.js — Warkop API Service
//  Sesuai dengan backend Express di port 5000
//  Base: http://localhost:5000/api
// ============================================================

const BASE = 'http://localhost:5000/api';
const UPLOADS_URL = 'http://localhost:5000/uploads';

// Helper: tambah Authorization header jika ada token
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

// ── UPLOAD ────────────────────────────────────────────────
export async function uploadImage(file) {
  const form = new FormData();
  form.append('gambar', file);
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal upload');
  return data;
}

export { UPLOADS_URL };

// ── AUTH ──────────────────────────────────────────────────
// POST /api/auth/register  body: { nama, email, password, role? }
export const register = (body) => request('POST', '/auth/register', body);

// POST /api/auth/login  body: { email, password }
export const login = (body) => request('POST', '/auth/login', body);

// ── KATEGORI ─────────────────────────────────────────────
// GET /api/kategori  — public, returns { success, data: [{id_kategori, nama_kategori}] }
export const getKategori = () => request('GET', '/kategori');

// ── MENU ─────────────────────────────────────────────────
// GET /api/menu  — public, returns { success, data: [{id_menu, id_kategori, nama_menu, harga, created_at}] }
export const getMenu = () => request('GET', '/menu');

// GET /api/menu/:id
export const getMenuById = (id) => request('GET', `/menu/${id}`);

// POST /api/menu  — admin only, body: { id_kategori, nama_menu, harga }
export const createMenu = (body) => request('POST', '/menu', body, true);

// PUT /api/menu/:id  — admin only, body: { id_kategori, nama_menu, harga }
export const updateMenu = (id, body) => request('PUT', `/menu/${id}`, body, true);

// DELETE /api/menu/:id  — admin only
export const deleteMenu = (id) => request('DELETE', `/menu/${id}`, null, true);

// ── ORDERS ───────────────────────────────────────────────
// POST /api/orders  — auth required
// body: { tipe_layanan: 'dine_in'|'take_away', items: [{id_menu, jumlah}] }
// returns: { success, data: { id_order, kode_order, total_tagihan } }
export const createOrder = (body) => request('POST', '/orders', body);

// GET /api/orders/:id/struk — public, PDF receipt for order (used by QRIS)
export const getStrukUrl = (id) => `${BASE}/orders/${id}/struk`;

// ── TRANSAKSI ────────────────────────────────────────────
// POST /api/transaksi  — auth required
// body: { id_order, metode_pembayaran: 'cash'|'qris' }
// returns: { success, data: { id_transaksi, id_order, total_harga, metode_pembayaran } }
export const bayar = (body) => request('POST', '/transaksi', body, true);

// ── DASHBOARD ADMIN ────────────────────────────────────────
// GET /api/orders — admin only, melihat semua pesanan masuk
export const getOrders = () => request('GET', '/orders', null, true);

// DELETE /api/orders/:id — admin only, hapus pesanan
export const deleteOrder = (id) => request('DELETE', `/orders/${id}`, null, true);

// GET /api/transaksi — admin only, melihat semua riwayat pembayaran
export const getTransaksi = () => request('GET', '/transaksi', null, true);

// PATCH /api/transaksi/:id/lunas — admin only, menandai lunas
export const lunas = (id) => request('PATCH', `/transaksi/${id}/lunas`, null, true);

// GET /api/dashboard/harian — admin only, penjualan per menu hari ini
export const getHarian = () => request('GET', '/dashboard/harian', null, true);

// GET /api/dashboard/pdf — admin only, download PDF laporan harian
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
  // Revoke setelah jeda cukup lama agar download sempat dimulai
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
