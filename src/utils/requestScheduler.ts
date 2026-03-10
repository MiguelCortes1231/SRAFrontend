// src/utils/requestScheduler.ts
/**
 * ⏳ Request Scheduler
 * ---------------------------------------------------
 * Sirve para evitar que muchos GET salgan de golpe.
 *
 * ✅ Qué hace:
 * - Cola secuencial para GET
 * - Espera aleatoria entre requests
 * - Control de concurrencia
 *
 * 🎯 Caso de uso:
 * - imágenes protegidas
 * - detalles de agenda
 * - cualquier GET que pueda saturar backend
 */

type QueueTask<T> = {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  job: () => Promise<T>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class RequestScheduler {
  private queue: QueueTask<unknown>[] = [];
  private running = 0;

  // 🔧 Puedes cambiar esto si luego quieres 2 paralelas
  private readonly maxConcurrent = 1;

  // ⏱️ Delay aleatorio entre GETs
  private readonly minDelayMs = 1000;
  private readonly maxDelayMs = 2000;

  enqueue<T>(job: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        resolve,
        reject,
        job,
      });

      this.runNext();
    });
  }

  private async runNext() {
    if (this.running >= this.maxConcurrent) return;
    if (this.queue.length === 0) return;

    const item = this.queue.shift();
    if (!item) return;

    this.running += 1;

    try {
      // 💤 Espera aleatoria antes de disparar el GET
      const waitMs = randomBetween(this.minDelayMs, this.maxDelayMs);
      await sleep(waitMs);

      const result = await item.job();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.running -= 1;
      this.runNext();
    }
  }
}

// 🌍 Instancia global compartida
export const getRequestScheduler = new RequestScheduler();