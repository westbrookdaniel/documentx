import './index.css'
import { render } from 'vvanilla/dom'

type Task = {
  id: number
  title: string
  done: boolean
}

const App = () => {
  let id = 4
  const tasks: Task[] = [
    { id: 1, title: 'Task 1', done: true },
    { id: 2, title: 'Task 2', done: false },
    { id: 3, title: 'Task 3', done: false },
  ]

  const onCheck = (task: Task) => {
    task.done = !task.done
    const el = document.querySelector('#task-container')
    if (!el) throw new Error('Element not found')
    render(el, <Tasks tasks={tasks} onCheck={onCheck} />)
  }

  const addTask = (title: string) => {
    if (title.length === 0) return
    tasks.unshift({ id: id++, title, done: false })
    const el = document.querySelector('#task-container')
    if (!el) throw new Error('Element not found')
    render(el, <Tasks tasks={tasks} onCheck={onCheck} />)
  }

  return (
    <div class="p-8">
      <h1 class="text-4xl font-light">Todos</h1>
      <div class="mt-3 flex flex-col gap-6">
        <form
          class="flex gap-2 items-center max-w-sm"
          onSubmit={(e: Event) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const formData = new FormData(form)
            const title = formData.get('new-todo') as string
            addTask(title)
            form.reset()
          }}
        >
          <input type="text" name="new-todo" placeholder="Whats new?" />
          <button>Add</button>
        </form>
        <div id="task-container">
          <Tasks tasks={tasks} onCheck={onCheck} />
        </div>
      </div>
    </div>
  )
}

const Tasks = ({
  tasks,
  onCheck,
}: {
  tasks: Task[]
  onCheck: (task: Task) => void
}) => {
  return (
    <div class="flex flex-col gap-2">
      {tasks.map((task) => (
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={task.done ? true : undefined}
            onChange={() => {
              onCheck(task)
            }}
          />
          <span class={task.done ? 'line-through' : undefined}>
            {task.title}
          </span>
        </label>
      ))}
    </div>
  )
}

render(document.querySelector<HTMLDivElement>('#app')!, <App />)
