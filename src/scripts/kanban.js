let tasks = JSON.parse(localStorage.getItem('KanbanTasks')) || []
let dark = localStorage.getItem('DarkStatus') === 'true'

let chartDist = null
let chartQtd = null



const addTask = () => {
    try {
        const input = document.getElementById('taskInput')
        const taskText = input.value.trim()

        if (taskText === '') return alert('Por favor, insira uma tarefa válida.')

        tasks.push({
            id: Date.now(),
            titulo: taskText,
            status: 'todo'
        })

        input.value = ''
        input.focus()

        saveAndRender()

    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error)
    }
}



const deleteTask = (id) => {
    try {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

        tasks = tasks.filter(t => t.id !== id)
        saveAndRender()
        
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error)
    }
}



const saveAndRender = () => {
    localStorage.setItem('KanbanTasks', JSON.stringify(tasks))
    render()
}



const render = () => {

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

        // Permite o drag e drop nos cards
        card.id = task.id
        card.draggable = true
        card.ondragstart = dragstartHandler
        
        card.innerHTML = `
            <span class="text-sm">${task.titulo}</span>
            <button onclick="deleteTask(${task.id})" class="p-1 bg-red-500 text-white rounded hover:bg-red-600">✕</button>
            `
        columns[task.status].appendChild(card);
    })
}



const toggleDarkMode = (dark) => {

    // Todos esses elementos vão ser alterados na mudança de tema claro ou escuro
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
        btnDark.classList.remove('bg-gray-200', 'hover:bg-gray-300')
          

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

    // Só irá renderizar os gráficos quando a seção dashboard estiver ativa
    if (!document.getElementById('container_dashboard').classList.contains('hidden')) {
        renderCharts()
    }
    
    render()
}



const showKanban = () => {
    document.getElementById('container_kanban').classList.remove('hidden')
    document.getElementById('container_dashboard').classList.add('hidden')
    document.getElementById('btn_kanban').classList.add('bg-blue-600', 'hover:bg-blue-700')
    document.getElementById('btn_kanban').classList.remove('bg-gray-500', 'hover:bg-gray-600')
    document.getElementById('btn_dashboard').classList.add('bg-gray-500', 'hover:bg-gray-600')
    document.getElementById('btn_dashboard').classList.remove('bg-blue-600', 'hover:bg-blue-700')
}



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
window.addEventListener('load', () => {
    render()

    // Chama a função de tema dark ao recarregar a página, apenas se ela já estava ativada antes.
    if (dark) return toggleDarkMode(true)
})



// Renderiza os gráficos
const renderCharts = () => {

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
                    },
                    grid: { 
                        color: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: textColor
                    },
                    grid: { 
                        color: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
                    }
                }
            },
        }
    })
}



// Permite que uma área (coluna) receba elementos arrastados
function dragoverHandler(ev) {
    ev.preventDefault()
}


// Salva o ID do card sendo arrastado
function dragstartHandler(ev) {
    ev.dataTransfer.setData("id", ev.target.id)
}


// Processa quando o elemento é solto na coluna
function dropHandler(ev) {
    ev.preventDefault()
    const id = Number(ev.dataTransfer.getData("id"))
    const task = tasks.find(t => t.id === id)
    
    task.status = ev.currentTarget.id.replace('col-', '')
    saveAndRender()
}
