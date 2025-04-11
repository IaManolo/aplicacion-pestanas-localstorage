// ===================================
// Inicialización de datos
// ===================================
const defaultData = { categories: [] };
let data;

try {
    data = JSON.parse(localStorage.getItem('buttonData')) || defaultData;
} catch (e) {
    console.warn("Datos corruptos en localStorage. Se usará estructura vacía.");
    data = defaultData;
}

function saveData() {
    localStorage.setItem('buttonData', JSON.stringify(data));
}

// ===================================
// Renderizado de categorías
// ===================================
function renderCategories() {
    const container = document.getElementById('boton-container');
    container.innerHTML = '';

    data.categories.forEach((cat, index) => {
        container.innerHTML += `
            <div class="boton" style="background: ${cat.color}" onclick="openCategory(${index})">
                <i class="${cat.icon}"></i>
                <p>${cat.name}</p>
            </div>
        `;
    });

    const volverBtn = document.getElementById("volver-btn");
    if (volverBtn) volverBtn.style.display = "none";
}

// ===================================
// Renderizado de botones dentro de una categoría
// ===================================
function openCategory(index) {
    localStorage.setItem('currentCategory', index);
    renderButtons(index);
}
function renderButtons(categoryIndex) {
    const container = document.getElementById('boton-container');
    const category = data.categories[categoryIndex];

    // Título de la categoría
    container.innerHTML = `
        <div class="categoria-titulo-container">
            <h2 class="categoria-titulo">${category.name}</h2>
        </div>
    `;

    // Botones de la categoría
    category.buttons.forEach((btn, index) => {
        container.innerHTML += `
            <div class="boton" style="background: ${btn.color}; position: relative;">
                <button class="edit-btn" onclick="editButton(${categoryIndex}, ${index}); event.preventDefault();">✏️</button>
                <button class="delete-btn" onclick="deleteButton(${categoryIndex}, ${index}); event.preventDefault(); event.stopPropagation();">&times;</button>
                <a href="${btn.link}" target="_blank" class="text-white text-decoration-none d-flex flex-column align-items-center">
                    <i class="${btn.icon}" style="font-size: 40px;"></i>
                    <p class="boton-texto">${btn.text}</p>
                </a>
            </div>
        `;
    });

    // Botón volver
    let volverBtn = document.getElementById("volver-btn");
    if (!volverBtn) {
        volverBtn = document.createElement("button");
        volverBtn.id = "volver-btn";
        volverBtn.className = "btn btn-primary volver-btn";
        volverBtn.innerText = "Volver";
        volverBtn.onclick = renderCategories;
        document.body.appendChild(volverBtn);
    }
    volverBtn.style.display = "block";
}


// ===================================
// Modal de añadir/editar botón
// ===================================
function openAddModal() {
    document.getElementById('editIndex').value = "";
    document.getElementById('categorySelect').value = "";
    document.getElementById('categoryName').value = "";
    document.getElementById('categoryIcon').value = "";
    document.getElementById('categoryColor').value = "#ffffff";
    document.getElementById('buttonText').value = "";
    document.getElementById('buttonIcon').value = "";
    document.getElementById('buttonLink').value = "";
    document.getElementById('buttonColor').value = "#ffffff";

    populateCategorySelect();
    new bootstrap.Modal(document.getElementById('addModal')).show();
}

