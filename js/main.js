const firebaseConfig = {
  apiKey: "AIzaSyAUyd1dd5OKyfdo1L4bffiIekGqYW9Fqjc",
  authDomain: "clones-3ec8b.firebaseapp.com",
  databaseURL: "https://clones-3ec8b-default-rtdb.firebaseio.com",
  projectId: "clones-3ec8b",
  storageBucket: "clones-3ec8b.firebasestorage.app",
  messagingSenderId: "415064834438",
  appId: "1:415064834438:web:b5f94e248f976ea5ec2c07",
  measurementId: "G-ZHJWB1ZYVX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const cloneFormDB = firebase.database().ref("cloneForm");

// Функция получения данных из формы
function getFormData() {
  const fields = ["org_name", "id_org", "app_code", "country", "fb_url", "deeplink_scheme", "captcha_domain", "captcha_key"];
  return Object.fromEntries(
    fields.map(field => [field, document.getElementById(field).value.trim()])
  );
}

// Функция добавления данных в БД
document.getElementById('cloneForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = getFormData();

  try {
    if (currentEditKey) {
      await cloneFormDB.child(currentEditKey).update({ common: formData });
      showAlert("Запись успешно обновлена!");
    } else {
      await cloneFormDB.push({ common: formData });
      showAlert("Запись успешно добавлена!");
    }

    setTimeout(() => {
      document.getElementById('cloneModal').style.display = 'none';
    }, 3000);
  } catch (error) {
    console.error('Ошибка:', error);
  }

  e.target.reset();
});

const getElementVal = (id) => document.getElementById(id).value;

