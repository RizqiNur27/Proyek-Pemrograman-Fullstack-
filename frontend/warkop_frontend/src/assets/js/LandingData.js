import profile2 from "../img/warkop-profile2.jpg";
import profile3 from "../img/warkop-profile3.jpg";
import profile4 from "../img/warkop-profile4.jpg";

export const menuData = [
  {
    category: "Kopi Panas",
    filter: "kopi",
    items: [
      { name: "Kopi Hitam", price: "Rp 5.000", fav: false },
      { name: "Kopi Susu", price: "Rp 8.000", fav: true },
      { name: "Kopi Jahe", price: "Rp 7.000", fav: false },
      { name: "Kopi Aren", price: "Rp 10.000", fav: true },
    ],
  },
  {
    category: "Es Kopi",
    filter: "kopi",
    items: [
      { name: "Es Kopi Susu", price: "Rp 12.000", fav: true },
      { name: "Es Kopi Aren", price: "Rp 14.000", fav: true },
      { name: "Es Americano", price: "Rp 10.000", fav: false },
      { name: "Es Kopi Gula Batu", price: "Rp 11.000", fav: false },
    ],
  },
  {
    category: "Non-Kopi",
    filter: "nonkopi",
    items: [
      { name: "Teh Tarik", price: "Rp 8.000", fav: false },
      { name: "Es Teh Manis", price: "Rp 5.000", fav: false },
      { name: "Susu Cokelat", price: "Rp 10.000", fav: true },
      { name: "Wedang Jahe", price: "Rp 7.000", fav: false },
    ],
  },
  {
    category: "Makanan",
    filter: "makanan",
    isFood: true,
    items: [
      { name: "Indomie Rebus", price: "Rp 8.000", fav: false },
      { name: "Indomie Goreng Spesial", price: "Rp 10.000", fav: true },
      { name: "Nasi Goreng Kampung", price: "Rp 15.000", fav: true },
      { name: "Roti Bakar Cokelat", price: "Rp 10.000", fav: false },
    ],
  },
  {
    category: "Cemilan",
    filter: "makanan",
    isFood: true,
    items: [
      { name: "Pisang Goreng", price: "Rp 7.000", fav: false },
      { name: "Tahu Crispy", price: "Rp 8.000", fav: true },
      { name: "Singkong Goreng", price: "Rp 6.000", fav: false },
      { name: "Tempe Mendoan", price: "Rp 7.000", fav: false },
    ],
  },
];

export const testiData = [
  {
    name: "Basuki.",
    meta: "Pelanggan Tetap · Mahasiswa",
    stars: 5,
    text: "Kopi susu arennya enak banget dan harganya masuk akal. Tempatnya juga nyaman banget buat nugas berlama-lama. Udah jadi langganan sejak semester satu.",
  },
  {
    name: "Aguss.",
    meta: "Pelanggan · Freelancer",
    stars: 5,
    text: "Suka banget sama suasananya deh kayak tenang tapi nggak sepi. WiFi nya stabil, colokan ada di mana-mana. Kalau lagi kerja remote asik nih gak perlu berebut colokan.",
  },
  {
    name: "Yudhis.",
    meta: "Pelanggan · Karyawan Swasta",
    stars: 4,
    text: "Nasi gorengnya kacau enak banget porsinya banyak gak pelit HAHAHA dan rasanya selalu konsisten. Nongkrong sama teman-teman kantor sini jadi pilihan rutin setiap minggu.",
  },
  {
    name: "Ahmad.",
    meta: "Pelanggan · Pelajar SMA",
    stars: 5,
    text: "Harganya ramah di kantong pelajar, tapi kualitasnya nggak murahan. Es kopi susunya favorit banget, selalu repeat order tiap hari.",
  },
  {
    name: "Billy.",
    meta: "Pelanggan · Wiraswasta",
    stars: 4,
    text: "Tempatnya enak buat meeting informal. Karyawannya ramah dan gerak cepat. Minumannya beragam pilihan, semua yang pernah saya coba enak.",
  },
  {
    name: "Dewi.",
    meta: "Pelanggan · Ibu Rumah Tangga",
    stars: 5,
    text: "Teh tariknya mengingatkan saya dengan warung di kampung halaman. Roti bakarnya juga nagih. Cocok nih buat ngobrol santai sambil menikmati sore.",
  },
];

export const heroSlides = [
  {
    img: profile2,
  },
  {
    img: profile3,
  },
  {
    img: profile4,
  },
];