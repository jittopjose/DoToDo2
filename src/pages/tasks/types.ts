export type Task = {
    id: number,
    name: string,
    description?: string,
    remarks: string,
    done: boolean,
    dueDateTime: string,
    repeat: string,
    list: string,
    ruleId: number 
}

export type TaskRule = {
    id: number,
    name: string,
    description?: string,
    dueDateTime: string,
    repeat: string,
    list: string
}