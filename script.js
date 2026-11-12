// ==========================================
// 1. SUPABASE CONFIGURATION (Backend Sync)
// ==========================================
const SUPABASE_URL = 'https://moggsrqzhygvavsdcanh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_v6HqFpBZkX4LJdOT54mMvQ_W3GS9cTY';

let supabaseClient = null;
let useLocalFallback = false;

const sampleProducts = [
    // 3 Cats Items
    { type: 'Cats', category: 'Food', name: 'Me-O Tuna Adult Cat Food (1.2kg)', price: 14500, exp: '2027-11-15', img: 'https://images.unsplash.com/photo-1574635677940-d98c25dbff45?auto=format&fit=crop&w=400&q=80', specs: 'Balanced nutrition with Taurine for healthy vision.', created_at: Date.now() },
    { type: 'Cats', category: 'Snack', name: 'Ciao Churu Tuna Creamy Treats', price: 4500, exp: '2027-08-20', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80', specs: '4 tubes per pack, grain-free lickable cat snack.', created_at: Date.now() - 100 },
    { type: 'Cats', category: 'Medicine', name: 'Frontline Plus Flea & Tick Drops', price: 18000, exp: '2028-03-01', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80', specs: 'Fast-acting waterproof flea and tick protection.', created_at: Date.now() - 200 },
    // 3 Dogs Items
    { type: 'Dogs', category: 'Food', name: 'Pedigree Chicken & Vegetables (1.5kg)', price: 16500, exp: '2027-12-10', img: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=400&q=80', specs: 'Omega 6 & Zinc for healthy skin and shiny coat.', created_at: Date.now() - 300 },
    { type: 'Dogs', category: 'Snack', name: 'JerHigh Milky Sticks Dog Snack', price: 5500, exp: '2027-09-05', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=400&q=80', specs: 'Made with real chicken meat, high protein.', created_at: Date.now() - 400 },
    { type: 'Dogs', category: 'Medicine', name: 'Heartgard Plus Chewables', price: 22000, exp: '2028-05-12', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80', specs: 'Monthly beef-flavored heartworm preventive.', created_at: Date.now() - 500 },
    // 3 Accessories Items
    { type: 'Accessories', category: 'Bowls', name: 'Anti-Slip Double Pet Food Bowl', price: 9500, exp: 'N/A', img: 'https://images.unsplash.com/photo-1601758174114-e711c0cbea69?auto=format&fit=crop&w=400&q=80', specs: 'Stainless steel removable bowls for food & water.', created_at: Date.now() - 600 },
    { type: 'Accessories', category: 'Toys', name: 'Interactive Feather Teaser Wand', price: 4000, exp: 'N/A', img: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=400&q=80', specs: 'Natural feathers with bell for indoor exercise.', created_at: Date.now() - 700 },
    { type: 'Accessories', category: 'Gear', name: 'Adjustable Reflective Pet Harness', price: 13000, exp: 'N/A', img: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=400&q=80', specs: 'Breathable mesh chest vest with 1.5m leash.', created_at: Date.now() - 800 }
];

try {
    if (SUPABASE_URL && SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.startsWith('eyJ') && window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        document.getElementById('sysBanner').classList.add('hidden');
    } else {
        useLocalFallback = true;
        document.getElementById('sysBanner').classList.remove('hidden');
    }
} catch (err) {
    console.error("Supabase init error:", err);
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
        search_res: "Search Results for"
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
    if (categoryTitle.innerText.includes('Search Results') || categoryTitle.innerText.includes('ရှာဖွေမှုရလဒ်များ')) {
        const term = searchInput.value.trim();
        categoryTitle.innerText = `${translations[currentLang].search_res} "${term}"`;
    } else if (searchInput.value === '') {
        categoryTitle.innerText = translations[currentLang].all_items;
    }
}

// ==========================================
// 3. PRODUCT & SYNC STATE
// ==========================================
let products = [];
let currentProducts = [];
let cart = JSON.parse(localStorage.getItem('kosoepets_cart_v71')) || [];
let isAdmin = false;
let currentAdminPass = localStorage.getItem('kosoepets_pass_v71') || 'admin';
let seededInitialData = false;

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categoryTitle = document.getElementById('categoryTitle');

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.has-sub')) {
            document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
        }
    });
    updateCartCount();
    fetchProducts();
});

function toggleSubMenu(e, linkEl) {
    e.preventDefault();
    e.stopPropagation();
    const parentLi = linkEl.parentElement;
    const wasOpen = parentLi.classList.contains('open');
    document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
    if (!wasOpen) parentLi.classList.add('open');
}

async function fetchProducts() {
    if (useLocalFallback) {
        let stored = localStorage.getItem('kosoepets_products_v71');
        products = stored ? JSON.parse(stored) : sampleProducts.map((p, i) => ({ ...p, id: i + 1 }));
        products.sort((a, b) => b.created_at - a.created_at);
        currentProducts = [...products];
        renderProducts(currentProducts);
    } else {
        const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Supabase fetch error:", error.message);
            productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ff4757;">Database error: ${error.message}</p>`;
            return;
        }
        // Auto-seed 9 sample items if database table is empty
        if ((!data || data.length === 0) && !seededInitialData) {
            seededInitialData = true;
            await supabaseClient.from('products').insert(sampleProducts);
            return fetchProducts();
        }
        products = data || [];
        currentProducts = [...products];
        renderProducts(currentProducts);

        supabaseClient.channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                fetchProducts();
            })
            .subscribe();
    }
}

