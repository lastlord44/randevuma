import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <h1 className="text-3xl font-bold">randevuma.com</h1>
      <p className="text-gray-600">
        İşletmeniz için çevrimiçi randevu—hızlı, güvenilir, kurumsal.
      </p>

      <div className="flex gap-3">
        <Link
          href="/b/demo"
          className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
        >
          Demo Randevu Al
        </Link>
        <a
          href="/api/business/demo"
          className="rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          API'yi Gör
        </a>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Öne Çıkanlar</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Kolay entegrasyon (Next.js App Router)</li>
          <li>Edge-ready API uçları</li>
          <li>Vercel Deploy & Env ile tek tık yönetim</li>
        </ul>
      </section>
    </main>
  );
}