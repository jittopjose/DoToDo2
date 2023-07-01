import {
  DatetimeCustomEvent,
  InputCustomEvent,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  SelectCustomEvent,
  TextareaCustomEvent,
  useIonRouter
} from '@ionic/react'
import { arrowBackOutline } from 'ionicons/icons'
import { useEffect, useState } from 'react'
import moment from 'moment'
import {
  DAILY,
  EVERY_WEEK_DAYS,
  EVERY_WEEK_ENDS,
  NO_REPEAT
} from '../../contstants'
import { Task, TaskRule } from './types'
import { useTasksStorage } from '../../hooks/useTasksStorage'
import { getYYYYMMDD } from '../../util'

const taskInitialState = {
  name: '',
  description: '',
  due: moment()
    .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
    .utc(true)
    .toISOString(),
  repeat: NO_REPEAT,
  list: 'personal'
}

const CreateEditTask: React.FC = () => {
  const [task, setTask] = useState(taskInitialState)
  const { addTask, addTaskRule } = useTasksStorage()
  const router = useIonRouter()

  const onNameChange = (e: InputCustomEvent) => {
    setTask(task => {
      return {
        ...task,
        name: e.target.value ? e.target.value.toString() : ''
      }
    })
  }

  const onDescriptonChange = (e: TextareaCustomEvent) => {
    setTask(task => {
      return {
        ...task,
        description: e.target.value ? e.target.value.toString() : ''
      }
    })
  }

  const onDueChange = (e: DatetimeCustomEvent) => {
    setTask(task => {
      return {
        ...task,
        due: e.target.value ? e.target.value.toString() : ''
      }
    })
  }

  const onRepeatChange = (e: SelectCustomEvent) => {
    setTask(task => {
      return {
        ...task,
        repeat: e.target.value ? e.target.value.toString() : ''
      }
    })
  }

  const onListChange = (e: SelectCustomEvent) => {
    setTask(task => {
      return {
        ...task,
        list: e.target.value ? e.target.value.toString() : ''
      }
    })
  }

  const onAddTask = () => {
    const newTask = { ...task }
    if (newTask?.repeat === 'weekly') {
      const dueDay = new Date(task?.due).getDay()
      const days = NO_REPEAT.split(',')
      days[dueDay] = '1'
      newTask.repeat = days.join(',')
    }
    if (task.repeat !== NO_REPEAT) {
      const taskRule: TaskRule = getTaskRule(newTask)
      addTaskRule(taskRule)
      const taskWithRule: Task = getTask(newTask, taskRule)
      addTask(taskWithRule, getYYYYMMDD(new Date(newTask?.due)))
    } else {
      const taskWithoutRule: Task = getTask(newTask)
      addTask(taskWithoutRule, getYYYYMMDD(new Date(newTask?.due)))
    }
    setTask(taskInitialState)
    if (router.canGoBack()) {
      router.goBack()
    }
  }

  const getTaskRule = (task: any) => {
    return {
      id: new Date().getTime(),
      name: task.name,
      dueDateTime: task.due,
      repeat: task.repeat,
      list: task.list
    }
  }

  const getTask = (task: any, rule?: TaskRule) => {
    return {
      id: new Date().getTime(),
      name: task.name,
      remarks: '',
      done: false,
      dueDateTime: task.due,
      repeat: task.repeat,
      list: task.list,
      ruleId: rule ? rule.id : -1
    }
  }

  const isValidTask = () => {
    if (task?.name === '' || task?.due === '' || task?.list === '') {
      return false
    }
    return true
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton icon={arrowBackOutline} />
            <IonTitle>Add New Task</IonTitle>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonItem>
                <IonLabel position='floating'>Name</IonLabel>
                <IonInput
                  type='text'
                  required
                  maxlength={30}
                  value={task.name}
                  onIonInput={onNameChange}
                />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem>
                <IonLabel position='floating'>Decription</IonLabel>
                <IonTextarea
                  value={task.description}
                  onIonInput={onDescriptonChange}
                />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem>
                <IonLabel>Due</IonLabel>
                <IonDatetimeButton
                  datetime='datetime'
                  slot='end'
                ></IonDatetimeButton>
                <IonModal keepContentsMounted={true}>
                  <IonDatetime
                    id='datetime'
                    value={task.due}
                    showDefaultButtons
                    onIonChange={onDueChange}
                  ></IonDatetime>
                </IonModal>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem>
                <IonSelect
                  onIonChange={onRepeatChange}
                  aria-label='repeat'
                  placeholder='Repeat'
                  value={task.repeat}
                >
                  <IonSelectOption value={NO_REPEAT}>No Repeat</IonSelectOption>
                  <IonSelectOption value={DAILY}>Daily</IonSelectOption>
                  <IonSelectOption value='weekly'>Weekly</IonSelectOption>
                  <IonSelectOption value={EVERY_WEEK_DAYS}>
                    Every Weekdays
                  </IonSelectOption>
                  <IonSelectOption value={EVERY_WEEK_ENDS}>
                    Every Weekends
                  </IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem>
                <IonSelect
                  onIonChange={onListChange}
                  aria-label='list'
                  placeholder='List'
                  value={task.list}
                >
                  <IonSelectOption value='personal'>Personal</IonSelectOption>
                  <IonSelectOption value='work'>Work</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton
                onClick={onAddTask}
                color={'success'}
                expand={'block'}
                disabled={!isValidTask()}
              >
                Add Task
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  )
}

export default CreateEditTask
