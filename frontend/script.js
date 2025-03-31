const API_URL = "http://localhost:5000/api/products";
const CART_KEY = "shoppingCart";

let deleteProductId = null;

// Fetch & Display Products
async function fetchProducts() {
    const response = await fetch(API_URL);
    const products = await response.json();
    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    products.forEach(product => {
        productList.innerHTML += `
            <div class="card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>₹${product.price}</p>
                <button class="edit-btn" onclick="openProductModal('${product._id}', '${product.name}', ${product.price}, '${product.image}')">Edit</button>
                <button class="delete-btn" onclick="openDeleteModal('${product._id}')">Delete</button>
                <button class="add-cart-btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">🛒 Add to Cart</button>
            </div>
        `;
    });
}

// Open Add/Edit Product Modal
function openProductModal(id = "", name = "", price = "", image = "") {
    document.getElementById("productId").value = id;
    document.getElementById("productName").value = name;
    document.getElementById("productPrice").value = price;
    document.getElementById("productImage").value = image;
    document.getElementById("modalTitle").innerText = id ? "Edit Product" : "Add Product";
    document.getElementById("productModal").style.display = "flex";
}

// Save Product (Create/Update)
async function saveProduct() {
    const id = document.getElementById("productId").value;
    const name = document.getElementById("productName").value;
    const price = document.getElementById("productPrice").value;
    const image = document.getElementById("productImage").value;

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/${id}` : API_URL;

    await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, image })
    });

    closeProductModal();
    fetchProducts();
}

// Open Delete Confirmation Modal
function openDeleteModal(id) {
    deleteProductId = id;
    document.getElementById("deleteModal").style.display = "flex";
}

// Confirm Delete
async function confirmDelete() {
    await fetch(`${API_URL}/${deleteProductId}`, { method: "DELETE" });
    closeDeleteModal();
    fetchProducts();
}

// 🛒 ADD TO CART FUNCTIONALITY
function addToCart(id, name, price, image) {
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    // Check if item is already in cart, increase quantity
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

// 🛒 UPDATE CART COUNT IN HEADER
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    document.getElementById("cartCount").innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// 🛒 OPEN CART MODAL & DISPLAY ITEMS
function openCart() {
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    cartItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>🛒 Your cart is empty!</p>";
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            cartItems.innerHTML += `
                <li>
                    <img src="${item.image}" alt="${item.name}" width="50">
                    <span>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</span>
                    <button onclick="removeFromCart('${item.id}')">❌</button>
                </li>
            `;
        });
    }
    cartTotal.innerText = total;
    document.getElementById("cartModal").style.display = "flex";
}

// 🛒 REMOVE ITEM FROM CART
function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    openCart();
    updateCartCount();
}

// 🛒 CLEAR ENTIRE CART
function clearCart() {
    localStorage.removeItem(CART_KEY);
    openCart();
    updateCartCount();
}

// Close Modals
function closeProductModal() { document.getElementById("productModal").style.display = "none"; }
function closeDeleteModal() { document.getElementById("deleteModal").style.display = "none"; }
function closeCart() { document.getElementById("cartModal").style.display = "none"; }

// Initial Fetch & Update Cart Count
fetchProducts();
updateCartCount();
