// ==========================================
// KO SOE LOVE PETS v8.4 — POS TERMINAL ENGINE
// Supports Pyidaungsu Myanmar Unicode + EN/MM Language Switcher
// ==========================================
const SUPABASE_URL = 'https://moggsrqzhygvavsdcanh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ2dzcnF6aHlndmF2c2RjYW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0NzE0NzYsImV4cCI6MjExMDA0NzQ3Nn0.l8Et78xU1eo6f7UND-0ONHPPJfM_oJ-qEMyKUAZoPIU';

let staffToken = localStorage.getItem('kosoepets_staff_token_v75') || '';
let currentPosLang = localStorage.getItem('kosoepets_pos_lang') || 'en';
let supabaseClient = null;
let currentUser = null;
let userPermissions = {};

let products = [];
let stockMap = {};
let lowThreshold = 15;
let selectedCategory = 'ALL';
let posCart = [];
let salesHistory = [];
let stockMovements = [];

const posTranslations = {
    en: {
        pos_title: "Ko Soe Love Pets POS",
        tab_register: "Register",
        tab_restock: "Stock-In / Adjust",
        tab_history: "Sales & Ledger",
        btn_storefront: "Storefront",
        btn_logout: "Logout",
        login_heading: "POS Staff Sign In",
        login_sub: "Sign in with your Ko Soe Love Pets Admin or Sales Team account.",
        ph_username: "Username",
        ph_password: "Password",
        btn_open_pos: "Open POS Register",
        ph_search: "Scan barcode or search SKU (P00001) / Product Name...",
        cat_all: "All Items",
        cat_cats: "Cats",
        cat_dogs: "Dogs",
        cat_acc: "Accessories",
        current_receipt: "Current Receipt",
        btn_clear: "Clear",
        empty_cart: "Select items or scan SKU to start sale",
        lbl_channel: "Order Channel",
        opt_instore: "In-Store Walk-in",
        opt_viber: "Viber Paid Order",
        lbl_payment: "Payment Method",
        pay_cash: "Cash (MMK)",
        pay_bank: "Bank Transfer",
        lbl_discount: "Discount (MMK)",
        lbl_cash_received: "Cash Received (MMK)",
        ph_exact_cash: "Leave blank for exact",
        lbl_tx_ref: "Transfer Ref / Last 6 Digits",
        ph_cust_note: "Optional customer name / phone / delivery note...",
        lbl_subtotal: "Subtotal:",
        lbl_discount_line: "Discount:",
        lbl_grand_total: "Grand Total:",
        lbl_change: "Change Due:",
        btn_complete_sale: "Complete Sale & Print Receipt",
        restock_heading: "Inventory Stock-In & Count Adjustment",
        restock_sub: "Updates live website stock immediately and logs every change in the audit ledger.",
        btn_export_stock: "Export Current Stock (CSV)",
        th_product: "Product Name",
        th_category: "Category",
        th_price: "Price",
        th_stock: "Current Stock",
        th_status: "Status",
        th_action: "Action",
        kpi_sales: "Today's Completed Sales",
        kpi_rev: "Today's Revenue (MMK)",
        kpi_split: "In-Store vs. Viber Paid",
        kpi_low: "Low Stock Items",
        receipts_heading: "POS Receipts",
        btn_all_dates: "All Dates",
        btn_export_sales: "Export Sales Report (CSV)",
        th_receipt: "Receipt #",
        th_datetime: "Date / Time",
        th_channel: "Channel",
        th_payment: "Payment",
        th_total: "Grand Total",
        th_cashier: "Cashier",
        ledger_heading: "Stock Movement Ledger (Last 100 Movements)",
        th_time: "Time",
        th_type: "Type",
        th_change: "Change",
        th_before_after: "Before → After",
        th_note: "Ref / Note",
        th_staff: "Staff",
        modal_restock_title: "Update Stock",
        lbl_update_mode: "Update Mode",
        opt_add_stock: "Add Incoming Stock (+ Qty)",
        opt_set_stock: "Set Exact Physical Count (= Qty)",
        lbl_qty: "Quantity",
        lbl_reason: "Reason / Supplier Note",
        ph_restock_note: "e.g. New shipment from supplier",
        btn_save_stock: "Save Stock Update",
        badge_in: "In Stock",
        badge_low: "Low Stock",
        badge_out: "Out of Stock",
        btn_stock_in: "Stock-In / Adjust",
        btn_print: "Print",
        btn_void: "Void",
        btn_view_receipt: "View Receipt →"
    },
    mm: {
        pos_title: "ကိုစိုး Love Pets POS စနစ်",
        tab_register: "အရောင်းကောင်တာ",
        tab_restock: "ပစ္စည်းအဝင် / လက်ကျန်ပြင်ရန်",
        tab_history: "အရောင်းမှတ်တမ်း",
        btn_storefront: "ဆိုင်စာမျက်နှာ",
        btn_logout: "ထွက်ရန်",
        login_heading: "POS ဝန်ထမ်းအကောင့်ဝင်ရန်",
        login_sub: "Admin သို့မဟုတ် Sales Team အကောင့်ဖြင့် ဝင်ရောက်ပါ။",
        ph_username: "အသုံးပြုသူအမည် (Username)",
        ph_password: "စကားဝှက် (Password)",
        btn_open_pos: "POS စနစ်ဖွင့်မည်",
        ph_search: "SKU ကုဒ် (P00001) သို့မဟုတ် ပစ္စည်းအမည် ရိုက်ရှာပါ...",
        cat_all: "ပစ္စည်းအားလုံး",
        cat_cats: "ကြောင်ပစ္စည်း",
        cat_dogs: "ခွေးပစ္စည်း",
        cat_acc: "အသုံးအဆောင်",
        current_receipt: "လက်ရှိဘောက်ချာ",
        btn_clear: "ရှင်းလင်းမည်",
        empty_cart: "အရောင်းစတင်ရန် ပစ္စည်းရွေးချယ်ပါ သို့မဟုတ် SKU ရိုက်ထည့်ပါ",
        lbl_channel: "အရောင်းအမျိုးအစား",
        opt_instore: "ဆိုင်လာဝယ် (In-Store)",
        opt_viber: "Viber ငွေရှင်းပြီးအော်ဒါ",
        lbl_payment: "ငွေပေးချေမှုပုံစံ",
        pay_cash: "ငွေသား (Cash)",
        pay_bank: "ဘဏ်လွှဲ (Bank Transfer)",
        lbl_discount: "လျှော့စျေး (MMK)",
        lbl_cash_received: "လက်ခံရရှိငွေ (MMK)",
        ph_exact_cash: "အတိအကျဆိုလျှင် ဗလာထားပါ",
        lbl_tx_ref: "ငွေလွှဲပြေစာနံပါတ်",
        ph_cust_note: "ဝယ်သူအမည် / ဖုန်းနံပါတ် / မှတ်ချက်...",
        lbl_subtotal: "စုစုပေါင်း:",
        lbl_discount_line: "လျှော့စျေး:",
        lbl_grand_total: "ကျသင့်ငွေ:",
        lbl_change: "ပြန်အမ်းငွေ:",
        btn_complete_sale: "အရောင်းအတည်ပြုပြီး ဘောက်ချာထုတ်မည်",
        restock_heading: "ပစ္စည်းအဝင်ထည့်သွင်းခြင်းနှင့် လက်ကျန်ပြင်ဆင်ခြင်း",
        restock_sub: "ပြင်ဆင်လိုက်သည်နှင့် Website ပေါ်ရှိ လက်ကျန်စာရင်း ချက်ချင်းပြောင်းလဲပါမည်။",
        btn_export_stock: "လက်ကျန်စာရင်း (CSV) ထုတ်ယူရန်",
        th_product: "ပစ္စည်းအမည်",
        th_category: "အမျိုးအစား",
        th_price: "စျေးနှုန်း",
        th_stock: "လက်ကျန်အရေအတွက်",
        th_status: "အခြေအနေ",
        th_action: "လုပ်ဆောင်ချက်",
        kpi_sales: "ယနေ့အရောင်းအရေအတွက်",
        kpi_rev: "ယနေ့ရောင်းရငွေ (MMK)",
        kpi_split: "ဆိုင်ဝယ် / Viber အော်ဒါ",
        kpi_low: "လက်ကျန်နည်းပစ္စည်း",
        receipts_heading: "အရောင်းဘောက်ချာများ",
        btn_all_dates: "ရက်စွဲအားလုံး",
        btn_export_sales: "အရောင်းစာရင်း (CSV) ထုတ်ယူရန်",
        th_receipt: "ဘောက်ချာနံပါတ်",
        th_datetime: "ရက်စွဲ / အချိန်",
        th_channel: "အရောင်းလမ်းကြောင်း",
        th_payment: "ငွေချေစနစ်",
        th_total: "စုစုပေါင်းကျသင့်ငွေ",
        th_cashier: "အရောင်းဝန်ထမ်း",
        ledger_heading: "ပစ္စည်းအဝင်/အထွက် မှတ်တမ်း (နောက်ဆုံး ၁၀၀)",
        th_time: "အချိန်",
        th_type: "အမျိုးအစား",
        th_change: "အပြောင်းအလဲ",
        th_before_after: "ယခင် → ယခု",
        th_note: "မှတ်ချက်",
        th_staff: "ဝန်ထမ်း",
        modal_restock_title: "လက်ကျန်အရေအတွက် ပြင်ဆင်ရန်",
        lbl_update_mode: "ပြင်ဆင်မည့်ပုံစံ",
        opt_add_stock: "ပစ္စည်းအသစ်ထပ်ပေါင်းမည် (+ Qty)",
        opt_set_stock: "လက်ရှိအရေအတွက် အတိအကျသတ်မှတ်မည် (= Qty)",
        lbl_qty: "အရေအတွက်",
        lbl_reason: "အကြောင်းအရင်း / မှတ်ချက်",
        ph_restock_note: "ဥပမာ - ပစ္စည်းအသစ်ရောက်ရှိ",
        btn_save_stock: "သိမ်းဆည်းမည်",
        badge_in: "ပစ္စည်းရှိသည်",
        badge_low: "လက်ကျန်နည်း",
        badge_out: "ပစ္စည်းပြတ်",
        btn_stock_in: "အဝင်ထည့် / ပြင်ရန်",
        btn_print: "Print ထုတ်ရန်",
        btn_void: "ပယ်ဖျက်ရန်",
        btn_view_receipt: "ဘောက်ချာကြည့်ရန် →"
    }
};

