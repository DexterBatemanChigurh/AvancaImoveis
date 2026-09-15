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
        defaultValue={defaultValue}
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
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: [string, string][];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-10 rounded-md border border-line bg-bg px-3"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
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
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        name={name}
        rows={4}
        defaultValue={defaultValue.join("\n")}
        className="rounded-md border border-line bg-bg px-3 py-2"
      />
    </label>
  );
}
