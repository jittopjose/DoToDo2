import { IonModal, IonPage } from '@ionic/react'
import styled from 'styled-components'

export const TaskIonPage = styled(IonPage)`
  .list-row {
    flex-wrap: nowrap;
  }
  .list-row-container::-webkit-scrollbar {
    display: none;
  }
  .list-row-container {
    overflow-x: scroll !important;
  }
  .task-name {
    font-size: 13px;
  }
  .task-description {
    font-size: 9px;
  }
  .task-card-grid {
    padding: 0;
  }
`
export const AddTaskIonModel = styled(IonModal)`
  --height: auto;

  .add-task-container {
    width: 100%;
    height: 150px;
    padding: 20px;
  }
`
