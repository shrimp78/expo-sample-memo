/**
 * Annivから経過年数と単位を計算して返す関数
 * @param annivDate Anniv
 * @returns { number: number; unit: string } 年数と単位
 */
export function changeAnnivFormat(anniv: Date): { number: number; unit: string } {
  let years = 0;
  let months = 0;
  let returnNumber = 0;

  // 経過年数を計算
  const now = new Date();
  years = now.getFullYear() - anniv.getFullYear();
  const hasHadAnnivThisYear =
    now.getMonth() > anniv.getMonth() ||
    (now.getMonth() === anniv.getMonth() && now.getDate() >= anniv.getDate());

  if (!hasHadAnnivThisYear) {
    years -= 1;
  }

  // 経過年が0の場合は、経過月数を計算
  if (years === 0) {
    const totalMonthsDiff = 12 + (now.getMonth() - anniv.getMonth());
    months = totalMonthsDiff - (now.getDate() < anniv.getDate() ? 1 : 0);
  }
  returnNumber = years === 0 ? months : years;

  // 単位を計算
  let unit = '';
  if (years === 0) {
    unit = 'months';
  } else if (years === 1) {
    unit = 'year';
  } else {
    unit = 'years';
  }

  return { number: returnNumber, unit: unit };
}
