// Salva as tarefas adicionadas ou deletadas. No começo salva vazio.
let tasks = JSON.parse(localStorage.getItem('KanbanTasks')) || []

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

// Função: Mover tarefa
const moveTask = (id, direction) => {
    try {
        // Procura tarefas com id únicos (data e hora)
        const task = tasks.find(t => t.id === id)

        // Verifica qual o estado da tarefa: A fazer, Fazendo ou Feito.
        const order = ['todo', 'doing', 'done']
        let index = order.indexOf(task.status)

        // Move para a próxima coluna se o estado da tarefa for de index < 2, ou seja, a fazer ou fazendo. Atualizando o estado atual.
        if (direction === "forward" && index < 2) { 
            task.status = order[index + 1]; 
        }

        // Move Move para a coluna anterior se o estado da tarefa for de index > , ou seja, fazendo ou feito. Atualizando o estado atual.
        if (direction === "back" && index > 0) {
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
        tasks = tasks.filter(t => t.id !== id); 

        // Salva e atualiza novamente a lista de tarefas sem a tarefas que foi excluída.
        saveAndRender(); 
        
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
    }
}

// Salvar e renderizar
const saveAndRender = () => {
        localStorage.setItem('KanbanTasks', JSON.stringify(tasks));
        render();
}

const render = () => {

    const columns = {
        todo: document.getElementById('col-todo'),
        doing: document.getElementById('col-doing'),
        done: document.getElementById('col-done')
    }

    // Transforma o objeto em array para aplicar o forEach e depois limpa os dados das colunas para atualizar a lista de tarefas
    Object.values(columns).forEach(col => col.innerHTML = '')

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = "bg-gray-100 p-3 rounded shadow flex justify-between items-center";
        
        // ? : -> Mesmo que o IF e ELSE. Ou seja, caso o estado da tarefa foi X, o botão fica Y, caso contrário fica Z.
        card.innerHTML = `
            <span class="font-medium">${task.titulo}</span>
            <div class="flex gap-2">
                ${
                // Caso for o estado Doing ou Done, ficará com os botões de mover tarefa para o estado anterior.
                task.status !== "todo"
                ? `<button onclick="moveTask(${task.id}, 'back')" class="p-1 bg-blue-500 text-white rounded">←</button>`
                : ""
                }
                
                ${
                // Caso for o estado Todo ou Doing, ficará com os botões de mover tarefa para o estado posterior.    
                task.status !== "done"
                ? `<button onclick="moveTask(${task.id}, 'forward')" class="p-1 bg-green-500 text-white rounded">→</button>`
                : ""
                }
                <!-- Todos os estados terão o botão de excluir tarefa. Em especial, o estado Doing(Fazendo) terá todos os outros. -->
                <button onclick="deleteTask(${task.id})" class="p-1 bg-red-500 text-white rounded">✕</button>
            </div>
        `
        columns[task.status].appendChild(card);
    })
}

render();