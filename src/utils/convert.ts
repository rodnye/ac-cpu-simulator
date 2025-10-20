export function hexTo4BitBinary(string: string) {
  let ret: string = "";
  for (const char of string) {
    ret += auxHexTo4BitBinary(char);
  }
  return ret;
}

export function auxHexTo4BitBinary(hexChar: string): string {
  if (!/^[0-9A-Fa-f]$/.test(hexChar)) {
    throw new Error(
      "El carácter debe ser un dígito hexadecimal (0-9, A-F, a-f)",
    );
  }

  const decimalValue = parseInt(hexChar, 16);
  const binaryString = decimalValue.toString(2).padStart(4, "0");

  return binaryString;
}

export function binary4BitToHex(binaryString: string): string {
  if (binaryString.length % 4 !== 0) {
    throw new Error("La cadena binaria debe tener una longitud múltiplo de 4");
  }

  let ret: string = "";
  for (let i = 0; i < binaryString.length; i += 4) {
    const fourBits = binaryString.slice(i, i + 4);
    ret += auxBinary4BitToHex(fourBits);
  }
  return ret;
}

export function auxBinary4BitToHex(fourBits: string): string {
  if (!/^[01]{4}$/.test(fourBits)) {
    throw new Error("Cada grupo debe contener exactamente 4 bits (0 o 1)");
  }

  const decimalValue = parseInt(fourBits, 2);
  const hexChar = decimalValue.toString(16).toUpperCase();

  return hexChar;
}
