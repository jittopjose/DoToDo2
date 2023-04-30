import { atom } from "recoil";
import { Task, TaskRule } from "../../pages/tasks/types";

export const tasksAtom = atom<Task[]>({
    key: 'taskAtom',
    default: []
});

export const tasksRuleAtom = atom<TaskRule[]>({
    key: 'taskRuleAtom',
    default: []
})