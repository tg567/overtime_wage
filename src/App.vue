<script setup>
import { reactive, ref, watch, onBeforeUnmount } from "vue";
import { debounce } from 'lodash-es'
import { calculateMonthSalary, calculateYearWorkDay } from "./overtime_wage";
import { parseDate } from "./util";
import { getOnlineHolidayData } from "./http";
import { useParamStore } from "./stores/param";

const yearJSONs = [
    `{"year":2025,"region":"CN","dates":[{"date":"2025-01-01","name":"元旦","name_cn":"元旦","name_en":"NewYear'sDay","type":"public_holiday"},{"date":"2025-01-26","name":"春节补班","name_cn":"春节补班","name_en":"SpringFestivalWorkday","type":"transfer_workday"},{"date":"2025-01-28","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2025-01-29","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2025-01-30","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2025-01-31","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2025-02-01","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2025-02-02","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2025-02-03","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2025-02-04","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2025-02-08","name":"春节补班","name_cn":"春节补班","name_en":"SpringFestivalWorkday","type":"transfer_workday"},{"date":"2025-04-04","name":"清明节","name_cn":"清明节","name_en":"Tomb-SweepingDay","type":"public_holiday"},{"date":"2025-04-05","name":"清明节","name_cn":"清明节","name_en":"Tomb-SweepingDay","type":"public_holiday"},{"date":"2025-04-06","name":"清明节","name_cn":"清明节","name_en":"Tomb-SweepingDay","type":"public_holiday"},{"date":"2025-04-27","name":"劳动节补班","name_cn":"劳动节补班","name_en":"LaborDayWorkday","type":"transfer_workday"},{"date":"2025-05-01","name":"劳动节","name_cn":"劳动节","name_en":"LaborDay","type":"public_holiday"},{"date":"2025-05-02","name":"劳动节","name_cn":"劳动节","name_en":"LaborDay","type":"public_holiday"},{"date":"2025-05-03","name":"劳动节","name_cn":"劳动节","name_en":"LaborDay","type":"public_holiday"},{"date":"2025-05-04","name":"劳动节","name_cn":"劳动节","name_en":"LaborDay","type":"public_holiday"},{"date":"2025-05-05","name":"劳动节","name_cn":"劳动节","name_en":"LaborDay","type":"public_holiday"},{"date":"2025-05-31","name":"端午节","name_cn":"端午节","name_en":"DragonBoatFestival","type":"public_holiday"},{"date":"2025-06-01","name":"端午节","name_cn":"端午节","name_en":"DragonBoatFestival","type":"public_holiday"},{"date":"2025-06-02","name":"端午节","name_cn":"端午节","name_en":"DragonBoatFestival","type":"public_holiday"},{"date":"2025-09-28","name":"国庆节补班","name_cn":"国庆节补班","name_en":"NationalDayWorkday","type":"transfer_workday"},{"date":"2025-10-01","name":"国庆节、中秋节","name_cn":"国庆节、中秋节","name_en":"NationalDay&Mid-AutumnFestival","type":"public_holiday"},{"date":"2025-10-02","name":"国庆节、中秋节","name_cn":"国庆节、中秋节","name_en":"NationalDay&Mid-AutumnFestival","type":"public_holiday"},{"date":"2025-10-03","name":"国庆节、中秋节","name_cn":"国庆节、中秋节","name_en":"NationalDay&Mid-AutumnFestival","type":"public_holiday"},{"date":"2025-10-04","name":"国庆节、中秋节","name_cn":"国庆节、中秋节","name_en":"NationalDay&Mid-AutumnFestival","type":"public_holiday"},{"date":"2025-10-05","name":"国庆节、中秋节","name_cn":"国庆节、中秋节","name_en":"NationalDay&Mid-AutumnFestival","type":"public_holiday"},{"date":"2025-10-06","name":"国庆节、中秋节","name_cn":"国庆节、中秋节","name_en":"NationalDay&Mid-AutumnFestival","type":"public_holiday"},{"date":"2025-10-07","name":"国庆节、中秋节","name_cn":"国庆节、中秋节","name_en":"NationalDay&Mid-AutumnFestival","type":"public_holiday"},{"date":"2025-10-08","name":"国庆节、中秋节","name_cn":"国庆节、中秋节","name_en":"NationalDay&Mid-AutumnFestival","type":"public_holiday"},{"date":"2025-10-11","name":"国庆节补班","name_cn":"国庆节补班","name_en":"NationalDayWorkday","type":"transfer_workday"}]}`,
    `{"year":2024,"region":"CN","dates":[{"date":"2024-01-01","name":"元旦","name_cn":"元旦","name_en":"NewYear'sDay","type":"public_holiday"},{"date":"2024-02-04","name":"春节补班","name_cn":"春节补班","name_en":"SpringFestivalWorkday","type":"transfer_workday"},{"date":"2024-02-10","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2024-02-11","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2024-02-12","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2024-02-13","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2024-02-14","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2024-02-15","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2024-02-16","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2024-02-17","name":"春节","name_cn":"春节","name_en":"ChineseNewYear","type":"public_holiday"},{"date":"2024-02-18","name":"春节补班","name_cn":"春节补班","name_en":"SpringFestivalWorkday","type":"transfer_workday"},{"date":"2024-04-04","name":"清明节","name_cn":"清明节","name_en":"Tomb-SweepingDay","type":"public_holiday"},{"date":"2024-04-05","name":"清明节","name_cn":"清明节","name_en":"Tomb-SweepingDay","type":"public_holiday"},{"date":"2024-04-06","name":"清明节","name_cn":"清明节","name_en":"Tomb-SweepingDay","type":"public_holiday"},{"date":"2024-04-07","name":"清明节补班","name_cn":"清明节补班","name_en":"Tomb-SweepingDayWorkday","type":"transfer_workday"},{"date":"2024-04-28","name":"劳动节补班","name_cn":"劳动节补班","name_en":"LaborDayWorkday","type":"transfer_workday"},{"date":"2024-05-01","name":"劳动节","name_cn":"劳动节","name_en":"LaborDay","type":"public_holiday"},{"date":"2024-05-02","name":"劳动节","name_cn":"劳动节","name_en":"LaborDay","type":"public_holiday"},{"date":"2024-05-03","name":"劳动节","name_cn":"劳动节","name_en":"LaborDay","type":"public_holiday"},{"date":"2024-05-04","name":"劳动节","name_cn":"劳动节","name_en":"LaborDay","type":"public_holiday"},{"date":"2024-05-05","name":"劳动节","name_cn":"劳动节","name_en":"LaborDay","type":"public_holiday"},{"date":"2024-05-11","name":"劳动节补班","name_cn":"劳动节补班","name_en":"LaborDayWorkday","type":"transfer_workday"},{"date":"2024-06-10","name":"端午节","name_cn":"端午节","name_en":"DragonBoatFestival","type":"public_holiday"},{"date":"2024-09-14","name":"中秋节补班","name_cn":"中秋节补班","name_en":"Mid-AutumnFestivalWorkday","type":"transfer_workday"},{"date":"2024-09-15","name":"中秋节","name_cn":"中秋节","name_en":"Mid-AutumnFestival","type":"public_holiday"},{"date":"2024-09-16","name":"中秋节","name_cn":"中秋节","name_en":"Mid-AutumnFestival","type":"public_holiday"},{"date":"2024-09-17","name":"中秋节","name_cn":"中秋节","name_en":"Mid-AutumnFestival","type":"public_holiday"},{"date":"2024-09-29","name":"国庆节补班","name_cn":"国庆节补班","name_en":"NationalDayWorkday","type":"transfer_workday"},{"date":"2024-10-01","name":"国庆节","name_cn":"国庆节","name_en":"NationalDay","type":"public_holiday"},{"date":"2024-10-02","name":"国庆节","name_cn":"国庆节","name_en":"NationalDay","type":"public_holiday"},{"date":"2024-10-03","name":"国庆节","name_cn":"国庆节","name_en":"NationalDay","type":"public_holiday"},{"date":"2024-10-04","name":"国庆节","name_cn":"国庆节","name_en":"NationalDay","type":"public_holiday"},{"date":"2024-10-05","name":"国庆节","name_cn":"国庆节","name_en":"NationalDay","type":"public_holiday"},{"date":"2024-10-06","name":"国庆节","name_cn":"国庆节","name_en":"NationalDay","type":"public_holiday"},{"date":"2024-10-07","name":"国庆节","name_cn":"国庆节","name_en":"NationalDay","type":"public_holiday"},{"date":"2024-10-12","name":"国庆节补班","name_cn":"国庆节补班","name_en":"NationalDayWorkday","type":"transfer_workday"}]}`
]

