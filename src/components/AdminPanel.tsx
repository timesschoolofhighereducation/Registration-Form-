"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type {
  StudentRegistrationListItem,
  StudentRegistrationRow,
} from "@/types/registration";
import {
  labelEducation,
  labelGender,
  labelPayment,
  labelProgrammeCategory,
  labelProgrammeName,
} from "@/lib/registrationLabels";
import { openRegistrationPrint } from "@/lib/openRegistrationPrint";

function PrintIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.72 13.829c-.61.49-1.54.79-2.72.79-1.18 0-2.11-.3-2.72-.79M6.72 13.829V18h10.56v-4.171M6.72 13.829l-1.095-3.36A2.25 2.25 0 015.49 8.5h13.02a2.25 2.25 0 012.355 1.969l-1.095 3.36M6.72 13.829h10.56M9 8.5V6.75A1.5 1.5 0 0110.5 5h3A1.5 1.5 0 0115 6.75V8.5"
      />
    </svg>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatAmount(value: number | null) {
  if (value == null) return "—";
  return `LKR ${value.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

function csvEscape(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function AdminPanel() {
  const router = useRouter();

  const [registrations, setRegistrations] = useState<
    StudentRegistrationListItem[]
  >([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<StudentRegistrationRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const limit = 25;

  const loadRegistrations = useCallback(
    async (nextPage: number, term: string) => {
      setListLoading(true);
      setListError(null);
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: String(limit),
        });
        if (term) params.set("search", term);

        const res = await fetch(`/api/admin/registrations?${params}`);
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/admin/login");
            return;
          }
          throw new Error(data.message ?? "Failed to load registrations");
        }

        setRegistrations(data.registrations ?? []);
        setTotal(data.total ?? 0);
        setPage(data.page ?? nextPage);
      } catch (error) {
        setListError(
          error instanceof Error ? error.message : "Failed to load registrations"
        );
      } finally {
        setListLoading(false);
      }
    },
    [router]
  );

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
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
      setDetail(data.registration);
    } catch (error) {
      setDetailError(
        error instanceof Error ? error.message : "Failed to load registration"
      );
    } finally {
      setDetailLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadRegistrations(page, search);
  }, [page, search, loadRegistrations]);

  useEffect(() => {
    if (selectedId != null) {
      void loadDetail(selectedId);
    } else {
      setDetail(null);
      setDetailError(null);
    }
  }, [selectedId, loadDetail]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setRegistrations([]);
    setSelectedId(null);
    setDetail(null);
    router.push("/admin/login");
    router.refresh();
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const exportCsv = () => {
    const headers = [
      "ID",
      "Registered",
      "Full Name",
      "NIC",
      "Programme",
      "Email",
      "Mobile",
      "Payment",
      "Amount Paid",
    ];
    const rows = registrations.map((row) => [
      row.id,
      row.created_at,
      row.full_name,
      row.nic,
      labelProgrammeName(row.programme_name),
      row.email,
      row.mobile_number,
      labelPayment(row.payment_method),
      row.amount_paid ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((line) => line.map(csvEscape).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `student-registrations-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));


  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 h-1 w-12 rounded-full bg-[#f01923]" />
            <h1 className="text-xl font-semibold text-[#2d4084] sm:text-2xl">
              Student registrations
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {total} registration{total === 1 ? "" : "s"} total
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={registrations.length === 0}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Export CSV (this page)
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-lg border border-[#f01923]/30 bg-[#f01923]/10 px-3 py-2 text-sm font-medium text-[#f01923] transition hover:bg-[#f01923]/20"
            >
              Sign out
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-6 flex flex-col gap-2 sm:flex-row"
        >
          <input
            type="search"
            placeholder="Search by name, NIC, email, mobile, or programme…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-[#2d4084]/30 focus:border-[#2d4084] focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#2d4084] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#243366]"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </form>

        {listError && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {listError}
          </p>
        )}

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">NIC</th>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {listLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Loading…
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No registrations found.
                  </td>
                </tr>
              ) : (
                registrations.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {row.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row.full_name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.nic}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {labelProgrammeName(row.programme_name)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{row.mobile_number}</div>
                      <div className="text-xs text-slate-500">{row.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {labelPayment(row.payment_method)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openRegistrationPrint(row.id)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:border-[#2d4084]/30 hover:bg-[#2d4084]/5 hover:text-[#2d4084]"
                          title="Print / Save PDF"
                          aria-label={`Print registration ${row.id}`}
                        >
                          <PrintIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedId(row.id)}
                          className="rounded-lg border border-[#2d4084]/20 bg-[#2d4084]/5 px-3 py-1.5 text-xs font-medium text-[#2d4084] transition hover:bg-[#2d4084]/10"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || listLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || listLoading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedId != null && (
        
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-detail-title"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2
                id="registration-detail-title"
                className="text-lg font-semibold text-[#2d4084]"
              >
                Registration #{selectedId}
              </h2>
              <div className="flex items-center gap-2">
                {selectedId != null && (
                  <button
                    type="button"
                    onClick={() => openRegistrationPrint(selectedId)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    title="Print / Save PDF"
                  >
                    <PrintIcon className="h-4 w-4" />
                    Print / PDF
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                  aria-label="Close"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            
            <div className="overflow-y-auto px-5 py-4">
              {detailLoading && (
                <p className="text-sm text-slate-600">Loading details…</p>
              )}
              {detailError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {detailError}
                </p>
              )}
              {detail && (
                <div className="space-y-6 text-sm">
                  <DetailSection title="Programme">
                    <DetailRow
                      label="Category"
                      value={labelProgrammeCategory(detail.programme_category)}
                    />
                    <DetailRow
                      label="Programme"
                      value={labelProgrammeName(detail.programme_name)}
                    />
                  </DetailSection>

                  <DetailSection title="Personal">
                    <DetailRow label="Full name" value={detail.full_name} />
                    <DetailRow
                      label="Name with initials"
                      value={detail.name_with_initials}
                    />
                    <DetailRow label="Date of birth" value={detail.date_of_birth} />
                    <DetailRow label="Gender" value={labelGender(detail.gender)} />
                    <DetailRow label="NIC" value={detail.nic} />
                    <DetailRow label="Address" value={detail.address} />
                    <DetailRow label="Mobile" value={detail.mobile_number} />
                    <DetailRow label="Email" value={detail.email} />
                  </DetailSection>

                  <DetailSection title="Emergency contact">
                    <DetailRow
                      label="Name"
                      value={detail.emergency_contact_name}
                    />
                    <DetailRow
                      label="Number"
                      value={detail.emergency_contact_number}
                    />
                  </DetailSection>

                  <DetailSection title="Education">
                    <DetailRow
                      label="School / institution"
                      value={detail.school_institution}
                    />
                    <DetailRow
                      label="Highest qualification"
                      value={labelEducation(detail.highest_education_qualification)}
                    />
                    <DetailRow label="Qualification 1" value={detail.qualification_1} />
                    <DetailRow label="Qualification 2" value={detail.qualification_2} />
                    <DetailRow
                      label="Other qualification"
                      value={detail.other_education_qualification}
                    />
                  </DetailSection>

                  <DetailSection title="Payment">
                    <DetailRow
                      label="Method"
                      value={labelPayment(detail.payment_method)}
                    />
                    <DetailRow
                      label="Amount paid"
                      value={formatAmount(detail.amount_paid)}
                    />
                    <DetailRow label="Receipt number" value={detail.receipt_number} />
                    <DetailRow label="Bank branch" value={detail.bank_branch} />
                  </DetailSection>

                  <DetailSection title="Meta">
                    <DetailRow
                      label="Registered"
                      value={formatDate(detail.created_at)}
                    />
                    <DetailRow
                      label="Signed at"
                      value={formatDate(detail.applicant_signed_at)}
                    />
                    <DetailRow label="IP" value={detail.ip_hash} />
                  </DetailSection>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {detail.profile_image_base64 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Profile photo
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={detail.profile_image_base64}
                          alt="Profile"
                          className="max-h-48 rounded-lg border border-slate-200 object-contain"
                        />
                      </div>
                    )}
                    {detail.bank_receipt_base64 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Bank receipt
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={detail.bank_receipt_base64}
                          alt="Bank receipt"
                          className="max-h-48 rounded-lg border border-slate-200 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#2d4084]">
        {title}
      </h3>
      <dl className="space-y-2">{children}</dl>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    
    <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}