// Вычитывание данных из БД и построение таблицы
cloneFormDB.on('value', snapshot => {
  const clonesContainer = document.getElementById('clones-container');
  clonesContainer.innerHTML = ''; // Очищаем контейнер

  const data = snapshot.val();
  if (!data) return;

  const fields = [
    { key: 'org_name', label: 'Название организации' },
    { key: 'id_org', label: 'ID организации' },
    { key: 'app_code', label: 'Код приложения' },
    { key: 'country', label: 'Страна' },
    { key: 'fb_url', label: 'Url проекта в Google Firebase' },
    { key: 'deeplink_scheme', label: 'Схема для диплинков' },
    { key: 'captcha_domain', label: 'Домен капчи' },
    { key: 'captcha_key', label: 'Ключ капчи' }
  ];

  // Создаём таблицу
  const table = document.createElement('table');
  table.classList.add('clone-table');

  // Создаём заголовок таблицы
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Добавляем заголовки столбцов
  fields.forEach(field => {
    const th = document.createElement('th');
    th.textContent = field.label;
    headerRow.appendChild(th);
  });

  // Добавляем заголовок для кнопок действий
  const actionsHeader = document.createElement('th');
  actionsHeader.textContent = 'Действия';
  headerRow.appendChild(actionsHeader);

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Создаём тело таблицы
  const tbody = document.createElement('tbody');

  // Добавляем строки с данными
  Object.entries(data).forEach(([key, clone]) => {
    const row = document.createElement('tr');

    fields.forEach(field => {
      const td = document.createElement('td');
      if (field.key === 'fb_url') {
        const link = document.createElement('a');
        link.textContent = 'URL';
        link.href = clone.common[field.key] || '#';
        link.target = '_blank';
        td.appendChild(link);
      } else {
        td.textContent = clone.common[field.key] || '';
      }
      row.appendChild(td);
    });

    // Добавляем кнопки действий
    const actionsCell = document.createElement('td');
    const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('actions-container');

    const editButton = createButton('✏️', 'edit-button', () => openCloneModal('edit', key, clone));
    const deleteButton = createButton('🗑', 'delete-button', () => deleteRecord(key, row));

    actionsContainer.append(editButton, deleteButton);
    actionsCell.appendChild(actionsContainer);
    row.appendChild(actionsCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  clonesContainer.appendChild(table);
});

// Вспомогательная функция для создания кнопок
function createButton(text, className, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.classList.add(className);
  button.addEventListener('click', onClick);
  return button;
}

let currentKey = null; // Хранит ключ записи, которую нужно удалить
let currentRow = null; // Хранит строку таблицы, которую нужно удалить

// Функция для отображения модального окна удаления записей
function showDeleteModal(key, row) {
  currentKey = key;
  currentRow = row;
  const modal = document.getElementById('deleteModal');
  modal.style.display = 'flex'; // Показываем модальное окно
}

// Функция для скрытия модального окна удаления записей
function hideDeleteModal() {
  const modal = document.getElementById('deleteModal');
  modal.style.display = 'none'; // Скрываем модальное окно
}

// Обработчик для кнопки "Удалить" в модальном окне удаления записей
document.getElementById('confirmDelete').addEventListener('click', () => {
  if (currentKey && currentRow) {
    // Удаляем запись из Firebase
    cloneFormDB.child(currentKey).remove()
      .then(() => {
        // Удаляем строку из таблицы
        currentRow.remove();
        console.log('Запись удалена:', currentKey);
      })
      .catch((error) => {
        console.error('Ошибка при удалении записи:', error);
      });
  }
  hideDeleteModal(); // Скрываем модальное окно
});

// Обработчик для кнопки "Отмена" в модальном окне удаления записей
document.getElementById('cancelDelete').addEventListener('click', hideDeleteModal);

// Изменяем функцию для кнопки удаления в таблице
function deleteRecord(key, row) {
  showDeleteModal(key, row); // Показываем модальное окно
}

// Открытие модального окна
document.getElementById('openModalButton').addEventListener('click', () => {
  openCloneModal('add')
});

let currentEditKey = null; // Хранит ключ записи, которую редактируем

// Функция для открытия модального окна
function openCloneModal(mode, key = null, clone = null) {
  const modal = document.getElementById('cloneModal');
  const modalTitle = document.getElementById('modalTitle');
  const submitButton = document.getElementById('submitButton');

  // Устанавливаем заголовок и текст кнопки в зависимости от режима
  modalTitle.textContent = mode === 'add' ? 'Добавить запись' : 'Редактировать запись';
  submitButton.value = mode === 'add' ? 'Добавить' : 'Сохранить изменения';

  // Очищаем форму или заполняем её данными
  if (mode === 'add') {
    document.getElementById('cloneForm').reset(); // Очищаем форму
    currentEditKey = null; // Сбрасываем ключ редактирования
  } else {
    currentEditKey = key;
    fillForm(clone.common); // Заполняем форму данными
  }

  // Открываем модальное окно
  modal.style.display = 'flex';
}

// Вспомогательная функция для заполнения формы
function fillForm(data) {
  const form = document.getElementById('cloneForm');
  Array.from(form.elements)
    .filter(element => element.tagName === 'INPUT' || element.tagName === 'SELECT')
    .forEach(element => {
      if (element.id in data) {
        element.value = data[element.id] || '';
      }
    });
}

// Закрытие модального окна
document.querySelector('.close-modal').addEventListener('click', () => {
  const modal = document.getElementById('cloneModal');
  modal.style.display = 'none';
});

// Закрытие модального окна при клике вне его области
window.addEventListener('click', (event) => {
  const modal = document.getElementById('cloneModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

//функция для показа уведомлений добавления/редактирования записей
function showAlert(message) {
  const alert = document.getElementById('actionAlert');
  alert.textContent = message;
  alert.style.display = "block";
  alert.classList.remove('hide'); // Убираем класс для анимации появления

  setTimeout(() => {
    alert.classList.add('hide'); // Добавляем класс для анимации исчезновения
    setTimeout(() => {
      alert.style.display = "none"; // Скрываем уведомление после анимации
    }, 500); // Время анимации исчезновения
  }, 3000); // Время отображения уведомления
}