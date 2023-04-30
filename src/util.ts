export const getYYYYMMDD = (date:Date) => {
    return new Date(date.setHours(0)).toISOString().slice(0, 10).replaceAll('-', '')
}