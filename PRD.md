# PRODUCT REQUIREMENTS DOCUMENT

Website Undangan Pernikahan Interaktif

PRD v3.0 • Secure RSVP • Invitation Token • QR Check-in • Pesan & Kesan • Photo Sharing

**Project**

**Value**

**Client**

Han

**Version**

v3.0

**Target Deadline**

November 2026

**Platform**

Responsive Web — Mobile First

**Theme**

Lotus / Water Lily + Hanging Willow Tree

1. Change Summary — v2.0 → v3.0

RSVP tidak lagi bersifat public/free-form. Hanya tamu yang memiliki invitation record/token yang dapat melakukan RSVP.

Setiap undangan memiliki unique invitation link/token yang dibuat oleh sistem atau admin.

Guest list harus dipersiapkan/pre-registered sebelum undangan digunakan.

Tamu mengisi RSVP sendiri melalui invitation link yang valid.

QR Code dibuat otomatis oleh sistem setelah/berdasarkan invitation dan RSVP; tamu tidak perlu membuat atau mengetik QR.

Pada hari H, staff menjadi pihak yang melakukan scan dan final check-in.

Ditambahkan validasi double check-in agar QR yang telah digunakan tidak dapat dipakai kembali.

Quota diperlakukan sebagai jumlah seat/undangan yang dihitung; bayi/anak yang tidak dihitung quota dapat dicatat terpisah.

Photo-sharing tetap menjadi optional/dependency karena integrasi dengan aplikasi pihak ketiga bergantung pada kemampuan API/deep link/QR.

2. Project Overview

Website undangan pernikahan digital dengan visual storytelling berbasis scroll dan sistem guest management sederhana. Pengguna mengalami perjalanan visual dari opening invitation, pengenalan pasangan, informasi acara, RSVP, Pesan & Kesan, hingga akses photo-sharing/gallery. Sistem RSVP menggunakan pre-registered invitation dan unique token untuk mengurangi risiko orang yang tidak diundang membuat RSVP secara bebas. QR digunakan sebagai identitas check-in dan diverifikasi oleh staff.

3. Product Goals

Membuat undangan memorable dan berbeda dari template statis.

Menjadikan scroll sebagai mekanisme storytelling utama.

Membangun visual identity lotus + willow yang konsisten.

Mencegah RSVP dari orang yang tidak memiliki invitation.

Memudahkan tamu melakukan RSVP sendiri tanpa input manual staff.

Menghasilkan QR secara otomatis untuk kebutuhan check-in.

Memungkinkan staff melakukan validasi tamu secara cepat pada hari H.

Menyediakan Pesan & Kesan dan akses photo-sharing.

4. User Roles

Role

Permission / Responsibility

Guest / Tamu

Mengakses invitation link miliknya, melihat undangan, mengisi RSVP, melihat QR, mengirim pesan/kesan, dan mengakses photo-sharing.

Couple / Client

Menyediakan/menyetujui guest list, melihat RSVP, pesan, dan data attendance.

Event Staff

Scan QR, melihat hasil validasi, dan melakukan final check-in.

Admin / Developer

Mengelola invitation records, guest data, konfigurasi, dan maintenance sistem.

5. Design Direction

Primary theme: Lotus / Water Lily.

Decorative motif: bunga teratai.

Header decoration: juntaian willow tree.

Color palette: soft natural lotus-inspired tones; hex final ditentukan pada fase UI/UX.

Tone: elegant, romantic, calm, organic, premium.

Mobile-first dan tetap nyaman digunakan walaupun terdapat animation.

6. Core Functional Requirements

ID

Feature

Requirement

FR-01

Opening Invitation

Opening seperti “Selamat Anda Diundang”.

FR-02

Scroll Storytelling

Visual/content berubah progresif mengikuti scroll.

FR-03

Couple Introduction

Nama pasangan muncul melalui transisi/animasi.

FR-04

Event Information

Nama, tanggal, waktu, lokasi, dan informasi acara.

FR-05

Countdown

Countdown menuju acara.

FR-06

