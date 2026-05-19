"use client";

import { RegistrationPrintDocument } from "@/components/RegistrationPrintDocument";
import type { StudentRegistrationRow } from "@/types/registration";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function PrintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const autoPrint = searchParams.get("auto") !== "0";

  const [registration, setRegistration] = useState<StudentRegistrationRow | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasPrinted = useRef(false);

  useEffect(() => {
    if (!id) {
      setError("Missing registration id");
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const res = await fetch(`/api/admin/registrations?id=${id}`);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/admin/login");
            return;
          }
          throw new Error(data.message ?? "Failed to load registration");
        }
        setRegistration(data.registration);
        const name = data.registration.full_name as string;
        document.title = `Registration-${id}-${name.replace(/[^\w.-]+/g, "_")}`;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load registration"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  useEffect(() => {
    if (!registration || !autoPrint || hasPrinted.current) return;

    const timer = window.setTimeout(() => {
      hasPrinted.current = true;
      window.print();
    }, 600);

    return () => window.clearTimeout(timer);
  }, [registration, autoPrint]);

  if (loading) {
    return (
      <p className="p-8 text-center text-sm text-slate-600">
        Preparing document for print…
      </p>
    );
  }

  if (error || !registration) {
    return (
      <p className="p-8 text-center text-sm text-rose-700">
        {error ?? "Registration not found"}
      </p>
    );
  }

  return (
    <>
      <div className="no-print fixed right-4 top-4 z-50 flex gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-[#2d4084] px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-[#243366]"
        >
          Print / Save PDF
        </button>
        <button
          type="button"
          onClick={() => window.close()}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-md hover:bg-slate-50"
        >
          Close
        </button>
      </div>
      <RegistrationPrintDocument registration={registration} />
    </>
  );
}

export default function AdminPrintPage() {
  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <Suspense
        fallback={
          <p className="p-8 text-center text-sm text-slate-600">Loading…</p>
        }
      >
        <PrintContent />
      </Suspense>
    </div>
  );
}
