// src/app/(dashboard)/booking/success/page.tsx
'use client'

import { CheckCircle, ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-black mb-4">
            Permintaan Anda Sudah Terkirim
          </h1>
          
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Terima kasih! Permintaan peminjaman ruangan Anda telah berhasil dikirim. 
            Admin akan meninjau dan memberikan konfirmasi dalam 1-2 hari kerja.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/status"
              className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold text-center block hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              Cek Status
            </Link>
            
            <Link
              href="/"
              className="w-full border border-gray-300 text-gray-700 p-4 rounded-lg font-semibold text-center block hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali ke Beranda
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-black mb-2">📋 Langkah Selanjutnya:</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Tunggu konfirmasi dari admin</li>
              <li>• Cek status secara berkala</li>
              <li>• Anda akan mendapat notifikasi saat ada update</li>
              <li>• Hubungi admin jika ada pertanyaan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}