function tPos(key) {
    return (posTranslations[currentPosLang] && posTranslations[currentPosLang][key]) || posTranslations.en[key] || key;
}

function switchPosLanguage() {
    const sel = document.getElementById('posLangSelect');
    if (sel) currentPosLang = sel.value;
    localStorage.setItem('kosoepets_pos_lang', currentPosLang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (posTranslations[currentPosLang][key]) {
            el.innerText = posTranslations[currentPosLang][key];
        }
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (posTranslations[currentPosLang][key]) {
            el.placeholder = posTranslations[currentPosLang][key];
        }
    });

    renderPosCatalog();
    renderPosCart();
    renderRestockTable();
    if (!document.getElementById('posHistoryView').classList.contains('hidden')) {
        fetchPosSalesHistory();
    }
}

function initSupabase() {
    const headers = staffToken ? { 'x-staff-token': staffToken } : {};
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers }
    });
}

initSupabase();

function showPosToast(msg) {
    const el = document.getElementById('posToast');
    el.innerText = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 2600);
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function hasPosPerm(code) {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    return Boolean(userPermissions && userPermissions[code]);
}

// ==========================================
// 1. AUTHENTICATION (Shares Storefront Session)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const langSel = document.getElementById('posLangSelect');
    if (langSel) langSel.value = currentPosLang;
    switchPosLanguage();

    document.getElementById('posSearchInput').addEventListener('input', renderPosCatalog);
    document.getElementById('posSearchInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBarcodeOrSkuEnter();
        }
    });

    if (staffToken) {
        const { data, error } = await supabaseClient.rpc('rpc_validate_session');
        if (!error && data && data.valid) {
            currentUser = data.user;
            userPermissions = data.permissions || {};
            await activatePosWorkspace();
            return;
        }
    }
    document.getElementById('posLoginGate').classList.remove('hidden');
});

