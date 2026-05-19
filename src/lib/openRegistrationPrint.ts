export function openRegistrationPrint(registrationId: number) {
  const url = `/admin/print?id=${registrationId}`;
  const printWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (!printWindow) {
    window.alert(
      "Please allow pop-ups for this site to print or save registrations as PDF."
    );
  }
}
