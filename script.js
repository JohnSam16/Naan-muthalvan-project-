document.addEventListener('DOMContentLoaded', () => {
    // Page Elements
    const welcomeMessage = document.getElementById('welcome-message');

    // Product & Filter Elements
    const productGrid = document.getElementById('product-grid');
    const searchBar = document.getElementById('search-bar');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const priceValue = document.getElementById('price-value');
    const ratingFilter = document.getElementById('rating-filter');
    const filterTitles = document.querySelectorAll('.filter-title');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    // Mobile Filter Menu Elements
    const menuButton = document.getElementById('menu-button');
    const filtersSidebar = document.getElementById('filters-sidebar');
    const closeFiltersBtn = document.getElementById('close-filters-btn');
    const overlay = document.querySelector('.overlay');

    // Cart Elements
    const cartButton = document.getElementById('cart-button');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.querySelector('.close-cart-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');

    // Pagination Elements
    const paginationContainer = document.getElementById('pagination-container');

    let allProducts = [];
    let currentFilteredProducts = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // --- PAGINATION STATE ---
    let currentPage = 1;
    const productsPerPage = 8;

    // --- INITIALIZATION ---
    function init() {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            window.location.href = 'login.html';
            return;
        }
        
        welcomeMessage.textContent = `Welcome, ${storedUsername}!`;
        updateCartCount();
        fetchProducts();
    }

    async function fetchProducts() {
        try {
            const response = await fetch('products.json');
            allProducts = await response.json();
            currentFilteredProducts = [...allProducts];
            populateCategories(); // Now this will work correctly
            displayProductsPage();
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    }

    // --- DISPLAY LOGIC ---
    function displayProductsPage() {
        productGrid.innerHTML = '';
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToShow = currentFilteredProducts.slice(startIndex, endIndex);

        if (productsToShow.length === 0 && currentPage === 1) {
            productGrid.innerHTML = '<p>No products match your criteria.</p>';
        } else {
            productsToShow.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <a href="product.html?id=${product.id}" class="product-card-link">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <div class="product-meta">
                                <p class="product-price">₹${product.price_inr.toLocaleString('en-IN')}</p>
                                <div class="product-rating">
                                    <span>${product.rating}</span> <i class="fas fa-star"></i>
                                </div>
                            </div>
                        </div>
                    </a>
                `;
                productGrid.appendChild(productCard);
            });
        }
        setupPagination();
    }

    // --- PAGINATION LOGIC ---
    function setupPagination() {
        paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(currentFilteredProducts.length / productsPerPage);

        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.className = 'pagination-button';
            btn.innerText = i;
            if (i === currentPage) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                currentPage = i;
                displayProductsPage();
            });
            paginationContainer.appendChild(btn);
        }
    }

    // --- FILTERS & SEARCH ---
    function populateCategories() {
        // This function creates the radio buttons from the product data
        const categories = ['All', ...new Set(allProducts.map(p => p.category))];
        categoryFilter.innerHTML = categories.map(cat => `
            <label><input type="radio" name="category" value="${cat}" ${cat === 'All' ? 'checked' : ''}> ${cat}</label>
        `).join('');
        categoryFilter.addEventListener('change', applyFilters);
    }

    function applyFilters() {
        // This function reads the value from the checked radio button
        const selectedCategory = document.querySelector('input[name="category"]:checked').value;
        const searchTerm = searchBar.value.toLowerCase();
        const maxPrice = parseInt(priceFilter.value);
        const minRating = parseFloat(document.querySelector('input[name="rating"]:checked').value);

        currentFilteredProducts = allProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) &&
            (selectedCategory === 'All' || p.category === selectedCategory) &&
            p.price_inr <= maxPrice &&
            p.rating >= minRating
        );
        
        currentPage = 1;
        displayProductsPage();
    }

    [searchBar, priceFilter, ratingFilter].forEach(el => el.addEventListener('input', applyFilters));
    priceFilter.addEventListener('input', () => priceValue.textContent = `Up to ₹${parseInt(priceFilter.value).toLocaleString('en-IN')}`);
    
    resetFiltersBtn.addEventListener('click', () => {
        searchBar.value = '';
        document.querySelector('input[name="category"][value="All"]').checked = true;
        priceFilter.value = priceFilter.max;
        priceValue.textContent = `Up to ₹${parseInt(priceFilter.max).toLocaleString('en-IN')}`;
        document.querySelector('input[name="rating"][value="4.5"]').checked = true;
        applyFilters();
    });

    filterTitles.forEach(title => {
        title.addEventListener('click', () => {
            const options = title.nextElementSibling;
            title.classList.toggle('active');
            options.style.maxHeight = options.style.maxHeight ? null : `${options.scrollHeight}px`;
        });
    });
    
    // --- MOBILE FILTER MENU ---
    const toggleFilterMenu = () => {
        filtersSidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    };
    [menuButton, closeFiltersBtn, overlay].forEach(el => el.addEventListener('click', toggleFilterMenu));

    // --- CART MODAL ---
    const updateCartCount = () => {
        cartCount.textContent = cart.length;
    };
    
    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div><h4>${item.name}</h4><p>₹${item.price_inr.toLocaleString('en-IN')}</p></div>
                </div>
            `).join('');
        }
        const total = cart.reduce((sum, item) => sum + item.price_inr, 0);
        cartTotalEl.textContent = `Total: ₹${total.toLocaleString('en-IN')}`;
    }

    cartButton.addEventListener('click', () => {
        renderCartItems();
        cartModal.style.display = 'block';
    });
    
    closeCartBtn.addEventListener('click', () => cartModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) cartModal.style.display = 'none';
    });

    init(); // Start the application
});