async function posLogin() {
    const username = document.getElementById('posLoginUser').value.trim();
    const password = document.getElementById('posLoginPass').value.trim();
    const errEl = document.getElementById('posLoginError');
    const btn = document.getElementById('posLoginSubmitBtn');

    if (!username || !password) {
        errEl.innerText = currentPosLang === 'mm' ? 'အသုံးပြုသူအမည်နှင့် စကားဝှက် ထည့်သွင်းပါ။' : 'Please enter username and password.';
        return;
    }

    btn.disabled = true;
    errEl.innerText = '';
    try {
        const { data, error } = await supabaseClient.rpc('rpc_staff_login', {
            p_username: username,
            p_password: password,
            p_user_agent: navigator.userAgent
        });
        if (error || !data || !data.success) {
            if (data && data.code === 'ALREADY_LOGGED_IN') {
                errEl.innerText = currentPosLang === 'mm'
                    ? 'ဤအကောင့်သည် အခြားစက်တစ်ခုတွင် ဝင်ရောက်အသုံးပြုနေပါသည်။ ထိုစက်မှ Logout အရင်လုပ်ပါ။'
                    : 'Already logged in on another device. Please logout from the other device first.';
            } else {
                errEl.innerText = (data && data.error) ? data.error : (error ? error.message : 'Login failed.');
            }
            return;
        }
        staffToken = data.token;
        localStorage.setItem('kosoepets_staff_token_v75', staffToken);
        currentUser = data.user;
        userPermissions = data.permissions || {};
        initSupabase();
        await activatePosWorkspace();
    } finally {
        btn.disabled = false;
    }
}

async function posLogout() {
    if (staffToken) {
        try { await supabaseClient.rpc('rpc_staff_logout', { p_user_agent: navigator.userAgent }); } catch (_) {}
    }
    staffToken = '';
    localStorage.removeItem('kosoepets_staff_token_v75');
    currentUser = null;
    userPermissions = {};
    location.reload();
}

async function activatePosWorkspace() {
    if (!hasPosPerm('pos.sell') && !hasPosPerm('pos.restock')) {
        document.getElementById('posLoginError').innerText = 'Your account does not have POS access permissions.';
        return;
    }

    document.getElementById('posLoginGate').classList.add('hidden');
    document.getElementById('posNavTabs').classList.remove('hidden');
    document.getElementById('posLogoutBtn').classList.remove('hidden');

    const chip = document.getElementById('posCashierChip');
    chip.classList.remove('hidden');
    chip.title = `${currentUser.display_name} (${currentUser.role})`;
    chip.innerHTML = `<i class="fa fa-user-check"></i> ${escapeHtml(currentUser.display_name)}`;

    document.getElementById('navRegisterBtn').classList.toggle('hidden', !hasPosPerm('pos.sell'));
    document.getElementById('navRestockBtn').classList.toggle('hidden', !hasPosPerm('pos.restock'));

    await refreshPosData();
    subscribeRealtimeStock();

    if (hasPosPerm('pos.sell')) {
        switchPosTab('register');
    } else {
        switchPosTab('restock');
    }
}
function switchPosTab(tab) {
    ['navRegisterBtn', 'navRestockBtn', 'navHistoryBtn'].forEach(id => {
        document.getElementById(id).classList.remove('active');
    });
    document.getElementById('posRegisterView').classList.add('hidden');
    document.getElementById('posRestockView').classList.add('hidden');
    document.getElementById('posHistoryView').classList.add('hidden');
    const mrb = document.getElementById('mobileReceiptBar');
    if (mrb) mrb.classList.toggle('hidden', tab !== 'register');

    if (tab === 'register') {
        document.getElementById('navRegisterBtn').classList.add('active');
        document.getElementById('posRegisterView').classList.remove('hidden');
        document.getElementById('posSearchInput').focus();
    } else if (tab === 'restock') {
        document.getElementById('navRestockBtn').classList.add('active');
        document.getElementById('posRestockView').classList.remove('hidden');
        renderRestockTable();
    } else if (tab === 'history') {
        document.getElementById('navHistoryBtn').classList.add('active');
        document.getElementById('posHistoryView').classList.remove('hidden');
        fetchPosSalesHistory();
        fetchStockMovements();
    }
}

