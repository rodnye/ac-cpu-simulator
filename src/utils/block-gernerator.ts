export function generarCadenasUnicas(cantidad: number): string[] {
  const caracteres = "ABCDEF0123456789";
  const longitudTag = 2;
  const longitudCadena = 6;
  const conjunto = new Set<string>();
  const conjuntoTags = new Set<string>();

  while (conjuntoTags.size < cantidad) {
    let tag = "";
    let cadena = "";
    for (let i = 0; i < longitudTag; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      tag += caracteres[indice];
    }
    conjuntoTags.add(tag);

    for (let i = 0; i < longitudCadena; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      cadena += caracteres[indice];
    }

    conjunto.add(tag + cadena);
  }

  return Array.from(conjunto);
}