const param = useParamStore().param
const birth = useParamStore().birth

// 全局变量
let years = [];
let currentTime = new Date();
let maxYear = 2025;
if (currentTime.getFullYear() >= 2025) {
    maxYear = currentTime.getFullYear() + 1
}
const tempBirthday = ref('')
for (let i = 2024; i <= maxYear; i++) {
    years.push(i);
}
let holidayDates = {};
let timer;

const monthDetailMap = reactive(new Map())
for (let i = 1; i <= 12; i++) {
    monthDetailMap.set(i, false)
}

let yearJSONMap = new Map();
yearJSONs.forEach(yearJSON => {
    let data = JSON.parse(yearJSON);
    yearJSONMap.set(data.year, data)
});
// 响应式数据声明
const results = reactive([])
const yearOnePointFive = ref(0)
const yearTriple = ref(0)
let retire = reactive({
    retireDate: '',
    day: 0,
    hour: 0,
    minute: 0,
    second: 0
})


// 防抖函数初始化
const debouncedCalculate = debounce(calculate, 200)
// 防抖函数初始化
const debouncedCalculateRetire = debounce(calculateRetire, 200)

// 生命周期管理
onBeforeUnmount(() => {
    debouncedCalculate.cancel()
})

watch(param, () => {
    param.year = Number(param.year)
    debouncedCalculate() // 触发防抖计算
})

