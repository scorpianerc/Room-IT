// src/app/(dashboard)/cara-pesan/page.tsx
export default function CaraPesanPage() {
  const steps = [
    {
      number: 1,
      title: "Klik ikon ☰ kemudian klik ruangan dan pilih ruangan",
      description: "Pilih menu hamburger di pojok kanan atas, lalu pilih 'Ruangan' untuk melihat daftar ruangan yang tersedia."
    },
    {
      number: 2,
      title: "Periksa jadwal yang tersedia",
      description: "Lihat jadwal yang tersedia untuk ruangan yang dipilih. Pastikan waktu yang Anda inginkan tidak bentrok dengan pemesanan lain."
    },
    {
      number: 3,
      title: "Upload proposal",
      description: "Siapkan dan upload proposal kegiatan Anda dalam format PDF. Proposal ini akan digunakan untuk proses persetujuan."
    },
    {
      number: 4,
      title: "Konfirmasi",
      description: "Review kembali semua informasi pemesanan Anda, lalu konfirmasi untuk mengirim permintaan peminjaman ruangan."
    }
  ]

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-4">Cara Pesan</h1>
      <p className="text-gray-300">Tata cara peminjaman ruangan di Fakultas Ilmu Komputer</p>

      {/* Steps */}
      <div className="py-6 space-y-4 rounded-lg">
        {steps.map((step) => (
          <div key={step.number} className="bg-white rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {step.number}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-black">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Tips:</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Pastikan proposal sudah lengkap sebelum diupload</li>
            <li>• Periksa kembali jadwal sebelum konfirmasi</li>
            <li>• Tunggu konfirmasi dari admin sebelum menggunakan ruangan</li>
            <li>• Hubungi admin jika ada pertanyaan</li>
          </ul>
        </div>
      </div>
    </div>
  )
}