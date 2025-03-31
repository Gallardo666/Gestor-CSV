
/* Manejo de carga del archivo CSV */
document.getElementById('csvFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const headers = results.meta.fields;
                allData = results.data;
                createTable(headers, allData);
                displayAllResponsesSummary(headers);
            }
        });
    }
});

let allData = [];
const charLimit = 50; // Límite de caracteres para el botón "Show More"

// Función para crear tabla HTML a partir de los datos
function createTable(headers, data) {
    const thead = document.getElementById('tableHeader');
    const tbody = document.querySelector('#tablaPersonas tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        thead.appendChild(th);
    });

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.addEventListener('click', () => showDetails(row)); // Agregar evento para mostrar detalles

        headers.forEach(header => {
            const td = document.createElement('td');
            const text = row[header] || '';
            if (text.length > charLimit) {
                const span = document.createElement('span');
                span.textContent = text.substring(0, charLimit) + '...';
                const button = document.createElement('button');
                button.textContent = 'Show More';
                button.className = 'show-more-button';
                button.onclick = (e) => {
                    e.stopPropagation(); // Prevenir el evento de click en la fila
                    const isExpanded = td.classList.toggle('expanded');
                    span.textContent = isExpanded ? text : text.substring(0, charLimit) + '...';
                    button.textContent = isExpanded ? 'Show Less' : 'Show More';
                };
                td.appendChild(span);
                td.appendChild(button);
            } else {
                td.textContent = text;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    // Filtro de búsqueda
    document.getElementById('searchInput').addEventListener('input', function() {
        const searchValue = this.value.toLowerCase();
        const rows = tbody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            let showRow = false;
            Array.from(row.getElementsByTagName('td')).forEach(cell => {
                if (cell.textContent.toLowerCase().includes(searchValue)) {
                    showRow = true;
                }
            });
            row.style.display = showRow ? '' : 'none';
        });
    });
}

// Función para mostrar el resumen de respuestas en todas las columnas
function displayAllResponsesSummary(headers) {
    const summaryDiv = document.getElementById('responseSummary');
    let html = '<h3>Resumen de respuestas por columna</h3>';
    
    headers.forEach(header => {
        let totalRespuestas = 0;
        const distribucion = {};

        allData.forEach(row => {
            const cell = row[header] ? row[header].trim() : '';
            if (cell !== '') {
                totalRespuestas++;
                distribucion[cell] = (distribucion[cell] || 0) + 1;
            }
        });

        // Ordenar la distribución de respuestas de manera descendente
        const sortedDistribucion = Object.entries(distribucion)
            .sort((a, b) => b[1] - a[1]);

        html += `<div style="margin-bottom:15px; border:1px solid #ddd; padding:10px; border-radius:5px;">`;
        // Encabezado con evento onclick para alternar los detalles
        html += `<div class="column-summary-header" style="cursor:pointer;" onclick="toggleColumnDetails(this)">`;
        html += `<strong>${header}</strong>: ${totalRespuestas} respuesta${totalRespuestas !== 1 ? 's' : ''}`;
        html += `</div>`;
        // Contenido de detalles inicialmente oculto
        html += `<div class="column-details" style="display:none; margin-top:8px;">`;
        if (totalRespuestas > 0) {
            html += `<ul>`;
            sortedDistribucion.forEach(([value, count]) => {
                html += `<li>${count} de "${value}"</li>`;
            });
            html += `</ul>`;
        }
        html += `</div>`;
        html += `</div>`;
    });
    
    summaryDiv.innerHTML = html;
}

// Función para alternar la visualización de los detalles de una columna
function toggleColumnDetails(element) {
    // Se asume que el siguiente hermano es el contenedor de detalles
    const details = element.nextElementSibling;
    if (details.style.display === "none") {
        details.style.display = "block";
    } else {
        details.style.display = "none";
    }
}

// Función para exportar datos
function exportar() {
    const format = document.getElementById('exportSelect').value;
    if (format === 'csv') {
        exportarCSV();
    } else if (format === 'json') {
        exportarJSON();
    } else if (format === 'excel') {
        exportarExcel();
    }
}

function exportarCSV() {
    const csv = Papa.unparse(allData);
    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, 'datos.csv');
}

function exportarJSON() {
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    saveAs(blob, 'datos.json');
}

function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, 'datos.xlsx');
}

function showDetails(row) {
    const detailBox = document.getElementById('detailBox');
    detailBox.innerHTML = '<h3>Detalles de la Fila</h3>' + Object.entries(row)
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value || 'N/A'}</p>`)
        .join('');
    detailBox.style.display = 'block';
}