Pre-registered Invitation

Setiap tamu/invitation harus terdaftar sebelum dapat RSVP.

FR-07

Unique Invitation Link

Setiap invitation memiliki URL/token unik.

FR-08

RSVP

Tamu melakukan konfirmasi melalui invitation link yang valid.

FR-09

Guest Quota

Jumlah guest yang dihitung tidak boleh melebihi quota invitation.

FR-10

QR Generation

Sistem membuat QR otomatis untuk invitation/check-in.

FR-11

Staff QR Check-in

Staff melakukan scan dan final check-in.

FR-12

QR Validation

Sistem memvalidasi token dan status check-in.

FR-13

Pesan & Kesan

Tamu dapat mengirim ucapan/pesan.

FR-14

Message Moderation

Client/admin dapat menyembunyikan/menghapus pesan.

FR-15

Photo Sharing

Tamu dapat mengakses platform photo-sharing.

FR-16

Gallery QR

QR/deep link dapat digunakan untuk membuka album/event foto.

FR-17

Responsive

Mobile, tablet, desktop.

FR-18

Deployment

Public domain + HTTPS.

7. Invitation & RSVP Security Flow

Sistem tidak menyediakan form RSVP publik yang memungkinkan siapa pun membuat data undangan sendiri.

Client/admin memasukkan atau mengimpor guest list terlebih dahulu.

Sistem membuat invitation record untuk setiap tamu/kelompok undangan.

Setiap invitation memperoleh unique token/URL yang sulit ditebak.

Tamu membuka URL invitation miliknya.

Sistem memvalidasi token sebelum menampilkan/menyimpan RSVP.

Tamu mengisi status hadir dan jumlah guest yang dihitung.

Server memvalidasi guest_count terhadap quota.

Setelah RSVP berhasil, sistem menyediakan QR unik untuk invitation tersebut.

Orang tanpa invitation token yang valid tidak dapat membuat RSVP baru.

8. Invitation Data Example

Invitation

Example

Invitation ID

INV-001

Guest Name

Hilman Fauzi

Invitation Token

8fK2xP9m...

Quota

2 seats

RSVP Status

Attending

Guest Count

2

QR Status

Not Checked In

Children/Baby

1 — excluded from quota

9. Guest Quota & Children/Baby Rule

Default: 1 invitation memiliki maksimal 2 counted guests.

Guest count yang dihitung tidak boleh melebihi quota.

Client dapat menentukan quota berbeda per invitation jika diperlukan.

Bayi/anak yang secara khusus tidak dihitung quota dapat dicatat pada field terpisah.

Contoh: quota 2 seats + 1 baby = tetap 2 counted guests.

Aturan final tentang anak/bayi harus ditentukan client sebelum production.

## 10. QR Code & Check-in Flow

QR digunakan sebagai identifier check-in, bukan sebagai mekanisme pembuatan RSVP.

QR dibuat otomatis berdasarkan invitation/token.

Tamu dapat membuka kembali invitation untuk melihat QR.

Tamu tidak perlu mengetik atau membuat QR secara manual.

Pada hari H, staff membuka scanner/check-in page.

Staff scan QR tamu.

Server mengecek token valid, invitation aktif, RSVP status, dan check-in status.

Jika valid → data tamu ditampilkan → staff menekan Confirm Check-in.

Setelah berhasil → status menjadi Checked In.

Jika QR sudah digunakan → sistem menampilkan Already Checked In.

Jika token tidak valid → sistem menampilkan Invalid QR.

## 11. Recommended Check-in Screen

Status

System Response

Valid

Nama tamu + quota + jumlah hadir + tombol Confirm Check-in

Already Checked In

Tampilkan waktu check-in dan tolak check-in kedua

Invalid QR

Tolak dan tampilkan pesan error

No RSVP

Tampilkan warning; staff menentukan apakah walk-in diperbolehkan

Quota / Guest Mismatch

Warning untuk staff; keputusan mengikuti policy client

## 12. Walk-in / Exception Handling

Walk-in guest harus menjadi exception flow, bukan jalur RSVP normal.

