export type Bin = string & { readonly _brand: unique symbol };
export type Hex = string & { readonly _brand: unique symbol };

const convertionHash: Record<string, string> = {
  "0": "0000",
  "1": "0001",
  "2": "0010",
  "3": "0011",
  "4": "0100",
  "5": "0101",
  "6": "0110",
  "7": "0111",
  "8": "1000",
  "9": "1001",
  A: "1010",
  B: "1011",
  C: "1100",
  D: "1101",
  E: "1110",
  F: "1111",
};

const reverseConvertionHash: Record<string, string> = {
  "0000": "0",
  "0001": "1",
  "0010": "2",
  "0011": "3",
  "0100": "4",
  "0101": "5",
  "0110": "6",
  "0111": "7",
  "1000": "8",
  "1001": "9",
  "1010": "A",
  "1011": "B",
  "1100": "C",
  "1101": "D",
  "1110": "E",
  "1111": "F",
};

export function hexTo4BitBinary(hex: Hex): Bin {
  let ret = "";
  for (const char of hex) {
    ret += convertionHash[char];
  }
  return ret as Bin;
}

export function binary4BitToHex(binaryString: Bin): Hex {
  // Verificar que la longitud sea múltiplo de 4
  if (binaryString.length % 4 !== 0) {
    throw new Error("La cadena binaria debe tener una longitud múltiplo de 4");
  }

  let ret: string = "";

  // Crear un hash inverso para la conversión
  const reverseHash: { [key: string]: string } = {};
  for (const [hex, binary] of Object.entries(convertionHash)) {
    reverseHash[binary] = hex;
  }

  // Procesar la cadena en grupos de 4 bits
  for (let i = 0; i < binaryString.length; i += 4) {
    const chunk = binaryString.substring(i, i + 4);

    if (!reverseHash[chunk]) {
      throw new Error(`Grupo binario inválido: ${chunk}`);
    }

    ret += reverseHash[chunk];
  }

  return ret as Hex;
}

export function randomBinaryChar(len: number): Bin {
  const str = "01";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += str.charAt(randomInt(0, 2));
  }

  return result as Bin;
}

export function randomHexChar(len: number): Hex {
  const string: string = "ABCDEF0123456789";
  let resultado = "";

  for (let i = 0; i < len; i++) {
    resultado += string[randomInt(0, 15)];
  }

  return resultado as Hex;
}

export function parseHexAddress(hexAddress: Hex) {
  const bin = hexTo4BitBinary(hexAddress);
  return {
    bin,
    tag: bin.substring(0, 8) as Bin,
    line: bin.substring(8, 22) as Bin,
    word: bin.substring(22, 24) as Bin,
  };
}

export function parseHexAssociativeAddress(hexAddress: Hex) {
  const bin = hexTo4BitBinary(hexAddress);
  return {
    tag: bin.substring(0, 22) as Bin,
    word: bin.substring(22, 24) as Bin,
  };
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const hexToBin = (hex: Hex) =>
  parseInt(hex.toLowerCase().padStart(1, "0"), 16).toString(2) as Bin;
export const binToHex = (bin: Bin) =>
  parseInt(bin.padStart(1, "0"), 2).toString(16).toUpperCase() as Hex;
