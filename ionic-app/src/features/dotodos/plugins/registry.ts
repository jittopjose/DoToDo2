import { ItemType } from '../types'
import { DoTodoTypePlugin } from './types'
import { todoPlugin } from './todo'
import { shoppingPlugin } from './shopping'
import { notePlugin } from './note'
import { checklistPlugin } from './checklist'

export const typePlugins: Record<ItemType, DoTodoTypePlugin> = {
  todo: todoPlugin,
  shopping: shoppingPlugin,
  note: notePlugin,
  checklist: checklistPlugin,
}