// ==========================================
// 2. DATA LOADING & REALTIME SYNC
// ==========================================
async function refreshPosData() {
    const [settingsRes, prodRes, stockRes] = await Promise.all([
        supabaseClient.from('store_settings').select('stock_low_threshold').eq('id', 1).single(),
        supabaseClient.from('products').select('*').order('sku', { ascending: true }),
        supabaseClient.from('product_stock').select('*')
    ]);

    if (settingsRes.data && settingsRes.data.stock_low_threshold) {
        lowThreshold = Number(settingsRes.data.stock_low_threshold);
        document.getElementById('kpiLowThresh').innerText = lowThreshold;
    }

    products = prodRes.data || [];
    const nextMap = {};
    for (const row of stockRes.data || []) {
        if (row.product_sku) {
            nextMap[String(row.product_sku).trim().toUpperCase()] = row;
        }
    }
    stockMap = nextMap;

    renderPosCatalog();
    renderRestockTable();
    updateKpiStrip();
}

function subscribeRealtimeStock() {
    supabaseClient.channel('pos:product_stock')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'product_stock' }, () => {
            refreshPosData();
        })
        .subscribe();
}

function getStockForProduct(prod) {
    if (prod.is_available === false) {
        return { qty: 0, status: 'OUT_OF_STOCK' };
    }
    const sku = prod.sku ? String(prod.sku).trim().toUpperCase() : '';
    const rec = sku ? stockMap[sku] : null;
    if (!rec) return { qty: 0, status: 'OUT_OF_STOCK' };

    const qty = Number(rec.stock_qty || 0);
    let status = 'IN_STOCK';
    if (qty <= 0) status = 'OUT_OF_STOCK';
    else if (qty <= lowThreshold) status = 'LOW_STOCK';
    return { qty, status };
}

// ==========================================
// 3. CATALOG TILE GRID & SKU BARCODE SCANNER
// ==========================================
function setPosCategory(cat, btnEl) {
    selectedCategory = cat;
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    renderPosCatalog();
}

function renderPosCatalog() {
    const grid = document.getElementById('posProductGrid');
    if (!grid) return;
    const q = document.getElementById('posSearchInput').value.toLowerCase().trim();

    let list = products.filter(p => {
        if (selectedCategory !== 'ALL' && p.type !== selectedCategory) return false;
        if (!q) return true;
        return (
            (p.sku && p.sku.toLowerCase().includes(q)) ||
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q))
        );
    });

    if (list.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#64748b; padding:30px;">${currentPosLang === 'mm' ? 'ကိုက်ညီသော ပစ္စည်းမတွေ့ပါ။' : 'No matching products found.'}</p>`;
        return;
    }

    grid.innerHTML = list.map(p => {
        const st = getStockForProduct(p);
        const disabled = st.status === 'OUT_OF_STOCK' || !p.sku;
        const badgeClass = st.status === 'IN_STOCK' ? 'in' : (st.status === 'LOW_STOCK' ? 'low' : 'out');
        const badgeText = st.status === 'OUT_OF_STOCK'
            ? (currentPosLang === 'mm' ? 'ပြတ် (0)' : 'Out (0)')
            : (currentPosLang === 'mm' ? `ကျန်: ${st.qty}` : `Stock: ${st.qty}`);

        return `
            <div class="pos-item-tile ${disabled ? 'disabled' : ''}" onclick="${disabled ? '' : `addPosCartItem(${p.id})`}">
                <div>
                    <div class="pos-tile-top">
                        <span class="sku-tag">${escapeHtml(p.sku || 'NO-SKU')}</span>
                        <span class="stock-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <img src="${escapeHtml(p.img || '')}" class="pos-tile-img" onerror="this.style.display='none'">
                    <div class="pos-tile-name">${escapeHtml(p.name)}</div>
                </div>
                <div class="pos-tile-price">${Number(p.price).toLocaleString()} MMK</div>
            </div>
        `;
    }).join('');
}

function handleBarcodeOrSkuEnter() {
    const input = document.getElementById('posSearchInput');
    const code = input.value.trim().toUpperCase();
    if (!code) return;

    const exact = products.find(p => p.sku && p.sku.toUpperCase() === code);
    if (exact) {
        addPosCartItem(exact.id);
        input.value = '';
        renderPosCatalog();
    }
}

// ==========================================
// 4. POS CART & ATOMIC CHECKOUT
// ==========================================
function addPosCartItem(productId) {
    const prod = products.find(p => Number(p.id) === Number(productId));
    if (!prod) return;

    const st = getStockForProduct(prod);
    if (st.status === 'OUT_OF_STOCK') {
        alert(currentPosLang === 'mm' ? `${prod.name} ပစ္စည်းပြတ်နေပါသည်။` : `${prod.name} is Out of Stock.`);
        return;
    }

    const existing = posCart.find(c => Number(c.id) === Number(productId));
    const currentQty = existing ? existing.qty : 0;

    if (currentQty + 1 > st.qty) {
        alert(currentPosLang === 'mm'
            ? `${prod.name} (${prod.sku}) လက်ကျန် ${st.qty} ခုသာ ရှိပါသည်။`
            : `Only ${st.qty} units available for ${prod.name} (${prod.sku}).`);
        return;
    }

    if (existing) {
        existing.qty += 1;
    } else {
        posCart.push({
            id: prod.id,
            sku: prod.sku,
            name: prod.name,
            price: Number(prod.price),
            qty: 1
        });
    }
    renderPosCart();
}

