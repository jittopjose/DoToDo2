import { useRecoilState } from 'recoil'
import { tasksAtom, tasksRuleAtom } from '../recoil/task'
import { Task, TaskRule } from '../pages/tasks/types'
import { getTaskStorage } from '../data/storage'
import { TASK_RULES_KEY } from '../contstants'
import { getYYYYMMDD } from '../util'

export function useTasksStorage () {
  const [tasks, setTasks] = useRecoilState(tasksAtom)
  const [taskRules, setTaskRules] = useRecoilState(tasksRuleAtom)

  const getTasks = async (date: string) => {
    const storedTasks: Task[] =
      (await getTaskStorage().get(`Tasks_${date}`)) || []
    setTasks(storedTasks)
  }

  const addTask = async (task: Task, date: string) => {
    const key = `Tasks_${date}`
    const existingTasks = (await getTaskStorage().get(key)) || []
    const newTasks = [...existingTasks, task]
    await getTaskStorage().set(key, newTasks)
    setTasks(newTasks)
  }

  const addTaskRule = async (rule: TaskRule) => {
    const existingRules: TaskRule[] =
      (await getTaskStorage().get(TASK_RULES_KEY)) || []
    const newRules = [...existingRules, rule]
    await getTaskStorage().set(TASK_RULES_KEY, newRules)
    setTaskRules(newRules)
  }

  const deleteTask = async (task: Task) => {
    if (task.ruleId !== -1) {
      const existingRules: TaskRule[] =
        (await getTaskStorage().get(TASK_RULES_KEY)) || []
      const updatedRules = existingRules.filter(rule => rule.id !== task.ruleId)
      await getTaskStorage().set(TASK_RULES_KEY, updatedRules)
      setTaskRules(updatedRules)
    }
    const dateStr = getYYYYMMDD(new Date(task.dueDateTime))
    const tasksKey = `Tasks_${dateStr}`
    const existingTasks: Task[] = await getTaskStorage().get(tasksKey)
    const updatedTasks = existingTasks.filter(item => item.id !== task.id)
    await getTaskStorage().set(tasksKey, updatedTasks)
    setTasks(updatedTasks)
  }

  return {
    getTasks,
    addTask,
    addTaskRule,
    deleteTask
  }
}
