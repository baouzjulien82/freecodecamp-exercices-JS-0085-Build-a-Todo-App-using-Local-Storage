// Sélection des éléments du DOM (formulaire, boutons, inputs, conteneur des tâches, etc.)
const taskForm = document.getElementById("task-form");
const confirmCloseDialog = document.getElementById("confirm-close-dialog");
const openTaskFormBtn = document.getElementById("open-task-form-btn");
const closeTaskFormBtn = document.getElementById("close-task-form-btn");
const addOrUpdateTaskBtn = document.getElementById("add-or-update-task-btn");
const cancelBtn = document.getElementById("cancel-btn");
const discardBtn = document.getElementById("discard-btn");
const tasksContainer = document.getElementById("tasks-container");
const titleInput = document.getElementById("title-input");
const dateInput = document.getElementById("date-input");
const descriptionInput = document.getElementById("description-input");

// Récupération des données sauvegardées dans localStorage (persistantes après rechargement)
// Si aucune donnée n'existe, on initialise avec un tableau vide
const taskData = JSON.parse(localStorage.getItem("data")) || [];
let currentTask = {}; // Stocke la tâche en cours d'édition

// Fonction utilitaire : supprime les caractères spéciaux d'une chaîne
const removeSpecialChars = (val) => {
  return val.trim().replace(/[^A-Za-z0-9\-\s]/g, '')
}

// Fonction principale : ajoute ou met à jour une tâche
const addOrUpdateTask = () => {
  // Vérifie que le titre n'est pas vide
  if(!titleInput.value.trim()){
    alert("Please provide a title");
    return;
  }

  // Cherche si la tâche courante existe déjà dans le tableau
  const dataArrIndex = taskData.findIndex((item) => item.id === currentTask.id);

  // Crée un objet tâche avec un id unique basé sur le titre + timestamp
  const taskObj = {
    id: `${removeSpecialChars(titleInput.value).toLowerCase().split(" ").join("-")}-${Date.now()}`,
    title: titleInput.value,
    date: dateInput.value,
    description: descriptionInput.value,
  };

  // Si la tâche n'existe pas encore, on l'ajoute au début du tableau
  if (dataArrIndex === -1) {
    taskData.unshift(taskObj);
  } else {
    // Sinon, on met à jour la tâche existante
    taskData[dataArrIndex] = taskObj;
  }

  // Sauvegarde dans localStorage
  localStorage.setItem("data", JSON.stringify(taskData));

  // Met à jour l'affichage et réinitialise le formulaire
  updateTaskContainer()
  reset()
};

// Fonction qui met à jour le conteneur des tâches dans le DOM
const updateTaskContainer = () => {
  tasksContainer.innerHTML = ""; // Vide le conteneur

  // Parcourt toutes les tâches et génère du HTML pour chacune
  taskData.forEach(
    ({ id, title, date, description }) => {
        tasksContainer.innerHTML += `
        <div class="task" id="${id}">
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Description:</strong> ${description}</p>
          <button onclick="editTask(this)" type="button" class="btn">Edit</button>
          <button onclick="deleteTask(this)" type="button" class="btn">Delete</button> 
        </div>
      `
    }
  );
};

// Fonction de suppression d'une tâche
const deleteTask = (buttonEl) => {
  // Trouve l'index de la tâche à supprimer
  const dataArrIndex = taskData.findIndex(
    (item) => item.id === buttonEl.parentElement.id
  );

  // Supprime l'élément du DOM
  buttonEl.parentElement.remove();

  // Supprime la tâche du tableau
  taskData.splice(dataArrIndex, 1);

  // Met à jour localStorage
  localStorage.setItem("data", JSON.stringify(taskData));
}

// Fonction d'édition d'une tâche
const editTask = (buttonEl) => {
  // Trouve l'index de la tâche à éditer
  const dataArrIndex = taskData.findIndex(
    (item) => item.id === buttonEl.parentElement.id
  );

  // Stocke la tâche courante
  currentTask = taskData[dataArrIndex];

  // Remplit le formulaire avec les valeurs de la tâche
  titleInput.value = currentTask.title;
  dateInput.value = currentTask.date;
  descriptionInput.value = currentTask.description;

  // Change le texte du bouton pour indiquer une mise à jour
  addOrUpdateTaskBtn.innerText = "Update Task";

  // Affiche le formulaire
  taskForm.classList.toggle("hidden");  
}

// Fonction de réinitialisation du formulaire
const reset = () => {
  addOrUpdateTaskBtn.innerText = "Add Task"; // remet le texte du bouton
  titleInput.value = "";
  dateInput.value = "";
  descriptionInput.value = "";
  taskForm.classList.toggle("hidden"); // cache le formulaire
  currentTask = {}; // réinitialise la tâche courante
}

// Si des tâches existent déjà dans localStorage, on les affiche au chargement
if (taskData.length) {
  updateTaskContainer();
}

// Événement : ouverture du formulaire
openTaskFormBtn.addEventListener("click", () =>
  taskForm.classList.toggle("hidden")
);

// Événement : fermeture du formulaire
closeTaskFormBtn.addEventListener("click", () => {
  // Vérifie si des valeurs ont été saisies
  const formInputsContainValues = titleInput.value || dateInput.value || descriptionInput.value;
  // Vérifie si les valeurs ont été modifiées par rapport à la tâche courante
  const formInputValuesUpdated = titleInput.value !== currentTask.title || dateInput.value !== currentTask.date || descriptionInput.value !== currentTask.description;

  // Si oui, affiche une boîte de dialogue de confirmation
  if (formInputsContainValues && formInputValuesUpdated) {
    confirmCloseDialog.showModal();
  } else {
    // Sinon, réinitialise directement
    reset();
  }
});

// Événement : bouton "Cancel" dans la boîte de dialogue
cancelBtn.addEventListener("click", () => confirmCloseDialog.close());

// Événement : bouton "Discard" dans la boîte de dialogue
discardBtn.addEventListener("click", () => {
  confirmCloseDialog.close();
  reset()
});

// Événement : soumission du formulaire
taskForm.addEventListener("submit", (e) => {
  e.preventDefault(); // empêche le rechargement de la page
  addOrUpdateTask();  // ajoute ou met à jour la tâche
});
