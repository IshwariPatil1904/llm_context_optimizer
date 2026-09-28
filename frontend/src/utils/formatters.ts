export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(val);
}

export function formatMs(ms: number): string {
  if (ms < 1.0) {
    return `${(ms * 1000).toFixed(0)} μs`;
  }
  return `${ms.toFixed(2)} ms`;
}

export function formatPercent(val: number): string {
  return `${val.toFixed(1)}%`;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(6)}`;
}
