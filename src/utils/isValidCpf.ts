export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // rejeita 111.111.111-11 etc.

  const calcCheckDigit = (base: string, factor: number) => {
    let sum = 0;
    for (const digit of base) {
      sum += Number(digit) * factor--;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const digit1 = calcCheckDigit(digits.slice(0, 9), 10);
  const digit2 = calcCheckDigit(digits.slice(0, 10), 11);

  return digit1 === Number(digits[9]) && digit2 === Number(digits[10]);
}