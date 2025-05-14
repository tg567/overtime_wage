import { defineStore } from "pinia";
import { reactive } from "vue";

export const useParamStore = defineStore("param", () => {
    let param = reactive({
        year: new Date().getFullYear(),
        salaryPerHour: 21.60,
        firstWorkDay: '2025-04-15',
    });
    let birth = reactive({
        birthday: '1995-07-20',
        gender: 2,
    });
    return {
        param,
        birth
    }
}, {
    persist: true,
})

