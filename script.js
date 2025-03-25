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
            }
        });
    }
});

let allData = [];
const charLimit = 50; // Set character limit for showing the "Show More" button

// Crear tabla
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
        tr.addEventListener('click', () => showDetails(row)); // Add click event to show details

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
                    e.stopPropagation(); // Prevent row click event
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

// Exportar datos
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
