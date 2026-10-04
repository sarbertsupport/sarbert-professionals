/**
 * Tailwind class sets for support desk status / priority chips.
 * Status: open = red, terminal = green, middle states = amber/yellow.
 * Priority: urgent/high = red, normal = yellow, low = muted.
 */
export function supportStatusBadgeClass(status) {
  switch (String(status || '').toUpperCase()) {
    case 'OPEN':
      return 'bg-rose-100 text-rose-900 border-rose-300';
    case 'IN_PROGRESS':
      return 'bg-amber-100 text-amber-900 border-amber-400';
    case 'WAITING_CUSTOMER':
      return 'bg-yellow-100 text-yellow-950 border-yellow-400';
    case 'RESOLVED':
    case 'CLOSED':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

export function supportPriorityBadgeClass(priority) {
  switch (String(priority || '').toUpperCase()) {
    case 'URGENT':
    case 'CRITICAL':
      return 'bg-rose-100 text-rose-950 border-rose-400 font-semibold';
    case 'HIGH':
      return 'bg-red-100 text-red-900 border-red-300';
    case 'NORMAL':
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'LOW':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
