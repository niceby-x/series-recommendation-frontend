import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold text-blue-400 mb-2">
        BL Series
      </h1>
      <p className="text-gray-400 mb-8">
        Your ultimate BL drama recommendation site
      </p>
      
      <Link  href="/series"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
        Browse Series →
      </Link>
    </main>
  );
}