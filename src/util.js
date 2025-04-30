// 工具函数
export function parseDate(dateStr) {
    // 解析日期字符串为Date对象，格式为 yyyy-mm-dd
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// js月份0-11取值需+1，赋值需-1
export function formatDate(date) {
    // 格式化Date为 yyyy-mm-dd
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// js月份0-11取值需+1，赋值需-1
export function formatChineseMonthDate(date) {
    // 格式化Date为 yyyy-mm-dd
    const m = (date.getMonth() + 1).toString();
    const d = date.getDate().toString();
    return `${m}月${d}日`;
}

// js月份0-11取值需+1，赋值需-1
export function formatMonthDate(date) {
    // 格式化Date为 yyyy-mm-dd
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${m}-${d}`;
}

export function isWeekend(date) {
    const wd = date.getDay();
    return wd === 0 || wd === 6; // 周日0，周六6
}

export function max(a, b) {
    return a > b ? a : b;
}

export function newDate(y, m, d) {
    return new Date(y, m - 1, d)
}