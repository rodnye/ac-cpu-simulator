export function hexTo4BitBinary(string: string) {
  let ret: string = "";
  for (let char of string) {
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
