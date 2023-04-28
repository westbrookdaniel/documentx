import './index.css'
import { render } from 'vvanilla'
import { withFormData } from 'vvanilla-util'

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
          onSubmit={withFormData((data: { 'new-todo': string }, form) => {
            const title = data['new-todo']
            if (title.length === 0) return
            addTask(title)
            form.reset()
          })}
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
          <Counter />
        </div>
      ))}
    </div>
  )
}

const Counter = () => {
  let count = 1
  let counterEl: Element | null = null

  const renderCount = (count: number) => {
    if (!counterEl) return
    counterEl.textContent = count.toString()
  }

  return (
    <div class="flex items-center gap-2 border border-green-800 rounded-full">
      <button
        onClick={() => {
          count--
          renderCount(count)
        }}
      >
        -
      </button>
      <p ref={(el: Element) => (counterEl = el)}>{count}</p>
      <button
        onClick={() => {
          count++
          renderCount(count)
        }}
      >
        +
      </button>
    </div>
  )
}

const app = document.querySelector<HTMLDivElement>('#app')!
app.replaceChildren(render(<App />))
