document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('add-endpoint-form');
    const tableBody = document.getElementById('blacklist-table-body');

    function loadExtensions() {
        const extensionSelect = document.getElementById('extension-id'); // Use the ID of the select element
    
        chrome.management.getAll((extensions) => {
            const extensionList = extensions.filter(extension => extension.type === 'extension');
            extensionSelect.innerHTML = '<option value="" disabled selected>Select an extension</option>';
            extensionList.forEach(extension => {
                const option = document.createElement('option');
                option.value = extension.id;
                option.textContent = extension.name;
                extensionSelect.appendChild(option);
            });
        });
    }
    

    // Load blacklist from Chrome storage
    function loadBlacklist() {
        chrome.storage.sync.get('extensions', function(data) {
            const blacklist = data.extensions || [];
            tableBody.innerHTML = ''; // Clear current table rows
            blacklist.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.extensionId}</td>
                    <td>${item.domains.join(', ')}</td>
                    <td>
                        <button class="btn btn-trash btn-sm" data-extension-id="${item.extensionId}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-edit btn-sm" data-extension-id="${item.extensionId}" data-domain="${item.domains.join(', ')}">
                            <i class="bi bi-pencil"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        });
    }

    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const extensionId = document.getElementById('extension-id').value.trim();
        const domain = document.getElementById('domain').value.trim();
    
        if (extensionId && domain) {
            chrome.storage.sync.get('extensions', function(data) {
                const blacklist = data.extensions || [];
                
                // Find the index of the existing entry with the same extensionId
                const index = blacklist.findIndex(item => item.extensionId === extensionId);
    
                if (index !== -1) {
                    // Replace the existing entry's domains with the new domain
                    blacklist[index].domains = [domain];
                } else {
                    // Add a new entry if it doesn't exist
                    blacklist.push({ extensionId, domains: [domain] });
                }
    
                chrome.storage.sync.set({ extensions: blacklist }, function() {
                    loadBlacklist(); // Reload the blacklist
                    form.reset(); // Reset form fields
                });
            });
        }
    });

    // Handle delete button click
    tableBody.addEventListener('click', function(event) {
        if (event.target.closest('.btn-trash')) {
            const extensionIdToDelete = event.target.closest('.btn-trash').dataset.extensionId;
            chrome.storage.sync.get('extensions', function(data) {
                let blacklist = data.extensions || [];
                blacklist = blacklist.filter(item => item.extensionId !== extensionIdToDelete);
                chrome.storage.sync.set({ extensions: blacklist }, function() {
                    loadBlacklist(); // Reload the blacklist
                });
            });
        }
    });

    // handle edit button click
    tableBody.addEventListener('click', function(event) {
        if (event.target.closest('.btn-edit')) {
            const button = event.target.closest('.btn-edit');
            const extensionId = button.getAttribute('data-extension-id');
            const domain = button.getAttribute('data-domain');

            // Fill the form with the current values for editing
            document.getElementById('extension-id').value = extensionId;
            document.getElementById('domain').value = domain;

            // Store the current entry to be edited
            editingEntry = { extensionId, domain };
        }
    });

    // Initial load of blacklist
    loadBlacklist();
    loadExtensions();
});
