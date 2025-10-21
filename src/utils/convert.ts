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

export function hexTo4BitBinary(string: string): string {
  let ret: string = "";
  for (const char of string) {
    ret += convertionHash[char];
  }
  return ret;
}

export function binary4BitToHex(binaryString: string): string {
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

  return ret;
}

export function randomBinaryChar(cantidad: number) {
  const str = "01";
  let result = "";
  for (let i = 0; i < cantidad; i++) {
    result += str.charAt(randomInt(0, 2));
  }

  return result;
}

export function randomHexChar(cantidad: number) {
  const string: string = "ABCDEF0123456789";
  let resultado = "";

  for (let i = 0; i < cantidad; i++) {
    resultado += string[randomInt(0, 15)];
  }

  return resultado;
}

export function parseHexAddress(direccionHex: string): {
  bin: string;
  tag: string;
  line: string;
  word: string;
} {
  const bin = hexTo4BitBinary(direccionHex);
  return {
    bin,
    tag: bin.substring(0, 8),
    line: bin.substring(8, 22),
    word: bin.substring(22, 24),
  };
}

export function parseHexAssociativeAddress(direccionHex: string): {
  tag: string;
  word: string;
} {
  const bin = hexTo4BitBinary(direccionHex);
  return {
    tag: bin.substring(0, 22),
    word: bin.substring(22, 24),
  };
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
