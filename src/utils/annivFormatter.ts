export default function annivFormatter(annivDate: Date): number {
  const date = new Date(annivDate);
  const now = new Date();

  let years = now.getFullYear() - date.getFullYear();
  const hasHadAnniversaryThisYear =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());

  if (!hasHadAnniversaryThisYear) {
    years -= 1;
  }

  return Math.max(0, years);
}
