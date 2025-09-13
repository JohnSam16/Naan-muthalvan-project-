document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');
    const cartCount = document.getElementById('cart-count');
    let allProducts = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Function to get the product ID from the URL query parameter
    const getProductId = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get('id'));
    };

    // Fetch all products, then find and display the correct one
    const fetchAndDisplayProduct = async () => {
        try {
            const response = await fetch('products.json');
            allProducts = await response.json();
            const productId = getProductId();
            const product = allProducts.find(p => p.id === productId);

            if (product) {
                displayProductDetails(product);
            } else {
                productDetailContainer.innerHTML = '<p class="error-text">Product not found.</p>';
            }
        } catch (error) {
            console.error('Failed to fetch product details:', error);
            productDetailContainer.innerHTML = '<p class="error-text">Could not load product details.</p>';
        }
    };
    
    // Renders the product details into the container
    const displayProductDetails = (product) => {
        document.title = product.name; // Update the page title
        productDetailContainer.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-detail-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-detail-info">
                    <h2>${product.name}</h2>
                    <div class="product-rating">
                        <span>${product.rating}</span>
                        ${'<i class="fas fa-star"></i>'.repeat(Math.round(product.rating))}
                        ${'<i class="far fa-star"></i>'.repeat(5 - Math.round(product.rating))}
                    </div>
                    <p class="product-description">${product.details}</p>
                    <p class="detail-price">₹${product.price_inr.toLocaleString('en-IN')}</p>
                    <div class="delivery-info">
                        <i class="fas fa-truck"></i>
                        <span>Estimated Delivery: <b>${product.delivery_eta}</b></span>
                    </div>
                    <button id="add-to-cart-btn" class="cta-button" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;

        // Add event listener for the new "Add to Cart" button
        document.getElementById('add-to-cart-btn').addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.productId);
            addToCart(id);
        });
    };

    // --- CART LOGIC (Copied for this page to update count) ---
    const addToCart = (productId) => {
        const productToAdd = allProducts.find(p => p.id === productId);
        if (productToAdd) {
            cart.push(productToAdd);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }
    };

    const updateCartCount = () => {
        cartCount.textContent = cart.length;
    };

    // --- INITIALIZATION ---
    fetchAndDisplayProduct();
    updateCartCount(); // Initial cart count on page load
});