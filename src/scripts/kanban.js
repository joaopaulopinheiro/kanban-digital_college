// Salva as tarefas adicionadas ou deletadas. No começo, salva vazio como um array.
let tasks = JSON.parse(localStorage.getItem('KanbanTasks')) || []

// Verifica o status do tema escuro da página e retorna um valor booleano
let dark = localStorage.getItem('DarkStatus') === 'true'

// Armazena os gráficos
let chartDist = ''
let chartQtd = ''

// Adiciona uma nova tarefa
const addTask = () => {
    try {
        const input = document.getElementById('taskInput')
        // Retira espaços do começo e/ou do final da string
        const taskText = input.value.trim()

        // Evita que o usuário adicione uma tarefa vazia
        if (taskText === '') return alert('Por favor, insira uma tarefa válida.')

        // Caso o local storage esteja vazio, insere no 'KanbanTasks' as novas tarefas adicionadas. Criando um array de objetos com as informações abaixo (elas ainda não foram salvas em cache).
        tasks.push({
            id: Date.now(),
            titulo: taskText,
            status: 'todo'
        })

        // Resetar o campo de digitar a tarefa e foca nele novamente.
        input.value = ''
        input.focus()

        // Salva e atualiza a lista de tarefas com a adição das novas tarefas
        saveAndRender()

    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error)
    }
}

// Mover uma tarefa de posição
const moveTask = (id, direction) => {
    try {
        // Procura tarefas com id únicos (data e hora)
        const task = tasks.find(t => t.id === id)

        // Verifica qual o estado da tarefa: A fazer, Fazendo ou Feito.
        const order = ['todo', 'doing', 'done']
        let index = order.indexOf(task.status)

        // Move para a próxima coluna se o estado da tarefa for de index < 2, ou seja, TODO ou DOING. Atualizando o estado atual.
        if (direction === 'forward' && index < 2) { 
            task.status = order[index + 1]

        // Move para a coluna anterior se o estado da tarefa for de index > 0, ou seja, DOING ou DONE. Atualizando o estado atual.
        } else if (direction === 'back' && index > 0) {
            task.status = order[index - 1]
        }

        // Salva e atualiza novamente a lista de tarefas com as alterações da posição/estado da tarefa em relação ao array criado.
        saveAndRender()
        
    } catch (error) {
        console.error('Erro ao mover tarefa:', error)
    }
}

// Excluir uma tarefa
const deleteTask = (id) => {
    try {
        // Confirmação de exclusão
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

        // Filtra todas as tarefas que não são a com o ID a ser excluído.
        tasks = tasks.filter(t => t.id !== id)

        // Salva e atualiza novamente a lista de tarefas sem a tarefa que foi excluída.
        saveAndRender()
        
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error)
    }
}

// Salvar e renderizar as informações do localStorage
const saveAndRender = () => {
    localStorage.setItem('KanbanTasks', JSON.stringify(tasks))
    render()
}

// Renderiza as tarefas em cada alteração que foi feita anteriormente ou que for feita depois.
const render = () => {

    // Limpa todas as colunas
    const columns = { 
        todo: document.getElementById('col-todo'),
        doing: document.getElementById('col-doing'),
        done: document.getElementById('col-done')
    }

    Object.values(columns).forEach(col => col.innerHTML = '')

    tasks.forEach(task => {
        const card = document.createElement('div');
        const cardBackground = dark ? 'bg-slate-700' : 'bg-gray-100'
        const textColor = dark ? 'text-white' : 'text-black'
        card.className = `${cardBackground} ${textColor} p-3 rounded shadow flex justify-between items-center`
        
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
        columns[task.status].appendChild(card);
    })
}

