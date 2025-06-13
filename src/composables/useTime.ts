import { ref, onMounted } from 'vue'
import type { TimeInfo } from '@/types'

export function useTime() {
    const timeInfo = ref<TimeInfo>({
        buildingTime: '',
        currentTime: '',
        currentWeekday: ''
    })

    // 更新时间函数修改
    const updateTime = () => {
        const now = new Date()
        const hours = now.getHours().toString().padStart(2, '0')
        const minutes = now.getMinutes().toString().padStart(2, '0')
        const seconds = now.getSeconds().toString().padStart(2, '0')
        const currentTime = `${hours}:${minutes}:${seconds}`

        // 更新日期
        const year = now.getFullYear()
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = monthNames[now.getMonth()]
        // const month = (now.getMonth() + 1).toString().padStart(2, '0')
        const day = now.getDate().toString().padStart(2, '0')
        // const currentDate = `${year}.${month}.${day}`
        const currentDate = `${month}. ${day}, ${year}`

        // 更新星期
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        // const currentWeekday = weekdays[now.getDay()]
        const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const currentWeekday = weekdaysShort[now.getDay()]
        timeInfo.value = {
            currentTime: `${currentTime}`,
            currentDate: `${currentDate}`,
            currentWeekday: `${currentWeekday}`
        }
    }

    onMounted(() => {
        updateTime()
        setInterval(updateTime, 1000)
    })

    return {
        timeInfo
    }
}