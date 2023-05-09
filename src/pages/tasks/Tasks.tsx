import {
  IonAlert,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { tasksAtom } from '../../recoil/task'
import { useTasksStorage } from '../../hooks/useTasksStorage'
import { Fragment, Key, useEffect } from 'react'
import { Task, TaskRule } from './types'
import { getYYYYMMDD } from '../../util'
import {
  addOutline,
  calendarClearOutline,
  calendarOutline,
  checkmarkDoneOutline,
  createOutline,
  lockOpenOutline,
  repeat,
  trashOutline
} from 'ionicons/icons'
import { generateTaskFromRule } from './util'
import {
  DAILY,
  EVERY_WEEK_DAYS,
  EVERY_WEEK_ENDS,
  NO_REPEAT
} from '../../contstants'
import { TaskIonPage } from './styles'

const Tasks: React.FC = () => {
  const tasks = useRecoilValue<Task[]>(tasksAtom)
  const { getTasks, deleteTask, updateTaskStatus } = useTasksStorage()
  useEffect(() => {
    getTasks(getYYYYMMDD(new Date()))
  }, [])

  const getTaskSummary = (task: Task) => {
    console.log(task)
    //deleteTask(task)
  }

  const getTaskStatus = (task: Task) => {
    if (task.done) {
      return 'Done'
    } else {
      const todayStr = +getYYYYMMDD(new Date())
      const dueDayStr = +getYYYYMMDD(new Date(task.dueDateTime))
      if (todayStr === dueDayStr) {
        if (new Date(task.dueDateTime).getTime() < new Date().getTime()) {
          return 'Overdue'
        } else {
          return 'Pending'
        }
      } else if (dueDayStr < todayStr) {
        return 'Overdue'
      } else if (dueDayStr > todayStr) {
        return 'Open'
      }
    }
  }

  const getDueText = (task: Task) => {
    const minutesNow = new Date().getTime() / 1000 / 60
    const minutesTaskDue = new Date(task.dueDateTime).getTime() / 1000 / 60
    if (minutesTaskDue > minutesNow) {
      if (minutesTaskDue - minutesNow < 60) {
        return `, Due in ${Math.round(minutesTaskDue - minutesNow)} minute(s)`
      } else {
        return `, Due in ${Math.round(
          (minutesTaskDue - minutesNow) / 60
        )} Hours`
      }
    }
    return ''
  }

  const getRepeatText = (task: Task) => {
    switch (task.repeat) {
      case NO_REPEAT:
        return ', No Repeat'
      case DAILY:
        return ', Daily'
      case EVERY_WEEK_DAYS:
        return ', Every Weekdays'
      case EVERY_WEEK_ENDS:
        return ', Every Weekends'
      default:
        return `, Every ${getDayName(task.repeat)}`
    }
  }

  const getDayName = (repeat: string) => {
    const days = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'
    const repeatDay = repeat.split(',').findIndex(item => item === '1')
    return days.split(',')[repeatDay]
  }

  const getListText = (task: Task) => {
    switch (task.list) {
      case 'personal':
        return 'Personal'
      case 'work':
        return 'Work'
      default:
        return task.list
    }
  }

  return (
    <TaskIonPage>
      <IonContent fullscreen>
        <IonItem lines='none'>
          <IonGrid>
            <IonRow className='list-row'>
              <IonCol size='auto'>
                <IonBadge
                  mode='ios'
                  color={'light'}
                >
                  All
                </IonBadge>
              </IonCol>
              <IonCol size='auto'>
                <IonBadge
                  mode='ios'
                  color={'secondary'}
                >
                  Personal
                </IonBadge>
              </IonCol>
              <IonCol size='auto'>
                <IonBadge
                  mode='ios'
                  color={'secondary'}
                >
                  Work
                </IonBadge>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonButtons slot='end'>
            <IonButton>
              <IonIcon slot='icon-only' icon={calendarOutline} />
            </IonButton>
          </IonButtons>
        </IonItem>
        <IonList>
          {tasks.map((item: Task, key: Key | null | undefined) => {
            return (
              <IonCard key={item.id}>
                <IonCardHeader class='ion-no-padding'>
                  <IonItemSliding>
                    <IonItemOptions side='start'>
                      {!item.done && (
                        <IonItemOption
                          color={'danger'}
                          id={`delete-task-${item.id}`}
                        >
                          <IonIcon
                            slot='icon-only'
                            icon={trashOutline}
                          ></IonIcon>
                        </IonItemOption>
                      )}
                      <IonAlert
                        header='Delete Task'
                        trigger={`delete-task-${item.id}`}
                        message={'Are you sure you want to delete this task?'}
                        buttons={[
                          {
                            text: 'Cancel',
                            role: 'cancel'
                          },
                          {
                            text: 'OK',
                            role: 'confirm',
                            handler: () => {
                              deleteTask(item)
                            }
                          }
                        ]}
                      ></IonAlert>
                    </IonItemOptions>

                    <IonItem lines='none'>
                      <IonLabel>
                        <h2>{item.name}</h2>
                      </IonLabel>
                      <IonBadge
                        color={item.done ? 'success' : 'danger'}
                        slot='end'
                      >
                        {getTaskStatus(item)}
                      </IonBadge>
                    </IonItem>
                    <IonItemOptions side='end'>
                      <IonItemOption
                        color={'success'}
                        id={`mark-task-done-${item.id}`}
                      >
                        <IonIcon
                          slot='icon-only'
                          icon={
                            item.done ? lockOpenOutline : checkmarkDoneOutline
                          }
                        ></IonIcon>
                      </IonItemOption>
                      <IonAlert
                        header='Are you sure?'
                        trigger={`mark-task-done-${item.id}`}
                        message={
                          item.done
                            ? 'Are you sure you want to reopen the task?'
                            : 'Are you sure you want to mark the task as done?'
                        }
                        buttons={[
                          {
                            text: 'Cancel',
                            role: 'cancel'
                          },
                          {
                            text: 'OK',
                            role: 'confirm',
                            handler: data => {
                              updateTaskStatus(item, !item.done, data.remarks)
                            }
                          }
                        ]}
                        inputs={[
                          {
                            name: 'remarks',
                            placeholder: 'Add a comment..'
                          }
                        ]}
                      ></IonAlert>
                      {!item.done && (
                        <IonItemOption color='warning'>
                          <IonIcon
                            slot='icon-only'
                            icon={createOutline}
                          ></IonIcon>
                        </IonItemOption>
                      )}
                    </IonItemOptions>
                  </IonItemSliding>
                </IonCardHeader>
                <IonCardContent>{`${getListText(item)}${getRepeatText(
                  item
                )}${getDueText(item)}`}</IonCardContent>
              </IonCard>
            )
          })}
        </IonList>
      </IonContent>
    </TaskIonPage>
  )
}

export default Tasks
