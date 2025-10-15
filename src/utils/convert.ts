export function hexTo4BitBinary(hexChar: string): string {
  // Validar que sea un solo carácter hexadecimal
  if (!/^[0-9A-Fa-f]$/.test(hexChar)) {
    throw new Error(
      "El carácter debe ser un dígito hexadecimal (0-9, A-F, a-f)",
    );
  }

  // Convertir a número y luego a binario
  const decimalValue = parseInt(hexChar, 16);

  // Convertir a binario y rellenar con ceros a la izquierda para tener 4 bits
  const binaryString = decimalValue.toString(2).padStart(4, "0");

  return binaryString;
}
