// Salva as tarefas adicionadas ou deletadas. No começo salva vazio.
let tasks = JSON.parse(localStorage.getItem('KanbanTasks'))
let dark = localStorage.getItem('DarkStatus')

// Adiciona tarefa
const addTask = () => {
    try {
        const input = document.getElementById('taskInput');
        // Retira espaços do começo e/ou do final da string
        const taskText = input.value.trim();

        // Evita que o usuário adicione uma tarefa vazia
        if (taskText === '') return alert('Por favor, insira uma tarefa válida.')

        // Caso o local storage esteja vazio, insere no 'KanbanTasks' as novas tarefas adicionadas. Criando um array de objetos com as informações abaixo (elas ainda não foram salvas em cache).
        tasks.push({
            id: Date.now(),
            titulo: taskText,
            status: 'todo'
        })

        // Resetar o campo de digitar a tarefa.
        input.value = ''

        // Salva e atualiza a lista de tarefas com a adição das novas tarefas
        saveAndRender()

    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error)
    }
}

// Mover tarefa
const moveTask = (id, direction) => {
    try {
        // Procura tarefas com id únicos (data e hora)
        const task = tasks.find(t => t.id === id)

        // Verifica qual o estado da tarefa: A fazer, Fazendo ou Feito.
        const order = ['todo', 'doing', 'done']
        let index = order.indexOf(task.status)

        // Move para a próxima coluna se o estado da tarefa for de index < 2, ou seja, a fazer ou fazendo. Atualizando o estado atual.
        if (direction === 'forward' && index < 2) { 
            task.status = order[index + 1]

        // Move para a coluna anterior se o estado da tarefa for de index > , ou seja, fazendo ou feito. Atualizando o estado atual.
        } else if (direction === 'back' && index > 0) {
            task.status = order[index - 1]
        }

        // Salva e atualiza novamente a lista de tarefas com as alterações de posição
        saveAndRender()
        
    } catch (error) {
        console.error('Erro ao mover tarefa:', error)
    }
}

// Excluir tarefa
const deleteTask = (id) => {
    try {
        // Confirmação de exclusão
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

        // Filtra todas as tarefas que não são a com o ID a ser excluído.
        tasks = tasks.filter(t => t.id !== id)

        // Salva e atualiza novamente a lista de tarefas sem a tarefas que foi excluída.
        saveAndRender()
        
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error)
    }
}

// Salvar e renderizar
const saveAndRender = () => {
    localStorage.setItem('KanbanTasks', JSON.stringify(tasks))
        
    render()
}

const render = () => {

    document.getElementById('col-todo').innerHTML = '';
    document.getElementById('col-doing').innerHTML = '';
    document.getElementById('col-done').innerHTML = '';

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = "bg-gray-100 p-3 rounded shadow flex justify-between items-center";
        
        // ? : -> Mesmo que o IF e ELSE. Ou seja, caso o estado da tarefa foi X, o botão fica Y, caso contrário fica Z.
        card.innerHTML = `
            <span class="text-sm">${task.titulo}</span>
            <div class="flex gap-2">
                ${task.status !== "todo"
                ? `<button onclick="moveTask(${task.id}, 'back')" class="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">←</button>`
                : ""
                }
                
                ${task.status !== "done"
                ? `<button onclick="moveTask(${task.id}, 'forward')" class="p-1 bg-green-500 text-white rounded hover:bg-green-600">→</button>`
                : ""
                }
                <button onclick="deleteTask(${task.id})" class="p-1 bg-red-500 text-white rounded hover:bg-red-600">✕</button>
            </div>
            `
        // columns[task.status].appendChild(card);
        document.getElementById(`col-${task.status}`).appendChild(card)
    })
}

const darkMode = () => {
    dark = !dark
    const container = document.getElementById('addtask')

    if (dark) {
        container.classList.add('bg-stale-900 text-white')
        container.classList.remove('bg-white')
    } else {
        container.classList.remove('bg-stale-900 text-white')
        container.classList.add('bg-white')
    }
}

const showKanban = () => {
    document.getElementById('kanban_section').classList.remove('hidden');
    document.getElementById('dashboard_section').classList.add('hidden');
    document.getElementById('btn_kanban').classList.add('bg-blue-600', 'text-white');
    document.getElementById('btn_kanban').classList.remove('bg-white', 'text-gray-700');
    document.getElementById('btn_dashboard').classList.add('bg-white', 'text-gray-700');
    document.getElementById('btn_dashboard').classList.remove('bg-blue-600', 'text-white');
}

const showDashboard = () => {
    document.getElementById('kanban_section').classList.add('hidden');
    document.getElementById('dashboard_section').classList.remove('hidden');
    document.getElementById('btn_dashboard').classList.add('bg-blue-600', 'text-white');
    document.getElementById('btn_dashboard').classList.remove('bg-white', 'text-gray-700');
    document.getElementById('btn_kanban').classList.add('bg-white', 'text-gray-700');
    document.getElementById('btn_kanban').classList.remove('bg-blue-600', 'text-white');
}

render()