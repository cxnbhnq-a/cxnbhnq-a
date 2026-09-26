# PRD — Terminal Profile Dashboard

## 1. Ringkasan

Bangun ulang tampilan utama GitHub Profile README menjadi dashboard bergaya terminal yang punya identitas visual sendiri. Produk mempertahankan fungsi dan jenis konten dari profil yang ada: potret yang dikonversi menjadi ASCII, identitas singkat, fokus profesional, proyek, dan tautan. Desain referensi yang diberikan menjadi panduan komposisi dan suasana; implementasi visual harus dirancang baru dan tidak menyalin aset atau kode desain lama.

Hasilnya harus dapat digunakan pemilik repo lain dengan mengganti konfigurasi profil serta gambar sumber, lalu menghasilkan aset yang cocok ditampilkan di GitHub README.

## 2. Latar Belakang

Repo saat ini menghasilkan empat hero SVG dari konfigurasi profil dan gambar transparan: desktop/mobile serta tema gelap/terang. Hero memuat potret ASCII di satu panel dan informasi profil di panel lain. PRD ini mengarahkan perancangan ulang hero utama dengan susunan yang mengacu pada mockup baru, sambil menjaga sumber data dan tujuan penggunaannya.

## 3. Tujuan

- Membuat tampilan terminal profil yang terasa personal dan berbeda dari desain hero sekarang.
- Mempertahankan potret ASCII beserta ringkasan profil yang mudah dikenali dan dibaca.
- Menambahkan suasana hidup melalui latar kode biner yang bergerak.
- Menjaga generator tetap dapat dipakai ulang oleh pengguna lain melalui konfigurasi dan gambar mereka sendiri.
- Menghasilkan aset yang tetap praktis ditampilkan di GitHub README dan mendukung ukuran desktop serta mobile.

## 4. Bukan Tujuan

- Mengubah isi profil, proyek, skill, atau tautan sebagai bagian dari redesain.
- Membuat aplikasi web penuh atau terminal interaktif yang menerima perintah.
- Memutar audio di dalam README GitHub atau SVG.
- Mengharuskan pengguna menyediakan layanan backend atau akun pihak ketiga.

## 5. Pengguna Sasaran

1. Pemilik repo yang ingin menampilkan profil developer secara khas di GitHub.
2. Pengguna template yang ingin menghasilkan dashboard serupa dengan data dan potret mereka sendiri tanpa mengedit SVG secara manual.
3. Pengunjung profil yang ingin cepat memahami siapa pemiliknya, apa fokusnya, serta melihat potret dan tautan utama.

## 6. Prinsip Desain

- **Terminal sebagai bingkai presentasi:** tampilkan nuansa console tanpa mengorbankan keterbacaan.
- **Potret dan identitas seimbang:** letakkan potret ASCII di panel kiri dan detail profil bergaya Neofetch di panel kanan pada desktop.
- **Informasi ringkas:** tampilkan identitas dan ringkasan yang sudah ada dengan hierarki yang jelas.
- **Gerak sebagai atmosfer:** animasi latar mendukung isi dan tidak mengganggu teks atau potret.
- **Mudah diadaptasi:** identitas, gambar, dan warna dapat diubah oleh pemakai repo.
- **Aksesibel dan tenang:** hormati preferensi reduced motion dan jaga kontras yang cukup.

## 7. Referensi Tata Letak

Mockup terlampir menetapkan arah komposisi berikut:

- Kanvas utama berupa jendela terminal lebar berlatar gelap dengan batas tipis.
- Kontrol jendela tiga titik berada di sisi kiri atas.
- Prompt identitas berada pada bilah terminal bagian atas.
- Panel potret ASCII berada di kiri; panel detail Neofetch berisi identitas, quick facts, riset, build, dan tautan berada di kanan.
- Pola karakter biner hijau mengalir ke atas dan ke kanan di latar belakang.
- Beam tipis dengan gradasi kiri-ke-kanan menyapu dari atas ke bawah lalu kembali ke atas.
- Indikator audio bergaya waveform/equalizer berada dekat sudut kiri bawah.
- Tampilan keseluruhan minimal, dominan gelap, dengan aksen biru dan hijau.