function populateCategorySelect() {
    const select = document.getElementById('categorySelect');
    select.innerHTML = '<option value="">Nueva Categoría</option>';
    data.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

function updateCategoryFields() {
    const selected = document.getElementById('categorySelect').value;
    const nameInput = document.getElementById('categoryName');
    const iconInput = document.getElementById('categoryIcon');
    const colorInput = document.getElementById('categoryColor');

    if (selected) {
        const category = data.categories.find(cat => cat.name === selected);
        nameInput.value = category.name;
        iconInput.value = category.icon;
        colorInput.value = category.color;
        nameInput.disabled = true;
    } else {
        nameInput.value = "";
        iconInput.value = "";
        colorInput.value = "#ffffff";
        nameInput.disabled = false;
    }
}

function saveButton() {
    const catSelect = document.getElementById('categorySelect').value;
    const catName = document.getElementById('categoryName').value.trim();
    const catIcon = document.getElementById('categoryIcon').value.trim();
    const catColor = document.getElementById('categoryColor').value;
    const btnText = document.getElementById('buttonText').value.trim();
    const btnIcon = document.getElementById('buttonIcon').value.trim();
    const btnLink = document.getElementById('buttonLink').value.trim();
    const btnColor = document.getElementById('buttonColor').value;
    const editIndex = document.getElementById('editIndex').value;

    if (!catName || !catIcon || !btnText || !btnIcon || !btnLink) {
        alert("Todos los campos son obligatorios");
        return;
    }

    let category = data.categories.find(cat => cat.name === catSelect || cat.name === catName);
    if (!category) {
        category = { name: catName, icon: catIcon, color: catColor, buttons: [] };
        data.categories.push(category);
    }

    if (editIndex) {
        const [catIdx, btnIdx] = editIndex.split(',').map(Number);
        data.categories[catIdx].buttons[btnIdx] = {
            text: btnText, icon: btnIcon, link: btnLink, color: btnColor
        };
    } else {
        category.buttons.push({
            text: btnText, icon: btnIcon, link: btnLink, color: btnColor
        });
    }

    saveData();
    renderCategories();
    bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
}

function editButton(catIndex, btnIndex) {
    const category = data.categories[catIndex];
    const button = category.buttons[btnIndex];

    document.getElementById('editIndex').value = `${catIndex},${btnIndex}`;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryIcon').value = category.icon;
    document.getElementById('categoryColor').value = category.color;
    document.getElementById('buttonText').value = button.text;
    document.getElementById('buttonIcon').value = button.icon;
    document.getElementById('buttonLink').value = button.link;
    document.getElementById('buttonColor').value = button.color;

    populateCategorySelect();
    document.getElementById('categorySelect').value = category.name;
    updateCategoryFields();

    new bootstrap.Modal(document.getElementById('addModal')).show();
}

function deleteButton(catIndex, btnIndex) {
    data.categories[catIndex].buttons.splice(btnIndex, 1);
    if (data.categories[catIndex].buttons.length === 0) {
        data.categories.splice(catIndex, 1);
    }
    saveData();
    renderCategories();
}

// ===================================
// Iconos dinámicos desde Bootstrap
// ===================================
let targetInputId = "";

function openIconModal(target) {
    targetInputId = target;
    new bootstrap.Modal(document.getElementById('iconModal')).show();
}

function selectIcon(icon) {
    document.getElementById(targetInputId).value = icon;
    bootstrap.Modal.getInstance(document.getElementById('iconModal')).hide();
}

async function loadIcons() {
    const response = await fetch("https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css");
    const cssText = await response.text();
    const iconMatches = cssText.match(/\.bi-([a-z0-9-]+)::before/g);
    const icons = iconMatches ? iconMatches.map(match => match.replace('.bi-', '').replace('::before', '')) : [];

    document.getElementById("iconList").innerHTML = icons.map(icon =>
        `<i class="bi bi-${icon} fs-2 p-2" onclick="selectIcon('bi bi-${icon}')" style="cursor:pointer"></i>`
    ).join('');
}

// ===================================
// Exportar/Importar JSON
// ===================================
function exportButtons() {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "buttons_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importButtons(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!importedData.categories || !Array.isArray(importedData.categories)) {
                alert("Error: El archivo JSON no contiene la estructura correcta.");
                return;
            }
            data = importedData;
            saveData();
            renderCategories();
            alert("Datos importados correctamente.");
        } catch (error) {
            alert("Error al leer el archivo JSON.");
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// ===================================
// Inicialización al cargar la página
// ===================================
document.addEventListener("DOMContentLoaded", () => {
    renderCategories();
    loadIcons();
});