// ==========================================
// 4. IMAGE UPLOAD HANDLER (Max 5MB)
// ==========================================
function handleImageUpload(inputId, targetUrlId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert(translations[currentLang].img_limit);
                el.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function (evt) { document.getElementById(targetUrlId).value = evt.target.result; };
            reader.readAsDataURL(file);
        }
    });
}
handleImageUpload('addImgFile', 'addImg');
handleImageUpload('editImgFile', 'editImg');

// ==========================================
// 5. CART & VOUCHER LOGIC
// ==========================================
function addToCart(id) {
    const item = products.find(p => p.id === id);
    if (item) {
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
        if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
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

    if (cart.length === 0) {
        listEl.innerHTML = `<p style="text-align:center;">${translations[currentLang].cart_empty}</p>`;
        grandTotalEl.innerText = '0 MMK';
    } else {
        let grandTotal = 0;
        cart.forEach((item) => {
            let itemTotal = Number(item.price) * item.qty;
            grandTotal += itemTotal;
            listEl.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <img src="${item.img}" alt="${item.name}">
                        <span>${item.name}<br><small>${Number(item.price).toLocaleString()} MMK</small></span>
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
    if (cart.length === 0) return;

    let grandTotal = 0;
    let orderSummary = `Items | Selected products%0A`;
    cart.forEach(item => {
        let rowTotal = Number(item.price) * item.qty;
        grandTotal += rowTotal;
        orderSummary += `Product Name | ${item.name}%0AQty | ${item.qty}%0APrice | ${Number(item.price).toLocaleString()} MMK%0A-%0A`;
    });
    orderSummary += `Grand Total | ${grandTotal.toLocaleString()} MMK%0A`;
    orderSummary += `Discount | 0 MMK%0A%0A`;
    orderSummary += `Thanks for your shopping!`;

    const viberUrl = `viber://chat?number=%2B959262597117&text=${orderSummary}`;
    window.location.href = viberUrl;
}

// ==========================================
// 6. UI RENDER, SEARCH & FILTER LOGIC
// ==========================================
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (term === '') {
        categoryTitle.innerText = translations[currentLang].all_items;
        currentProducts = products;
        renderProducts(products);
        return;
    }
    categoryTitle.innerText = `${translations[currentLang].search_res} "${term}"`;
    currentProducts = products.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.type && p.type.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term)) ||
        (p.specs && p.specs.toLowerCase().includes(term))
    );
    renderProducts(currentProducts);
});

function renderProducts(items) {
    productGrid.innerHTML = '';
    if (!items || items.length === 0) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666;">No products found.</p>`;
        return;
    }
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        let adminHtml = isAdmin ? `
            <div class="card-admin-actions">
                <button class="edit-btn" onclick="openEdit(${item.id})"><i class="fa fa-edit"></i> Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${item.id})"><i class="fa fa-trash"></i> Del</button>
            </div>` : '';

        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="product-img">
            <div class="product-info">
                <h3>${item.name}</h3>
                <p class="price">${Number(item.price).toLocaleString()} MMK</p>
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
    searchInput.value = '';
    categoryTitle.innerText = translations[currentLang].all_items;
    currentProducts = products;
    renderProducts(products);
}

function filterProducts(type, category) {
    searchInput.value = '';
    categoryTitle.innerText = `${type} - ${translations[currentLang][category.toLowerCase()] || category}`;
    currentProducts = products.filter(p => p.type === type && p.category === category);
    renderProducts(currentProducts);
}

// ==========================================
// 7. ADMIN C
