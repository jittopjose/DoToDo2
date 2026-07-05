import { ComponentType } from 'react'
import { DoTodo, ItemType } from '../types'

export interface DoTodoTypePlugin {
  /** Replaces Page.tsx entirely when this type filter is active */
  ListPage?: ComponentType<{ list: string; typeFilter: ItemType }>
  /** Replaces DoTodoItem for entries of this type */
  ListItem?: ComponentType<{ todo: DoTodo }>
  /** Replaces DoTodoEditPage for entries of this type */
  EditPage?: ComponentType<{ id: string }>

  ListItemExtra?: ComponentType<{ item: DoTodo }>
  InputActions?: ComponentType<{ itemType: ItemType }>
  EditorSections?: ComponentType<{
    item: DoTodo
    onUpdate: (updates: Partial<DoTodo>) => void
  }>
  createDefaults?: Partial<DoTodo>
}