Mockup tidak menentukan detail konten profil, perilaku audio, breakpoint, atau implementasi teknis. Hal-hal tersebut didefinisikan di bawah.

## 8. Cakupan Konten

1. **Identitas:** nama, username, headline/peran, afiliasi, lokasi, dan status.
2. **Ringkasan:** informasi “about” dan fokus utama sebagaimana tersedia di konfigurasi.
3. **Potret:** gambar sumber transparan yang dikonversi menjadi potret ASCII.
4. **Fokus dan riset:** bidang utama dan arah kerja yang sekarang tersedia.
5. **Proyek unggulan:** nama, fokus, label, dan ringkasan proyek.
6. **Tautan:** tautan profil seperti GitHub dan kanal lain yang dikonfigurasi.

Konten yang muncul di dashboard harus diturunkan dari konfigurasi, bukan ditulis statis di template SVG. Karena ruang mockup terbatas, tata letak boleh mengelompokkan atau memprioritaskan item, tetapi tidak boleh mengarang fakta. README di bawah hero mempertahankan bagian profil lama seperti About Me, Skills bergambar, contribution game, stats, dan kontak, ditambah fokus, proyek, riset, serta stack yang sudah ada. Blok aktivitas GitHub otomatis tidak ditampilkan.

## 9. Kebutuhan Fungsional

### 9.1 Tampilan Terminal

- Menghasilkan hero profil berbentuk terminal, dengan gaya visual baru berdasarkan referensi.
- Menampilkan identitas terminal secara ringkas pada bagian kiri atas.
- Menyediakan panel potret ASCII di kiri dan panel detail Neofetch di kanan dengan batas visual yang halus.
- Menyusun label dan nilai detail dalam kolom yang rata agar mudah dipindai.
- Mempertahankan tautan dan informasi profil penting dalam bentuk yang terbaca.
- Menyediakan versi desktop dan mobile; komposisi mobile harus disusun ulang agar teks dan potret tetap terbaca, bukan sekadar diperkecil.
- Mempertahankan varian tema gelap dan terang serta ukuran desktop dan mobile.

### 9.2 Potret ASCII

- Menggunakan gambar sumber transparan milik pengguna.
- Mengubah gambar menjadi karakter ASCII dengan proses generator yang sudah ada atau penggantinya.
- Memastikan potret tetap terlihat pada latar baru dan skala desktop/mobile.
- Menampilkan fallback atau pesan validasi yang jelas saat sumber gambar tidak ada atau tidak valid.

### 9.3 Animasi Latar

- Menghidupkan karakter biner/kode di latar secara halus dan berulang.
- Menggerakkan aliran karakter ke atas dan ke kanan, bukan hanya menggeser latar bolak-balik.
- Menyapu beam horizontal dari bagian atas ke bawah dan kembali ke atas.
- Membatasi kecerahan, kepadatan, dan kecepatan supaya tidak mengurangi kontras atau mengganggu isi.
- Menjaga teks, potret, dan panel informasi tetap menjadi lapisan visual utama.
- Mengurangi atau meniadakan animasi jika pengguna memilih `prefers-reduced-motion`.
- Animasi tidak boleh bergantung pada skrip eksternal atau layanan online.

### 9.4 Generator yang Dapat Dipakai Ulang

- Memakai konfigurasi yang sudah ada untuk profil, fokus, proyek, tautan, palet, dan teks footer.
- Memungkinkan pengguna lain memasukkan potret sumber mereka sendiri melalui alur generator yang terdokumentasi.
- Menghasilkan aset siap pakai untuk README beserta manifest versi aset.
- Tidak mengikat desain pada username, nama, gambar, atau data spesifik pemilik repo saat ini.

## 10. Kebutuhan Nonfungsional

