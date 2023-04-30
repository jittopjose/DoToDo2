import { Task, TaskRule } from './types'

export const generateTaskFromRule = (rule: TaskRule, date: Date) => {
    if (rule.repeat !== '') {
        const days = rule.repeat.split(',')
        if (days[date.getDay()] === '1') {
            return {
                id: new Date().getTime(),
                name: rule.name,
                remarks: '',
                done: false,
                // dueDateTime: new Date(
                //     date.setHours(
                //         rule.dueDateTime.getHours(),
                //         rule.dueDateTime.getMinutes(),
                //         rule.dueDateTime.getSeconds(),
                //         999
                //     )
                // ),
                repeat: rule.repeat,
                list: rule.list,
                ruleId: rule.id
            }
        }

    }
    return null;

}


