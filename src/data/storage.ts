import { Storage } from "@ionic/storage";
import { Task } from "../pages/tasks/types";

let taskStorage: Storage;

export const createTasksStore = () => {
    taskStorage = new Storage({
        name: 'dotodo2tasks'
    });
    taskStorage.create();
}

export const getTaskStorage = () => {
    return taskStorage;
}
