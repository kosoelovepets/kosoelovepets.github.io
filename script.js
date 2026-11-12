// ==========================================
// 1. SUPABASE CONFIGURATION (Backend Sync)
// ==========================================
// IMPORTANT: GitHub Pages is static. To achieve Real-Time Sync, insert your Supabase credentials below.
const SUPABASE_URL = 'https://moggsrqzhygvavsdcanh.supabase.co/rest/v1/'; 
const SUPABASE_ANON_KEY = 'sb_publishable_v6HqFpBZkX4LJdOT54mMvQ_W3GS9cTY';

let supabase = null;
let useLocalFallback = false;

if (SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    document.getElementById('sysBanner').classList.add('hidden');
} else {
    useLocalFallback = true;
    document.getElementById('sysBanner').classList.remove('hidden');
}

// ==========================================
// 2. TRANSLATION & LANGUAGE LOGIC
// ==========================================
let currentLang = 'en';

const translations = {
    en: {
        home: "Home", cats: "Cats", dogs: "Dogs", accessories: "Accessories",
        snack: "Snack", food: "Food", medicine: "Medicine", bowls: "Bowls", toys: "Toys", gear: "Gear",
        admin_login: "Admin Login", logout: "Logout", password: "Password",
        all_items: "All Hot Items", add_new: "Add New Product",
        about_us: "About Us", contact_us: "Contact Us",
        cart_title: "Your Cart", product: "Product", qty: "Qty", total: "Total (MMK)", grand_total: "Grand Total:",
        buy_viber: "Buy via Viber", cart_empty: "Your cart is empty.",
        img_limit: "File size exceeds the maximum limit of 5 MB. Please select another image.",
        search_res: 'Search Results for'
    },
    mm: {
        home: "ပင်မစာမျက်နှာ", cats: "ကြောင်များ", dogs: "ခွေးများ", accessories: "ဆက်စပ်ပစ္စည်းများ",
        snack: "သရေစာ", food: "အစားအစာ", medicine: "ဆေးဝါး", bowls: "ပန်းကန်များ", toys: "ကစားစရာများ", gear: "သုံးဆောင်များ",
        admin_login: "စီမံခန့်ခွဲသူဝင်ရန်", logout: "ထွက်ရန်", password: "စကားဝှက်",
        all_items: "လူကြိုက်များသော ပစ္စည်းများ", add_new: "ထုတ်ကုန်အသစ်ထည့်ရန်",
        about_us: "ကျွန်ုပ်တို့အကြောင်း", contact_us: "ဆက်သွယ်ရန်",
        cart_title: "သင့်စျေးခြင်းတောင်း", product: "ထုတ်ကုန်", qty: "အရေအတွက်", total: "စုစုပေါင်း (MMK)", grand_total: "စုစုပေါင်း ကျသင့်ငွေ:",
        buy_viber: "Viber ဖြင့် ဝယ်မည်", cart_empty: "စျေးခြင်းတောင်း ဗလာဖြစ်နေပါသည်။",
        img_limit: "ဖိုင်အရွယ်အစားသည် အများဆုံး 5 MB ထက်ကျော်လွန်နေပါသည်။ ကျေးဇူးပြု၍ အခြားပုံတစ်ပုံကို ရွေးချယ်ပါ။",
        search_res: "ရှာဖွေမှုရလဒ်များ -"
    }
};

function switchLanguage() {
    currentLang = document.getElementById('langSelect').value;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
    // Update dynamic text
    if(categoryTitle.innerText.includes('Search Results') || categoryTitle.innerText.includes('ရှာဖွေမှုရလဒ်များ')) {
        const term = searchInput.value.trim();
        categoryTitle.innerText = `${translations[currentLang].search_res} "${term}"`;
    } else if (searchInput.value === '') {
        categoryTitle.innerText = translations[currentLang].all_items;
    }
    openCartModal(); // Refresh cart translation
}

// ==========================================
// 3. PRODUCT & SYNC STATE
// ==========================================
let products = [];
let currentProducts = [];
let cart = JSON.parse(localStorage.getItem('kosoepets_cart_v71')) || [];
let isAdmin = false;
let currentAdminPass = localStorage.getItem('kosoepets_pass_v71') || 'admin';

// DOM Elements
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categoryTitle = document.getElementById('categoryTitle');

document.addEventListener('DOMContentLoaded', () => {
    // Setup Sub-menu toggles for mobile touch
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.has-sub')) {
            document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
        }
    });
    updateCartCount();
    fetchProducts(); // Initial Load
});

function toggleSubMenu(e, linkEl) {
    e.preventDefault(); e.stopPropagation();
    const parentLi = linkEl.parentElement;
    const wasOpen = parentLi.classList.contains('open');
    document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
    if (!wasOpen) parentLi.classList.add('open');
}

