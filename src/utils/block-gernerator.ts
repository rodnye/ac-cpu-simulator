export function generarCadenasUnicas(cantidad: number): string[] {
  const caracteres = "ABCDEF0123456789";
  const longitudCadena = 8;
  const conjunto = new Set<string>();

  while (conjunto.size < cantidad) {
    let cadena = "";

    for (let i = 0; i < longitudCadena; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      cadena += caracteres[indice];
    }
    conjunto.add(cadena);
  }

  return Array.from(conjunto);
}

export function generarTagsUnicos(cantidad: number): string[] {
  const caracteres = "ABCDEF0123456789";
  const longitudTag = 2;
  const conjuntoTags = new Set<string>();

  while (conjuntoTags.size < cantidad) {
    let tag = "";
    for (let i = 0; i < longitudTag; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      tag += caracteres[indice];
    }
    conjuntoTags.add(tag);
  }

  return Array.from(conjuntoTags);
}

export function generarCuerpos(cantidad: number): string[] {
  const caracteres = "ABCDEF0123456789";
  const longitud = 6;
  const arrayStrings: string[] = [];

  let i = 0;
  while (i < cantidad) {
    let cuerpo = "";
    for (let i = 0; i < longitud; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      cuerpo += caracteres[indice];
    }
    i++;
    arrayStrings.push(cuerpo);
  }

  return arrayStrings;
}
