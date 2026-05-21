const MY_RAW = `Bih17,Bih18,Cze11,Cze7,Kor11,Kor16,Kor20,Kor7,Kor3,Rsa3,Fwc00,
Mex18,Fwc10,Qat11,Qat1,Qat14,Qat16,Qat18,Sui9,Sui18,Sui14,Mar13,
Ger1,Ned3,Ned11,Ned7,Ned20,Ned16,Jpn13,Jpn5,Tun3,Tun7,Bel9,Bel5,
Cpv3,Cpv16,Ksa13,Ksa9,Ksa5,Uru20,Uru16,Nor5,Nor9,Nor18,Nor14,
Alg10,Alg6,Alg2,Alg15,Aut1,Aut11,Aut16,Aut20,Por14,Por18,Por9,
Cod3,Uzb1,Col14,Col5,Col18,Col9,Gha13,Gha14,Gha18,Pan13,Egy11,
Cpv7,Cpv11,Nzl3,Nzl7,Uzb8,Bih1,Cze20,Cze16,Cze3,Fwc13,Fwc16,
Fwc19,Fwc11,Fwc10,Uzb10,Uzb6,Uzb9,Uzb3,Uzb15,Uzb11,Cod14,Cod12,
Cod9,Alg13,Arg13,Nor13,Irq11,Irq10,Irq14,Sen9,Sen2,Sen3,Fra13,
Uru11,Uru19,Uru16,Uru3,Cpv13,Nzl13,Swe7,Tun14,Tun9,Tun17,Swe19,
Swe15,Swe14,Swe20,Swe3,Swe1,Swe17,Tur1,Par13,Civ13,Cuw13,Ger13,
Tur9,Tur5,Tur16,Tur12,Tur2,Usa15,Usa16,Usa19,Sui20,Bih15,Bih10,
Cze6,Rsa12,Rsa18,Mex13,Kor13,Fwc6,Can13,Usa5`;

export function parseMyCodes(raw) {
  const tokens = raw
    .replace(/\n/g, ",")
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
  const countMap = {};
  tokens.forEach((tok) => {
    countMap[tok] = (countMap[tok] || 0) + 1;
  });
  return countMap;
}

export const MY_COUNT = parseMyCodes(MY_RAW);
export const MY_CODES = new Set(Object.keys(MY_COUNT));
