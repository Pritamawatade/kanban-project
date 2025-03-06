// Data structure
let boards = [];
const STORAGE_KEY = 'kanban-boards';

// DOM Elements
const boardsContainer = document.getElementById('boards-container');
const addBoardBtn = document.getElementById('add-board-btn');
const taskModal = document.getElementById('task-modal');
const boardModal = document.getElementById('board-modal');
const confirmModal = document.getElementById('confirm-modal');
const taskForm = document.getElementById('task-form');
const boardForm = document.getElementById('board-form');
const modalTitle = document.getElementById('modal-title');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-description');
const boardTitleInput = document.getElementById('board-title');
const editTaskId = document.getElementById('edit-task-id');
const editBoardId = document.getElementById('edit-board-id');
const confirmMessage = document.getElementById('confirm-message');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const confirmCancelBtn = document.getElementById('confirm-cancel');

// Generate unique ID
function generateId() {

  return Date.now().toString(36) + Math.random().toString(36).substr(2);

}

// Load data from localStorage
function loadData() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    boards = JSON.parse(storedData);
  } else {
    // Default boards if no data exists
    boards = [
      {
        id: generateId(),
        title: 'Todo',
        tasks: [
          {
            id: generateId(),
            title: 'Learn React',
            description: 'Complete React tutorial and build a project'
          },
          {
            id: generateId(),
            title: 'Learn JavaScript',
            description: 'Master JavaScript fundamentals and ES6+ features'
          }
        ]
      },
      {
        id: generateId(),
        title: 'In Progress',
        tasks: []
      },
      {
        id: generateId(),
        title: 'Done',
        tasks: []
      }
    ];
    saveData();
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}

// Render all boards
function renderBoards() {
  boardsContainer.innerHTML = '';
  
  boards.forEach(board => {
    const boardElement = createBoardElement(board);
    boardsContainer.appendChild(boardElement);
  });
}

// Create a board element
function createBoardElement(board) {
  const boardElement = document.createElement('div');
  boardElement.className = 'board';
  boardElement.id = `board-${board.id}`;
  boardElement.setAttribute('data-board-id', board.id);
  
  // Board header
  const boardHeader = document.createElement('div');
  boardHeader.className = 'board-header';
  
  const boardTitle = document.createElement('h3');
  boardTitle.className = 'board-title';
  boardTitle.textContent = board.title;
  
  const boardActions = document.createElement('div');
  boardActions.className = 'board-actions';
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-danger btn-small';
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.addEventListener('click', () => {
    showConfirmModal('Are you sure you want to delete this board and all its tasks?', () => {
      deleteBoard(board.id);
    });
  });
  
  boardActions.appendChild(deleteBtn);
  boardHeader.appendChild(boardTitle);
  boardHeader.appendChild(boardActions);
  
  // Board content
  const boardContent = document.createElement('div');
  boardContent.className = 'board-content';
  
  // Render tasks
  board.tasks.forEach(task => {
    const taskElement = createTaskElement(task, board.id);
    boardContent.appendChild(taskElement);
  });
  
  // Add task button
  const addTaskBtn = document.createElement('button');
  addTaskBtn.className = 'add-task-btn';
  addTaskBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
  addTaskBtn.addEventListener('click', () => {
    showTaskModal('add', null, board.id);
  });
  
  boardElement.appendChild(boardHeader);
  boardElement.appendChild(boardContent);
  boardElement.appendChild(addTaskBtn);
  
  // Add drag and drop event listeners
  boardContent.addEventListener('dragover', (e) => {
    e.preventDefault();
    boardContent.classList.add('drop-target');
  });
  
  boardContent.addEventListener('dragleave', () => {
    boardContent.classList.remove('drop-target');
  });
  
  boardContent.addEventListener('drop', (e) => {
    e.preventDefault();
    boardContent.classList.remove('drop-target');
    
    const taskId = e.dataTransfer.getData('text/plain');
    const taskElement = document.getElementById(taskId);
    const fromBoardId = taskElement.getAttribute('data-board-id');
    const toBoardId = board.id;
    
    if (fromBoardId !== toBoardId) {
      moveTask(taskId.replace('task-', ''), fromBoardId, toBoardId);
    }
  });
  
  return boardElement;
}

