import { AdminLoginForm } from "@/components/AdminLoginForm";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
  title: "Admin Sign In – Student Registrations",
  description: "Sign in to view registered student submissions",
};

export default function AdminLoginPage() {
  return (
    
    <div className="min-h-screen bg-slate-50/80 py-12 px-4 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-md">
        <p className="mb-6 text-center text-sm text-slate-600">
          <Link href="/" className="font-medium text-[#2d4084] hover:underline">
            ← Back to registration form
          </Link>
        </p>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-10">
          <Suspense fallback={<p className="text-sm text-slate-600">Loading…</p>}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