Jika client mengizinkan, staff/admin dapat mencari invitation secara manual.

Staff/admin dapat melakukan override hanya dengan permission tertentu.

Override wajib dicatat dalam audit log bila sistem menggunakan audit log.

Guest yang sama sekali tidak memiliki invitation record sebaiknya tidak dapat membuat invitation sendiri.

## 13. Pesan & Kesan

Tamu mengisi nama dan pesan/kesan melalui invitation.

Pesan disimpan ke database.

Pesan yang disetujui ditampilkan pada website.

Client/admin dapat menghapus atau menyembunyikan pesan.

Input divalidasi, dibatasi panjang karakter, dan disanitasi.

## 14. Wedding Photo Gallery Integration

Client ingin tamu dapat mengambil foto saat wedding dan foto tersebut terkumpul di aplikasi/gallery. Revel menjadi kandidat awal.

Preferred flow: Website → tombol/QR Upload Foto Wedding → platform photo-sharing → tamu upload.

Jika tersedia API resmi, integrasi dapat dibuat sesuai kemampuan API.

Jika tidak tersedia API, gunakan deep link atau QR menuju album/event.

Client menyediakan akun/event/album platform pihak ketiga.

Subscription/biaya platform pihak ketiga berada di luar biaya development.

Status: OPTIONAL / DEPENDENCY sampai platform final dan mekanisme integrasi dikonfirmasi.

## 15. Scroll Animation Requirements

Scroll-driven transform, scale, opacity, position dan/atau rotation.

Seamless transition antar-scene.

Parallax/depth effect bila sesuai.

Lotus artwork menjadi bagian storytelling.

Willow tree dapat memiliki subtle parallax/motion.

Animation tidak menghalangi konten penting.

Reduced-motion fallback sebaiknya tersedia.

## 16. Suggested User Flow

Client/Admin creates guest list → Unique invitation generated → Guest opens personal link → RSVP → QR generated/available → Wedding day → Staff scans QR → Server validates → Staff confirms check-in → Attendance recorded.

Guest content flow: Open invitation → Opening → Scroll story → Couple → Event details → RSVP → Pesan & Kesan → Photo Gallery.

## 17. Non-Functional Requirements

Area

Requirement

Performance

Optimasi image/animation agar loading tetap ringan.

Responsive

Prioritas smartphone; usable di tablet/desktop.

Security

Token sulit ditebak, server-side validation, input sanitization.

Privacy

Data tamu/pesan tidak diekspos tanpa kontrol.

Availability

Website aktif selama periode undangan dan acara.

Accessibility

Informasi tetap usable saat animation dikurangi.

Maintainability

Source code dan deployment terdokumentasi.

## 18. Proposed Technical Architecture

Frontend: modern component-based web framework.

Animation: GSAP/ScrollTrigger atau equivalent.

Backend: REST/API untuk invitation, RSVP, quota, messages, QR validation, attendance.

Database: relational database.

Invitation security: cryptographically random token atau equivalent secure identifier.

QR: QR berisi URL/token atau signed identifier; server tetap menjadi sumber validasi.

Photo-sharing: API integration atau deep link/QR sesuai kemampuan platform.

Deployment: public hosting/server + HTTPS.

## 19. Minimum Data Model

Entity

Minimum Fields

Invitation

id, token, guest_name, quota, status

Guest

id, invitation_id, name, contact (optional), counted_guest flag

RSVP

id, invitation_id, attendance_status, guest_count, baby_count, submitted_at

Message

id, invitation_id, guest_name, message, status, created_at

Attendance

id, invitation_id, checked_in_at, checked_in_by, status

PhotoIntegration

platform, album/event reference, deep_link/QR target, status

Admin/Staff

id, name, role, authentication data

## 20. Acceptance Criteria

Invitation hanya dapat diakses melalui token/link valid.

Orang tanpa invitation tidak dapat membuat RSVP baru.

Guest count tidak dapat melebihi quota.

Bayi/anak dapat dicatat terpisah jika policy client mengizinkan.

