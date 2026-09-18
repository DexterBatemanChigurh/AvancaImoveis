import type { ChangeEvent, FocusEvent, ReactNode, Ref } from "react";

/**
 * Campos auxiliares de formulário do admin — compartilhados por
 * PropertyForm, OwnerForm e os formulários das próximas fases (Cliente,
 * Visita, Proposta...). Sem estado próprio, só marcação + estilo.
 */

export function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
      <legend className="px-1 font-mono text-xs uppercase tracking-wide text-muted">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-4 [&>*]:min-w-[8rem] [&>*]:flex-1">
      {children}
    </div>
  );
}

export function Text({
  name,
  label,
  type = "text",
  value,
  defaultValue,
  required,
  errors,
  hint,
  placeholder,
  inputRef,
  onChange,
  onBlur,
}: {
  name: string;
  label: string;
  type?: string;
  /**
   * Modo controlado — usa `value` + `onChange`. Preferível em qualquer
   * formulário que precise sobreviver a um retorno de Server Action sem
   * limpar os campos (ver PropertyForm): o React reseta os inputs NÃO
   * controlados de um <form action={...}> sempre que a action retorna, com
   * sucesso ou erro — só o valor controlado por estado escapa disso.
   */
  value?: string;
  /** Modo não controlado (legado) — mantido pros formulários que ainda usam esse padrão. */
  defaultValue?: string | number;
  required?: boolean;
  errors?: string[];
  /** Texto de status abaixo do campo (ex.: resultado da busca de CEP) — distinto de erro. */
  hint?: string;
  placeholder?: string;
  inputRef?: Ref<HTMLInputElement>;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}) {
  const valueProps =
    value !== undefined ? { value } : { defaultValue };
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <input
        ref={inputRef}
        name={name}
        type={type}
        step={type === "number" ? "any" : undefined}
        {...valueProps}
        required={required}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        className="h-10 rounded-md border border-line bg-bg px-3"
      />
      {errors ? (
        <span className="text-xs text-danger">{errors[0]}</span>
      ) : (
        hint && <span className="text-xs text-muted">{hint}</span>
      )}
    </label>
  );
}

export function Select({
  name,
  label,
  value,
  defaultValue,
  onChange,
  options,
}: {
  name: string;
  label: string;
  /** Modo controlado — ver comentário equivalente em `Text`. */
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: [string, string][];
}) {
  const valueProps =
    value !== undefined ? { value } : { defaultValue };
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        name={name}
        {...valueProps}
        onChange={onChange}
        className="h-10 rounded-md border border-line bg-bg px-3"
      >
        {options.map(([optValue, optLabel]) => (
          <option key={optValue} value={optValue}>
            {optLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Textarea "uma por linha". O Server Action separa por quebra de linha
 * (ver parseForm em features/properties/actions.ts).
 */
export function Lines({
  name,
  label,
  value,
  defaultValue,
  onChange,
}: {
  name: string;
  label: string;
  /** Modo controlado — já vem como texto (uma linha por item), ver `Text`. */
  value?: string;
  defaultValue?: string[];
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const valueProps =
    value !== undefined
      ? { value }
      : { defaultValue: (defaultValue ?? []).join("\n") };
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        name={name}
        rows={4}
        {...valueProps}
        onChange={onChange}
        className="rounded-md border border-line bg-bg px-3 py-2"
      />
    </label>
  );
}
