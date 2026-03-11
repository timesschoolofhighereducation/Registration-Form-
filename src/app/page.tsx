import { RegistrationForm } from "@/components/RegistrationForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-5xl">
        <RegistrationForm />
      </main>
    </div>
  );
}
