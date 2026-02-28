export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Food: '#f97316',
    Transport: '#3b82f6',
    Entertainment: '#a855f7',
    Shopping: '#ec4899',
    Health: '#10b981',
    Bills: '#6366f1',
    Education: '#14b8a6',
    Default: '#64748b',
    Other: '#78716c',
  };
  return colors[category] || '#64748b';
}

export function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    Food: '🍕',
    Transport: '🚗',
    Entertainment: '🎬',
    Shopping: '🛍️',
    Health: '💊',
    Bills: '📄',
    Education: '📚',
    Default: '📌',
    Other: '📦',
  };
  return emojis[category] || '📦';
}
