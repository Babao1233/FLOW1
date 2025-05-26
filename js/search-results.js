document.addEventListener('DOMContentLoaded', () => {
    const searchResultsGrid = document.getElementById('searchResultsGrid');
    const searchTermElement = document.getElementById('searchTerm');
    const resultsCountElement = document.getElementById('resultsCount');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const searchInputHeader = document.getElementById('searchInputHeader');
    const searchInputHeaderMobile = document.getElementById('searchInputHeaderMobile');


    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (searchTermElement) {
        searchTermElement.textContent = query || "";
    }
    if (searchInputHeader) {
        searchInputHeader.value = query || "";
    }
    if (searchInputHeaderMobile) {
        searchInputHeaderMobile.value = query || "";
    }


    function displaySearchResults() {
        if (!searchResultsGrid || !query) {
            if (noResultsMessage) noResultsMessage.classList.remove('hidden');
            if (resultsCountElement) resultsCountElement.textContent = "Vui lòng nhập từ khóa để tìm kiếm.";
            return;
        }

        // Show skeleton loaders
        searchResultsGrid.innerHTML = '';
        for (let i = 0; i < 4; i++) { // Show 4 skeletons
            searchResultsGrid.innerHTML += app.renderProductCard(null, true);
        }

        // Simulate loading for skeleton effect
        setTimeout(() => {
            const lowerCaseQuery = query.toLowerCase();
            const filteredProducts = app.products.filter(product => 
                product.name.toLowerCase().includes(lowerCaseQuery) ||
                (product.category && product.category.toLowerCase().includes(lowerCaseQuery)) ||
                (product.description && product.description.toLowerCase().includes(lowerCaseQuery))
            );

            searchResultsGrid.innerHTML = ''; // Clear skeletons

            if (resultsCountElement) {
                 resultsCountElement.textContent = `Tìm thấy ${filteredProducts.length} sản phẩm.`;
            }

            if (filteredProducts.length > 0) {
                filteredProducts.forEach(product => {
                    searchResultsGrid.innerHTML += app.renderProductCard(product);
                });
                if (noResultsMessage) noResultsMessage.classList.add('hidden');
            } else {
                if (noResultsMessage) noResultsMessage.classList.remove('hidden');
            }
        }, 500); // Adjust delay as needed
    }

    if (app.products && app.products.length > 0) {
        displaySearchResults();
    } else {
        // Fallback if app.products isn't loaded yet (e.g. data.js is slow)
        // This could be improved with a more robust data loading check or event
        const dataCheckInterval = setInterval(() => {
            if (window.appData && window.appData.products.length > 0) {
                // If app.js hasn't run init fully, manually assign.
                // This is a simplified scenario. Ideally app.js emits an event or provides a promise.
                if (!app.products || app.products.length === 0) {
                    app.products = window.appData.products;
                }
                displaySearchResults();
                clearInterval(dataCheckInterval);
            }
        }, 100);
        // Timeout for the interval to prevent infinite loops if data never loads
        setTimeout(() => clearInterval(dataCheckInterval), 5000);
    }
});





