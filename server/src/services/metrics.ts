interface MetricRecord {
  count: number;
  totalDuration: number;
  errors: number;
  lastUpdated: Date;
}

class MetricsService {
  private static store: Map<string, MetricRecord> = new Map();
  private static cleanupInterval = 3600000; // 1 hour

  static {
    setInterval(() => this.cleanupOldMetrics(), this.cleanupInterval);
  }

  static startRequest(operation: string) {
    if (!this.store.has(operation)) {
      this.store.set(operation, {
        count: 0,
        totalDuration: 0,
        errors: 0,
        lastUpdated: new Date()
      });
    }
  }

  static endRequest(
    operation: string, 
    status: 'success' | 'error', 
    duration: number,
    error?: Error
  ) {
    const metric = this.store.get(operation);
    if (!metric) return;

    metric.count++;
    metric.totalDuration += duration;
    if (status === 'error') metric.errors++;
    metric.lastUpdated = new Date();
  }

  static getMetrics() {
    return Array.from(this.store.entries()).map(([operation, data]) => ({
      operation,
      ...data,
      avgDuration: data.count > 0 ? data.totalDuration / data.count : 0,
      errorRate: data.count > 0 ? (data.errors / data.count) * 100 : 0
    }));
  }

  private static cleanupOldMetrics() {
    const cutoff = new Date(Date.now() - 86400000); // 24 hours
    for (const [op, metric] of this.store.entries()) {
      if (metric.lastUpdated < cutoff) {
        this.store.delete(op);
      }
    }
  }
}

export default MetricsService;