// Data Fetching (Real-time vs Local Preview)
async function fetchProducts() {
    if (useLocalFallback) {
        let stored = localStorage.getItem('kosoepets_products_v71');
        products = stored ? JSON.parse(stored) : [
            { id: 1, type: 'Cats', category: 'Food', name: 'Premium Cat Food', price: 25000, exp: '2028-05-01', img: 'https://images.unsplash.com/photo-1574635677940-d98c25dbff45?auto=format&fit=crop&w=400&q=80', specs: 'Complete nutrition.', created_at: Date.now() },
            { id: 2, type: 'Dogs', category: 'Snack', name: 'Beef Bones', price: 8500, exp: '2027-08-11', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=400&q=80', specs: 'Tough beef bone.', created_at: Date.now() - 1000 }
        ];
        // Sort Newest First (Requirement #8)
        products.sort((a, b) => b.created_at - a.created_at);
        currentProducts = [...products];
        renderProducts(currentProducts);
    } else {
        // Real-Time DB Fetch via Supabase (Requirement #6 & #8)
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            products = data;
            currentProducts = [...products];
            renderProducts(currentProducts);
        }
        
        // Subscribe to real-time changes
        supabase.channel('public:products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
            fetchProducts(); // Silent re-fetch to ensure sync across all browsers
        }).subscribe();
    }
}

// ==========================================
// 4. IMAGE UPLOAD HANDLER (Max 5MB)
// ==========================================
function handleImageUpload(inputId, targetUrlId) {
    const el = document.getElementById(inputId);
    if(!el) return;
    el.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Check Size (5MB) - Requirement #1
            if (file.size > 5 * 1024 * 1024) {
                alert(translations[currentLang].img_limit);
                el.value = ''; // clear
                return;
            }
            const reader = new FileReader();
            reader.onload = function(evt) { document.getElementById(targetUrlId).value = evt.target.result; };
            reader.readAsDataURL(file);
        }
    });
}
handleImageUpload('addImgFile', 'addImg');
handleImageUpload('editImgFile', 'editImg');

// ==========================================
// 5. CART & VOUCHER LOGIC (Requirement #2, #3)
// ==========================================
function addToCart(id) {
    const item = products.find(p => p.id === id);
    if(item) {
        let existing = cart.find(c => c.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...item, qty: 1 });
        }
        saveCart();
        alert(`${item.name} added to cart!`);
    }
}

function updateCartQty(id, delta) {
    let item = cart.find(c => c.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(c => c.id !== id);
        }
        saveCart();
        openCartModal();
    }
}

