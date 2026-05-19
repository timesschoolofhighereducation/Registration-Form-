import { AdminPanel } from "@/components/AdminPanel";
import Link from "next/link";

export const metadata = {
  title: "Admin – Student Registrations",
  description: "View registered student submissions",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50/80 py-12 px-4 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-6xl">
        <p className="mb-6 text-center text-sm text-slate-600">
          <Link href="/" className="font-medium text-[#2d4084] hover:underline">
            ← Back to registration form
          </Link>
        </p>
        <AdminPanel />
      </main>
    </div>
  );
}
