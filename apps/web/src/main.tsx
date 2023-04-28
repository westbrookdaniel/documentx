import './index.css'
import { render } from 'jolt'

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

  let tasksEl: Element | null = null

  const renderTasks = () => {
    if (!tasksEl) return
    tasksEl.replaceChildren(render(<Tasks tasks={tasks} onCheck={onCheck} />))
  }

  const onCheck = (task: Task) => {
    task.done = !task.done
    renderTasks()
  }

  const addTask = (title: string) => {
    if (title.length === 0) return
    tasks.unshift({ id: id++, title, done: false })
    renderTasks()
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
            const data = Object.fromEntries(new FormData(form).entries())
            const title = data['new-todo'] as string
            if (title.length === 0) return
            addTask(title)
            form.reset()
          }}
        >
          <input type="text" name="new-todo" placeholder="Whats new?" />
          <button>Add</button>
        </form>
        <div ref={(el: Element) => (tasksEl = el)}>
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
        <div class="flex items-center gap-4">
          <Counter id={task.id} />
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
        </div>
      ))}
    </div>
  )
}

const counterMap = new Map<number, number>()

const Counter = ({ id }: { id: number }) => {
  const ref = {
    el: null as Element | null,
    get count() {
      return counterMap.get(id) ?? 0
    },
    set count(value: number) {
      counterMap.set(id, value)
      if (!this.el) return
      this.el.textContent = value.toString()
    },
  }

  return (
    <div class="flex items-center gap-2 border border-green-800 rounded-full w-36 justify-between">
      <button onClick={() => (ref.count = ref.count - 1)}>-</button>
      <p ref={(el: Element) => (ref.el = el)}>{ref.count.toString()}</p>
      <button onClick={() => (ref.count = ref.count + 1)}>+</button>
    </div>
  )
}

const app = document.querySelector<HTMLDivElement>('#app')!
app.replaceChildren(render(<App />))