let birthChange = true
watch(birth, () => {
    if (birthChange) {
        birth.gender = Number(birth.gender)
        debouncedCalculateRetire()
    }
})

watch(tempBirthday, () => {
    birthChange = false
    birth.birthday = tempBirthday.value
    birthChange = true
    debouncedCalculateRetire()
})

// 计算逻辑优化
async function calculate() {
    try {
        await holidayChange()

        const tempResults = []
        let temp1 = 0, temp2 = 0

        // 清空原有结果
        results.splice(0, results.length)

        calculateYearWorkDay(param.year, holidayDates)

        for (let i = 1; i <= 12; i++) {
            const result = calculateMonthSalary(
                param.year,
                i,
                parseDate(param.firstWorkDay),
                param.salaryPerHour
            )
            if (result) {
                tempResults.push(result)
            }
        }

        // 批量更新结果
        tempResults.forEach(result => {
            temp1 += Number(result.onePointFiveSalary.toFixed(2))
            temp2 += Number(result.tripleSalary.toFixed(2))
        })

        // 响应式更新
        results.push(...tempResults)
        yearOnePointFive.value = temp1
        yearTriple.value = temp2

    } catch (err) {
        console.error('计算失败:', err)
        results.splice(0, results.length) // 清空错误数据
    }
}
async function calculateRetire() {

    clearInterval(timer)
    startCountdown()

}

calculate();
calculateRetire();

// 异步获取假期数据优化
async function holidayChange() {
    if (!yearJSONMap.has(param.year)) {
        try {
            const data = await getOnlineHolidayData(param.year)
            yearJSONMap.set(param.year, data)
        } catch (err) {
            console.warn('使用本地备份数据', err)
            yearJSONMap.set(param.year, JSON.parse(yearJSONs[0]))
        }
    }
    holidayDates = yearJSONMap.get(param.year)
}

function monthClick(month) {
    monthDetailMap.set(month, !monthDetailMap.get(month))
}

function resetParam() {
    param.year = currentTime.getFullYear()
    param.salaryPerHour = 21.6
    param.firstWorkDay = "2025-04-15"
    birth.birthday = '1995-07-20'
    birth.gender = 2
}