function changePosCartQty(productId, delta) {
    const item = posCart.find(c => Number(c.id) === Number(productId));
    if (!item) return;

    if (delta > 0) {
        const prod = products.find(p => Number(p.id) === Number(productId));
        const st = prod ? getStockForProduct(prod) : { qty: item.qty };
        if (item.qty + delta > st.qty) {
            alert(currentPosLang === 'mm' ? `အများဆုံးလက်ကျန် ${st.qty} ခုသာ ရှိပါသည်။` : `Maximum stock available is ${st.qty}.`);
            return;
        }
    }

    item.qty += delta;
    if (item.qty <= 0) {
        posCart = posCart.filter(c => Number(c.id) !== Number(productId));
    }
    renderPosCart();
}

function clearPosCart() {
    posCart = [];
    document.getElementById('posDiscountInput').value = 0;
    document.getElementById('posCashTendered').value = '';
    document.getElementById('posPaymentRef').value = '';
    document.getElementById('posCustomerNote').value = '';
    renderPosCart();
}

function toggleCashTenderedField() {
    const method = document.getElementById('posPaymentMethod').value;
    const isCash = method === 'CASH';
    document.getElementById('cashTenderedGroup').classList.toggle('hidden', !isCash);
    document.getElementById('posChangeLine').classList.toggle('hidden', !isCash);
    document.getElementById('paymentRefGroup').classList.toggle('hidden', isCash);
    recalcPosTotals();
}

function renderPosCart() {
    const listEl = document.getElementById('posCartList');
    if (!listEl) return;
    if (posCart.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; color:#64748b; padding:35px 0; font-weight:600;">${tPos('empty_cart')}</p>`;
        recalcPosTotals();
        return;
    }

    listEl.innerHTML = posCart.map(item => `
        <div class="pos-cart-row">
            <div>
                <div class="pos-cart-row-title">${escapeHtml(item.name)}</div>
                <div class="pos-cart-row-sub">${escapeHtml(item.sku)} &bull; ${item.price.toLocaleString()} MMK</div>
            </div>
            <div class="qty-box">
                <button type="button" class="qty-btn" onclick="changePosCartQty(${item.id}, -1)">-</button>
                <strong>${item.qty}</strong>
                <button type="button" class="qty-btn" onclick="changePosCartQty(${item.id}, 1)">+</button>
            </div>
            <div style="font-weight:800; font-size:14px; min-width:85px; text-align:right;">
                ${(item.price * item.qty).toLocaleString()}
            </div>
            <button type="button" class="btn-sm danger" onclick="changePosCartQty(${item.id}, -9999)">&times;</button>
        </div>
    `).join('');

    recalcPosTotals();
}


function toggleMobileReceiptDrawer(open) {
    const panel = document.querySelector('.pos-cart-panel');
    if (!panel) return;
    if (open) {
        panel.classList.add('mobile-open');
    } else {
        panel.classList.remove('mobile-open');
    }
}

function recalcPosTotals() {
    const subtotal = posCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    let discount = Math.max(0, parseInt(document.getElementById('posDiscountInput').value) || 0);
    if (discount > subtotal) discount = subtotal;
    const grandTotal = subtotal - discount;

    document.getElementById('posSubtotalVal').innerText = `${subtotal.toLocaleString()} MMK`;
    document.getElementById('posDiscountVal').innerText = `${discount.toLocaleString()} MMK`;
    document.getElementById('posGrandTotalVal').innerText = `${grandTotal.toLocaleString()} MMK`;

    const tendered = parseInt(document.getElementById('posCashTendered').value);
    const change = (!isNaN(tendered) && tendered >= grandTotal) ? (tendered - grandTotal) : 0;
    document.getElementById('posChangeVal').innerText = `${change.toLocaleString()} MMK`;

    const totalQty = posCart.reduce((sum, i) => sum + i.qty, 0);
    const mBadge = document.getElementById('mobileCartBadge');
    const mTotal = document.getElementById('mobileCartTotal');
    const mSub = document.getElementById('mobileCartSub');
    if (mBadge) mBadge.innerText = totalQty;
    if (mTotal) mTotal.innerText = `${grandTotal.toLocaleString()} MMK`;
    if (mSub) {
        mSub.innerText = totalQty > 0
            ? (currentPosLang === 'mm' ? `${totalQty} မျိုး ရွေးထားပါသည် — နှိပ်၍ ငွေရှင်းပါ` : `${totalQty} item(s) — Tap to review & checkout`)
            : (currentPosLang === 'mm' ? 'ပစ္စည်းမရွေးရသေးပါ' : 'No items selected yet');
    }
}

