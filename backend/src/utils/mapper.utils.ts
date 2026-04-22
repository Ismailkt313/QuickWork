export const formatBudget = (budget: { min: number; max: number }): string => {
    if (!budget) return 'No budget specified';
    return `₹${budget.min} – ₹${budget.max}`;
};

export const getInitials = (name: string): string => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
};

export const getRelativeTime = (date: Date): string => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export const formatDate = (date: Date): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
};