function saveCart() {
    localStorage.setItem('kosoepets_cart_v71', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    document.getElementById('cartCount').innerText = cart.reduce((sum, item) => sum + item.qty, 0);
}

function openCartModal() {
    const listEl = document.getElementById('cartItemsList');
    const grandTotalEl = document.getElementById('cartGrandTotal');
    listEl.innerHTML = '';
    
    if(cart.length === 0) {
        listEl.innerHTML = `<p style="text-align:center;">${translations[currentLang].cart_empty}</p>`;
        grandTotalEl.innerText = '0 MMK';
    } else {
        let grandTotal = 0;
        cart.forEach((item) => {
            let itemTotal = item.price * item.qty;
            grandTotal += itemTotal;
            listEl.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <img src="${item.img}" alt="${item.name}">
                        <span>${item.name}<br><small>${item.price.toLocaleString()} MMK</small></span>
                    </div>
                    <div class="cart-qty-controls">
                        <button class="cart-qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="cart-qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                    </div>
                    <div class="cart-item-total">
                        ${itemTotal.toLocaleString()} MMK
                    </div>
                </div>`;
        });
        grandTotalEl.innerText = `${grandTotal.toLocaleString()} MMK`;
    }
    document.getElementById('cartModal').style.display = 'block';
}

function redirectToViber() {
    if(cart.length === 0) return;
    
    // Voucher Construction
    let grandTotal = 0;
    let orderSummary = `Items | Selected products%0A`;
    cart.forEach(item => {
        let rowTotal = item.price * item.qty;
        grandTotal += rowTotal;
        orderSummary += `Product Name | ${item.name}%0AQty | ${item.qty}%0APrice | ${item.price.toLocaleString()} MMK%0A-%0A`;
    });
    orderSummary += `Grand Total | ${grandTotal.toLocaleString()} MMK%0A`;
    orderSummary += `Discount | 0 MMK%0A%0A`;
    orderSummary += `Thanks for your shopping!`;
    
    // Viber Link (Requirement #3) -> +959262597117
    const viberUrl = `viber://chat?number=%2B959262597117&text=${orderSummary}`;
    window.location.href = viberUrl;
}

// ==========================================
// 6. UI RENDER & FILTER LOGIC
// ==========================================
function renderProducts(items) {
    productGrid.innerHTML = '';
    if(items.length === 0) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">No items found.</p>`; return;
    }
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        let adminHtml = isAdmin ? `
            <div class="card-admin-actions">
                <button class="edit-btn" onclick="openEdit(${item.id})"><i class="fa fa-edit"></i> Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${item.id})"><i class="fa fa-trash"></i> Del</button>
            </div>` : '';

        // Auto Append MMK Requirement (#7)
        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="product-img">
            <div class="product-info">
                <h3>${item.name}</h3>
                <p class="price">${item.price.toLocaleString()} MMK</p>
                <p class="product-meta"><strong>Exp:</strong> ${item.exp}</p>
                <p class="product-meta">${item.specs}</p>
                <button class="buy-btn" onclick="addToCart(${item.id})">🛒 Add to Cart</button>
                ${adminHtml}
            </div>
        `;
        productGrid.appendChild(card);
    });
}

function goHome() {
    searchInput.value = ''; categoryTitle.innerText = translations[currentLang].all_items;
    currentProducts = products; renderProducts(products);
}

function filterProducts(type, category) {
    searchInput.value = ''; 
    categoryTitle.innerText = `${type} - ${translations[currentLang][category.toLowerCase()] || category}`;
    currentProducts = products.filter(p => p.type === type && p.category === category);
    renderProducts(currentProducts);
}

// ==========================================
// 7. ADMIN C.R.U.D LOGIC
// ==========================================
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function openAddModal() { document.getElementById('addModal').style.display = 'block'; }
function openEdit(id) {
    const item = products.find(p => p.id === id);
    document.getElementById('editId').value = item.id;
    document.getElementById('editImg').value = item.img;
    document.getElementById('editPrice').value = item.price;
    document.getElementById('editExp').value = item.exp;
    document.getElementById('editSpecs').value = item.specs;
    document.getElementById('editModal').style.display = 'block';
}

async function saveNewProduct() {
    const newProd = {
        type: document.getElementById('addType').value,
        category: document.getElementById('addCategory').value,
        name: document.getElementById('addName').value || 'New Product',
        price: parseInt(document.getElementById('addPrice').value) || 0, // Numbers Only
        exp: document.getElementById('addExp').value || 'N/A',
        img: document.getElementById('addImg').value || 'https://via.placeholder.com/400x300?text=No+Image',
        specs: document.getElementById('addSpecs').value || '',
        created_at: Date.now()
    };
    
    if (useLocalFallback) {
        newProd.id = Date.now();
        products.unshift(newProd);
        localStorage.setItem('kosoepets_products_v71', JSON.stringify(products));
        fetchProducts();
    } else {
        await supabase.from('products').insert([newProd]);
        // Note: Real-time subscription will trigger fetchProducts() automatically
    }
    closeModal('addModal');
}

async function saveEdit() {
    const id = parseInt(document.getElementById('editId').value);
    const updates = {
        img: document.getElementById('editImg').value,
        price: parseInt(document.getElementById('editPrice').value) || 0,
        exp: document.getElementById('editExp').value,
        specs: document.getElementById('editSpecs').value
    };
    
    if (useLocalFallback) {
        let index = products.findIndex(p => p.id === id);
        if (index > -1) {
            products[index] = { ...products[index], ...updates };
            localStorage.setItem('kosoepets_products_v71', JSON.stringify(products));
            fetchProducts();
        }
    } else {
        await supabase.from('products').update(updates).eq('id', id);
    }
    closeModal('editModal');
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        if (useLocalFallback) {
            products = products.filter(p => p.id !== id);
            localStorage.setItem('kosoepets_products_v71', JSON.stringify(products));
            fetchProducts();
        } else {
            await supabase.from('products').delete().eq('id', id);
        }
    }
}

// Login
document.getElementById('loginBtn').onclick = () => document.getElementById('loginModal').style.display = 'block';
function login() {
    if (document.getElementById('username').value === 'admin' && document.getElementById('password').value === currentAdminPass) {
        isAdmin = true; closeModal('loginModal');
        document.querySelectorAll('.admin-btn').forEach(btn => btn.classList.remove('hidden'));
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');
        renderProducts(currentProducts);
    }
}
document.getElementById('logoutBtn').onclick = () => {
    isAdmin = false;
    document.querySelectorAll('.admin-btn').forEach(btn => btn.classList.add('hidden'));
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    renderProducts(currentProducts);
};
