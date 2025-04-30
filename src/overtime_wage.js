import { formatDate, newDate, isWeekend, parseDate, max } from "./util";

const tripleDateMap = new Map();
const cycleDay = 4;
const actualHourPerDay = 12;
const normalHourPerDay = 8;
const tripleDates = ["2025-01-01", "2025-01-28", "2025-01-29", "2025-01-30", "2025-01-31", "2025-04-04", "2025-05-01", "2025-05-02", "2025-05-31", "2025-10-01", "2025-10-02", "2025-10-03", "2025-10-06",
    "2024-01-01", "2024-02-10", "2024-02-11", "2024-02-12", "2024-04-04", "2024-05-01", "2024-06-10", "2024-09-17", "2024-10-01", "2024-10-02", "2024-10-03"
]
let monthWorkDayMap = new Map();

// 计算周期数
function getCycleNumber(firstWorkDay, date) {
    if (firstWorkDay < date) {
        const diffDays = Math.floor((date - firstWorkDay) / (24 * 3600 * 1000));
        return diffDays % cycleDay;
    } else {
        const diffDays = Math.floor((firstWorkDay - date) / (24 * 3600 * 1000));
        return (cycleDay - (diffDays % cycleDay));
    }
}


// 计算小时处理器类
class CalculateHourHandler {
    constructor(cycleNumber) {
        this.tripleHour = 0;
        this.noneTripleHour = 0;
        this.actualWorkDay = 0;
        this.cycleNumber = cycleNumber;
    }
    handle(date) {
        const cycleMod = this.cycleNumber % cycleDay;
        const dateStr = formatDate(date);
        switch (cycleMod) {
            case 0:
                this.actualWorkDay++;
                if (tripleDateMap.get(dateStr)) {
                    this.tripleHour += actualHourPerDay;
                } else {
                    this.noneTripleHour += actualHourPerDay;
                }
                break;
            case 1:
                this.actualWorkDay++;
                if (tripleDateMap.get(dateStr)) {
                    this.tripleHour += 4;
                    this.noneTripleHour += 8;
                } else {
                    this.noneTripleHour += actualHourPerDay;
                }
                break;
            case 2:
                if (tripleDateMap.get(dateStr)) {
                    this.tripleHour += 8;
                    this.noneTripleHour -= 8;
                }
                break;
        }
        this.cycleNumber++;
    }
}

export function calculateYearWorkDay(year, holidayDates) {

    let yearFirstDate = newDate(year, 1, 1)
    let yearLastDate = newDate(year, 12, 31)
    // 初始化工作日计数
    monthWorkDayMap.clear();

    // 计算节假日对工作日的影响
    if (holidayDates === undefined) {
        return
    }
    for (const d of holidayDates.dates) {
        const dTime = parseDate(d.date);
        const m = dTime.getMonth() + 1;
        if (!monthWorkDayMap.has(m)) monthWorkDayMap.set(m, 0);

        if (d.type === 'public_holiday' && !isWeekend(dTime)) {
            monthWorkDayMap.set(m, monthWorkDayMap.get(m) - 1);
        }
        if (d.type === 'transfer_workday' && isWeekend(dTime)) {
            monthWorkDayMap.set(m, monthWorkDayMap.get(m) + 1);
        }
    }

    // 计算每个月的工作日
    for (let d = new Date(yearFirstDate); d <= yearLastDate; d.setDate(d.getDate() + 1)) {
        const wd = d.getDay();
        if (wd >= 1 && wd <= 5) { // 周一到周五
            const m = d.getMonth() + 1;
            monthWorkDayMap.set(m, (monthWorkDayMap.get(m) || 0) + 1);
        }
    }
}


export function calculateMonthSalary(year, month, firstWorkDay, salaryPerHour) {
    if (monthWorkDayMap.size == 0) { // 未获取到月工作日，直接返回
        return
    }
    tripleDates.forEach(d => {
        tripleDateMap.set(d, true);
    });

    let noneTripleBegin = newDate(year, month - 1, 1);
    let noneTripleEnd = newDate(year, month, 0);
    let tripleBegin = newDate(year, month - 1, 15);
    let tripleEnd = newDate(year, month, 15);
    if (month == 1) {
        tripleBegin = newDate(year, month, 1);
    }
    if (month == 12) {
        tripleEnd = newDate(year, month, 31);
        noneTripleEnd = new Date(tripleEnd);
    }

    // 计算3倍工资工作小时 改成前开后闭
    const tripleHandler = new CalculateHourHandler(getCycleNumber(firstWorkDay, tripleBegin));
    for (let d = new Date(tripleBegin); d < tripleEnd; d.setDate(d.getDate() + 1)) {
        tripleHandler.handle(new Date(d));
    }
    let noneTripleHandler = new CalculateHourHandler(getCycleNumber(firstWorkDay, noneTripleBegin));
    // 计算非3倍工资工作小时
    if (month != 1) {
        for (let d = new Date(noneTripleBegin); d <= noneTripleEnd; d.setDate(d.getDate() + 1)) {
            noneTripleHandler.handle(new Date(d));
        }
    }

    let result = {};
    result.tripleHour = tripleHandler.tripleHour;
    result.normalWorkDay = monthWorkDayMap.get(month - 1) || 0;
    if (month == 12) {
        result.normalWorkDay = result.normalWorkDay + monthWorkDayMap.get(month) || 0;
    }

    result.actualWorkDay = noneTripleHandler.actualWorkDay
    result.actualWorkHour = noneTripleHandler.noneTripleHour
    result.normalWorkHour = result.normalWorkDay * normalHourPerDay;
    result.onePointFiveSalary = max((noneTripleHandler.noneTripleHour - result.normalWorkHour) * salaryPerHour * 1.5, 0);
    result.onePointFiveHour = max(noneTripleHandler.noneTripleHour - result.normalWorkHour, 0);
    result.tripleSalary = result.tripleHour * salaryPerHour * 3;

    result.tripleBeginMonth = tripleBegin.getMonth() + 1;
    result.tripleBeginDay = tripleBegin.getDate();
    result.tripleEndMonth = tripleEnd.getMonth() + 1;
    result.tripleEndDay = tripleEnd.getDate();
    result.noneTripleBeginMonth = noneTripleBegin.getMonth() + 1;
    result.noneTripleBeginDay = noneTripleBegin.getDate();
    result.noneTripleEndMonth = noneTripleEnd.getMonth() + 1;
    result.noneTripleEndDay = noneTripleEnd.getDate();
    result.month = month

    return result
}