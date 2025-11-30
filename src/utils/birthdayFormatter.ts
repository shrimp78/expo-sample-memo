/**
 * 生年月日から経過年数または月数を計算して返す関数
 * @param birthdayDate Date
 * @returns { number: number; unit: string } 年数と単位
 */
export function changeBirthdayFormat(birthdayDate: Date): { number: number; unit: string } {
  let years = 0;
  let months = 0;
  let returnNumber = 0;

  // 経過年数を計算
  const now = new Date();
  years = now.getFullYear() - birthdayDate.getFullYear();
  const hasBirthdayThisYear =
    now.getMonth() > birthdayDate.getMonth() ||
    (now.getMonth() === birthdayDate.getMonth() && now.getDate() >= birthdayDate.getDate());

  if (!hasBirthdayThisYear) {
    years -= 1;
  }

  // 経過年が0の場合は、経過月数を計算
  if (years === 0) {
    const totalMonthsDiff =
      (now.getFullYear() - birthdayDate.getFullYear()) * 12 +
      (now.getMonth() - birthdayDate.getMonth());
    months = totalMonthsDiff - (now.getDate() < birthdayDate.getDate() ? 1 : 0);
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
