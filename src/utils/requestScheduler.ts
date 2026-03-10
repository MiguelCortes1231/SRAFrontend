// src/utils/requestScheduler.ts
/**
 * ⏳ Cola global para GET
 * ---------------------------------------------------
 * Evita que salgan muchos GET al mismo tiempo.
 *
 * ✅ maxConcurrent = 1
 * ✅ delay aleatorio entre requests
 */

type QueueTask<T> = {
  job: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
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

  // 🔥 1 sola request GET a la vez
  private readonly maxConcurrent = 1;

  // ⏱️ espera aleatoria entre 1000 y 2000 ms
  private readonly minDelayMs = 200;
  private readonly maxDelayMs = 500;

  enqueue<T>(job: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ job, resolve, reject });
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

export const getRequestScheduler = new RequestScheduler();