import type { StudentRegistrationRow } from "@/types/registration";
import { labelProgrammeName } from "@/lib/registrationLabels";

type Props = {
  registration: StudentRegistrationRow;
};

function Check({ checked }: { checked: boolean }) {
  return (
    <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-sm border border-slate-400 text-[9px]">
      {checked ? "✓" : ""}
    </span>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string | null | undefined;
  multiline?: boolean;
}) {
  const display = value?.trim() ? value : "—";
  return (
    
    <div>
      <p className="font-semibold">{label}</p>
      {multiline ? (
        <p className="mt-0.5 min-h-[32px] whitespace-pre-line border border-slate-300 px-1 py-1">
          {display}
        </p>
      ) : (
        <p className="mt-0.5 min-h-[18px] border-b border-slate-300">{display}</p>
      )}
    </div>
  );
}

export function RegistrationPrintDocument({ registration: r }: Props) {
  const amountPaid =
    r.amount_paid != null
      ? r.amount_paid.toLocaleString("en-LK", { minimumFractionDigits: 2 })
      : "";

  return (
    <div className="mx-auto w-full max-w-[900px] bg-white p-6 text-slate-900 print:p-4">
      <div className="flex items-start border-b border-slate-200 pb-4">
        <div className="flex-1">
          <p className="text-[10px] font-medium text-slate-500">
            Registration #{r.id}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tshelogo.jpg"
              alt="TIMES School of Higher Education"
              className="h-8 w-auto object-contain"
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                TIMES SCHOOL OF HIGHER EDUCATION
              </h1>
              <p className="text-sm font-semibold text-slate-800">
                STUDENT REGISTRATION FORM
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4 text-[11px]">
        <section>
          <p className="font-semibold">1. Programme Selection</p>
          
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div>
              <p className="font-semibold">Undergraduate Programmes</p>
              <ul className="mt-0.5 space-y-0.5">
                {[
                  ["BBA", "Bachelor of Business Administration"],
                  ["BTL", "Bachelor of Transportation and Logistics"],
                  ["BSCM", "Bachelor of Supply Chain Management"],
                  ["BIT", "Bachelor of Information and Technology"],
                ].map(([code, label]) => (
                  <li key={code} className="flex items-center gap-1">
                    <Check checked={r.programme_name === code} />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-1">
              
              <div>
                <p className="font-semibold">Postgraduate Programmes</p>
                
                
                <div className="mt-0.5 flex items-center gap-1">
                  <Check checked={r.programme_name === "MBA"} />
                  <span>Master of Business Administration</span>
                </div>
              </div>
              <div>
                <p className="font-semibold">
                  Diploma Programmes / Certificate Programmes
                </p>
                <ul className="mt-0.5 space-y-0.5">
                  <li className="flex items-center gap-1">
                    <Check
                      checked={
                        r.programme_name ===
                        "Diploma_Professional_English_Digital_Skills"
                      }
                    />
                    <span>
                      Diploma in Professional English and Digital Skills
                    </span>
                  </li>
                  <li className="flex items-center gap-1">
                    <Check
                      checked={
                        r.programme_name ===
                        "AdvCert_Professional_Communication_Digital_Skills_School_Leaders"
                      }
                    />
                    <span>
                      Advanced Certificate in Professional Communication and
                      Digital Skills for School Leaders
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Languages</p>
                <div className="mt-0.5 flex items-center gap-1">
                  <Check checked={r.programme_name === "Cambridge_Linguaskill"} />
                  <span>Cambridge Linguaskill</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div className="col-span-2 flex items-center justify-between">
            <p className="font-semibold">2. Personal Information</p>
            <div className="flex items-center gap-2">
              <div className="h-16 w-16 overflow-hidden rounded border border-slate-300 bg-slate-50">
                {r.profile_image_base64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.profile_image_base64}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-400">
                    Photo
                  </div>
                )}
              </div>
            </div>
          </div>
          <Field label="Full Name" value={r.full_name} />
          <Field label="Name with Initials" value={r.name_with_initials} />
          <Field label="Date of Birth" value={r.date_of_birth} />
          <div>
            <p className="font-semibold">Gender</p>
            <div className="mt-0.5 flex items-center gap-4">
              {[
                ["male", "Male"],
                ["female", "Female"],
              ].map(([code, label]) => (
                
                <div key={code} className="flex items-center gap-1">
                  <Check checked={r.gender === code} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <Field label="NIC" value={r.nic} />
          <p className="col-span-2 mt-2 font-semibold">3. Contact Information</p>
          <div className="col-span-2">
            <Field label="Address" value={r.address} multiline />
          </div>
          <Field label="Mobile Number" value={r.mobile_number} />
          <Field label="Email Address" value={r.email} />
          <Field label="Emergency Contact Name" value={r.emergency_contact_name} />
          <Field
            label="Emergency Contact Number"
            value={r.emergency_contact_number}
          />
        </section>

        <section>
          <p className="font-semibold">4. Education Background</p>
          <div className="mt-1 grid grid-cols-2 gap-3">
            <Field label="School / Institution" value={r.school_institution} />
            <div>
              <p className="font-semibold">Highest Education Qualification</p>
              <div className="mt-0.5 flex flex-wrap gap-3">
                {[
                  ["bachelor", "Bachelor"],
                  ["hnd", "HND"],
                  ["diploma", "Diploma"],
                  ["certificate", "Certificate level"],
                  ["al", "A/L"],
                  ["ol", "O/L"],
                ].map(([code, label]) => (
                  <div key={code} className="flex items-center gap-1">
                    <Check checked={r.highest_education_qualification === code} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <Field label="Qualification 1" value={r.qualification_1} />
            </div>
            <div className="col-span-2">
              <Field label="Qualification 2" value={r.qualification_2} />
            </div>
            <div className="col-span-2">
              <Field
                label="Other Education Qualification"
                value={r.other_education_qualification}
                multiline
              />
            </div>
          </div>
        </section>

        <section>
          <p className="font-semibold">5. Payment Information</p>
          <div className="mt-1 grid grid-cols-2 gap-3">
            <div>
              <p className="font-semibold">Payment Method</p>
              <div className="mt-0.5 space-y-1">
                <div className="flex items-center gap-1">
                  <Check checked={r.payment_method === "cash"} />
                  <span>Cash</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check checked={r.payment_method === "bank_transfer"} />
                  <span>Bank Transfer</span>
                </div>
              </div>
            </div>
            <div>
              <Field label="Amount Paid" value={amountPaid} />
              <div className="mt-2">
                <Field label="Receipt Number" value={r.receipt_number} />
              </div>
              <div className="mt-2">
                <Field label="Bank / Branch (if applicable)" value={r.bank_branch} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-2 border-t border-slate-200 pt-2">
          <p className="font-semibold">6. Declaration</p>
          <p className="mt-1 text-slate-800">
            I hereby declare that the above information is true and correct. I
            understand that any false information may result in the cancellation
            of my enrollment.
          </p>
          {r.applicant_signed && (
            <p className="mt-1 text-[10px] text-slate-600">
              Applicant confirmed electronically
              {r.applicant_signed_at
                ? ` on ${new Date(r.applicant_signed_at).toLocaleString("en-LK")}`
                : ""}
              .
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-slate-700">Signature of Applicant</p>
              
              <div className="mt-4 border-b border-slate-400" />
            </div>
            <div>
              <p className="text-slate-700">Date</p>
              <div className="mt-4 border-b border-slate-400" />
            </div>
          </div>
        </section>

        <section className="mt-4 border-t border-dashed border-slate-400 pt-3">
          <p className="font-semibold">Payment Receipt (Student Copy)</p>
          <p className="mb-2 text-[10px] text-slate-500">
            Cut along the dotted line and keep this receipt.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Field label="Name" value={r.full_name} />
              <div className="mt-2">
                <Field
                  label="Programme"
                  value={labelProgrammeName(r.programme_name)}
                />
              </div>
              
              <div className="mt-2">
                <Field label="Amount Paid" value={amountPaid} />
              </div>
            </div>
            <div>
              <Field label="Receipt Number" value={r.receipt_number} />
              <div className="mt-2">
                <Field label="Bank / Branch" value={r.bank_branch} />
              </div>
              <div className="mt-2">
                <p className="font-semibold">Received By</p>
                <div className="mt-0.5 min-h-[16px] border-b border-slate-300" />
              </div>
            </div>
          </div>
          {r.bank_receipt_base64 && (
            <div className="mt-3">
              <p className="mb-1 font-semibold">Bank Receipt Image</p>
              <div className="flex items-center justify-center rounded border border-slate-300 bg-slate-50 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.bank_receipt_base64}
                  alt="Bank receipt"
                  className="max-h-40 w-auto object-contain"
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
