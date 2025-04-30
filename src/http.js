import axios from "axios"

export async function getOnlineHolidayData(year) {
    try {
        const holidayURL = `https://unpkg.com/holiday-calendar@1.1.6/data/CN/${year}.json`
        return (await axios.get(holidayURL)).data
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
