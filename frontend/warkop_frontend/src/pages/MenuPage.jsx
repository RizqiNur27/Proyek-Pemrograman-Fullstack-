import { useState, useEffect, useRef } from 'react';
import { getMenu, getKategori, createOrder, bayar, getStrukUrl, UPLOADS_URL } from '../api';
import QRCode from 'qrcode';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export default function MenuPage({ onShowAuth, onNavigate }) {
  const { user } = useAuth();
  const { items, addItem, removeItem, updateQty, clearCart, total, itemCount } = useCart();

  const [menu, setMenu]         = useState([]);
  const [kategori, setKategori] = useState([]);
  const [activeKat, setActiveKat] = useState('semua');
  const [loading, setLoading]   = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep]         = useState('cart');   // 'cart' | 'tipe' | 'bayar' | 'sukses'
  const [tipeLayanan, setTipeLayanan] = useState('dine_in');
  const [metodeBayar, setMetodeBayar] = useState('cash');
  const [namaPemesan, setNamaPemesan] = useState('');
  const [orderResult, setOrderResult] = useState(null);
  const [transaksiResult, setTransaksiResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [err, setErr]            = useState('');
  const [qrisDataUrl, setQrisDataUrl] = useState(null);
  const qrisCanvasRef = useRef(null);

  // ── FITUR BARU: State untuk pencarian menu ──
  const [searchQuery, setSearchQuery] = useState('');

  // Generate QR code when user selects QRIS (in the bayar step)
  useEffect(() => {
    if (metodeBayar === 'qris' && orderResult && !qrisDataUrl && items.length > 0) {
      generateQrisReceipt();
    }
  }, [metodeBayar, orderResult]);

  useEffect(() => {
    Promise.all([getMenu(), getKategori()])
      .then(([m, k]) => {
        setMenu(m.data || []);
        setKategori(k.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── FILTER GABUNGAN: Kategori + Search Bar ──
  const filtered = menu.filter(m => {
    const matchesCategory = activeKat === 'semua' || m.id_kategori === activeKat;
    const matchesSearch = m.nama_menu.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  async function handleOrder() {
    if (items.length === 0) return;
    if (!namaPemesan.trim()) {
      setErr('Mohon masukkan nama kamu agar pesanan tidak tertukar ya!');
      return;
    }
    setProcessing(true);
    setErr('');
    try {
      const res = await createOrder({
        nama_pemesan: namaPemesan,
        tipe_layanan: tipeLayanan,
        items: items.map(i => ({ id_menu: i.id_menu, jumlah: i.jumlah })),
      });
      setOrderResult(res.data);
      setStep('bayar');
    } catch (e) {
      setErr(e.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleBayar() {
    setProcessing(true);
    setErr('');
    try {
      const res = await bayar({ id_order: orderResult.id_order, metode_pembayaran: metodeBayar });
      const data = res.data;
      setTransaksiResult(data);
      if (metodeBayar === 'qris') {
        await generateQrisReceipt();
      }
      setStep('sukses');
      clearCart();
    } catch (e) {
      setErr(e.message);
    } finally {
      setProcessing(false);
    }
  }

  const WA_NUMBER = '6285716836399';

  function generateQrisReceipt() {
    const line = '==============================';
    let text = '*WARKOP SI BONTOT*\n';
    text += 'Struk Pesanan\n';
    text += line + '\n';
    text += `Kode: ${orderResult.kode_order}\n`;
    text += `Pelanggan: ${namaPemesan}\n`;
    text += `Layanan: ${tipeLayanan === 'dine_in' ? 'Makan di Sini' : 'Bawa Pulang'}\n`;
    text += line + '\n\n';
    text += '*Menu:*\n';
    items.forEach(i => {
      const sub = i.harga * i.jumlah;
      text += `- ${i.nama_menu} x${i.jumlah} = Rp ${Number(sub).toLocaleString('id-ID')}\n`;
    });
    text += '\n' + line + '\n';
    text += `*TOTAL: Rp ${Number(total).toLocaleString('id-ID')}*\n`;
    text += line + '\n\n';
    text += 'Terima kasih ☕';

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

    QRCode.toDataURL(waUrl, { width: 250, margin: 2 })
      .then(url => setQrisDataUrl(url))
      .catch(e => console.error('QR error:', e));
  }

  function resetCart() {
    setCartOpen(false);
    setStep('cart');
    setOrderResult(null);
    setTransaksiResult(null);
    setErr('');
  }

  return (
    <div className="menu-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── Tombol Kembali ── */}
      <button
        onClick={() => onNavigate('landing')}
        style={{
          background: 'none', border: 'none', color: '#ffb347', cursor: 'pointer',
          fontSize: '15px', padding: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '6px'
        }}
      >
        ← Kembali ke Beranda
      </button>

      {/* ── Search Bar ── */}
      <div className="search-wrapper" style={{ marginBottom: '25px' }}>
        <input 
          type="text" 
          placeholder="🔎 Lagi pengen ngopi apa hari ini bray? Cari di sini..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: '#1e1e1e',
            border: '1px solid #333',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* ── Kategori filter ── */}
      <div className="kat-bar" style={{ marginBottom: '25px' }}>
        <button
          className={activeKat === 'semua' ? 'kat-btn active' : 'kat-btn'}
          onClick={() => setActiveKat('semua')}
        >Semua</button>
        {kategori.map(k => (
          <button
            key={k.id_kategori}
            className={activeKat === k.id_kategori ? 'kat-btn active' : 'kat-btn'}
            onClick={() => setActiveKat(k.id_kategori)}
          >{k.nama_kategori}</button>
        ))}
      </div>

      {/* ── Menu grid ── */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Memuat menu...</p>
        </div>
      ) : (
        <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {filtered.map(m => {
            const inCart = items.find(i => i.id_menu === m.id_menu);
            return (
              <div key={m.id_menu} className="menu-card">
                <div className="menu-img">
                  {m.gambar ? (
                    <img src={`${UPLOADS_URL}/${m.gambar}`} alt={m.nama_menu} className="menu-img-actual" />
                  ) : (
                    <span className="menu-img-emoji">{getCategoryEmoji(m.id_kategori, kategori)}</span>
                  )}
                </div>
                <div className="menu-body">
                  <h3>{m.nama_menu}</h3>
                  <span className="menu-price">{formatRp(m.harga)}</span>
                  {inCart ? (
                    <div className="qty-ctrl">
                      <button onClick={() => updateQty(m.id_menu, inCart.jumlah - 1)}>−</button>
                      <span>{inCart.jumlah}</span>
                      <button onClick={() => updateQty(m.id_menu, inCart.jumlah + 1)}>+</button>
                    </div>
                  ) : (
                    <button className="add-btn" onClick={() => addItem(m)}>+ Tambah</button>
                  )}
                </div>
              </div>
            );
          })}
          
          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
              Menu belum tersedia atau tidak ditemukan bray.
            </div>
          )}
        </div>
      )}

      {/* ── Floating Cart Button ── */}
      {itemCount > 0 && (
        <button className="cart-fab" onClick={() => { setCartOpen(true); setStep('cart'); }}>
          🛒 {itemCount} item · {formatRp(total)}
        </button>
      )}

      {/* ── Cart / Checkout Drawer ── */}
      {cartOpen && (
        <div className="drawer-overlay" onClick={() => !processing && resetCart()}>
          <div className="drawer" onClick={e => e.stopPropagation()}>

            {step === 'cart' && (
              <>
                <div className="drawer-hdr">
                  <h2>🛒 Keranjang</h2>
                  <button className="close-btn" onClick={resetCart}>✕</button>
                </div>
                <div className="cart-items">
                  {items.map(i => (
                    <div key={i.id_menu} className="cart-row">
                      <div className="cart-info">
                        <span className="cart-name">{i.nama_menu}</span>
                        <span className="cart-price">{formatRp(i.harga)}</span>
                      </div>
                      <div className="qty-ctrl">
                        <button onClick={() => updateQty(i.id_menu, i.jumlah - 1)}>−</button>
                        <span>{i.jumlah}</span>
                        <button onClick={() => updateQty(i.id_menu, i.jumlah + 1)}>+</button>
                      </div>
                      <span className="cart-sub">{formatRp(i.harga * i.jumlah)}</span>
                    </div>
                  ))}
                </div>
                <div className="drawer-footer">
                  <div className="total-row"><span>Total</span><strong>{formatRp(total)}</strong></div>
                  <button className="checkout-btn" onClick={() => setStep('tipe')}>Lanjut Pesan →</button>
                </div>
              </>
            )}

            {step === 'tipe' && (
              <>
                <div className="drawer-hdr">
                  <button className="back-btn" onClick={() => setStep('cart')}>← Kembali</button>
                  <h2>Tipe Layanan</h2>
                </div>
                <div className="tipe-options">
                  {[
                    { val: 'dine_in',   icon: '🍽️', label: 'Makan di Sini', desc: 'Nikmati di tempat' },
                    { val: 'take_away', icon: '📦', label: 'Bawa Pulang',   desc: 'Dikemas untuk dibawa' },
                  ].map(t => (
                    <div
                      key={t.val}
                      className={`tipe-card ${tipeLayanan === t.val ? 'selected' : ''}`}
                      onClick={() => setTipeLayanan(t.val)}
                    >
                      <span className="tipe-icon">{t.icon}</span>
                      <div><strong>{t.label}</strong><p>{t.desc}</p></div>
                      {tipeLayanan === t.val && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>
                <div className="field" style={{ padding: '0 20px', marginBottom: '16px', marginTop: '16px' }}>
                  <label>Atas Nama (Untuk Panggilan)</label>
                  <input
                    type="text"
                    placeholder="Masukkan nama kamu..."
                    value={namaPemesan}
                    onChange={e => setNamaPemesan(e.target.value)}
                    required
                  />
                </div>
                {err && <div className="err-box">{err}</div>}
                <div className="drawer-footer">
                  <div className="total-row"><span>Total</span><strong>{formatRp(total)}</strong></div>
                  <button className="checkout-btn" onClick={handleOrder} disabled={processing}>
                    {processing ? 'Memproses...' : 'Buat Pesanan →'}
                  </button>
                </div>
              </>
            )}

            {step === 'bayar' && orderResult && (
              <>
                <div className="drawer-hdr">
                  <button className="back-btn" onClick={() => setStep('tipe')}>← Kembali</button>
                  <h2>💳 Pembayaran</h2>
                </div>
                <div className="order-info-box">
                  <div className="order-kode">{orderResult.kode_order}</div>
                  <div className="order-total-lbl">Total Tagihan</div>
                  <div className="order-total-val">{formatRp(orderResult.total_tagihan)}</div>
                </div>
                <div className="metode-list">
                  <p className="metode-label">Pilih Metode Pembayaran</p>
                  {[
                    { val: 'cash', icon: '💵', label: 'Tunai' },
                    { val: 'qris', icon: '📱', label: 'QRIS' },
                  ].map(m => (
                    <div
                      key={m.val}
                      className={`metode-card ${metodeBayar === m.val ? 'selected' : ''}`}
                      onClick={() => { setMetodeBayar(m.val); if (m.val !== 'qris') setQrisDataUrl(null); }}
                    >
                      <span>{m.icon}</span><span>{m.label}</span>
                      {metodeBayar === m.val && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>

                {metodeBayar === 'qris' && (
                  <div style={{
                    padding: '0 20px', marginBottom: '16px', textAlign: 'center'
                  }}>
                    <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '12px' }}>
                      Scan barcode untuk kirim struk pesanan ke WhatsApp kasir.
                    </p>
                    <div style={{
                      background: '#fff', borderRadius: '12px', padding: '16px',
                      display: 'inline-block'
                    }}>
                      <img
                        src={qrisDataUrl}
                        alt="QR"
                        style={{ width: 200, height: 200 }}
                      />
                    </div>
                  </div>
                )}

                {err && <div className="err-box">{err}</div>}
                <div className="drawer-footer">
                  <button className="checkout-btn" onClick={handleBayar} disabled={processing}>
                    {processing ? 'Memproses...' : 'Bayar Sekarang →'}
                  </button>
                </div>
              </>
            )}

            {step === 'sukses' && transaksiResult && (
              <div className="sukses-view">
                <div className="sukses-icon">{metodeBayar === 'cash' ? '✅' : '⏳'}</div>
                <h2>{metodeBayar === 'cash' ? 'Pembayaran Berhasil!' : 'Pesanan Dibuat!'}</h2>
                <div className="sukses-detail">
                  <div className="sd-row"><span>No. Transaksi</span>#<strong>{transaksiResult.id_transaksi}</strong></div>
                  <div className="sd-row"><span>Metode</span><strong style={{ textTransform:'capitalize' }}>{transaksiResult.metode_pembayaran}</strong></div>
                  <div className="sd-row"><span>Total</span><strong>{formatRp(transaksiResult.total_harga)}</strong></div>
                </div>

                {metodeBayar === 'qris' && qrisDataUrl && (
                  <div style={{ textAlign: 'center', margin: '16px 0' }}>
                    <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '10px' }}>
                      Scan barcode untuk kirim pesanan ke WhatsApp kasir
                    </p>
                    <div style={{
                      background: '#fff', borderRadius: '12px', padding: '12px',
                      display: 'inline-block'
                    }}>
                      <img
                        src={qrisDataUrl}
                        alt="QR"
                        style={{ width: 180, height: 180 }}
                      />
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <a
                        href={orderResult ? getStrukUrl(orderResult.id_order) : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', background: '#FF9057', color: '#fff',
                          borderRadius: '8px', textDecoration: 'none', fontSize: '13px',
                          fontWeight: 'bold'
                        }}
                      >
                        📄 Download Struk PDF
                      </a>
                    </div>
                  </div>
                )}

                <p className="sukses-msg">
                  {metodeBayar === 'cash' ? 'Terima kasih! Pesananmu sedang disiapkan ☕' :
                   'Scan QR di atas untuk kirim pesanan ke WhatsApp kasir.'}
                </p>
                <button className="checkout-btn" onClick={resetCart}>Pesan Lagi</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: emoji berdasarkan kategori
function getCategoryEmoji(id_kategori, kategoriList) {
  const kat = kategoriList.find(k => k.id_kategori === id_kategori);
  const nm  = kat?.nama_kategori?.toLowerCase() || '';
  if (nm.includes('kopi') || nm.includes('coffee')) return '☕';
  if (nm.includes('minum') || nm.includes('drink'))  return '🥤';
  if (nm.includes('makan') || nm.includes('food'))   return '🍜';
  if (nm.includes('snack') || nm.includes('cemil'))  return '🍟';
  if (nm.includes('dessert') || nm.includes('manis'))return '🍰';
  if (nm.includes('paket'))                           return '🎁';
  return '🍽️';
}