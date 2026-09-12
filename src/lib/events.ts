import { EventEmitter } from "node:events";

/**
 * Barramento de eventos em memória — avisa abas abertas do site público
 * quando algo muda no admin, pra atualizarem sozinhas (ver /api/events e
 * components/public/live-refresh.tsx).
 *
 * Só funciona porque a app roda como processo único (um VPS, `next start`).
 * Se um dia rodar em várias instâncias, precisa trocar isso por algo
 * compartilhado (Redis pub/sub, por exemplo).
 */
const globalForEvents = globalThis as unknown as { _propertyEvents?: EventEmitter };

export const propertyEvents = globalForEvents._propertyEvents ?? new EventEmitter();
propertyEvents.setMaxListeners(0);
globalForEvents._propertyEvents = propertyEvents;

/** Chame depois de qualquer alteração que deva refletir no site público. */
export function emitCatalogChanged() {
  propertyEvents.emit("changed");
}