const toggleDarkMode = (dark) => {

    // Todos os elementos  que vão serem alterados na mudança de tema claro ou escuro
    const columns = { 
        header: document.getElementById('header'),
        addtask: document.getElementById('addtask'),
        colTodoContainer: document.getElementById('col-todo-container'),
        colDoingContainer: document.getElementById('col-doing-container'),
        colDoneContainer: document.getElementById('col-done-container'),
        dashboardDist: document.getElementById('dashboard-dist'),
        dashboardQtd: document.getElementById('dashboard-qtd')
    }

    const taskInput = document.getElementById('taskInput')
    const btnDark = document.getElementById('btn_dark')

    if (dark) {
        // Se a variável dark for verdadeira, a tela, os botões e as tarefas ficam escura
        Object.values(columns).forEach(col => {
            col.classList.add('bg-slate-800', 'text-white')
            col.classList.remove('bg-white')
        })

        taskInput.classList.add('bg-slate-700', 'text-white', 'border-slate-600')
        taskInput.classList.remove('bg-white', 'text-black')
        
        btnDark.classList.add('bg-slate-600', 'text-white', 'hover:bg-slate-700')
        btnDark.classList.remove('bg-gray-200', 'hover:bg-gray-400')
          

    } else {
        // Se a variável dark for falsa, a tela fica clara
        Object.values(columns).forEach(col => {
            col.classList.remove('bg-slate-800', 'text-white')
            col.classList.add('bg-white')
        })

        taskInput.classList.remove('bg-slate-700', 'text-white', 'border-slate-600')
        taskInput.classList.add('bg-white', 'text-black')
        
        btnDark.classList.remove('bg-slate-600', 'text-white')
        btnDark.classList.add('bg-gray-200', 'hover:bg-gray-400')
    }
}

const darkMode = () => {
    dark = !dark
    localStorage.setItem('DarkStatus', dark)
    toggleDarkMode(dark)

    renderCharts()
    render()
}

// Ao pressionar o botão Kanban, o container das tarefas aparece
const showKanban = () => {
    document.getElementById('container_kanban').classList.remove('hidden')
    document.getElementById('container_dashboard').classList.add('hidden')
    document.getElementById('btn_kanban').classList.add('bg-blue-600', 'hover:bg-blue-700')
    document.getElementById('btn_kanban').classList.remove('bg-gray-500', 'hover:bg-gray-600')
    document.getElementById('btn_dashboard').classList.add('bg-gray-500', 'hover:bg-gray-600')
    document.getElementById('btn_dashboard').classList.remove('bg-blue-600', 'hover:bg-blue-700')
}

// Ao pressionar o botão Dashboard, o container dos gráficos aparece
const showDashboard = () => {
    document.getElementById('container_kanban').classList.add('hidden')
    document.getElementById('container_dashboard').classList.remove('hidden')
    document.getElementById('btn_dashboard').classList.add('bg-blue-600', 'hover:bg-blue-700')
    document.getElementById('btn_dashboard').classList.remove('bg-gray-500', 'hover:bg-gray-600')
    document.getElementById('btn_kanban').classList.add('bg-gray-500', 'hover:bg-gray-600')
    document.getElementById('btn_kanban').classList.remove('bg-blue-600', 'hover:bg-blue-700')

    renderCharts()
}

// Ao inicializar a página, renderiza as tarefas.
window.onload = () => {
    render()

    // Chama a função de tema dark ao recarregar a página, apenas se ela já estava ativada antes.
    if (dark) {
        toggleDarkMode(true)
    } 
}

// Renderiza os gráficos
const renderCharts = () => {

    // Contar a quantidade de tafefas por estado.
    const todoCount = tasks.filter(t => t.status === 'todo').length
    const doingCount = tasks.filter(t => t.status === 'doing').length
    const doneCount = tasks.filter(t => t.status === 'done').length

    const textColor = dark ? '#ffffff' : '#6f7379'

    // Limpa os gráficos e depois renderiza novamente
    if (chartDist) {
        chartDist.destroy()
    }
    if (chartQtd) {
        chartQtd.destroy()
    }
    
    // Gráfico 1 - Distribuição de Tarefas
    const ctxDist = document.getElementById('chart-dist')
    chartDist = new Chart(ctxDist, {
        type: 'pie',
        data: {
            labels: ['A Fazer', 'Fazendo', 'Feito'],
            datasets: [{
                label: 'Quantidade',
                data: [todoCount, doingCount, doneCount],
                backgroundColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 2,
                borderColor: dark ? '#1e293b' : '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
        }
    })

    // Gráfico 2 - Quantidade de Tarefas
    const ctxQtd = document.getElementById('chart-qtd')
    chartQtd = new Chart(ctxQtd, {
        type: 'bar',
        data: {
            labels: ['A Fazer', 'Fazendo', 'Feito'],
            datasets: [{
                label: 'Tarefas',
                data: [todoCount, doingCount, doneCount],
                backgroundColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 2,
                borderColor: dark ? '#1e293b' : '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: textColor
                    }
                }
            },
        }
    })
}