async function completePosSale() {
    if (posCart.length === 0) {
        alert(currentPosLang === 'mm' ? 'ဘောက်ချာထဲတွင် ပစ္စည်းမရှိသေးပါ။' : 'POS cart is empty.');
        return;
    }

    const channel = document.getElementById('posSaleChannel').value;
    const paymentMethod = document.getElementById('posPaymentMethod').value;
    const paymentRef = document.getElementById('posPaymentRef').value.trim();
    const customerNote = document.getElementById('posCustomerNote').value.trim();
    const discount = Math.max(0, parseInt(document.getElementById('posDiscountInput').value) || 0);
    const cashRaw = document.getElementById('posCashTendered').value.trim();
    // Blank or 0 means exact cash received
    const cashTendered = (paymentMethod === 'CASH' && cashRaw !== '' && parseInt(cashRaw) > 0) ? parseInt(cashRaw) : null;

    const btn = document.getElementById('posCompleteSaleBtn');
    btn.disabled = true;

    try {
        const itemsPayload = posCart.map(c => ({ id: c.id, qty: c.qty }));
        const { data, error } = await supabaseClient.rpc('rpc_complete_pos_sale', {
            p_items: itemsPayload,
            p_sale_channel: channel,
            p_payment_method: paymentMethod,
            p_payment_ref: paymentRef || null,
            p_customer_note: customerNote || null,
            p_discount: discount,
            p_cash_tendered: cashTendered,
            p_user_agent: navigator.userAgent
        });

        if (error || !data || !data.success) {
            alert('Sale blocked: ' + ((data && data.error) ? data.error : (error ? error.message : 'Unknown error')));
            await refreshPosData();
            return;
        }

        const receiptSnapshot = {
            receipt_no: data.receipt_no,
            sale_channel: channel,
            payment_method: paymentMethod,
            payment_ref: paymentRef,
            customer_note: customerNote,
            subtotal: data.subtotal,
            discount: data.discount,
            grand_total: data.grand_total,
            cash_tendered: cashTendered,
            change_due: data.change_due || 0,
            cashier_name: currentUser.display_name,
            created_at: new Date().toISOString(),
            items: posCart.map(c => ({
                product_sku: c.sku,
                product_name: c.name,
                unit_price: c.price,
                qty: c.qty,
                line_total: c.price * c.qty
            }))
        };

        showPosToast(`Receipt ${data.receipt_no} completed!`);
        clearPosCart();
        toggleMobileReceiptDrawer(false);
        await refreshPosData();
        printPosReceipt(receiptSnapshot);
    } finally {
        btn.disabled = false;
    }
}

