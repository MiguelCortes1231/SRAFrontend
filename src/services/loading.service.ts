// src/services/loading.service.ts
/**
 * ⏳ Loading Service global
 * ---------------------------------------------------
 * Controla un loader fullscreen tipo ngx-spinner.
 *
 * ✅ Usa contador interno
 * ✅ Permite múltiples requests al mismo tiempo
 * ✅ Se oculta solo cuando todas terminan
 */

type Listener = (isVisible: boolean) => void;

class LoadingService {
  private activeRequests = 0;
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.activeRequests > 0);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const visible = this.activeRequests > 0;
    this.listeners.forEach((listener) => listener(visible));
  }

  show() {
    this.activeRequests += 1;
    this.notify();
  }

  hide() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.notify();
  }

  reset() {
    this.activeRequests = 0;
    this.notify();
  }
}

export const loadingService = new LoadingService();