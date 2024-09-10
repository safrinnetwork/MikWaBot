# MikWaBot - MikroTik WhatsApp Bot

MikWaBot - MikroTik WhatsApp Bot adalah bot WhatsApp yang terhubung dengan perangkat MikroTik menggunakan REST API. Bot ini memungkinkan pengguna untuk mengontrol dan memantau berbagai fungsi MikroTik melalui pesan WhatsApp. Bot ini dibangun menggunakan `whatsapp-web.js`, `axios`, dan terhubung ke API REST MikroTik untuk mengambil dan mengirim data ke router MikroTik.

## Fitur

1. **/connect**: Menghubungkan bot ke MikroTik menggunakan URL, username, dan password.
2. **/resource**: Menampilkan informasi resource sistem dari MikroTik seperti board name, uptime, CPU load, free memory, dan HDD space.
3. **/status**: Memeriksa apakah bot telah terhubung ke MikroTik atau belum.
4. **/interface_list**: Menampilkan daftar interface yang ada pada MikroTik, termasuk status running setiap interface.
5. **/interface_disable <nama interface>**: Mendisable interface tertentu berdasarkan nama.
6. **/interface_enable <nama interface>**: Menenable interface tertentu berdasarkan nama.
7. **/total_hotspot**: Menampilkan total user hotspot, user aktif, dan host pada jaringan hotspot MikroTik.
8. **/hotspot_find <nama>**: Mencari user hotspot berdasarkan kata kunci yang relevan, serta menampilkan detail user dan informasi user yang sedang aktif (jika ada lebih dari satu user aktif, semua akan ditampilkan).
9. **/total_pppoe**: Menampilkan total PPPoE aktif.
10. **/netwatch_down**: Menampilkan daftar netwatch yang statusnya "down".

## Persyaratan

- **Node.js**: v18.
- **whatsapp-web.js**: Library untuk mengontrol WhatsApp Web.
- **Axios**: Library untuk melakukan HTTP request ke API MikroTik.
- **qrcode-terminal**: Library untuk menampilkan QR code di terminal.
- **MikroTik Router**: Router MikroTik dengan REST API diaktifkan (RouterOS v7.1 atau lebih baru).

## Install Dependensi
```
curl -s https://deb.nodesource.com/setup_18.x | sudo bash
```
```
sudo apt install nodejs -y
```
```
npm install whatsapp-web.js axios express qrcode-terminal
```
```
sudo apt-get install libnss3 libatk-bridge2.0-0 libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libpango-1.0-0 libdbus-1-3 libxrandr2 libgbm1 libasound2 libatk1.0-0 libcups2 libxss1 libgtk-3-0
```

## Instalasi Bot

1. **Clone repository ini:**

   ```
   git clone https://github.com/safrinnetwork/MikWaBot.git
   ```

2. **Masuk ke direktori project:**

   ```
   cd MikWaBot
   ```
3. **Jalankan Bot:**

   ```
   node bot.js
   ```

   Setelah menjalankan perintah di atas, bot akan menampilkan QR code di terminal. Pindai QR code menggunakan aplikasi WhatsApp Anda (melalui WhatsApp Web) untuk menghubungkan bot dengan akun WhatsApp Anda.

## Cara Menggunakan

### Menghubungkan Bot ke MikroTik

Gunakan perintah `/connect <url> <username> <password>` untuk menghubungkan bot ke MikroTik. Misalnya:

```
/connect http://192.168.88.1/rest admin password123
```

Setelah terhubung, bot siap menerima perintah lain untuk mengontrol dan memantau router MikroTik Anda.

### Daftar Perintah

- **/help**: Menampilkan menu dan daftar perintah.
- **/connect**: Menghubungkan bot ke MikroTik.
- **/resource**: Menampilkan informasi resource sistem dari MikroTik.
- **/status**: Memeriksa status koneksi bot ke MikroTik.
- **/interface_list**: Menampilkan daftar interface dan statusnya.
- **/interface_disable <nama interface>**: Mendisable interface yang dipilih.
- **/interface_enable <nama interface>**: Menenable interface yang dipilih.
- **/total_hotspot**: Menampilkan jumlah user hotspot dan host.
- **/hotspot_find <nama>**: Mencari user hotspot berdasarkan kata kunci yang relevan.
- **/total_pppoe**: Menampilkan total user PPPoE yang aktif.
- **/netwatch_down**: Menampilkan status netwatch yang "down".

### Contoh Penggunaan

1. **Menampilkan resource sistem:**

   ```
   /resource
   ```

   Output:

   ```
   System Resource:
   Board Name: RB4011iGS+5HacQ2HnD
   Uptime: 5d 4h 21m 38s
   CPU Load: 38%
   Free Memory: 593.8 MiB
   Free HDD Space: 0.4 GiB
   RouterOS: 7.9 (stable)
   ```

2. **Mencari user hotspot:**

   ```
   /hotspot_find arpan
   ```

   Output:

   ```
   Hotspot User Detail 1:
   Nama: hdy-arpan3
   Password: 5511
   Profile: Hidayah-Member-3

   Hotspot Aktif Detail 1:
   Nama: hdy-arpan3
   IP: 10.40.5.125
   MAC: 72:BE:5A:C3:03:F9
   Uptime: 21h 48m 52s

   Hotspot Aktif Detail 2:
   Nama: hdy-arpan3
   IP: 10.40.10.134
   MAC: 2A:31:3A:F5:63:0A
   Uptime: 21h 59m 53s
   ```

3. **Menonaktifkan interface:**

   ```
   /interface_disable ether10
   ```

   Output:

   ```
   Interface ether10 berhasil di disable.
   ```

4. **Menampilkan total user hotspot:**

   ```
   /total_hotspot
   ```

   Output:

   ```
   Total User
   User Hotspot: 7923
   User Hotspot Aktif: 313
   Host: 565
   ```

## Kontribusi

Jika Anda ingin berkontribusi pada proyek ini, silakan buat pull request atau ajukan issue di repository ini.
