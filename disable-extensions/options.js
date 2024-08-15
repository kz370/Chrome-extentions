document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('add-endpoint-form');
    const tableBody = document.getElementById('blacklist-table-body');

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
                const extension = blacklist.find(item => item.extensionId === extensionId);

                if (extension) {
                    extension.domains.push(domain);
                } else {
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

    // Initial load of blacklist
    loadBlacklist();
});
