/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Android APK Packaging & PWA Guide Modal
 */

import React, { useState } from 'react';
import { Smartphone, Terminal, Code2, CheckCircle2, X, ExternalLink, Copy, Check, Download, AlertTriangle, Globe } from 'lucide-react';

interface ApkExportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportGuideModal: React.FC<ApkExportGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const directAppUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(directAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadManifest = () => {
    fetch('/manifest.json')
      .then((res) => res.text())
      .then((text) => handleDownloadFile('manifest.json', text, 'application/json'))
      .catch(() => {});
  };

  const handleDownloadSW = () => {
    fetch('/sw.js')
      .then((res) => res.text())
      .then((text) => handleDownloadFile('sw.js', text, 'text/javascript'))
      .catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 transition-colors max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Cara Mengubah Aplikasi Ini Menjadi APK / PWA</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Panduan lengkap ekspor ke file APK Android menggunakan PWABuilder & Capacitor.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Callout for PWABuilder error cause */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Penting: Mengapa PWABuilder Kemarin Error "Missing Manifest"?</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            PWABuilder membaca URL yang dimasukkan. Jika Anda memasukkan URL editor <code className="bg-amber-100 dark:bg-amber-950 px-1 py-0.5 rounded text-amber-700 dark:text-amber-300">https://ai.studio/app/...</code>, PWABuilder akan memeriksa halaman luar AI Studio (yang tidak punya manifest), BUKAN aplikasi Anda yang ada di dalam frame.
          </p>
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            Solusi: Gunakan URL Aplikasi Direct di bawah ini atau Buka di Tab Baru!
          </p>
        </div>

        {/* Direct App URL Copy Tool */}
        <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
            URL Aplikasi Direct (Bukan URL Studio):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={directAppUrl}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin!' : 'Salin URL'}
            </button>
            <a
              href={directAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Tab Baru
            </a>
          </div>
        </div>

        {/* Method 1: Install Directly on Android HP (RECOMMENDED) */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
            <Smartphone className="w-5 h-5 shrink-0" />
            <span className="text-sm">Cara Paling Mudah: Install Langsung di HP Android Anda</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
            Anda <strong>tidak perlu mengunduh file APK</strong> dari PWABuilder! Google Chrome di Android sudah mendukung PWA (Progressive Web App) secara langsung:
          </p>
          <ol className="list-decimal pl-5 text-[11px] space-y-1.5 text-slate-800 dark:text-slate-200 font-medium">
            <li>
              Buka URL aplikasi ini di browser <strong>Google Chrome</strong> di HP Android Anda.
            </li>
            <li>
              Tekan <strong>titik tiga (⋮)</strong> di pojok kanan atas browser Chrome.
            </li>
            <li>
              Pilih menu <strong>"Instal aplikasi"</strong> (atau <strong>"Tambahkan ke Layar Utama"</strong> / <em>Add to Home screen</em>).
            </li>
            <li>
              Tekan <strong>Instal</strong>.
            </li>
          </ol>
          <p className="text-[11px] bg-emerald-500/20 p-2 rounded-lg text-emerald-800 dark:text-emerald-300 font-medium">
            ✅ Aplikasi HandDraw akan langsung terpasang di HP Anda dengan ikon sendiri di layar utama, tanpa bilah browser (fullscreen), dan siap dipakai kapan saja!
          </p>
        </div>

        {/* Why PWABuilder fails on Google Play */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Mengapa PWABuilder "Unable to create Google Play package" (403 Forbidden)?</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            Server Cloud Google AI Studio memblokir robot pengunduh otomatis milik PWABuilder (403 Forbidden) saat PWABuilder mencoba mengambil gambar ikon dari server preview.
          </p>
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            Oleh karena itu, cara resmi & paling praktis untuk HP Android adalah menggunakan fitur <strong>"Instal aplikasi"</strong> langsung dari browser Chrome di HP Anda!
          </p>
        </div>

        {/* Direct Download Manifest & SW Assets */}
        <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
          <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-500" /> Unduh Berkas PWA Langsung
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadManifest}
              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" /> Unduh manifest.json
            </button>
            <button
              onClick={handleDownloadSW}
              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" /> Unduh sw.js (Worker)
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/30"
        >
          Mengerti, Tutup Panduan
        </button>
      </div>
    </div>
  );
};