QR dibuat/ditampilkan otomatis tanpa input manual dari tamu.

Staff dapat scan QR dan mendapatkan status valid/invalid/already checked-in.

QR yang sudah digunakan tidak dapat check-in kedua kali.

Pesan & Kesan dapat dikirim dan dimoderasi.

Photo-sharing dapat diakses melalui tombol/QR/deep link sesuai platform.

Scroll animation sesuai storyboard/reference yang disetujui.

Website responsive dan menggunakan HTTPS.

Tidak ada critical bug pada flow utama.

## 21. Revised Pricing Reference

Component

Estimated Price

UI/UX & Custom Lotus/Willow Design

Rp600.000

Opening Invitation

Rp300.000

Interactive Scroll Animation

Rp1.000.000

Wedding Information Section

Rp300.000

Pre-registered Invitation + Unique Token

Rp450.000

RSVP + Guest Quota

Rp450.000

Automatic QR Generation + Staff Check-in

Rp650.000

Pesan & Kesan + Basic Moderation

Rp350.000

Responsive Optimization

Rp200.000

Testing & Bug Fixing

Rp150.000

Deployment

Rp250.000

TOTAL DEVELOPMENT + DEPLOYMENT

Rp4.650.000

Photo-sharing integration belum dimasukkan ke baseline karena bergantung pada platform pihak ketiga.

## 22. Optional Add-ons

Optional Feature

Estimated Price

Photo Gallery QR / Deep Link

Rp150.000–Rp300.000

Third-party API Integration

Mulai Rp500.000; final setelah API review

Admin Dashboard RSVP + Messages

Rp750.000–Rp1.500.000

Guest Import / Bulk Upload

Rp250.000–Rp500.000

Advanced Guest Management

Mulai Rp500.000

Custom Illustration / Original Artwork

Mulai Rp500.000

Complex Frame-by-Frame / Cinematic Animation

Quotation berdasarkan storyboard

## 23. Out of Scope

Public free-form RSVP tanpa invitation validation.

Produksi foto/video wedding.

3D modeling/cinematic tanpa quotation terpisah.

Unlimited revisions.

Biaya domain/hosting tahunan.

Subscription/paid plan platform photo-sharing.

Perubahan besar requirement setelah development dimulai tanpa adjustment timeline/biaya.

## 24. Assumptions

Client menyediakan atau menyetujui guest list sebelum RSVP dibuka.

Client menyediakan data pasangan, acara, foto, teks, dan asset.

Client menyetujui storyboard dan visual direction.

Client menentukan platform photo-sharing final.

Platform pihak ketiga menyediakan API/deep link/QR-access yang dapat digunakan.

Maksimal 2–3 ronde revisi desain/fitur.

Target deadline November 2026 bergantung pada kesiapan asset, approval, dan keputusan platform.

## 25. Project Milestones

Phase

Work

Output

1

Requirement & Guest List

Final requirement, guest list, quota policy

2

UI/UX & Storyboard

Visual system, palette, scene breakdown, animation storyboard

3

Frontend

Responsive layout dan content sections

4

Animation

Scroll animation, lotus/willow motion, transitions

5

Guest & RSVP Backend

Invitation token, guest quota, RSVP

6

QR Check-in

QR generation, scanner, validation, attendance

7

Messages & Photo Integration

Pesan/kesan + QR/deep link/API photo-sharing

8

Testing

Cross-device, security, performance, user-flow testing

9

Deployment

Domain, server, SSL, production release

## 26. Final Scope Note

v3.0 menetapkan arsitektur RSVP yang lebih aman: guest list dipre-register, invitation menggunakan unique token/link, tamu mengisi RSVP sendiri, sistem menghasilkan QR, dan staff melakukan final check-in. Dengan model ini, orang yang tidak diundang tidak dapat membuat RSVP baru secara bebas. Kasus walk-in ditangani sebagai exception flow. Bayi/anak dapat dicatat terpisah apabila tidak dihitung sebagai quota. Photo-sharing tetap merupakan dependency pihak ketiga.
