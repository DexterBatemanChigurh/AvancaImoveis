/**
 * Formato padrão de retorno de Server Action usada por useActionState —
 * repetido em vários domínios (properties, leads, alerts...). Novos domínios
 * devem importar daqui em vez de redeclarar o mesmo shape.
 */
export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
