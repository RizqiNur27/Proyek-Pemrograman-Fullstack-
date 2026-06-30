import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../assets/css/AdminPage.css'
import {
  getMenu,
  getKategori,
  createMenu,
  updateMenu,
  deleteMenu,
  getOrders,
  deleteOrder,
  getTransaksi,
  lunas,
  getHarian,
  downloadPdf,
  bayar,
  uploadImage,
  UPLOADS_URL
} from '../api';

function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export default function AdminPage({ onNavigate }) {
  const [tab, setTab]               = useState('dashboard'); 
  const [menu, setMenu]             = useState([]);
  const [kategori, setKategori]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [harian, setHarian]       = useState([]);
  const [harianRingkasan, setHarianRingkasan] = useState({ totalPendapatan: 0, totalPesanan: 0 });
  const [loading, setLoading]     = useState(true);
  const [err, setErr]              = useState('');
  const [toast, setToast]         = useState(null);
  const [time, setTime] = useState(new Date());

  // State untuk Filter Live Orders
  const [searchOrder, setSearchOrder] = useState('');
  const [filterStatusOrder, setFilterStatusOrder] = useState('semua');

  // Modal state untuk Menu
  const [modal, setModal]     = useState(null);  // null | 'menu'
  const [modalBayar, setModalBayar] = useState(null);
  const [metodeBayar, setMetodeBayar] = useState('cash');
  const [form, setForm]       = useState({ id_kategori: '', nama_menu: '', harga: '' });
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [gambarFile, setGambarFile] = useState(null);
  const [gambarPreview, setGambarPreview] = useState(null);

  // URL Ikon Google Material (PNG / SVG)
  const iconUrl = (name) => `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${name}/default/24px.svg`;

  // ── FUNGSI SUARA SINTESIS 
  function playNotificationSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); 
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); 
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log("Audio play blocked by browser interaction policy", e);
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTanggal = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatJam = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' WIB';
  };

  async function loadData() {
    setLoading(true);
    const [m, k, o, t] = await Promise.all([
      getMenu().catch(() => ({ data: [] })),
      getKategori().catch(() => ({ data: [] })),
      getOrders().catch(() => ({ data: [] })),
      getTransaksi().catch(() => ({ data: [] })),
    ]);
    setMenu(Array.isArray(m) ? m : m.data || []);
    setKategori(Array.isArray(k) ? k : k.data || []);
    setOrders(Array.isArray(o) ? o : o.data || []);
    setTransaksi(Array.isArray(t) ? t : t.data || []);
    setLoading(false);
    getHarian().then(h => {
      if (h.status === 'success') {
        setHarian(h.data.items || []);
        setHarianRingkasan(h.data.ringkasan || { totalPendapatan: 0, totalPesanan: 0 });
      }
    }).catch(() => {});
  }

  let prevOrderLength = 0;
  async function refreshData() {
    try {
      const [o, t] = await Promise.all([
        getOrders(),
        getTransaksi(),
      ]);
      const newOrders = o.data || [];
      const newTransaksi = t.data || [];

      if (prevOrderLength > 0 && newOrders.length > prevOrderLength) {
        const latestOrder = newOrders[newOrders.length - 1];
        setToast({
          kode: latestOrder.kode_order,
          nama: latestOrder.nama_pemesan || latestOrder.nama_user || '',
          total: latestOrder.total_tagihan,
        });
        playNotificationSound();
        setTimeout(() => setToast(null), 4000);
      }
      prevOrderLength = newOrders.length;

      setOrders(newOrders);
      setTransaksi(newTransaksi);
    } catch (e) {
      console.error('Polling error:', e);
    }
  }

  async function handleDownloadPdf() {
    const token = localStorage.getItem('token');
    if (!token) {
      setErr('Anda belum login! Silakan login sebagai admin terlebih dahulu.');
      return;
    }
    try {
      await downloadPdf();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleLunas(id) {
    try {
      await lunas(id);
      loadData();
    } catch (e) {
      alert('Gagal update status: ' + e.message);
    }
  }

  // Menggunakan SweetAlert2 untuk konfirmasi hapus pesanan
  function handleDeleteOrder(id, kode) {
    Swal.fire({
      title: 'Hapus Pesanan?',
      text: `Yakin mau hapus pesanan ${kode}? Data transaksi & detail pesanan juga akan dihapus permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // Merah Danger
      cancelButtonColor: '#64748b',  // Muted Gray
      confirmButtonText: 'Ya, Hapus Saja!',
      cancelButtonText: 'Batal',
      reverseButtons: true, // Tombol batal di kiri
      focusCancel: true, // Fokus ke tombol batal
      customClass: {
        container: 'my-swal-container', // Biar searah font Inter lo
        popup: 'my-swal-popup',
        title: 'my-swal-title',
        confirmButton: 'btn-del', // Pakai styling tombol hapus lo
        cancelButton: 'btn-saas-cancel' // Pakai styling tombol batal lo
      },
      buttonsStyling: false // Matikan styling default Swal biar nempel sama CSS lo
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true); // Tampilkan loading sebentar
        try {
          await deleteOrder(id);
          Swal.fire({
            title: 'Terhapus!',
            text: `Pesanan ${kode} berhasil dihapus dari sistem.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              container: 'my-swal-container',
              popup: 'my-swal-popup'
            }
          });
          loadData();
        } catch (e) {
          Swal.fire({
            title: 'Gagal!',
            text: 'Gagal hapus pesanan: ' + e.message,
            icon: 'error',
            customClass: {
              container: 'my-swal-container',
              popup: 'my-swal-popup'
            }
          });
        } finally {
          setLoading(false);
        }
      }
    });
  }

  async function submitBayar() {
    try {
      await bayar({ id_order: modalBayar, metode_pembayaran: metodeBayar });
      alert("Pembayaran berhasil!");
      setModalBayar(null);
      loadData();
    } catch (e) {
      alert("Gagal memproses: " + e.message);
    }
  }

  useEffect(() => {
    loadData();
    const intervalId = setInterval(() => {
      refreshData();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  function openAdd() {
    setForm({ id_kategori: kategori[0]?.id_kategori || '', nama_menu: '', harga: '' });
    setGambarFile(null);
    setGambarPreview(null);
    setEditId(null);
    setModal('menu');
  }

  function openEdit(m) {
    setForm({ id_kategori: m.id_kategori || '', nama_menu: m.nama_menu, harga: m.harga });
    setGambarFile(null);
    setGambarPreview(m.gambar ? `${UPLOADS_URL}/${m.gambar}` : null);
    setEditId(m.id_menu);
    setModal('menu');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      let gambar;
      if (gambarFile) {
        const uploadRes = await uploadImage(gambarFile);
        gambar = uploadRes.filename;
      }
      const body = {
        id_kategori: form.id_kategori || null,
        nama_menu: form.nama_menu,
        harga: parseInt(form.harga),
      };
      if (editId) {
        if (gambar) body.gambar = gambar;
        await updateMenu(editId, body);
      } else {
        body.gambar = gambar || null;
        await createMenu(body);
      }
      setModal(null);
      loadData();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Menggunakan SweetAlert2 untuk konfirmasi hapus menu
  function handleDelete(id, nama) {
    Swal.fire({
      title: 'Hapus Menu?',
      text: `Yakin mau hapus menu "${nama}" permanen dari daftar?`,
      icon: 'question', // Ikon tanda tanya biar lebih soft
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        container: 'my-swal-container',
        popup: 'my-swal-popup',
        title: 'my-swal-title',
        confirmButton: 'btn-del',
        cancelButton: 'btn-saas-cancel'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSaving(true); // Indikator proses
        try {
          await deleteMenu(id);
          Swal.fire({
            title: 'Menu Terhapus!',
            text: `Menu "${nama}" berhasil dihapus.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              container: 'my-swal-container',
              popup: 'my-swal-popup'
            }
          });
          loadData();
        } catch (e) {
          Swal.fire({
            title: 'Gagal Hapus!',
            text: 'Gagal hapus menu: ' + e.message,
            icon: 'error',
            customClass: {
              container: 'my-swal-container',
              popup: 'my-swal-popup'
            }
          });
        } finally {
          setSaving(false);
        }
      }
    });
  }

  const totalMenu       = menu.length;
  const totalOmset      = transaksi.reduce((sum, t) => sum + Number(t.total_harga), 0);
  const jumlahPesanan   = orders.length;
  const transaksiSukses = transaksi.length;

  const menuTerlaris = [
    { nama: 'Es Kopi Susu Warkop', terjual: 48, harga: 15000, icon: 'coffee' },
    { nama: 'Mie Instan Goreng Nyemek', terjual: 36, harga: 12000, icon: 'ramen_dining' },
    { nama: 'Pancong Lumer Keju', terjual: 24, harga: 10000, icon: 'cake' },
  ];

  // Logika penyaringan untuk Tab Live Orders
  const filteredOrders = orders.filter(o => {
    const namaPelanggan = (o.nama_pemesan || o.nama_user || '').toLowerCase();
    const kodeOrder = (o.kode_order || '').toLowerCase();
    const keyword = searchOrder.toLowerCase();
    
    // Cek Search
    const matchSearch = kodeOrder.includes(keyword) || namaPelanggan.includes(keyword);
    
    // Cek Status (Asumsi status di DB: 'selesai' atau undefined/pending)
    const statusPesanan = o.status === 'selesai' ? 'selesai' : 'pending';
    const matchStatus = filterStatusOrder === 'semua' ? true : statusPesanan === filterStatusOrder;

    return matchSearch && matchStatus;
  });

  return (
    <div className="admin-page">
      {/* ── SIDEBAR SAAS MODERN ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src={iconUrl('storefront')} className="icon-img icon-white" alt="Warkop" />
          <div>
            <div className="brand-name">Warkop Si Bontot</div>
            <div className="brand-sub">Sistem Kelola Warkop</div>   
          </div>
        </div>
        <nav className="sidebar-nav-container">
          {[
            { key: 'dashboard', icon: 'monitoring', label: 'Dashboard Overview' },
            { key: 'orders',    icon: 'notifications_active', label: 'Live Orders Monitor' },
            { key: 'transaksi', icon: 'account_balance_wallet', label: 'Riwayat Keuangan' },
            { key: 'menu',      icon: 'restaurant_menu', label: 'Kelola Item Menu' },
            { key: 'kategori',  icon: 'sell', label: 'Manajemen Kategori' },
          ].map(n => (
            <button
              key={n.key}
              className={`sidebar-nav ${tab === n.key ? 'active' : ''}`}
              onClick={() => setTab(n.key)}
            >
              <img src={iconUrl(n.icon)} className="nav-icon-img" alt={n.label} />
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="admin-main">
        {err && <div className="err-box">⚠️ Error: {err}</div>}

       

        {/* ── 1. DASHBOARD TAB OVERVIEW ── */}
        {tab === 'dashboard' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Dashboard Overview</h1>
                <p>Cek performa bisnis dan laporan penjualan Warkop Si Bontot hari ini.</p>
              </div>
            </div>
            
            {/* ── WIDGET JAM REALTIME ── */}
            <div className="admin-clock-widget">
              <div className="clock-col">
                <span className="widget-tag">🗓️ TANGGAL OPERASIONAL</span>
                <h3>{formatTanggal(time)}</h3>
              </div>
              <div className="clock-col text-end-md">
                <span className="widget-tag">⏰ WAKTU DIGITAL</span>
                <h2 className="live-time-val">{formatJam(time)}</h2>
              </div>
            </div>

            {loading ? <Spinner /> : (
              <>
                <div className="stat-grid">
                  <StatCard icon="payments" label="Total Omset Penjualan" value={formatRp(totalOmset)} color="#1d4ed8" />
                  <StatCard icon="local_mall" label="Total Pesanan Masuk" value={`${jumlahPesanan} Pesanan`} color="#3b82f6" />
                  <StatCard icon="check_circle" label="Transaksi Sukses" value={`${transaksiSukses} Dibayar`} color="#22c55e" />
                  <StatCard icon="coffee" label="Varian Menu Aktif" value={`${totalMenu} Produk`} color="#f59e0b" />
                </div>

                <div className="admin-section-title">Aktivitas Terkini</div>
                <div className="dashboard-double-column">
                  
                  {/* Mini Live Order */}
                  <div className="mini-card-panel">
                    <h3><img src={iconUrl('buttons_alt')} className="panel-icon" alt="" /> Pesanan Terbaru</h3>
                    <ul className="mini-list">
                      {orders.slice(-5).reverse().map(o => {
                        const nama = o.nama_pemesan || o.nama_user || '';
                        return (
                          <li key={o.id_order}>
                            <div className="mini-list-left">
                              <strong className="text-blue">{o.kode_order}</strong>
                              {nama && <small className="text-muted block-name">({nama})</small>}
                              <small className="sub-detail-text">{o.tipe_layanan === 'dine_in' ? '🍽️ Dine In' : '📦 Take Away'}</small>
                            </div>
                            <strong className="text-navy">{formatRp(o.total_tagihan)}</strong>
                          </li>
                        );
                      })}
                      {orders.length === 0 && <p className="empty-text">Belum ada pesanan hari ini.</p>}
                    </ul>
                  </div>

                  {/* Mini Cashflow */}
                  <div className="mini-card-panel">
                    <h3><img src={iconUrl('account_balance_wallet')} className="panel-icon" alt="" /> Pembayaran Masuk</h3>
                    <ul className="mini-list">
                      {transaksi.slice(-5).reverse().map(t => (
                        <li key={t.id_transaksi}>
                          <div>
                            <span className="tbl-id">#{t.id_transaksi}</span>
                            <small className="sub-detail-text block-name uppercase">({t.metode_pembayaran})</small>
                          </div>
                          <strong className="text-green">{formatRp(t.total_harga)}</strong>
                        </li>
                      ))}
                      {transaksi.length === 0 && <p className="empty-text">Belum ada pembayaran masuk.</p>}
                    </ul>
                  </div>

                  {/* Leaderboard */}
                  <div className="mini-card-panel">
                    <h3><img src={iconUrl('leaderboard')} className="panel-icon" alt="" /> Menu Terlaris</h3>
                    <div className="leaderboard-box">
                      {menuTerlaris.map((item, idx) => (
                        <div key={idx} className="leaderboard-item">
                          <div className="lead-icon-wrap">
                            <img src={iconUrl(item.icon)} alt="" className="icon-img" />
                          </div>
                          <div className="lead-info">
                            <div className="lead-name">{item.nama}</div>
                            <div className="lead-sold">{item.terjual} Porsi Terjual</div>
                          </div>
                          <span className="lead-price">{formatRp(item.harga)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* LAPORAN HARIAN */}
                <div className="admin-section-title space-top">
                  Laporan Penjualan Hari Ini
                  <button onClick={handleDownloadPdf} className="btn-download-pdf">
                    <img src={iconUrl('description')} className="icon-img btn-icon icon-white" alt="" /> Download PDF
                  </button>
                </div>
                
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Menu</th>
                        <th>Terjual</th>
                        <th>Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {harian.filter(i => i.total_terjual > 0).map((item, idx) => (
                        <tr key={item.id_menu || idx}>
                          <td><strong>{item.nama_menu}</strong></td>
                          <td>{item.total_terjual} porsi</td>
                          <td className="text-green font-bold">{formatRp(item.total_pendapatan)}</td>
                        </tr>
                      ))}
                      {harian.filter(i => i.total_terjual > 0).length === 0 && (
                        <tr><td colSpan="3" className="text-center text-muted">Belum ada penjualan hari ini.</td></tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="table-footer-row">
                        <td><strong>Total</strong></td>
                        <td><strong>{harianRingkasan.totalPesanan} pesanan</strong></td>
                        <td className="text-green font-bold">{formatRp(harianRingkasan.totalPendapatan)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {/* ── 2. TAB LIVE ORDERS MONITOR (UPDATED WITH FILTER) ── */}
        {tab === 'orders' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Live Orders Monitor</h1>
                <p>Pantau pesanan pelanggan/waiter secara live real-time.</p>
              </div>
            </div>

            {/* AREA FILTER & SEARCH */}
            <div className="filter-controls" style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="🔍 Cari kode / nama pelanggan..." 
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', flex: '1' }}
              />
              <select 
                value={filterStatusOrder} 
                onChange={(e) => setFilterStatusOrder(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="semua">Semua Status</option>
                <option value="pending">⏳ Menunggu Pembayaran</option>
                <option value="selesai">✓ Lunas</option>
              </select>
            </div>

            {loading ? <Spinner /> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kode Order</th>
                      <th>Pelanggan</th>
                      <th>Item</th>
                      <th>Tipe</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* GUNAKAN filteredOrders BUKAN orders */}
                    {filteredOrders.map(o => {
                      const nama = o.nama_pemesan || o.nama_user || '(Tanpa Nama)';
                      return (
                        <tr key={o.id_order}>
                          <td><strong className="text-blue">{o.kode_order}</strong></td>
                          <td><span className="font-semibold">{nama}</span></td>
                          <td className="text-muted text-small">
                            {o.items && o.items.length > 0 ? o.items.map(i => `${i.nama_menu} x${i.jumlah}`).join(', ') : '-'}
                          </td>
                          <td>
                            <span className={`badge-layanan ${o.tipe_layanan}`}>
                              {o.tipe_layanan === 'dine_in' ? '🍽️ Dine In' : '📦 Take Away'}
                            </span>
                          </td>
                          <td><strong>{formatRp(o.total_tagihan)}</strong></td>
                          <td>
                            {o.status === 'selesai' ? (
                              <span className="badge-status-paid" title="Pesanan ini sudah dibayar lunas">✓ Lunas</span>
                            ) : (
                              <button onClick={() => setModalBayar(o.id_order)} className="btn-process-pay" title="Klik untuk memproses pembayaran kasir">
                                ⏳ Proses Bayar
                              </button>
                            )}
                          </td>
                          <td>
                            <button onClick={() => handleDeleteOrder(o.id_order, o.kode_order)} className="btn-table-delete" title="Hapus seluruh data pesanan ini">
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan="7" className="text-center text-muted empty-text">Tidak ada pesanan yang sesuai dengan filter pencarian.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── 3. TAB RIWAYAT KEUANGAN ── */}
        {tab === 'transaksi' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Riwayat Transaksi Finansial</h1>
                <p>Semua log uang masuk pembukuan transaksi digital.</p>
              </div>
            </div>
            {loading ? <Spinner /> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID Transaksi</th>
                      <th>Kode Order</th>
                      <th>Item</th>
                      <th>Metode</th>
                      <th>Status</th>
                      <th>Nominal</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaksi.map(t => (
                      <tr key={t.id_transaksi}>
                        <td><span className="tbl-id">#{t.id_transaksi}</span></td>
                        <td><strong className="text-blue">{t.kode_order || `#${t.id_order}`}</strong></td>
                        <td className="text-muted text-small">
                          {t.items && t.items.length > 0 ? t.items.map(i => `${i.nama_menu} x${i.jumlah}`).join(', ') : '-'}
                        </td>
                        <td>
                          <span className="metode-tag font-bold">
                            {t.metode_pembayaran === 'cash' ? '💵 Cash' : t.metode_pembayaran === 'qris' ? '📱 QRIS' : '🏦 Transfer'}
                          </span>
                        </td>
                        <td>
                          {t.status_pembayaran === 'lunas' ? (
                            <span className="badge-status-paid">✓ Lunas</span>
                          ) : (
                            <span className="badge-status-pending">⏳ Belum</span>
                          )}
                        </td>
                        <td><span className="text-green font-bold">{formatRp(t.total_harga)}</span></td>
                        <td>
                          {t.status_pembayaran !== 'lunas' && (
                            <button onClick={() => handleLunas(t.id_transaksi)} className="btn-table-action-success">
                              ✓ Set Lunas
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {transaksi.length === 0 && (
                      <tr><td colSpan="7" className="text-center text-muted">Belum ada record transaksi.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── 4. TAB KELOLA MENU ── */}
        {tab === 'menu' && (
          <>
            <div className="admin-header header-with-btn">
              <div>
                <h1>Kelola Item Menu</h1>
                <p>{menu.length} produk terdaftar di database</p>
              </div>
              <button className="btn-saas-primary" onClick={openAdd}>+ Tambah Menu</button>
            </div>
            {loading ? <Spinner /> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Gambar</th>
                      <th>ID</th>
                      <th>Nama Menu</th>
                      <th>Kategori</th>
                      <th>Harga</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.map(m => {
                      const kat = kategori.find(k => k.id_kategori === m.id_kategori);
                      return (
                        <tr key={m.id_menu}>
                          <td>
                            {m.gambar ? (
                              <img src={`${UPLOADS_URL}/${m.gambar}`} alt={m.nama_menu} className="tbl-menu-thumb" />
                            ) : (
                              <span className="text-muted text-small">—</span>
                            )}
                          </td>
                          <td><span className="tbl-id">#{m.id_menu}</span></td>
                          <td><strong>{m.nama_menu}</strong></td>
                          <td><span className="tbl-kat">{kat?.nama_kategori || '—'}</span></td>
                          <td><span className="tbl-price font-bold">{formatRp(m.harga)}</span></td>
                          <td>
                            <div className="tbl-actions">
                              <button className="btn-edit" onClick={() => openEdit(m)}>Edit</button>
                              <button className="btn-del" onClick={() => handleDelete(m.id_menu, m.nama_menu)}>Hapus</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── 5. TAB KATEGORI ── */}
        {tab === 'kategori' && (
          <>
            <div className="admin-header">
              <div>
                <h1>Manajemen Kategori</h1>
                <p>{kategori.length} kategori menu terdaftar</p>
              </div>
            </div>
            {loading ? <Spinner /> : (
              <div className="kat-grid-container">
                {kategori.map(k => {
                  const count = menu.filter(m => m.id_kategori === k.id_kategori).length;
                  return (
                    <div key={k.id_kategori} className="kat-saas-card">
                      <div className="kac-id">ID Kategori #{k.id_kategori}</div>
                      <div className="kac-name">{k.nama_kategori}</div>
                      <div className="kac-count">{count} Produk Aktif</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODAL MENU FORM ── */}
      {modal === 'menu' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h2>{editId ? 'Edit Item Menu' : 'Tambah Item Menu'}</h2>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="field">
                <label>Nama Menu</label>
                <input
                  type="text"
                  placeholder="Contoh: Espresso Romano"
                  value={form.nama_menu}
                  onChange={e => setForm(f => ({ ...f, nama_menu: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Gambar Menu</label>
                <div className="upload-area-box">
                  {(gambarPreview || form.gambar) && (
                    <img
                      src={gambarPreview || (form.gambar ? `${UPLOADS_URL}/${form.gambar}` : null)}
                      alt="Preview"
                      className="form-image-preview"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setGambarFile(file);
                        setGambarPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="form-file-input"
                  />
                </div>
              </div>
              <div className="field">
                <label>Harga (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 18000"
                  value={form.harga}
                  onChange={e => setForm(f => ({ ...f, harga: e.target.value }))}
                  min="0"
                  required
                />
              </div>
              <div className="field">
                <label>Kategori</label>
                <select
                  value={form.id_kategori}
                  onChange={e => setForm(f => ({ ...f, id_kategori: parseInt(e.target.value) }))}
                >
                  <option value="">— Tanpa Kategori —</option>
                  {kategori.map(k => (
                    <option key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-saas-cancel" onClick={() => setModal(null)}>Batal</button>
                <button type="submit" className="btn-saas-submit" disabled={saving}>
                  {saving ? 'Menyimpan...' : editId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div className="toast-notification" onClick={() => setToast(null)}>
          <div className="toast-icon-wrap">
            <img src={iconUrl('notifications_active')} className="icon-img icon-white" alt="" />
          </div>
          <div className="toast-body">
            <div className="toast-title">Pesanan Baru Masuk!</div>
            <div className="toast-desc">Kode: <strong>{toast.kode}</strong>{toast.nama ? ` — ${toast.nama}` : ''}</div>
            <div className="toast-sub">{formatRp(toast.total)} • Segera cek dapur</div>
          </div>
          <button className="toast-close">✕</button>
        </div>
      )}

      {/* ── MODAL PROSES BAYAR CASHIER ── */}
      {modalBayar && (
        <div className="modal-overlay" onClick={() => setModalBayar(null)}>
          <div className="modal-saas-card" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h2>Kasir Pembayaran</h2>
              <button className="close-btn" onClick={() => setModalBayar(null)}>✕</button>
            </div>
            <div className="modal-saas-body">
              <div className="field">
                <label>Pilih Metode Pembayaran</label>
                <select
                  value={metodeBayar}
                  onChange={(e) => setMetodeBayar(e.target.value)}
                  className="modal-select-input"
                >
                  <option value="cash">💵 Cash / Tunai</option>
                  <option value="qris">📱 QRIS Digital</option>
                  <option value="transfer">🏦 Bank Transfer</option>
                </select>
              </div>
            </div>
            <div className="modal-footer padding-box">
              <button onClick={() => setModalBayar(null)} className="btn-saas-cancel">Batal</button>
              <button onClick={submitBayar} className="btn-saas-submit">Konfirmasi Lunas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const iconUrl = (name) => `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${name}/default/24px.svg`;
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="sc-icon-wrap" style={{ background: `${color}12` }}>
        <img src={iconUrl(icon)} style={{ filter: `drop-shadow(0px 0px 1px ${color})` }} className="stat-icon-img" alt="" />
      </div>
      <div className="sc-val">{value}</div>
      <div className="sc-label">{label}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="loading-state">
      <div className="saas-spinner"></div>
      <p>Mengambil data riil database...</p>
    </div>
  );
}