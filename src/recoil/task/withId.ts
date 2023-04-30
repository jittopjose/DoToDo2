import { selectorFamily } from "recoil";
import { tasksAtom } from "./atom";

const taskWithId = selectorFamily({
    key: 'taskWithId',
    get: id => ({get}) => {
        const tasks = get(tasksAtom)
        return tasks.find(item => item.id === id)
    }
})