const STORE_PRODUCTS = 'kosoepets_products_v7';
const STORE_PASS = 'kosoepets_pass_v7';
const STORE_BANNER_IMG = 'kosoepets_banner_img_v7';
const STORE_BANNER_TXT = 'kosoepets_banner_txt_v7';
const STORE_ABOUT = 'kosoepets_about_v7';
const STORE_CONTACT = 'kosoepets_contact_v7';

const defaultProducts = [
    { id: 1, type: 'Cats', category: 'Snack', name: 'Tuna Bites', price: '$5.99', exp: '2027-12-01', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80', specs: 'Healthy tuna flavor.' },
    { id: 2, type: 'Cats', category: 'Snack', name: 'Salmon Sticks', price: '$6.99', exp: '2027-10-15', img: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=400&q=80', specs: 'Real salmon meat.' },
    { id: 3, type: 'Cats', category: 'Snack', name: 'Catnip Treats', price: '$4.50', exp: '2028-01-20', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80', specs: 'Organic catnip.' },
    { id: 4, type: 'Cats', category: 'Food', name: 'Premium Dry Cat Food', price: '$25.00', exp: '2028-05-01', img: 'https://images.unsplash.com/photo-1574635677940-d98c25dbff45?auto=format&fit=crop&w=400&q=80', specs: 'Complete nutrition.' },
    { id: 5, type: 'Cats', category: 'Food', name: 'Wet Chicken Pate', price: '$1.50', exp: '2027-11-10', img: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?auto=format&fit=crop&w=400&q=80', specs: 'Grain-free chicken pate.' },
    { id: 6, type: 'Cats', category: 'Food', name: 'Kitten Formula', price: '$22.00', exp: '2028-03-15', img: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=400&q=80', specs: 'For kittens under 1 year.' },
    { id: 7, type: 'Cats', category: 'Medicine', name: 'Flea Drops', price: '$15.00', exp: '2029-01-01', img: 'https://images.unsplash.com/photo-1629828551347-1d88a101b7a2?auto=format&fit=crop&w=400&q=80', specs: 'Monthly application.' },
    { id: 8, type: 'Cats', category: 'Medicine', name: 'Dewormer Tablets', price: '$12.00', exp: '2028-08-14', img: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=400&q=80', specs: 'Broad spectrum dewormer.' },
    { id: 9, type: 'Cats', category: 'Medicine', name: 'Ear Mite Treatment', price: '$9.50', exp: '2028-02-28', img: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=400&q=80', specs: 'Soothes and cleans ears.' },
    { id: 10, type: 'Dogs', category: 'Snack', name: 'Beef Bones', price: '$8.99', exp: '2027-08-11', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=400&q=80', specs: 'Tough beef bone.' },
    { id: 11, type: 'Dogs', category: 'Snack', name: 'Chicken Jerky', price: '$7.50', exp: '2027-09-30', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80', specs: 'Dried chicken breast.' },
    { id: 12, type: 'Dogs', category: 'Snack', name: 'Peanut Butter Biscuits', price: '$5.00', exp: '2028-02-14', img: 'https://images.unsplash.com/photo-1601758174114-e711c0cbea69?auto=format&fit=crop&w=400&q=80', specs: 'Natural peanut butter.' },
    { id: 13, type: 'Dogs', category: 'Food', name: 'Adult Dog Kibble', price: '$35.00', exp: '2028-06-15', img: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=400&q=80', specs: 'For large breeds.' },
    { id: 14, type: 'Dogs', category: 'Food', name: 'Puppy Chow', price: '$32.00', exp: '2028-07-20', img: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=400&q=80', specs: 'High protein for growth.' },
    { id: 15, type: 'Dogs', category: 'Food', name: 'Senior Dog Diet', price: '$38.00', exp: '2028-09-10', img: 'https://images.unsplash.com/photo-1574635677940-d98c25dbff45?auto=format&fit=crop&w=400&q=80', specs: 'Joint support formula.' },
    { id: 16, type: 'Dogs', category: 'Medicine', name: 'Heartworm Chew', price: '$20.00', exp: '2028-11-20', img: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?auto=format&fit=crop&w=400&q=80', specs: 'Prevents heartworm.' },
    { id: 17, type: 'Dogs', category: 'Medicine', name: 'Tick Collar', price: '$18.00', exp: '2029-05-01', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80', specs: '8-month protection.' },
    { id: 18, type: 'Dogs', category: 'Medicine', name: 'Joint Supplements', price: '$25.00', exp: '2028-12-15', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80', specs: 'Glucosamine and Chondroitin.' },
    { id: 19, type: 'Accessories', category: 'Bowls', name: 'Slow Feeder Bowl', price: '$14.00', exp: 'N/A', img: 'https://images.unsplash.com/photo-1601758174114-e711c0cbea69?auto=format&fit=crop&w=400&q=80', specs: 'Prevents fast eating.' },
    { id: 20, type: 'Accessories', category: 'Bowls', name: 'Ceramic Cat Bowl', price: '$10.00', exp: 'N/A', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80', specs: 'Whisker-friendly design.' },
    { id: 21, type: 'Accessories', category: 'Bowls', name: 'Stainless Dispenser', price: '$25.00', exp: 'N/A', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=400&q=80', specs: '2L water capacity.' },
    { id: 22, type: 'Accessories', category: 'Toys', name: 'Squeaky Ball', price: '$4.00', exp: 'N/A', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=400&q=80', specs: 'Durable rubber ball.' },
    { id: 23, type: 'Accessories', category: 'Toys', name: 'Feather Wand', price: '$6.00', exp: 'N/A', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80', specs: 'Interactive cat toy.' },
    { id: 24, type: 'Accessories', category: 'Toys', name: 'Tug Rope', price: '$8.00', exp: 'N/A', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80', specs: 'Heavy-duty cotton.' },
    { id: 25, type: 'Accessories', category: 'Gear', name: 'Nylon Leash', price: '$12.00', exp: 'N/A', img: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=400&q=80', specs: 'Reflective 6ft leash.' },
    { id: 26, type: 'Accessories', category: 'Gear', name: 'Reflective Harness', price: '$18.00', exp: 'N/A', img: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?auto=format&fit=crop&w=400&q=80', specs: 'No-pull design.' },
    { id: 27, type: 'Accessories', category: 'Gear', name: 'Travel Carrier', price: '$35.00', exp: 'N/A', img: 'https://images.unsplash.com/photo-1574635677940-d98c25dbff45?auto=format&fit=crop&w=400&q=80', specs: 'Airline approved.' }
];

let products = JSON.parse(localStorage.getItem(STORE_PRODUCTS)) || defaultProducts;
let cart = JSON.parse(localStorage.getItem('kosoepets_cart')) || [];
let currentAdminPass = localStorage.getItem(STORE_PASS) || 'admin';
let isAdmin = false;
let currentProducts = products;

// DOM Elements
const productGrid = document.getElementById('productGrid');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const categoryTitle = document.getElementById('categoryTitle');
const cartCountEl = document.getElementById('cartCount');

document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem(STORE_BANNER_IMG)) document.getElementById('bannerImgEl').src = localStorage.getItem(STORE_BANNER_IMG);
    if(localStorage.getItem(STORE_BANNER_TXT)) document.getElementById('bannerTextEl').innerText = localStorage.getItem(STORE_BANNER_TXT);
    if(localStorage.getItem(STORE_ABOUT)) document.getElementById('aboutTextEl').innerText = localStorage.getItem(STORE_ABOUT);
    
    let savedContact = JSON.parse(localStorage.getItem(STORE_CONTACT));
    if(savedContact) {
        document.getElementById('contactPhoneEl').innerHTML = `<i class="fa fa-phone" style="color:#ff9a9e;"></i> ${savedContact.phone}`;
        document.getElementById('contactEmailEl').innerHTML = `<i class="fa fa-envelope" style="color:#ff9a9e;"></i> ${savedContact.email}`;
        document.getElementById('fbLinkEl').href = savedContact.fb;
        document.getElementById('tiktokLinkEl').href = savedContact.tiktok;
    }
    
    // Close mobile sub-menus when tapping outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.has-sub')) {
            document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
        }
    });

    updateCartCount();
    renderProducts(products);
});

// Mobile Sub-menu Toggle
function toggleSubMenu(e, linkEl) {
    e.preventDefault();
    e.stopPropagation();
    const parentLi = linkEl.parentElement;
    const wasOpen = parentLi.classList.contains('open');
    document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
    if (!wasOpen) {
        parentLi.classList.add('open');
    }
}

// File Upload Handlers
function attachFileHandler(inputId, targetUrlId) {
    const el = document.getElementById(inputId);
    if(!el) return;
    el.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) { document.getElementById(targetUrlId).value = evt.target.result; };
            reader.readAsDataURL(file);
        }
    });
}
attachFileHandler('editBannerFile', 'editBannerImg');
attachFileHandler('editImgFile', 'editImg');
attachFileHandler('addImgFile', 'addImg');

function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function saveProductsToLocal() { localStorage.setItem(STORE_PRODUCTS, JSON.stringify(products)); }

// Cart Logic
function addToCart(id) {
    const item = products.find(p => p.id === id);
    if(item) {
        cart.push(item);
        localStorage.setItem('kosoepets_cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${item.name} added to cart!`);
    }
}

function updateCartCount() {
    cartCountEl.innerText = cart.length;
}

function openCartModal() {
    const listEl = document.getElementById('cartItemsList');
    listEl.innerHTML = '';
    if(cart.length === 0) {
        listEl.innerHTML = '<p style="text-align:center;">Your cart is empty.</p>';
    } else {
        let total = 0;
        cart.forEach((item, index) => {
            let numPrice = parseFloat(item.price.replace('$', '')) || 0;
            total += numPrice;
            listEl.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:5px;">
                    <span>${item.name} (${item.price})</span>
                    <button onclick="removeFromCart(${index})" style="background:#ff4757; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Remove</button>
                </div>`;
        });
        listEl.innerHTML += `<div style="text-align:right; font-weight:bold; margin-top:10px;">Total: $${total.toFixed(2)}</div>`;
    }
    document.getElementById('cartModal').style.display = 'block';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('kosoepets_cart', JSON.stringify(cart));
    updateCartCount();
    openCartModal();
}

function redirectToViber() {
    if(cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    let orderSummary = "Hello Ko Soe Love Pets, I would like to order the following items:%0A";
    let total = 0;
    cart.forEach(item => {
        orderSummary += `- ${item.name} (${item.price})%0A`;
        total += parseFloat(item.price.replace('$', '')) || 0;
    });
    orderSummary += `Total: $${total.toFixed(2)}`;
    
    // Viber deep link format
    const viberUrl = `viber://chat?number=%2B9592625972117&text=${orderSummary}`;
    window.location.href = viberUrl;
}

// Search
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (term === '') {
        categoryTitle.innerText = 'All Hot Items';
        currentProducts = products;
        renderProducts(products);
        return;
    }
    categoryTitle.innerText = `Search Results for "${term}"`;
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(term) || p.type.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) || p.specs.toLowerCase().includes(term)
    );
    currentProducts = filtered;
    renderProducts(filtered);
});

// Navigation
function goHome() {
    document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
    searchInput.value = ''; categoryTitle.innerText = 'All Hot Items';
    currentProducts = products; renderProducts(products);
}

function filterProducts(type, category) {
    document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
    searchInput.value = ''; categoryTitle.innerText = `${type} - ${category}`;
    const filtered = products.filter(p => p.type === type && p.category === category);
    currentProducts = filtered; renderProducts(filtered);
}

function refreshCurrentView() {
    if (categoryTitle.innerText === 'All Hot Items') {
        currentProducts = products;
    } else if (categoryTitle.innerText.includes('Search Results')) {
        const term = searchInput.value.toLowerCase().trim();
        currentProducts = products.filter(p => p.name.toLowerCase().includes(term));
    } else {
        const parts = categoryTitle.innerText.split(' - ');
        if (parts.length === 2) {
            currentProducts = products.filter(p => p.type === parts[0] && p.category === parts[1]);
        }
    }
    renderProducts(currentProducts);
}

// Render Products
function renderProducts(items) {
    productGrid.innerHTML = '';
    if(items.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 16px;">No items found.</p>'; return;
    }
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        let adminHtml = '';
        if (isAdmin) {
            adminHtml = `
            <div class="card-admin-actions">
                <button class="edit-btn" onclick="openEdit(${item.id})"><i class="fa fa-edit"></i> Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${item.id})"><i class="fa fa-trash"></i> Del</button>
            </div>`;
        }

        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="product-img">
            <div class="product-info">
                <h3>${item.name}</h3>
                <p class="price">${item.price}</p>
                <p class="product-meta"><strong>Exp:</strong> ${item.exp}</p>
                <p class="product-meta">${item.specs}</p>
                <button class="buy-btn" onclick="addToCart(${item.id})">🛒 Add to Cart</button>
                ${adminHtml}
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// Admin Auth
loginBtn.onclick = () => { document.getElementById('loginModal').style.display = 'block'; document.getElementById('loginError').innerText = ''; };
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (user === 'admin' && pass === currentAdminPass) {
        isAdmin = true;
        closeModal('loginModal');
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        document.getElementById('changePassBtn').classList.remove('hidden');
        document.getElementById('editBannerBtn').classList.remove('hidden');
        document.getElementById('editAboutBtn').classList.remove('hidden');
        document.getElementById('editContactBtn').classList.remove('hidden');
        document.getElementById('addBtn').classList.remove('hidden');
        renderProducts(currentProducts);
    } else {
        document.getElementById('loginError').innerText = 'Invalid credentials';
    }
}
logoutBtn.onclick = () => {
    isAdmin = false;
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    document.getElementById('changePassBtn').classList.add('hidden');
    document.getElementById('editBannerBtn').classList.add('hidden');
    document.getElementById('editAboutBtn').classList.add('hidden');
    document.getElementById('editContactBtn').classList.add('hidden');
    document.getElementById('addBtn').classList.add('hidden');
    renderProducts(currentProducts);
};

// Password Management
function openChangePass() {
    document.getElementById('oldPass').value = '';
    document.getElementById('newPass').value = '';
    document.getElementById('passError').innerText = '';
    document.getElementById('passModal').style.display = 'block';
}

function savePassword() {
    const oldP = document.getElementById('oldPass').value;
    const newP = document.getElementById('newPass').value;
    if (oldP !== currentAdminPass) {
        document.getElementById('passError').innerText = 'Current password incorrect!';
        return;
    }
    if (newP.trim() === '') {
        document.getElementById('passError').innerText = 'New password cannot be empty!';
        return;
    }
    currentAdminPass = newP;
    localStorage.setItem(STORE_PASS, newP);
    closeModal('passModal');
    alert('Password updated successfully!');
}

// Add Product
function openAddModal() {
    document.getElementById('addName').value = '';
    document.getElementById('addImg').value = '';
    document.getElementById('addImgFile').value = '';
    document.getElementById('addPrice').value = '';
    document.getElementById('addExp').value = '';
    document.getElementById('addSpecs').value = '';
    document.getElementById('addModal').style.display = 'block';
}

function saveNewProduct() {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const type = document.getElementById('addType').value;
    const categoryRaw = document.getElementById('addCategory').value;
    
    const newProd = {
        id: newId,
        type: type,
        category: categoryRaw,
        name: document.getElementById('addName').value || 'New Product',
        price: document.getElementById('addPrice').value || '$0.00',
        exp: document.getElementById('addExp').value || 'N/A',
        img: document.getElementById('addImg').value || 'https://via.placeholder.com/400x300?text=No+Image',
        specs: document.getElementById('addSpecs').value || 'No specs added.'
    };
    
    products.unshift(newProd);
    saveProductsToLocal();
    closeModal('addModal');
    refreshCurrentView();
}

// Edit Product
function openEdit(id) {
    const item = products.find(p => p.id === id);
    document.getElementById('editId').value = item.id;
    document.getElementById('editImg').value = item.img;
    document.getElementById('editPrice').value = item.price;
    document.getElementById('editExp').value = item.exp;
    document.getElementById('editSpecs').value = item.specs;
    document.getElementById('editImgFile').value = ''; 
    document.getElementById('editModal').style.display = 'block';
}
function saveEdit() {
    const id = parseInt(document.getElementById('editId').value);
    const index = products.findIndex(p => p.id === id);
    if (index > -1) {
        products[index].img = document.getElementById('editImg').value;
        products[index].price = document.getElementById('editPrice').value;
        products[index].exp = document.getElementById('editExp').value;
        products[index].specs = document.getElementById('editSpecs').value;
        saveProductsToLocal();
        closeModal('editModal');
        refreshCurrentView();
    }
}

// Delete Product
function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        saveProductsToLocal();
        refreshCurrentView();
    }
}

// Edit Banner, About & Contact
function openBannerEdit() {
    document.getElementById('editBannerText').value = document.getElementById('bannerTextEl').innerText;
    document.getElementById('editBannerImg').value = document.getElementById('bannerImgEl').src;
    document.getElementById('editBannerFile').value = '';
    document.getElementById('bannerModal').style.display = 'block';
}
function saveBanner() {
    const newTxt = document.getElementById('editBannerText').value;
    const newImg = document.getElementById('editBannerImg').value;
    document.getElementById('bannerTextEl').innerText = newTxt;
    document.getElementById('bannerImgEl').src = newImg;
    localStorage.setItem(STORE_BANNER_TXT, newTxt);
    localStorage.setItem(STORE_BANNER_IMG, newImg);
    closeModal('bannerModal');
}
function openAboutEdit() {
    document.getElementById('editAboutText').value = document.getElementById('aboutTextEl').innerText;
    document.getElementById('aboutModal').style.display = 'block';
}
function saveAbout() {
    const newAbt = document.getElementById('editAboutText').value;
    document.getElementById('aboutTextEl').innerText = newAbt;
    localStorage.setItem(STORE_ABOUT, newAbt);
    closeModal('aboutModal');
}
function openContactEdit() {
    let phoneText = document.getElementById('contactPhoneEl').innerText.trim();
    let emailText = document.getElementById('contactEmailEl').innerText.trim();
    document.getElementById('editPhone').value = phoneText;
    document.getElementById('editEmail').value = emailText;
    document.getElementById('editFb').value = document.getElementById('fbLinkEl').href;
    document.getElementById('editTiktok').value = document.getElementById('tiktokLinkEl').href;
    document.getElementById('contactModal').style.display = 'block';
}
function saveContact() {
    const phone = document.getElementById('editPhone').value;
    const email = document.getElementById('editEmail').value;
    const fb = document.getElementById('editFb').value;
    const tiktok = document.getElementById('editTiktok').value;
    
    document.getElementById('contactPhoneEl').innerHTML = `<i class="fa fa-phone" style="color:#ff9a9e;"></i> ${phone}`;
    document.getElementById('contactEmailEl').innerHTML = `<i class="fa fa-envelope" style="color:#ff9a9e;"></i> ${email}`;
    document.getElementById('fbLinkEl').href = fb;
    document.getElementById('tiktokLinkEl').href = tiktok;
    
    localStorage.setItem(STORE_CONTACT, JSON.stringify({ phone, email, fb, tiktok }));
    closeModal('contactModal');
}
