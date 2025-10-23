"use client";

import { useState } from "react";

type Staff = {
  id: string;
  name: string;
  slug: string;
  title?: string | null;
};

export default function StaffLinkCard({ staff, businessSlug }: { staff: Staff; businessSlug: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  const prettyURL = `${base}/b/${businessSlug}/s/${staff.slug}`;
  const haircutURL = `${prettyURL}?serviceId=svc_haircut`;
  const qrGeneralURL = `${prettyURL}?utm_source=qr&utm_campaign=${staff.slug}`;
  const qrHaircutURL = `${haircutURL}&utm_source=qr&utm_campaign=${staff.slug}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateQR = (url: string) => {
    // QR kod oluşturma servisi - ücretsiz API
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
  };

  return (
    <div className="rounded-2xl border p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{staff.name}</h2>
          {staff.title && <p className="text-sm text-gray-500">{staff.title}</p>}
        </div>
        <div className="text-xs text-gray-400 font-mono">/{staff.slug}</div>
      </div>

      {/* Linkler */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">📱 Paylaşım Linkleri</div>
        
        {/* Genel Link */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Genel Link</div>
          <div className="flex items-center gap-2">
            <code className="text-xs flex-1 truncate">{prettyURL}</code>
            <button
              onClick={() => copyToClipboard(prettyURL, "general")}
              className="text-xs px-2 py-1 bg-black text-white rounded hover:bg-gray-800"
            >
              {copied === "general" ? "✓" : "Kopyala"}
            </button>
          </div>
        </div>

        {/* Saç Kesimi Link */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Saç Kesimi (Direkt)</div>
          <div className="flex items-center gap-2">
            <code className="text-xs flex-1 truncate">{haircutURL}</code>
            <button
              onClick={() => copyToClipboard(haircutURL, "haircut")}
              className="text-xs px-2 py-1 bg-black text-white rounded hover:bg-gray-800"
            >
              {copied === "haircut" ? "✓" : "Kopyala"}
            </button>
          </div>
        </div>
      </div>

      {/* QR Kodlar */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">📷 QR Kodlar</div>
        <div className="grid grid-cols-2 gap-2">
          {/* Genel QR */}
          <a
            href={generateQR(qrGeneralURL)}
            target="_blank"
            rel="noopener noreferrer"
            className="border rounded-lg p-2 text-center hover:shadow-md transition"
          >
            <img src={generateQR(qrGeneralURL)} alt="Genel QR" className="w-full h-auto mb-1" />
            <div className="text-xs text-gray-600">Genel</div>
          </a>

          {/* Saç Kesimi QR */}
          <a
            href={generateQR(qrHaircutURL)}
            target="_blank"
            rel="noopener noreferrer"
            className="border rounded-lg p-2 text-center hover:shadow-md transition"
          >
            <img src={generateQR(qrHaircutURL)} alt="Saç Kesimi QR" className="w-full h-auto mb-1" />
            <div className="text-xs text-gray-600">Saç Kesimi</div>
          </a>
        </div>
      </div>

      {/* İndirme Talimatı */}
      <div className="text-xs text-gray-500 bg-blue-50 rounded p-2">
        💡 <strong>Not:</strong> QR kodlara tıklayarak büyük boyutunu indirebilir, kartınıza ekleyebilirsiniz.
      </div>
    </div>
  );
}

