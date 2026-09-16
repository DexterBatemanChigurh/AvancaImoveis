/** Campos "uma por linha" (textarea) chegam como texto; viram array aqui. */
export function linesFromForm(formData: FormData, name: string): string[] {
  return String(formData.get(name) ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