- SVG hasil generator harus valid, mandiri, dan tidak mengambil aset eksternal untuk tampilan inti.
- Teks harus memiliki kontras cukup pada tema yang didukung.
- Informasi inti harus tetap bermakna ketika animasi tidak berjalan.
- Ukuran aset dan jumlah elemen animasi dijaga agar pemuatan README tetap ringan.
- Konten SVG harus menyertakan judul dan deskripsi aksesibel yang sesuai dengan profil.
- Semua konten dinamis harus di-escape agar karakter khusus dalam profil tidak merusak SVG.
- Pengguna template harus dapat mengikuti README proyek untuk konfigurasi, pembuatan aset, serta penggantian gambar.

## 11. Batasan Platform

Tujuan utama adalah GitHub Profile README yang menampilkan SVG. README GitHub bukan lingkungan aplikasi umum: dukungan untuk JavaScript, kontrol HTML, animasi, media, dan perilaku SVG dapat dibatasi atau disanitasi. Karena itu:

- Animasi SVG perlu diuji pada tampilan README GitHub yang sebenarnya; informasi utama harus tetap lengkap jika animasi tidak dimainkan.
- Animasi dan informasi utama harus tetap bermakna ketika README dilihat pada perangkat atau klien yang membatasi animasi SVG.

## 12. Kriteria Penerimaan

1. Hero baru mempertahankan elemen inti: identitas ringkas, potret hasil konversi ASCII, ringkasan profil, fokus/proyek, dan tautan sesuai ruang.
2. Tampilan menggunakan komposisi mockup: terminal gelap, portrait di kiri, detail Neofetch berkolom rata di kanan, latar kode yang mengalir ke atas-kanan, scan beam vertikal, serta indikator waveform.
3. Hasil visual berbeda dari hero generator lama dalam tata letak dan sistem visual; sekadar mengganti warna atau teks tidak memenuhi tujuan.
4. Generator tetap mengambil konten dari konfigurasi dan dapat digunakan untuk profil lain dengan gambar sumber lain.
5. Aset desktop dan mobile tidak memotong elemen penting, dan teks utama terbaca pada ukuran tampil yang wajar.
6. Animasi latar tidak menutupi konten, serta ada perlakuan untuk reduced motion atau keadaan statis.
7. README menampilkan indikator waveform dekoratif tanpa ketergantungan pada audio atau layanan demo.
8. Varian tema yang dipertahankan memiliki kontras teks dan potret yang memadai.
9. Dokumentasi menjelaskan cara mengganti konfigurasi dan potret serta cara menghasilkan hero.

## 13. Di Luar Cakupan Rilis Awal

- Terminal yang menerima perintah atau menjalankan kode.
- Dashboard data live yang memerlukan API eksternal.
- Pembaruan aktivitas GitHub otomatis.
- Pengeditan profil melalui UI.

## 14. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Animasi atau SVG tidak konsisten di README GitHub | Jaga komposisi statis tetap lengkap dan pastikan informasi penting tetap dapat dibaca. |
| Latar bergerak mengganggu pembacaan | Jaga kontras rendah, kecepatan lambat, dan dukung reduced motion. |
| Potret ASCII terlalu rapat atau sulit dibaca pada mobile | Buat layout/resolusi mobile khusus dan tinjau hasil pada ukuran target. |
| Desain terlalu spesifik pada satu profil | Ambil semua label dan nilai profil dari konfigurasi; validasi data panjang. |

## 15. Keputusan Rilis Pertama

- Empat SVG dirender untuk desktop/mobile dan tema gelap/terang.
- Ringkasan profil, fokus, proyek, tautan, serta panel potret diambil dari konfigurasi.
- Latar biner bergerak diagonal dengan intensitas rendah; mode reduced-motion mengurangi gerak.
- Waveform menjadi elemen visual dekoratif; rilis template tidak menyertakan demo web atau audio.

## 16. Tahapan Produk yang Disarankan

1. Fork repo menjadi `USERNAME/USERNAME` dan perbarui `profile.config.json`.
2. Bangun ulang hero dengan PNG transparan milik pengguna dan tinjau empat SVG.
3. Tinjau README, lalu commit dan push perubahan ke repo profil.