function startCountdown() {
    timer = setInterval(() => {
        currentTime = new Date()
        const retireDate = parseDate(birth.birthday)
        if (birth.gender == 2) {
            retireDate.setFullYear(retireDate.getFullYear() + 55)
        } else {
            retireDate.setFullYear(retireDate.getFullYear() + 63)
        }
        const leftTime = Math.floor((retireDate.getTime() - currentTime.getTime()) / 1000)
        if (leftTime <= 0) {
            clearInterval(timer);
            return;
        }

        retire.day = Math.floor(leftTime / (60 * 60 * 24))
        let left = leftTime % (60 * 60 * 24)
        retire.hour = Math.floor(left / (60 * 60))
        left = left % (60 * 60)
        retire.minute = Math.floor(left / 60)
        retire.second = Math.floor(left % 60)
    }, 1000);
}

</script>

<template>
    <div class="param">
        <select v-model="param.year" class="param">
            <option v-for="y in years" :key="y">{{ y }}</option>
        </select>年

        ，时薪<input type="number" v-model="param.salaryPerHour" class="param">
        <br>

        上白班的日期：<input type="date" v-model="param.firstWorkDay" class="param" required>
        <button @click="resetParam()">恢复默认参数</button>
        <br>
        生日(默认不显示)：<input type="date" v-model="tempBirthday" class="param">
        性别： <select v-model="birth.gender" class="param">
            <option value="1">男</option>
            <option value="2">女</option>
        </select>
    </div>
    <div class="time" v-if="retire.day >= 0 && retire.hour >= 0 && retire.minute >= 0 && retire.second >= 0">
        距离退休只剩余:
        <div class="count_down">{{ retire.day }}天 {{ retire.hour.toString().padStart(2, "0") }}小时 {{
            retire.minute.toString().padStart(2, "0") }}分 {{
                retire.second.toString().padStart(2, "0") }}秒</div>
    </div>
    <div v-if="results.length">
        <transition-group name="fade">
            <section v-for="result in results" :key="result.month" @click="monthClick(result.month)">
                <h1>{{ result.month }}月</h1>
                <div v-show="!monthDetailMap.get(result.month)">
                    加班工资：<b>{{ (result.onePointFiveSalary + result.tripleSalary).toFixed(2) }}元</b>
                </div>

                <div v-show="monthDetailMap.get(result.month)">
                    <div v-if="result.month != 1">
                        {{ result.noneTripleBeginMonth }}月{{ result.noneTripleBeginDay }}日到{{ result.noneTripleEndMonth
                        }}月{{ result.noneTripleEndDay }}日
                        <div class="detail-grid">
                            <span>常规工作日:</span><span>{{ result.normalWorkDay }}天</span>
                            <span>常规工作小时:</span><span>{{ result.normalWorkHour }}小时 </span>
                            <span>实际工件日:</span><span>{{ result.actualWorkDay }}天</span>
                            <span>实际工作小时:</span><span>{{ result.actualWorkHour }}小时</span>
                            <span>1.5倍超时:</span><span>{{ result.onePointFiveHour }}小时</span>
                            <span>超时工资：</span><span>{{ result.onePointFiveSalary.toFixed(2) }}元</span>
                        </div>
                        <br>
                    </div>

                    {{ result.tripleBeginMonth }}月{{ result.tripleBeginDay }}日到{{ result.tripleEndMonth }}月{{
                        result.tripleEndDay }}日
                    <div class="detail-grid">
                        <span>3倍时间：</span><span>{{ result.tripleHour }}小时</span>
                        <span>3倍工资：</span><span>{{ result.tripleSalary.toFixed(2) }}元</span>
                    </div>
                    <br>
                    合计：{{ (result.onePointFiveSalary + result.tripleSalary).toFixed(2) }}元
                </div>
            </section>
        </transition-group>

        <h3>年度统计：</h3>
        <div>
            <p>1.5倍工资：{{ yearOnePointFive.toFixed(2) }}</p>
            <p>3倍工资：{{ yearTriple.toFixed(2) }}</p>
            <p>合计：{{ (yearOnePointFive + yearTriple).toFixed(2) }}</p>
        </div>
    </div>
    <div v-else class="recharge">
        <h3>加载数据错误，假期数据未成功获取。</h3>
    </div>
</template>

<style>
.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, max-content);
    gap: 0.1rem 1rem;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.count_down {
    font-size: 1.5em;
    font-weight: 500;
    font-family: sans-serif;
    text-align: center;
}

.recharge {
    text-align: center;
}
</style>