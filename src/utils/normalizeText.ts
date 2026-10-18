/** Normaliza textos de pesquisa sem diferenciar acentos ou maiúsculas. */
export function normalizeText(text: string): string {
  return text.trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}
