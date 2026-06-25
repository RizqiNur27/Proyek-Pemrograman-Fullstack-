import { useState, useEffect, useRef } from 'react';
import { getMenu, getKategori, createOrder, bayar, getStrukUrl, UPLOADS_URL } from '../api';
import QRCode from 'qrcode';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../css/MenuPage.css'

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
  const [searchQuery, setSearchQuery] = useState('');

  // URL Ikon Google Material 
  const iconUrl = (name) => `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${name}/default/24px.svg`;

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
    <div className="menu-page">
      {/* ── Tombol Kembali ── */}
      <button onClick={() => onNavigate('landing')} className="btn-back-home">
        <img src={iconUrl('arrow_back')} className="icon-img inline-icon" alt="" /> Kembali ke Beranda
      </button>

      {/* ── Search Bar ── */}
      <div className="search-wrapper">
        <div className="search-input-box">
          <img src={iconUrl('search')} className="search-box-icon" alt="" />
          <input 
            type="text" 
            placeholder="Lagi pengen ngopi apa hari ini bray? Cari di sini..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Kategori filter ── */}
      <div className="kat-bar">
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
          <div className="saas-spinner" />
          <p>Memuat item menu...</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filtered.map(m => {
            const inCart = items.find(i => i.id_menu === m.id_menu);
            return (
              <div key={m.id_menu} className="menu-card">
                <div className="menu-img">
                  {m.gambar ? (
                    <img src={`${UPLOADS_URL}/${m.gambar}`} alt={m.nama_menu} className="menu-img-actual" />
                  ) : (
                    <div className="menu-img-fallback-icon">
                      <img src={iconUrl(getCategoryIconName(m.id_kategori, kategori))} className="fallback-svg" alt="" />
                    </div>
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
            <div className="empty-state-view">
              <img src={iconUrl('info')} className="info-icon" alt="" />
              <p>Menu belum tersedia atau tidak ditemukan bray.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Floating Cart Button ── */}
      {itemCount > 0 && (
        <button className="cart-fab" onClick={() => { setCartOpen(true); setStep('cart'); }}>
          <img src={iconUrl('local_mall')} className="icon-white fab-icon-img" alt="" />
          <span>{itemCount} Item • {formatRp(total)}</span>
        </button>
      )}

      {/* ── Cart / Checkout Drawer ── */}
      {cartOpen && (
        <div className="drawer-overlay" onClick={() => !processing && resetCart()}>
          <div className="drawer" onClick={e => e.stopPropagation()}>

            {step === 'cart' && (
              <>
                <div className="drawer-hdr">
                  <div className="title-with-icon">
                    <img src={iconUrl('local_mall')} className="hdr-svg-icon" alt="" />
                    <h2>Keranjang Belanja</h2>
                  </div>
                  <button className="close-btn" onClick={resetCart}>✕</button>
                </div>
                <div className="cart-items">
                  {items.map(i => (
                    <div key={i.id_menu} className="cart-row">
                      <div className="cart-info">
                        <span className="cart-name">{i.nama_menu}</span>
                        <span className="cart-price">{formatRp(i.harga)}</span>
                      </div>
                      <div className="qty-ctrl size-sm">
                        <button onClick={() => updateQty(i.id_menu, i.jumlah - 1)}>−</button>
                        <span>{i.jumlah}</span>
                        <button onClick={() => updateQty(i.id_menu, i.jumlah + 1)}>+</button>
                      </div>
                      <span className="cart-sub">{formatRp(i.harga * i.jumlah)}</span>
                    </div>
                  ))}
                </div>
                <div className="drawer-footer">
                  <div className="total-row"><span>Total Pembayaran</span><strong>{formatRp(total)}</strong></div>
                  <button className="checkout-btn" onClick={() => setStep('tipe')}>Lanjut Pesan →</button>
                </div>
              </>
            )}

            {step === 'tipe' && (
              <>
                <div className="drawer-hdr">
                  <button className="back-btn" onClick={() => setStep('cart')}>
                    <img src={iconUrl('arrow_back')} className="inline-icon back-svg" alt="" /> Kembali
                  </button>
                  <h2>Tipe Layanan</h2>
                </div>
                <div className="tipe-options">
                  {[
                    { val: 'dine_in',   icon: 'restaurant', label: 'Makan di Sini', desc: 'Nikmati santapan hangat langsung di tempat' },
                    { val: 'take_away', icon: 'local_shipping', label: 'Bawa Pulang',   desc: 'Dikemas aman & praktis untuk dibawa' },
                  ].map(t => (
                    <div
                      key={t.val}
                      className={`tipe-card ${tipeLayanan === t.val ? 'selected' : ''}`}
                      onClick={() => setTipeLayanan(t.val)}
                    >
                      <div className="tipe-icon-wrap">
                        <img src={iconUrl(t.icon)} className="tipe-svg-icon" alt="" />
                      </div>
                      <div className="tipe-info-body"><strong>{t.label}</strong><p>{t.desc}</p></div>
                      {tipeLayanan === t.val && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>
                <div className="field form-input-drawer-spacing">
                  <label>Atas Nama (Untuk Panggilan Antrean)</label>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap kamu..."
                    value={namaPemesan}
                    onChange={e => setNamaPemesan(e.target.value)}
                    required
                  />
                </div>
                {err && <div className="err-box">{err}</div>}
                <div className="drawer-footer">
                  <div className="total-row"><span>Total Tagihan</span><strong>{formatRp(total)}</strong></div>
                  <button className="checkout-btn" onClick={handleOrder} disabled={processing}>
                    {processing ? 'Memproses...' : 'Buat Pesanan Sekarang →'}
                  </button>
                </div>
              </>
            )}

            {step === 'bayar' && orderResult && (
              <>
                <div className="drawer-hdr">
                  <button className="back-btn" onClick={() => setStep('tipe')}>
                    <img src={iconUrl('arrow_back')} className="inline-icon back-svg" alt="" /> Kembali
                  </button>
                  <h2>Metode Pembayaran</h2>
                </div>
                <div className="order-info-box">
                  <div className="order-kode">ORDER TOKEN: {orderResult.kode_order}</div>
                  <div className="order-total-lbl">Total Nilai Tagihan</div>
                  <div className="order-total-val">{formatRp(orderResult.total_tagihan)}</div>
                </div>
                <div className="metode-list">
                  <p className="metode-label">Pilih Opsi Pembayaran Resmi</p>
                  {[
                    { val: 'cash', icon: 'payments', label: 'Tunai / Cash di Kasir' },
                    { val: 'qris', icon: 'qr_code_2', label: 'QRIS Digital Otomatis' },
                  ].map(m => (
                    <div
                      key={m.val}
                      className={`metode-card ${metodeBayar === m.val ? 'selected' : ''}`}
                      onClick={() => { setMetodeBayar(m.val); if (m.val !== 'qris') setQrisDataUrl(null); }}
                    >
                      <img src={iconUrl(m.icon)} className="metode-svg-icon" alt="" />
                      <span className="metode-text-lbl">{m.label}</span>
                      {metodeBayar === m.val && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>

                {metodeBayar === 'qris' && (
                  <div className="qris-box-wrapper">
                    <p className="qris-help-text">
                      Scan barcode di bawah untuk mengirim nota struk pesanan digital secara berkala langsung ke WhatsApp pusat Kasir.
                    </p>
                    <div className="qris-image-container">
                      <img src={qrisDataUrl} alt="QRIS Gateway" />
                    </div>
                  </div>
                )}

                {err && <div className="err-box">{err}</div>}
                <div className="drawer-footer">
                  <button className="checkout-btn" onClick={handleBayar} disabled={processing}>
                    {processing ? 'Memproses Finansial...' : 'Selesaikan Pembayaran →'}
                  </button>
                </div>
              </>
            )}

            {step === 'sukses' && transaksiResult && (
              <div className="sukses-view">
                <div className="sukses-icon-animation-wrap">
                  <img src={iconUrl(metodeBayar === 'cash' ? 'check_circle' : 'pending')} className="success-status-svg" alt="" />
                </div>
                <h2>{metodeBayar === 'cash' ? 'Pembayaran Sukses!' : 'Pesanan Berhasil Antre!'}</h2>
                <div className="sukses-detail">
                  <div className="sd-row"><span>No. Transaksi Digital</span>#<strong>{transaksiResult.id_transaksi}</strong></div>
                  <div className="sd-row"><span>Metode Valid</span><strong className="uppercase">{transaksiResult.metode_pembayaran}</strong></div>
                  <div className="sd-row"><span>Total Nominal</span><strong className="text-blue">{formatRp(transaksiResult.total_harga)}</strong></div>
                </div>

                {metodeBayar === 'qris' && qrisDataUrl && (
                  <div className="qris-success-container">
                    <p className="qris-help-text">Scan untuk sinkronisasi struk fisik kasir</p>
                    <div className="qris-image-container size-sm">
                      <img src={qrisDataUrl} alt="QR" />
                    </div>
                    <div className="download-receipt-box">
                      <a
                        href={orderResult ? getStrukUrl(orderResult.id_order) : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-download-pdf-invoice"
                      >
                        <img src={iconUrl('description')} className="icon-white invoice-svg" alt="" /> Cetak Nota PDF
                      </a>
                    </div>
                  </div>
                )}

                <p className="sukses-msg">
                  {metodeBayar === 'cash' ? 'Terima kasih banyak bray! Pesanan kamu telah dikirim ke dapur monitor.' :
                   'Scan QR di atas untuk notifikasi instan langsung menuju WhatsApp kasir.'}
                </p>
                <button className="checkout-btn" onClick={resetCart}>Pesan Menu Lainnya</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Resolver nama ikon Google Material Icons
function getCategoryIconName(id_kategori, kategoriList) {
  const kat = kategoriList.find(k => k.id_kategori === id_kategori);
  const nm  = kat?.nama_kategori?.toLowerCase() || '';
  if (nm.includes('kopi') || nm.includes('coffee')) return 'coffee';
  if (nm.includes('minum') || nm.includes('drink'))  return 'local_bar';
  if (nm.includes('makan') || nm.includes('food'))   return 'ramen_dining';
  if (nm.includes('snack') || nm.includes('cemil'))  return 'bakery_dining';
  if (nm.includes('dessert') || nm.includes('manis'))return 'cake';
  if (nm.includes('paket'))                               return 'featured_seasonal';
  return 'restaurant';
}