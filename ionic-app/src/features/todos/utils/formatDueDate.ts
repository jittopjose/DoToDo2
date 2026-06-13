const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const hasTime = (date: Date) => date.getHours() !== 0 || date.getMinutes() !== 0;

const formatTime = (date: Date) => date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
});

export const formatDueDate = (timestamp: number) => {
    const due = new Date(timestamp);
    const now = new Date();
    const today = startOfDay(now);
    const dueDay = startOfDay(due);
    const dayDifference = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const timeSuffix = hasTime(due) ? `, ${formatTime(due)}` : '';

    if (dayDifference === 0) return `Today${timeSuffix}`;
    if (dayDifference === 1) return `Tomorrow${timeSuffix}`;
    if (dayDifference === -1) return `Yesterday${timeSuffix}`;
    if (dayDifference < -1) return `Overdue${timeSuffix}`;
    if (dayDifference < 7) return `${weekdayLabels[due.getDay()]}${timeSuffix}`;

    return due.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
    });
};