// Create a task element
function createTaskElement(task, boardId) {
  const taskElement = document.createElement('div');
  taskElement.className = 'task';
  taskElement.id = `task-${task.id}`;
  taskElement.setAttribute('draggable', 'true');
  taskElement.setAttribute('data-task-id', task.id);
  taskElement.setAttribute('data-board-id', boardId);
  
  const taskTitle = document.createElement('div');
  taskTitle.className = 'task-title';
  taskTitle.textContent = task.title;
  
  const taskDescription = document.createElement('div');
  taskDescription.className = 'task-description';
  taskDescription.textContent = task.description || '';
  
  const taskActions = document.createElement('div');
  taskActions.className = 'task-actions';
  
  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-small btn-circle';
  editBtn.innerHTML = '<i class="fas fa-edit"></i>';
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showTaskModal('edit', task.id, boardId);
  });
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-danger btn-small btn-circle';
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showConfirmModal('Are you sure you want to delete this task?', () => {
      deleteTask(task.id, boardId);
    });
  });
  
  taskActions.appendChild(editBtn);
  taskActions.appendChild(deleteBtn);
  
  taskElement.appendChild(taskTitle);
  taskElement.appendChild(taskDescription);
  taskElement.appendChild(taskActions);
  
  // Add drag events
  taskElement.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', taskElement.id);
    setTimeout(() => {
      taskElement.classList.add('flying');
    }, 0);
  });
  
  taskElement.addEventListener('dragend', () => {
    taskElement.classList.remove('flying');
  });
  
  return taskElement;
}

// Add a new board
function addBoard(title) {
  const newBoard = {
    id: generateId(),
    title: title,
    tasks: []
  };
  
  boards.push(newBoard);
  saveData();
  renderBoards();
}

// Delete a board
function deleteBoard(boardId) {
  boards = boards.filter(board => board.id !== boardId);
  saveData();
  renderBoards();
}

// Add a new task
function addTask(title, description, boardId) {
  const board = boards.find(b => b.id === boardId);
  if (board) {
    const newTask = {
      id: generateId(),
      title: title,
      description: description
    };
    
    board.tasks.push(newTask);
    saveData();
    renderBoards();
  }
}

// Update a task
function updateTask(taskId, title, description, boardId) {
  const board = boards.find(b => b.id === boardId);
  if (board) {
    const task = board.tasks.find(t => t.id === taskId);
    if (task) {
      task.title = title;
      task.description = description;
      saveData();
      renderBoards();
    }
  }
}

// Delete a task
function deleteTask(taskId, boardId) {
  const board = boards.find(b => b.id === boardId);
  if (board) {
    board.tasks = board.tasks.filter(task => task.id !== taskId);
    saveData();
    renderBoards();
  }
}

// Move task between boards
function moveTask(taskId, fromBoardId, toBoardId) {
  const fromBoard = boards.find(b => b.id === fromBoardId);
  const toBoard = boards.find(b => b.id === toBoardId);
  
  if (fromBoard && toBoard) {
    const taskIndex = fromBoard.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const task = fromBoard.tasks[taskIndex];
      fromBoard.tasks.splice(taskIndex, 1);
      toBoard.tasks.push(task);
      saveData();
      renderBoards();
    }
  }
}

// Show task modal
function showTaskModal(mode, taskId, boardId) {
  modalTitle.textContent = mode === 'add' ? 'Add Task' : 'Edit Task';
  editTaskId.value = taskId || '';
  editBoardId.value = boardId;
  
  if (mode === 'edit' && taskId) {
    const board = boards.find(b => b.id === boardId);
    if (board) {
      const task = board.tasks.find(t => t.id === taskId);
      if (task) {
        taskTitleInput.value = task.title;
        taskDescInput.value = task.description || '';
      }
    }
  } else {
    taskTitleInput.value = '';
    taskDescInput.value = '';
  }
  
  taskModal.style.display = 'flex';
}

// Show board modal
function showBoardModal() {
  boardTitleInput.value = '';
  boardModal.style.display = 'flex';
}

// Show confirmation modal
function showConfirmModal(message, confirmCallback) {
  confirmMessage.textContent = message;
  confirmModal.style.display = 'flex';
  
  // Store callback on the button
  confirmDeleteBtn.onclick = () => {
    confirmCallback();
    confirmModal.style.display = 'none';
  };
}

// Event Listeners
addBoardBtn.addEventListener('click', showBoardModal);

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();
  const taskId = editTaskId.value;
  const boardId = editBoardId.value;
  
  if (taskId) {
    updateTask(taskId, title, description, boardId);
  } else {
    addTask(title, description, boardId);
  }
  
  taskModal.style.display = 'none';
});

boardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = boardTitleInput.value.trim();
  
  if (title) {
    addBoard(title);
    boardModal.style.display = 'none';
  }
});

confirmCancelBtn.addEventListener('click', () => {
  confirmModal.style.display = 'none';
});

// Close modals when clicking on X or outside
document.querySelectorAll('.close').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    taskModal.style.display = 'none';
    boardModal.style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target === taskModal) {
    taskModal.style.display = 'none';
  }
  if (e.target === boardModal) {
    boardModal.style.display = 'none';
  }
  if (e.target === confirmModal) {
    confirmModal.style.display = 'none';
  }
});

// Initialize the app
loadData();
renderBoards();