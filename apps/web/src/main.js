"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./index.css");
var documentx_1 = require("documentx");
var App = function () {
    var id = 4;
    var tasks = [
        { id: 1, title: 'Task 1', done: true },
        { id: 2, title: 'Task 2', done: false },
        { id: 3, title: 'Task 3', done: false },
    ];
    var tasksEl = null;
    var renderTasks = function () {
        if (!tasksEl)
            return;
        tasksEl.replaceChildren((0, documentx_1.render)(<Tasks tasks={tasks} onCheck={onCheck}/>));
    };
    var onCheck = function (task) {
        task.done = !task.done;
        renderTasks();
    };
    var addTask = function (title) {
        if (title.length === 0)
            return;
        tasks.unshift({ id: id++, title: title, done: false });
        renderTasks();
    };
    return (<div class="p-8">
            <h1 class="text-4xl font-light">Todos</h1>
            <div class="mt-3 flex flex-col gap-6">
                <form class="flex gap-2 items-center max-w-sm" onSubmit={function (e) {
            e.preventDefault();
            var form = e.target;
            var data = Object.fromEntries(new FormData(form).entries());
            var title = data['new-todo'];
            if (title.length === 0)
                return;
            addTask(title);
            form.reset();
        }}>
                    <input type="text" name="new-todo" placeholder="Whats new?"/>
                    <button>Add</button>
                </form>
                <div ref={function (el) { return (tasksEl = el); }}>
                    <Tasks tasks={tasks} onCheck={onCheck}/>
                </div>
            </div>
        </div>);
};
var Tasks = function (_a) {
    var tasks = _a.tasks, onCheck = _a.onCheck;
    return (<div class="flex flex-col gap-2">
            {tasks.map(function (task) { return (<div class="flex items-center gap-4">
                    <Counter id={task.id}/>
                    <label class="flex items-center gap-2">
                        <input type="checkbox" checked={task.done ? true : undefined} onChange={function () {
                onCheck(task);
            }}/>
                        <span class={task.done ? 'line-through' : undefined}>
                            {task.title}
                        </span>
                    </label>
                </div>); })}
        </div>);
};
var counterMap = new Map();
var Counter = function (_a) {
    var id = _a.id;
    var ref = {
        el: null,
        get count() {
            var _a;
            return (_a = counterMap.get(id)) !== null && _a !== void 0 ? _a : 0;
        },
        set count(value) {
            counterMap.set(id, value);
            if (!this.el)
                return;
            this.el.textContent = value.toString();
        },
    };
    return (<div class="flex items-center gap-2 border border-green-800 rounded-full w-36 justify-between">
            <button onClick={function () { return (ref.count = ref.count - 1); }}>-</button>
            <p ref={function (el) { return (ref.el = el); }}>{ref.count.toString()}</p>
            <button onClick={function () { return (ref.count = ref.count + 1); }}>+</button>
        </div>);
};
var app = document.querySelector('#app');
app.replaceChildren((0, documentx_1.render)(<App />));