// ==========================================
// 5. THERMAL 80MM / A5 PRINTABLE RECEIPT (WITH PYIDAUNGSU FONT)
// ==========================================
function printPosReceipt(sale) {
    const win = window.open('', '_blank', 'width=440,height=760');
    if (!win) {
        alert('Please allow pop-ups in your browser to print the POS receipt.');
        return;
    }

    const dtStr = new Date(sale.created_at).toLocaleString();
    const rowsHtml = (sale.items || []).map(i => `
        <tr>
            <td>${escapeHtml(i.product_name)}<br><small style="color:#666;">${escapeHtml(i.product_sku)} x ${i.qty} @ ${Number(i.unit_price).toLocaleString()}</small></td>
            <td style="text-align:right; font-weight:700;">${Number(i.line_total).toLocaleString()}</td>
        </tr>
    `).join('');

    const cashLines = (sale.payment_method === 'CASH' && sale.cash_tendered !== null && sale.cash_tendered !== undefined)
        ? `<div><span>Cash Tendered:</span><span>${Number(sale.cash_tendered).toLocaleString()} MMK</span></div>
           <div><span>Change Due:</span><span>${Number(sale.change_due || 0).toLocaleString()} MMK</span></div>`
        : '';

    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(sale.receipt_no)}</title>
            <style>
                @font-face {
                    font-family: 'Pyidaungsu';
                    src: local('Pyidaungsu'), url('https://cdn.jsdelivr.net/gh/mgyway/pyidaungsu-font@master/Pyidaungsu-2.5.3_Regular.ttf') format('truetype');
                }
                body { font-family: 'Pyidaungsu', 'Padauk', 'Noto Sans Myanmar', sans-serif; width: 300px; margin: 0 auto; padding: 14px; color: #111; font-size: 13px; line-height: 1.5; }
                .center { text-align: center; }
                .divider { border-top: 1px dashed #333; margin: 8px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 4px 0; vertical-align: top; }
                .totals div { display: flex; justify-content: space-between; padding: 2px 0; }
                .grand { font-size: 16px; font-weight: 800; border-top: 1px dashed #333; padding-top: 5px; margin-top: 4px; }
                @media print { body { width: 100%; padding: 0; } }
            </style>
        </head>
        <body>
            <div class="center">
                <strong style="font-size:17px;">KO SOE LOVE PETS</strong><br>
                Viber: +959262597117<br>
                TikTok: @ko.soe1376
            </div>
            <div class="divider"></div>
            <div>
                Receipt: <strong>${escapeHtml(sale.receipt_no)}</strong><br>
                Date: ${dtStr}<br>
                Channel: ${escapeHtml(sale.sale_channel)}<br>
                Payment: ${escapeHtml(sale.payment_method)}${sale.payment_ref ? ` (${escapeHtml(sale.payment_ref)})` : ''}<br>
                Cashier: ${escapeHtml(sale.cashier_name)}
                ${sale.customer_note ? `<br>Note: ${escapeHtml(sale.customer_note)}` : ''}
            </div>
            <div class="divider"></div>
            <table><tbody>${rowsHtml}</tbody></table>
            <div class="divider"></div>
            <div class="totals">
                <div><span>Subtotal:</span><span>${Number(sale.subtotal).toLocaleString()} MMK</span></div>
                <div><span>Discount:</span><span>-${Number(sale.discount).toLocaleString()} MMK</span></div>
                <div class="grand"><span>TOTAL:</span><span>${Number(sale.grand_total).toLocaleString()} MMK</span></div>
                ${cashLines}
            </div>
            <div class="divider"></div>
            <div class="center" style="margin-top:8px;">
                Thank you for shopping with us!<br>
                ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါသည်
            </div>
            <script>window.onload = function() { setTimeout(function(){ window.print(); }, 350); };<\/script>
        </body>
        </html>
    `);
    win.document.close();
}

// ==========================================
// 6. RESTOCK / INVENTORY ADJUSTMENT
// ==========================================
function renderRestockTable() {
    const tbody = document.getElementById('posRestockTableBody');
    if (!tbody) return;

    tbody.innerHTML = products.map(p => {
        const st = getStockForProduct(p);
        const badgeClass = st.status === 'IN_STOCK' ? 'in' : (st.status === 'LOW_STOCK' ? 'low' : 'out');
        const label = st.status === 'IN_STOCK' ? tPos('badge_in') : (st.status === 'LOW_STOCK' ? tPos('badge_low') : tPos('badge_out'));

        return `
            <tr>
                <td><code>${escapeHtml(p.sku || '-')}</code></td>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td>${escapeHtml(p.type)} / ${escapeHtml(p.category)}</td>
                <td>${Number(p.price).toLocaleString()} MMK</td>
                <td><strong style="font-size:16px;">${st.qty}</strong></td>
                <td><span class="stock-badge ${badgeClass}">${label}</span></td>
                <td>
                    <button type="button" class="btn-sm primary" onclick="openRestockModal(${p.id})" ${!p.sku ? 'disabled' : ''}>
                        <i class="fa fa-plus-circle"></i> ${tPos('btn_stock_in')}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function openRestockModal(productId) {
    const prod = products.find(p => Number(p.id) === Number(productId));
    if (!prod) return;
    const st = getStockForProduct(prod);

    document.getElementById('restockProductId').value = prod.id;
    document.getElementById('restockProductLabel').innerText = `${prod.name} [${prod.sku}] — ${currentPosLang === 'mm' ? 'လက်ရှိလက်ကျန်' : 'Current Stock'}: ${st.qty}`;
    document.getElementById('restockMode').value = 'ADD';
    document.getElementById('restockQtyInput').value = 10;
    document.getElementById('restockNoteInput').value = '';
    document.getElementById('restockModal').classList.add('open');
}

function closeRestockModal() {
    document.getElementById('restockModal').classList.remove('open');
}

async function submitRestock() {
    const productId = Number(document.getElementById('restockProductId').value);
    const mode = document.getElementById('restockMode').value;
    const qty = parseInt(document.getElementById('restockQtyInput').value);
    const note = document.getElementById('restockNoteInput').value.trim();
    const btn = document.getElementById('saveRestockBtn');

    if (isNaN(qty) || qty < 0) {
        alert('Please enter a valid quantity.');
        return;
    }

    btn.disabled = true;
    try {
        const { data, error } = await supabaseClient.rpc('rpc_restock_product', {
            p_product_id: productId,
            p_mode: mode,
            p_qty: qty,
            p_note: note || null,
            p_user_agent: navigator.userAgent
        });

        if (error || !data || !data.success) {
            alert('Stock update failed: ' + ((data && data.error) ? data.error : (error ? error.message : 'Error')));
            return;
        }

        closeRestockModal();
        showPosToast(`Stock updated (${data.qty_before} → ${data.qty_after})`);
        await refreshPosData();
    } finally {
        btn.disabled = false;
    }
}

// ==========================================
// 7. SALES HISTORY, VOID & CSV/EXCEL EXPORTS
// ==========================================
function updateKpiStrip() {
    let lowCount = 0;
    products.forEach(p => {
        const st = getStockForProduct(p);
        if (st.status === 'LOW_STOCK') lowCount++;
    });
    document.getElementById('kpiLowStockCount').innerText = lowCount;
}

async function fetchPosSalesHistory() {
    const dateFilter = document.getElementById('salesFilterDate').value;
    const { data, error } = await supabaseClient
        .from('pos_sales')
        .select('*, pos_sale_items(*)')
        .order('id', { ascending: false })
        .limit(300);

    if (error) {
        console.error(error);
        return;
    }

    let list = data || [];
    const todayStr = new Date().toLocaleDateString('en-CA');
    let todayCount = 0;
    let todayRev = 0;
    let inStoreCount = 0;
    let viberCount = 0;

    list.forEach(s => {
        const localDate = new Date(s.created_at).toLocaleDateString('en-CA');
        if (localDate === todayStr && s.status === 'COMPLETED') {
            todayCount++;
            todayRev += Number(s.grand_total || 0);
            if (s.sale_channel === 'VIBER_ORDER') viberCount++;
            else inStoreCount++;
        }
    });

    document.getElementById('kpiTodayCount').innerText = todayCount;
    document.getElementById('kpiTodayRevenue').innerText = `${todayRev.toLocaleString()} MMK`;
    document.getElementById('kpiChannelSplit').innerText = `${inStoreCount} / ${viberCount}`;

    if (dateFilter) {
        list = list.filter(s => new Date(s.created_at).toLocaleDateString('en-CA') === dateFilter);
    }
    salesHistory = list;

    const isAdmin = currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN');
    const tbody = document.getElementById('posSalesTableBody');

    if (salesHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#64748b;">No sales receipts recorded yet.</td></tr>';
        return;
    }

    tbody.innerHTML = salesHistory.map(s => {
        const dt = new Date(s.created_at).toLocaleString();
        const isVoid = s.status === 'VOIDED';
        const voidBtn = (isAdmin && !isVoid)
            ? `<button type="button" class="btn-sm danger" onclick="voidPosReceipt(${s.id}, '${escapeHtml(s.receipt_no)}')">${tPos('btn_void')}</button>`
            : '';

        return `
            <tr style="${isVoid ? 'opacity:0.55;' : ''}">
                <td><code><strong>${escapeHtml(s.receipt_no)}</strong></code></td>
                <td><small>${dt}</small></td>
                <td>${escapeHtml(s.sale_channel)}</td>
                <td>${escapeHtml(s.payment_method)}</td>
                <td><strong>${Number(s.grand_total).toLocaleString()} MMK</strong></td>
                <td>${escapeHtml(s.cashier_name)}</td>
                <td><strong style="color:${isVoid ? '#dc2626' : '#16a34a'};">${escapeHtml(s.status)}</strong></td>
                <td style="display:flex; gap:6px;">
                    <button type="button" class="btn-sm" onclick="reprintSaleById(${s.id})"><i class="fa fa-print"></i> ${tPos('btn_print')}</button>
                    ${voidBtn}
                </td>
            </tr>
        `;
    }).join('');
}

function reprintSaleById(saleId) {
    const sale = salesHistory.find(s => Number(s.id) === Number(saleId));
    if (!sale) return;
    printPosReceipt({
        ...sale,
        items: sale.pos_sale_items || []
    });
}

async function voidPosReceipt(saleId, receiptNo) {
    const reason = prompt(`Enter reason to VOID receipt ${receiptNo} (stock will be restored automatically):`, 'Customer return / entry mistake');
    if (reason === null) return;

    const { data, error } = await supabaseClient.rpc('rpc_void_pos_sale', {
        p_sale_id: saleId,
        p_reason: reason,
        p_user_agent: navigator.userAgent
    });

    if (error || !data || !data.success) {
        alert('Void failed: ' + ((data && data.error) ? data.error : (error ? error.message : 'Error')));
        return;
    }

    showPosToast(`Receipt ${receiptNo} voided & stock restored.`);
    await refreshPosData();
    await fetchPosSalesHistory();
    await fetchStockMovements();
}

async function fetchStockMovements() {
    const { data, error } = await supabaseClient
        .from('stock_movements')
        .select('*')
        .order('id', { ascending: false })
        .limit(100);

    if (error) return;
    stockMovements = data || [];
    const tbody = document.getElementById('posMovementsTableBody');

    if (stockMovements.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#64748b;">No stock movements recorded yet.</td></tr>';
        return;
    }

    tbody.innerHTML = stockMovements.map(m => {
        const dt = new Date(m.created_at).toLocaleString();
        const sign = m.qty_change > 0 ? `+${m.qty_change}` : `${m.qty_change}`;
        const color = m.qty_change > 0 ? '#16a34a' : '#dc2626';

        return `
            <tr>
                <td><small>${dt}</small></td>
                <td><code>${escapeHtml(m.product_sku)}</code></td>
                <td>${escapeHtml(m.product_name)}</td>
                <td><strong>${escapeHtml(m.movement_type)}</strong></td>
                <td><strong style="color:${color};">${sign}</strong></td>
                <td>${m.qty_before} &rarr; <strong>${m.qty_after}</strong></td>
                <td><small>${escapeHtml(m.reference_no || '')} ${escapeHtml(m.note || '')}</small></td>
                <td>${escapeHtml(m.actor_name)}</td>
            </tr>
        `;
    }).join('');
}

function downloadCsvFile(filename, rows) {
    const csvContent = '\ufeff' + rows.map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function exportStockCsv() {
    const rows = [['Product ID', 'Product Name', 'Category', 'Price (MMK)', 'Stock Qty', 'Stock Status', 'Exported At']];
    const nowStr = new Date().toLocaleString();
    products.forEach(p => {
        const st = getStockForProduct(p);
        rows.push([p.sku || '', p.name, `${p.type}/${p.category}`, p.price, st.qty, st.status, nowStr]);
    });
    downloadCsvFile(`KoSoeLovePets_Stock_${new Date().toISOString().slice(0,10)}.csv`, rows);
}

function exportSalesCsv() {
    const rows = [['Receipt No', 'Date Time', 'Channel', 'Payment Method', 'Payment Ref', 'Subtotal (MMK)', 'Discount (MMK)', 'Grand Total (MMK)', 'Status', 'Cashier', 'Note']];
    salesHistory.forEach(s => {
        rows.push([
            s.receipt_no,
            new Date(s.created_at).toLocaleString(),
            s.sale_channel,
            s.payment_method,
            s.payment_ref || '',
            s.subtotal,
            s.discount,
            s.grand_total,
            s.status,
            s.cashier_name,
            s.customer_note || ''
        ]);
    });
    downloadCsvFile(`KoSoeLovePets_Sales_${new Date().toISOString().slice(0,10)}.csv`, rows);
}
// ==========================================
// 9. 90-SECOND SESSION KEEPALIVE & HEARTBEAT
// ==========================================
let posHeartbeatTimer = null;
function startPosSessionHeartbeat() {
    clearInterval(posHeartbeatTimer);
    posHeartbeatTimer = setInterval(async () => {
        if (!staffToken || document.hidden) return;
        const { data, error } = await supabaseClient.rpc('rpc_validate_session');
        if (error || !data || !data.valid) {
            clearInterval(posHeartbeatTimer);
            staffToken = '';
            localStorage.removeItem('kosoepets_staff_token_v75');
            alert(currentPosLang === 'mm'
                ? 'လှုပ်ရှားမှုမရှိသည်မှာ စက္ကန့် ၉၀ ကျော်သွားပါသဖြင့် အလိုအလျောက် Logout ဖြစ်သွားပါသည်။'
                : 'Session expired after 90 seconds of inactivity. Please sign in again.');
            location.reload();
        }
    }, 30000);
}
