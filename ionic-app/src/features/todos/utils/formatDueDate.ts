const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatDueDate = (timestamp: number) => {
    const due = new Date(timestamp);
    const now = new Date();
    const today = startOfDay(now);
    const dueDay = startOfDay(due);
    const dayDifference = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDifference === 0) return 'Today';
    if (dayDifference === 1) return 'Tomorrow';
    if (dayDifference === -1) return 'Yesterday';
    if (dayDifference < -1) return 'Overdue';
    if (dayDifference < 7) return `${weekdayLabels[due.getDay()]}`;

    return due.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
    });
};
