// ==========================================
// 1. SUPABASE CONFIGURATION (Backend Sync + Staff Token Header)
// ==========================================
const APP_VERSION = 'v8.6';
const SUPABASE_URL = 'https://moggsrqzhygvavsdcanh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ2dzcnF6aHlndmF2c2RjYW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0NzE0NzYsImV4cCI6MjExMDA0NzQ3Nn0.l8Et78xU1eo6f7UND-0ONHPPJfM_oJ-qEMyKUAZoPIU';

let supabaseClient = null;
let useLocalFallback = false;
let staffSessionToken = localStorage.getItem('kosoepets_staff_token_v75') || '';

function rebuildSupabaseClient() {
    if (SUPABASE_URL && SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_LEGACY') && window.supabase) {
        const headers = staffSessionToken ? { 'x-staff-token': staffSessionToken } : {};
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers }
        });
        document.getElementById('sysBanner').classList.add('hidden');
        useLocalFallback = false;
    } else {
        useLocalFallback = true;
        document.getElementById('sysBanner').classList.remove('hidden');
    }
}

try {
    rebuildSupabaseClient();
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
        admin_login: "Staff Login", logout: "Logout", password: "Password",
        all_items: "All Hot Items", add_new: "Add New Product",
        about_us: "About Us", contact_us: "Contact Us",
        cart_title: "Your Cart", product: "Product", qty: "Qty", total: "Total (MMK)",
        discount: "Discount:", grand_total: "Grand Total:",
        buy_viber: "Buy via Viber", download_pdf: "Download PDF", cart_empty: "Your cart is empty.",
        img_limit: "File size exceeds the maximum limit of 5 MB. Please select another image.",
        search_res: "Search Results for", no_match: "No matching products found.",
        voucher_title: "Shopping Voucher", thank_you: "Thanks for your shopping!",
        in_stock: "In Stock", low_stock: "Low Stock", out_of_stock: "Out of Stock", stock_unknown: "Stock unavailable"
    },
    mm: {
        home: "ပင်မစာမျက်နှာ", cats: "ကြောင်များ", dogs: "ခွေးများ", accessories: "ဆက်စပ်ပစ္စည်းများ",
        snack: "သရေစာ", food: "အစားအစာ", medicine: "ဆေးဝါး", bowls: "ပန်းကန်များ", toys: "ကစားစရာများ", gear: "သုံးဆောင်များ",
        admin_login: "ဝန်ထမ်းဝင်ရန်", logout: "ထွက်ရန်", password: "စကားဝှက်",
        all_items: "လူကြိုက်များသော ပစ္စည်းများ", add_new: "ထုတ်ကုန်အသစ်ထည့်ရန်",
        about_us: "ကျွန်ုပ်တို့အကြောင်း", contact_us: "ဆက်သွယ်ရန်",
        cart_title: "သင့်စျေးခြင်းတောင်း", product: "ထုတ်ကုန်", qty: "အရေအတွက်", total: "စုစုပေါင်း (MMK)",
        discount: "လျှော့စျေး:", grand_total: "စုစုပေါင်း ကျသင့်ငွေ:",
        buy_viber: "Viber ဖြင့် ဝယ်မည်", download_pdf: "PDF ဒေါင်းလုဒ်ဆွဲရန်", cart_empty: "စျေးခြင်းတောင်း ဗလာဖြစ်နေပါသည်။",
        img_limit: "ဖိုင်အရွယ်အစားသည် အများဆုံး 5 MB ထက်ကျော်လွန်နေပါသည်။ ကျေးဇူးပြု၍ အခြားပုံတစ်ပုံကို ရွေးချယ်ပါ။",
        search_res: "ရှာဖွေမှုရလဒ်များ -", no_match: "ကိုက်ညီသော ထုတ်ကုန်မတွေ့ပါ။",
        voucher_title: "အဝယ်ဘောက်ချာ", thank_you: "ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါသည်!",
        in_stock: "ပစ္စည်းရှိသည်", low_stock: "လက်ကျန်နည်းနေသည်", out_of_stock: "ပစ္စည်းပြတ်နေသည်", stock_unknown: "လက်ကျန်စာရင်း မရရှိနိုင်ပါ"
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
    const term = searchInput.value.trim();
    if (term !== '') {
        categoryTitle.innerText = `${translations[currentLang].search_res} "${term}"`;
    } else {
        categoryTitle.innerText = translations[currentLang].all_items;
    }
    renderProducts(currentProducts);
    if (document.getElementById('cartModal').style.display === 'block') {
        renderCartItems();
    }
}

// ==========================================
// 3. CENTRALIZED STATE, RBAC & STOCK CACHE
// ==========================================
let products = [];
let currentProducts = [];
let cart = JSON.parse(localStorage.getItem('kosoepets_cart_v741')) || [];

// Live POS Inventory Stock Cache (Single-batch cached by SKU)
let productStockMap = {}; // { 'P001': { product_sku, product_id, stock_qty, stock_status, last_synced_at } }
let stockLowThreshold = 5;
let stockSyncIntervalSec = 60;
let stockSyncTimer = null;
let lastStockSyncError = null;
let stockChannelSubscribed = false;

// Role-Based Access Control State
let currentStaffUser = null;
let currentPermissions = {};
let staffUsersList = [];
let auditLogsList = [];
let activeStaffView = 'products';

const ALL_PERMISSION_CODES = [
    'product.view', 'product.add', 'product.edit', 'product.price_edit',
    'product.specs_edit', 'product.image_edit', 'product.availability_edit',
    'product.delete', 'logs.view', 'settings.edit', 'users.manage',
    'pos.sell', 'pos.restock'
];

function hasPerm(code) {
    if (!currentStaffUser) return false;
    if (currentStaffUser.role === 'SUPER_ADMIN') return true;
    return Boolean(currentPermissions && currentPermissions[code]);
}

function canEditAnyProductField() {
    return (
        hasPerm('product.edit') ||
        hasPerm('product.price_edit') ||
        hasPerm('product.specs_edit') ||
        hasPerm('product.image_edit') ||
        hasPerm('product.availability_edit')
    );
}

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categoryTitle = document.getElementById('categoryTitle');

document.addEventListener('DOMContentLoaded', async () => {
    if (localStorage.getItem('kosoepets_about_v741')) document.getElementById('aboutTextEl').innerText = localStorage.getItem('kosoepets_about_v741');
    let savedContact = JSON.parse(localStorage.getItem('kosoepets_contact_v741'));
    if (savedContact) {
        let cleanPhone = savedContact.phone.replace(/[^0-9+]/g, '');
        document.getElementById('contactPhoneEl').href = `tel:${cleanPhone}`;
        document.getElementById('contactPhoneEl').innerHTML = `<i class="fa fa-phone" style="color:#ff9a9e;"></i> ${savedContact.phone}`;
        document.getElementById('contactEmailEl').innerHTML = `<i class="fa fa-envelope" style="color:#ff9a9e;"></i> ${savedContact.email}`;
        document.getElementById('fbLinkEl').href = savedContact.fb;
        document.getElementById('tiktokLinkEl').href = savedContact.tiktok;
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.has-sub')) {
            document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        }
    });

    updateCartCount();
    await restoreStaffSession();
    await fetchSettings();
    await fetchProducts();
    await fetchCachedProductStock();
    startStockAutoRefresh();
});

async function restoreStaffSession() {
    if (!staffSessionToken || useLocalFallback || !supabaseClient) return;
    try {
        const { data, error } = await supabaseClient.rpc('rpc_validate_session');
        if (!error && data && data.valid) {
            currentStaffUser = data.user;
            currentPermissions = data.permissions || {};
            applyStaffUIState();
        } else {
            staffSessionToken = '';
            localStorage.removeItem('kosoepets_staff_token_v75');
            rebuildSupabaseClient();
        }
    } catch (e) {
        console.warn("Session restore skipped:", e);
    }
}

function toggleSubMenu(e, linkEl) {
    e.preventDefault();
    e.stopPropagation();
    const parentLi = linkEl.parentElement;
    const wasOpen = parentLi.classList.contains('open');
    document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
    if (!wasOpen) parentLi.classList.add('open');
}

function sortNewestFirst(list) {
    return list.sort((a, b) => (Number(b.created_at) || Number(b.id) || 0) - (Number(a.created_at) || Number(a.id) || 0));
}

function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    toast.innerText = msg || 'Successfully added to your cart!';
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2500);
}

function openImageZoom(imgUrl) {
    document.getElementById('zoomedImg').src = imgUrl;
    document.getElementById('imageZoomModal').style.display = 'flex';
}

// ==========================================
// 3.5 BANNER SLIDESHOW & SETTINGS SYNC LOGIC
// ==========================================
let bannerImages = ['https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&w=1200&q=80'];
let bannerSlideIdx = 0;
let bannerInterval = null;
let settingsChannelSubscribed = false;

async function fetchSettings() {
    if (useLocalFallback) {
        let txt = localStorage.getItem('kosoepets_banner_txt_v741');
        let imgs = JSON.parse(localStorage.getItem('kosoepets_banner_imgs_v741'));
        if (txt) document.getElementById('bannerTextEl').innerText = txt;
        if (imgs && imgs.length > 0) bannerImages = imgs;
        renderBannerSlideshow();
    } else {
        const { data, error } = await supabaseClient.from('store_settings').select('*').eq('id', 1).single();
        if (!error && data) {
            if (data.banner_title) document.getElementById('bannerTextEl').innerText = data.banner_title;
            if (data.banner_images && data.banner_images.length > 0) bannerImages = data.banner_images;
            if (data.stock_low_threshold) stockLowThreshold = Number(data.stock_low_threshold);
            if (data.stock_sync_interval_sec) stockSyncIntervalSec = Number(data.stock_sync_interval_sec);

            const threshInput = document.getElementById('settingLowThreshold');
            const intInput = document.getElementById('settingSyncInterval');
            const threshLbl = document.getElementById('dashLowThresholdLabel');
            if (threshInput) threshInput.value = stockLowThreshold;
            if (intInput) intInput.value = stockSyncIntervalSec;
            if (threshLbl) threshLbl.innerText = stockLowThreshold;

            renderBannerSlideshow();
        }

        if (!settingsChannelSubscribed) {
            settingsChannelSubscribed = true;
            supabaseClient.channel('public:store_settings')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => {
                    fetchSettings();
                })
                .subscribe();
        }
    }
}

function renderBannerSlideshow() {
    const container = document.getElementById('bannerSlideshow');
    container.innerHTML = '';
    if (!bannerImages || bannerImages.length === 0) return;
    
    bannerImages.forEach((src, idx) => {
        let img = document.createElement('img');
        img.src = src;
        img.className = 'slideshow-img' + (idx === 0 ? ' active' : '');
        container.appendChild(img);
    });
    
    clearInterval(bannerInterval);
    if (bannerImages.length > 1) {
        bannerInterval = setInterval(() => {
            let imgs = document.querySelectorAll('.slideshow-img');
            if (imgs.length <= 1) return;
            imgs[bannerSlideIdx].classList.remove('active');
            bannerSlideIdx = (bannerSlideIdx + 1) % imgs.length;
            imgs[bannerSlideIdx].classList.add('active');
        }, 2000); 
    }
}

// ==========================================
// 3.6 POS Inventory LIVE STOCK SYNCHRONIZATION (BATCHED & RESILIENT)
// ==========================================
function getEffectiveProductStock(item) {
    // Manual admin override: Force Out of Stock
    if (item.is_available === false) {
        return { status: 'OUT_OF_STOCK', qty: 0, known: true, lastSyncedAt: null };
    }

    const sku = item.sku ? String(item.sku).trim().toUpperCase() : '';
    const record = sku ? productStockMap[sku] : null;

    if (!record || record.stock_status === 'UNKNOWN') {
        return { status: 'UNKNOWN', qty: null, known: false, lastSyncedAt: record ? record.last_synced_at : null };
    }

    const qty = Number(record.stock_qty ?? 0);
    let computedStatus = 'IN_STOCK';
    if (qty <= 0 || record.stock_status === 'OUT_OF_STOCK') {
        computedStatus = 'OUT_OF_STOCK';
    } else if (qty <= stockLowThreshold || record.stock_status === 'LOW_STOCK') {
        computedStatus = 'LOW_STOCK';
    }

    return {
        status: computedStatus,
        qty,
        known: true,
        lastSyncedAt: record.last_synced_at
    };
}

async function fetchCachedProductStock() {
    if (useLocalFallback || !supabaseClient) return;
    try {
        const { data, error } = await supabaseClient.from('product_stock').select('*');
        if (error) {
            console.warn("Could not read product_stock cache:", error.message);
            return;
        }
        const nextMap = {};
        for (const row of data || []) {
            if (row.product_sku) {
                nextMap[String(row.product_sku).trim().toUpperCase()] = row;
            }
        }
        productStockMap = nextMap;
        renderProducts(currentProducts);
        updateDashboardMetrics();
    } catch (e) {
        console.warn("Stock cache fetch error:", e);
    }
}

function startStockAutoRefresh() {
    clearInterval(stockSyncTimer);
    const intervalMs = Math.max(15, Number(stockSyncIntervalSec) || 60) * 1000;

    // Periodic non-disruptive refresh from Supabase POS stock cache (POS Inventory permanently disconnected)
    stockSyncTimer = setInterval(async () => {
        await fetchCachedProductStock();
    }, intervalMs);

    // Subscribe to Realtime changes on product_stock so POS sales & restocks update storefront immediately
    if (!useLocalFallback && supabaseClient && !stockChannelSubscribed) {
        stockChannelSubscribed = true;
        supabaseClient.channel('public:product_stock')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'product_stock' }, () => {
                fetchCachedProductStock();
            })
            .subscribe();
    }
}

async function saveStockSyncSettings() {
    if (!hasPerm('settings.edit')) return;
    const newThresh = Math.max(1, parseInt(document.getElementById('settingLowThreshold').value) || 5);
    const newInt = Math.max(15, parseInt(document.getElementById('settingSyncInterval').value) || 60);

    const { error } = await supabaseClient.from('store_settings').upsert({
        id: 1,
        stock_low_threshold: newThresh,
        stock_sync_interval_sec: newInt
    });
    if (error) {
        alert("Error saving stock settings: " + error.message);
        return;
    }

    stockLowThreshold = newThresh;
    stockSyncIntervalSec = newInt;
    startStockAutoRefresh();
    await writeAuditLog('UPDATE_SETTINGS', 'SETTINGS', 'stock_config', 'Stock Sync Settings', `Updated Low Stock threshold to ${newThresh} and sync interval to ${newInt}s`);
    showToast('Stock sync settings updated!');
    renderProducts(currentProducts);
    updateDashboardMetrics();
}

// ==========================================
// 3.7 SAFE IMAGE UPLOAD (MAGIC-BYTE CHECK + HEIC FALLBACK)
// ==========================================
const SUPABASE_BUCKET = 'product-images';

async function processAndUploadImage(file) {
    if (!supabaseClient) throw new Error("Supabase is not connected.");
    if (file.size > 5 * 1024 * 1024) throw new Error("File exceeds 5MB limit.");

    let processedFile = file;
    const lowerName = (file.name || '').toLowerCase();
    const mime = (file.type || '').toLowerCase();

    let headerBytes = new Uint8Array(0);
    let headerStr = '';
    try {
        const headerBuf = await file.slice(0, 16).arrayBuffer();
        headerBytes = new Uint8Array(headerBuf);
        headerStr = new TextDecoder('ascii').decode(headerBuf);
    } catch (_) {}

    const isPngMagic = headerBytes.length >= 4 && headerBytes[0] === 0x89 && headerBytes[1] === 0x50 && headerBytes[2] === 0x4E && headerBytes[3] === 0x47;
    const isJpegMagic = headerBytes.length >= 3 && headerBytes[0] === 0xFF && headerBytes[1] === 0xD8 && headerBytes[2] === 0xFF;
    const isGifMagic = headerStr.startsWith('GIF8');
    const isWebpMagic = headerStr.startsWith('RIFF') && headerStr.includes('WEBP');
    const isBmpMagic = headerStr.startsWith('BM');

    const isStandardImage =
        isPngMagic || isJpegMagic || isGifMagic || isWebpMagic || isBmpMagic ||
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'].includes(mime) ||
        /\.(jpe?g|png|webp|gif|bmp)$/i.test(lowerName);

    const isRealHeic =
        !isStandardImage && (
            headerStr.includes('ftypheic') ||
            headerStr.includes('ftypheix') ||
            headerStr.includes('ftyphevc') ||
            headerStr.includes('ftypmif1') ||
            headerStr.includes('ftypmsf1') ||
            lowerName.endsWith('.heic') ||
            lowerName.endsWith('.heif') ||
            mime === 'image/heic' ||
            mime === 'image/heif'
        );

    if (isRealHeic) {
        if (typeof heic2any === 'undefined') {
            throw new Error("HEIC conversion library not loaded.");
        }
        try {
            const resultBlob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.85
            });
            const finalBlob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
            const cleanBase = lowerName.replace(/\.hei[cf]$/i, '') || `photo_${Date.now()}`;
            processedFile = new File([finalBlob], `${cleanBase}.jpg`, { type: "image/jpeg" });
        } catch (e) {
            console.error("HEIC conversion failed:", e);
            throw new Error("Could not convert HEIC file. Please select a JPG, PNG, or WEBP photo.");
        }
    }

    let fileExt = 'png';
    let contentType = processedFile.type || 'image/png';

    if (isJpegMagic || mime === 'image/jpeg' || mime === 'image/jpg' || /\.jpe?g$/i.test(processedFile.name || '')) {
        fileExt = 'jpg';
        contentType = 'image/jpeg';
    } else if (isPngMagic || mime === 'image/png' || /\.png$/i.test(processedFile.name || '')) {
        fileExt = 'png';
        contentType = 'image/png';
    } else if (isWebpMagic || mime === 'image/webp' || /\.webp$/i.test(processedFile.name || '')) {
        fileExt = 'webp';
        contentType = 'image/webp';
    } else if (isGifMagic || mime === 'image/gif' || /\.gif$/i.test(processedFile.name || '')) {
        fileExt = 'gif';
        contentType = 'image/gif';
    } else if (isBmpMagic || mime === 'image/bmp' || /\.bmp$/i.test(processedFile.name || '')) {
        fileExt = 'bmp';
        contentType = 'image/bmp';
    }

    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
        .from(SUPABASE_BUCKET)
        .upload(filePath, processedFile, { contentType });

    if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error("Failed to upload image to storage: " + uploadError.message);
    }

    const { data } = supabaseClient.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
}

// Handle Banner Image UI logic
let tempBannerFiles = [];
document.getElementById('editBannerFiles').addEventListener('change', async function(e) {
    let files = Array.from(e.target.files);
    if (files.length > 6) {
        alert("Maximum 6 images allowed.");
        e.target.value = '';
        tempBannerFiles = [];
        return;
    }
    let totalSize = files.reduce((acc, f) => acc + f.size, 0);
    if (totalSize > 40 * 1024 * 1024) {
        alert("Total size exceeds 40 MB. Please select smaller images.");
        e.target.value = '';
        tempBannerFiles = [];
        return;
    }
    
    document.getElementById('bannerImgLoading').classList.remove('hidden');
    document.getElementById('saveBannerBtn').disabled = true;
    tempBannerFiles = [];
    
    try {
        if (!useLocalFallback && supabaseClient) {
             for(let f of files) {
                  let url = await processAndUploadImage(f);
                  tempBannerFiles.push(url);
             }
        } else {
            let results = await Promise.all(files.map(f => new Promise((resolve, reject) => {
                let r = new FileReader();
                r.onload = ev => resolve(ev.target.result);
                r.onerror = reject;
                r.readAsDataURL(f);
            })));
            tempBannerFiles = results;
        }
    } catch(err) {
        alert("Error processing banner images: " + err.message);
        e.target.value = '';
        tempBannerFiles = [];
    } finally {
        document.getElementById('bannerImgLoading').classList.add('hidden');
        document.getElementById('saveBannerBtn').disabled = false;
    }
});

function openBannerEdit() {
    if (!hasPerm('settings.edit')) {
        alert("Permission denied: You do not have permission to edit store settings.");
        return;
    }
    document.getElementById('editBannerText').value = document.getElementById('bannerTextEl').innerText;
    document.getElementById('editBannerFiles').value = '';
    document.getElementById('editBannerImgUrls').value = '';
    tempBannerFiles = [];
    document.getElementById('bannerModal').style.display = 'block';
}

async function saveBanner() {
    if (!hasPerm('settings.edit')) {
        alert("Permission denied.");
        return;
    }
    const oldTitle = document.getElementById('bannerTextEl').innerText;
    const oldImgs = [...bannerImages];
    const txt = document.getElementById('editBannerText').value.trim();
    const urlsText = document.getElementById('editBannerImgUrls').value.trim();
    
    let newImgs = [];
    if (tempBannerFiles.length > 0) {
        newImgs = tempBannerFiles;
    } else if (urlsText) {
        newImgs = urlsText.split(',').map(s => s.trim()).filter(s => s);
    } else {
        newImgs = bannerImages; 
    }

    if (newImgs.length > 6) {
        alert("Maximum 6 images allowed.");
        return;
    }

    if (useLocalFallback) {
        try {
            localStorage.setItem('kosoepets_banner_imgs_v741', JSON.stringify(newImgs));
            bannerImages = newImgs;
            if(txt) {
                localStorage.setItem('kosoepets_banner_txt_v741', txt);
                document.getElementById('bannerTextEl').innerText = txt;
            }
            renderBannerSlideshow();
            closeModal('bannerModal');
        } catch (err) {
            alert("Storage quota exceeded!");
        }
    } else {
        const finalTitle = txt || 'Welcome To Ko Soe Love Pets';
        const { error } = await supabaseClient.from('store_settings').upsert({
            id: 1,
            banner_title: finalTitle,
            banner_images: newImgs
        });
        if (error) {
            alert("Error updating banner in database: " + error.message);
            return;
        }
        await writeAuditLog(
            'UPDATE_SETTINGS',
            'SETTINGS',
            '1',
            'Banner Slideshow',
            `Updated banner (${newImgs.length} image(s), title: "${finalTitle}")`,
            { banner_title: oldTitle, banner_images: oldImgs },
            { banner_title: finalTitle, banner_images: newImgs }
        );
        await fetchSettings();
        closeModal('bannerModal');
    }
}

// ==========================================
// 4. DATABASE SYNC & PRODUCT UPLOAD (Max 5MB)
// ==========================================
let productsChannelSubscribed = false;

async function fetchProducts() {
    if (useLocalFallback) {
        let stored = localStorage.getItem('kosoepets_products_v741');
        products = stored ? JSON.parse(stored) : [
            { id: 1, sku: 'P001', type: 'Cats', category: 'Food', name: 'ကြောင်စာ (Premium Dry Cat Food)', price: 25000, exp: '2028-05-01', img: 'https://images.unsplash.com/photo-1574635677940-d98c25dbff45?auto=format&fit=crop&w=400&q=80', specs: 'ထိုင်းနိုင်ငံထုတ် ကြောင်ကလေးတွေအရမ်းကြိုက်', is_available: true, created_at: 1731400001000 },
            { id: 2, sku: 'P002', type: 'Dogs', category: 'Snack', name: 'Beef Chew Bones (အမဲရိုးသရေစာ)', price: 8500, exp: '2027-08-11', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=400&q=80', specs: 'သွားသန့်ရှင်းစေပြီး အကြာကြီးဝါးနိုင်သည်', is_available: true, created_at: 1731400002000 },
            { id: 3, sku: 'P003', type: 'Accessories', category: 'Gear', name: 'Reflective Dog Harness (ခွေးလည်ပတ်ကြိုး)', price: 18000, exp: 'N/A', img: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=400&q=80', specs: 'ခိုင်ခံ့ပြီး ညဘက်အလင်းပြန်သည်', is_available: true, created_at: 1731400003000 }
        ];
        products = sortNewestFirst(products);
        applyCurrentFilter();
        updateDashboardMetrics();
    } else {
        const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Supabase fetch error:", error.message);
            productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ff4757;">Database connection error: ${error.message}</p>`;
            return;
        }
        products = sortNewestFirst(data || []);
        applyCurrentFilter();
        updateDashboardMetrics();

        if (!productsChannelSubscribed) {
            productsChannelSubscribed = true;
            supabaseClient.channel('public:products')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                    fetchProducts();
                })
                .subscribe();
        }
    }
}

let pendingAddImgUrl = '';
let pendingEditImgUrl = '';

function setupProductImageUpload(inputId, targetUrlId, loadingId, btnId, urlStateSetter) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('change', async function (e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert(translations[currentLang].img_limit);
                el.value = '';
                return;
            }
            
            document.getElementById(loadingId).classList.remove('hidden');
            document.getElementById(btnId).disabled = true;
            
            try {
                 if (!useLocalFallback && supabaseClient) {
                     let url = await processAndUploadImage(file);
                     document.getElementById(targetUrlId).value = url;
                     urlStateSetter(url);
                 } else {
                     const reader = new FileReader();
                     reader.onload = function (evt) { 
                         document.getElementById(targetUrlId).value = evt.target.result;
                         urlStateSetter(evt.target.result);
                     };
                     reader.readAsDataURL(file);
                 }
            } catch(err) {
                 alert(err.message);
                 el.value = '';
            } finally {
                 document.getElementById(loadingId).classList.add('hidden');
                 document.getElementById(btnId).disabled = false;
            }
        }
    });
}

setupProductImageUpload('addImgFile', 'addImg', 'addImgLoading', 'saveAddBtn', (url) => { pendingAddImgUrl = url; });
setupProductImageUpload('editImgFile', 'editImg', 'editImgLoading', 'saveEditBtn', (url) => { pendingEditImgUrl = url; });

// ==========================================
// 5. STOCK-AWARE CART, SERVER VALIDATION & PDF VOUCHER
// ==========================================
function addToCart(id) {
    const item = products.find(p => Number(p.id) === Number(id));
    if (!item) return;

    const stockInfo = getEffectiveProductStock(item);
    if (stockInfo.status === 'OUT_OF_STOCK') {
        alert(currentLang === 'mm' ? 'ဤပစ္စည်း လက်ရှိပြတ်လပ်နေပါသည်။' : 'Sorry, this product is currently out of stock.');
        return;
    }

    let existing = cart.find(c => Number(c.id) === Number(id));
    const currentQtyInCart = existing ? existing.qty : 0;

    if (stockInfo.known && stockInfo.qty !== null && (currentQtyInCart + 1) > stockInfo.qty) {
        alert(
            currentLang === 'mm'
                ? `လက်ကျန်ပစ္စည်း ${stockInfo.qty} ခုသာ ကျန်ရှိပါသည်။ ထပ်မံတိုး၍မရပါ။`
                : `Only ${stockInfo.qty} left in stock for "${item.name}". Cannot add more.`
        );
        return;
    }

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    processCartStateChange();
    showToast('Successfully added to your cart!');
}

function updateCartQty(id, delta) {
    let item = cart.find(c => Number(c.id) === Number(id));
    if (!item) return;

    const masterItem = products.find(p => Number(p.id) === Number(id)) || item;
    const stockInfo = getEffectiveProductStock(masterItem);

    if (delta > 0) {
        if (stockInfo.status === 'OUT_OF_STOCK') {
            alert(currentLang === 'mm' ? 'ဤပစ္စည်း လက်ရှိပြတ်လပ်နေပါသည်။' : 'This item is now out of stock.');
            return;
        }
        if (stockInfo.known && stockInfo.qty !== null && (item.qty + delta) > stockInfo.qty) {
            alert(
                currentLang === 'mm'
                    ? `လက်ကျန်ပစ္စည်း ${stockInfo.qty} ခုသာ ကျန်ရှိပါသည်။`
                    : `Maximum available stock is ${stockInfo.qty} for "${masterItem.name}".`
            );
            return;
        }
    }

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(c => Number(c.id) !== Number(id));
    }
    processCartStateChange();
}

function removeCartItem(id) {
    cart = cart.filter(c => Number(c.id) !== Number(id));
    processCartStateChange();
}

function processCartStateChange() {
    localStorage.setItem('kosoepets_cart_v741', JSON.stringify(cart));
    updateCartCount();
    if (document.getElementById('cartModal').style.display === 'block') {
        renderCartItems();
    }
}

window.addEventListener('storage', (e) => {
    if (e.key === 'kosoepets_cart_v741') {
        cart = JSON.parse(e.newValue) || [];
        updateCartCount();
        if (document.getElementById('cartModal').style.display === 'block') {
            renderCartItems();
        }
    }
});

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const counterBadge = document.getElementById('cartCount');
    counterBadge.innerText = count;
    counterBadge.parentElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        counterBadge.parentElement.style.transform = 'scale(1)';
    }, 200);
}

function openCartModal() {
    renderCartItems();
    document.getElementById('cartModal').style.display = 'block';
}

function renderCartItems() {
    const listEl = document.getElementById('cartItemsList');
    const grandTotalEl = document.getElementById('cartGrandTotal');
    listEl.innerHTML = '';

    if (cart.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; padding: 25px 0; color: #777; font-weight:600; font-size:16px;">${translations[currentLang].cart_empty}</p>`;
        grandTotalEl.innerText = '0 MMK';
    } else {
        let grandTotal = 0;
        cart.forEach((item) => {
            let itemTotal = Number(item.price) * item.qty;
            grandTotal += itemTotal;
            listEl.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <img src="${item.img}" alt="${item.name}" onerror="this.style.display='none'">
                        <span>${item.name}<br><small>${Number(item.price).toLocaleString()} MMK</small></span>
                    </div>
                    <div class="cart-qty-controls">
                        <button type="button" class="cart-qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button type="button" class="cart-qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                    </div>
                    <div class="cart-item-total">
                        ${itemTotal.toLocaleString()} MMK
                    </div>
                    <button type="button" class="remove-item-btn" onclick="removeCartItem(${item.id})" title="Remove">&times;</button>
                </div>`;
        });
        grandTotalEl.innerText = `${grandTotal.toLocaleString()} MMK`;
    }
}

async function verifyServerCartStock() {
    if (useLocalFallback || !supabaseClient) return true;
    try {
        const payload = cart.map(c => ({ id: c.id, qty: c.qty }));
        const { data, error } = await supabaseClient.rpc('rpc_validate_cart_stock', { p_items: payload });
        if (error) {
            console.warn("Server stock validation RPC unavailable:", error.message);
            return true; // Fail open safely if RPC not yet migrated
        }
        if (data && data.valid === false) {
            const errList = Array.isArray(data.errors) ? data.errors.join('\n• ') : 'Insufficient stock.';
            alert("Stock availability changed:\n\n• " + errList + "\n\nPlease adjust quantities in your cart.");
            await fetchCachedProductStock();
            return false;
        }
        return true;
    } catch (e) {
        return true;
    }
}

async function downloadCartPDF() {
    if (cart.length === 0) {
        alert(translations[currentLang].cart_empty);
        return;
    }

    const stockValid = await verifyServerCartStock();
    if (!stockValid) return;

    const t = translations[currentLang];
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let grandTotal = 0;
    let rowsHtml = '';

    cart.forEach((item, idx) => {
        const unitPrice = Number(item.price);
        const rowTotal = unitPrice * item.qty;
        grandTotal += rowTotal;
        rowsHtml += `
            <tr>
                <td>${idx + 1}</td>
                <td><img src="${item.img}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;vertical-align:middle;margin-right:12px;" onerror="this.style.display='none'">${item.name}</td>
                <td style="text-align:center; font-weight:bold;">${item.qty}</td>
                <td style="text-align:right;">${unitPrice.toLocaleString()} MMK</td>
                <td style="text-align:right; font-weight:800; color:#333;">${rowTotal.toLocaleString()} MMK</td>
            </tr>
        `;
    });

    const voucherWindow = window.open('', '_blank', 'width=800,height=900');
    if (!voucherWindow) {
        alert('Please allow pop-ups in your browser to download/save the PDF voucher.');
        return;
    }

    voucherWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Ko_Soe_Love_Pets_Voucher_${dateStr}</title>
            <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Nunito', Tahoma, sans-serif; padding: 40px; color: #333; position: relative; background: #fff; }
                h1, strong, th, .grand { font-family: 'Baloo 2', cursive; }
                .watermark {
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg);
                    font-size: 72px; font-family: 'Baloo 2', cursive; font-weight: 800; color: rgba(255, 117, 140, 0.08);
                    white-space: nowrap; pointer-events: none; z-index: 0; user-select: none;
                }
                .voucher-box { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; border: 2px solid #fecfef; border-radius: 16px; padding: 35px; background: rgba(255,255,255,0.95); }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #ff758c; padding-bottom: 20px; margin-bottom: 25px; }
                .header h1 { color: #ff758c; margin: 0 0 5px 0; font-size: 32px; line-height: 1; }
                .meta { text-align: right; font-size: 14px; color: #555; font-weight: 600; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                th { background: #fecfef; color: #222; padding: 12px; text-align: left; font-size: 15px; font-weight: 800; }
                td { padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 15px; font-weight: 600; }
                .totals { width: 300px; margin-left: auto; font-size: 16px; font-weight: 700; color: #555; }
                .totals div { display: flex; justify-content: space-between; padding: 8px 0; }
                .totals .grand { font-size: 22px; font-weight: 800; color: #ff4757; border-top: 3px solid #fecfef; padding-top: 15px; margin-top: 5px; }
                .footer { text-align: center; margin-top: 40px; font-weight: 800; color: #666; font-size: 18px; font-family: 'Baloo 2', cursive; letter-spacing: 0.5px; }
                @media print { body { padding: 0; } .no-print { display: none; } .voucher-box { border: none; padding: 0; } }
            </style>
        </head>
        <body>
            <div class="watermark">Ko Soe Love Pets</div>
            <div class="voucher-box">
                <div class="header">
                    <div>
                        <h1>● Ko Soe Love Pets</h1>
                        <small style="font-weight:700; color:#666;">Viber: +959262597117 | TikTok: @ko.soe1376</small>
                    </div>
                    <div class="meta">
                        <strong style="font-size:20px; color:#333;">${t.voucher_title}</strong><br>
                        Date: ${dateStr} ${timeStr}
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>${t.product}</th>
                            <th style="text-align:center;">${t.qty}</th>
                            <th style="text-align:right;">Price</th>
                            <th style="text-align:right;">${t.total}</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
                <div class="totals">
                    <div><span>${t.discount}</span><span>0 MMK</span></div>
                    <div class="grand"><span>${t.grand_total}</span><span>${grandTotal.toLocaleString()} MMK</span></div>
                </div>
                <div class="footer">${t.thank_you}</div>
            </div>
            <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script>
        </body>
        </html>
    `);
    voucherWindow.document.close();
}

async function redirectToViber() {
    if (cart.length === 0) return;

    const stockValid = await verifyServerCartStock();
    if (!stockValid) return;

    const t = translations[currentLang];
    let grandTotal = 0;
    let orderSummary = `Ko Soe Love Pets - Order\n------------------------\n`;
    cart.forEach((item, idx) => {
        let rowTotal = Number(item.price) * item.qty;
        grandTotal += rowTotal;
        orderSummary += `${idx + 1}. ${item.name}\n   ${t.qty}: ${item.qty} x ${Number(item.price).toLocaleString()} MMK = ${rowTotal.toLocaleString()} MMK\n`;
    });
    orderSummary += `------------------------\n${t.discount} 0 MMK\n${t.grand_total} ${grandTotal.toLocaleString()} MMK\n\n${t.thank_you}`;

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(orderSummary);
        } else {
            const tempArea = document.createElement('textarea');
            tempArea.value = orderSummary;
            document.body.appendChild(tempArea);
            tempArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempArea);
        }
        alert(currentLang === 'mm'
            ? "အော်ဒါစာရင်းကို Copy ကူးပြီးပါပြီ။ Viber ပွင့်လာပါက Paste နှိပ်ပြီး ပို့ပေးပါ။"
            : "Order details copied! When Viber opens, simply tap Paste and Send.");
    } catch (err) {
        console.warn("Clipboard copy failed:", err);
    }

    window.location.href = "viber://chat?number=%2B959262597117";
}

// ==========================================
// 6. REAL-TIME SEARCH & FILTER LOGIC
// ==========================================
let activeCategoryFilter = null;

searchInput.addEventListener('input', () => {
    applyCurrentFilter();
});

function applyCurrentFilter() {
    const term = searchInput.value.toLowerCase().trim();
    let list = [...products];

    if (activeCategoryFilter) {
        list = list.filter(p => p.type === activeCategoryFilter.type && p.category === activeCategoryFilter.category);
    }

    if (term !== '') {
        categoryTitle.innerText = `${translations[currentLang].search_res} "${searchInput.value.trim()}"`;
        list = list.filter(p =>
            (p.name && p.name.toLowerCase().includes(term)) ||
            (p.specs && p.specs.toLowerCase().includes(term)) ||
            (p.type && p.type.toLowerCase().includes(term)) ||
            (p.category && p.category.toLowerCase().includes(term)) ||
            (p.sku && p.sku.toLowerCase().includes(term))
        );
    } else if (!activeCategoryFilter) {
        categoryTitle.innerText = translations[currentLang].all_items;
    }

    currentProducts = sortNewestFirst(list);
    renderProducts(currentProducts);
}

function renderProducts(items) {
    productGrid.innerHTML = '';
    if (!items || items.length === 0) {
        const msg = searchInput.value.trim() !== '' ? translations[currentLang].no_match : 'No products available.';
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; font-weight:700; padding: 30px;">${msg}</p>`;
        return;
    }

    const t = translations[currentLang];
    const canEdit = canEditAnyProductField();
    const canDelete = hasPerm('product.delete');

    items.forEach(item => {
        const card = document.createElement('div');
        const isDeleted = Boolean(item.is_deleted);
        card.className = 'product-card' + (isDeleted ? ' product-faded-deleted' : '');

        const stockInfo = getEffectiveProductStock(item);
        const isOutOfStock = stockInfo.status === 'OUT_OF_STOCK';

        let stockPillHtml = '';
        if (stockInfo.status === 'IN_STOCK') {
            stockPillHtml = `<div class="stock-status-pill in-stock">🟢 ${t.in_stock}</div>`;
        } else if (stockInfo.status === 'LOW_STOCK') {
            stockPillHtml = `<div class="stock-status-pill low-stock">🟠 ${t.low_stock}</div>`;
        } else if (stockInfo.status === 'OUT_OF_STOCK') {
            stockPillHtml = `<div class="stock-status-pill out-stock">🔴 ${t.out_of_stock}</div>`;
        } else {
            stockPillHtml = `<div class="stock-status-pill unknown-stock">🟡 ${t.stock_unknown}</div>`;
        }

        let adminButtons = [];
        if (canEdit) {
            adminButtons.push(`<button type="button" class="edit-btn" onclick="openEdit(${item.id})"><i class="fa fa-edit"></i> Edit</button>`);
        }
        if (canDelete) {
            adminButtons.push(`<button type="button" class="delete-btn" onclick="deleteProduct(${item.id})"><i class="fa fa-trash"></i> Del</button>`);
        }
        const adminHtml = adminButtons.length > 0 ? `<div class="card-admin-actions">${adminButtons.join('')}</div>` : '';

        let updatedMetaHtml = '';
        if (currentStaffUser && item.updated_by) {
            const dt = item.updated_at ? new Date(item.updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '';
            updatedMetaHtml = `<p class="last-updated-tag">${item.sku ? `[${escapeHtml(item.sku)}] ` : ''}Updated by: <strong>${escapeHtml(item.updated_by)}</strong>${dt ? ` (${dt})` : ''}</p>`;
        }

        let imgHtml = item.img ? `<img src="${item.img}" alt="${escapeHtml(item.name)}" class="product-img" onclick="openImageZoom('${item.img}')" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="product-img-broken hidden" style="display:none;"><i class="fa fa-image"></i></div>` 
            : `<div class="product-img-broken"><i class="fa fa-image"></i></div>`;

        const deletedRemarkHtml = isDeleted
            ? `<div style="background:#fee2e2; color:#b91c1c; font-size:11px; font-weight:800; padding:3px 8px; border-radius:6px; margin:6px 0;">[Deleted by @${escapeHtml(item.deleted_by || 'admin')}]</div>`
            : '';

        card.innerHTML = `
            ${imgHtml}
            <div class="product-info">
                <h3>${escapeHtml(item.name)}</h3>
                <p class="price">${Number(item.price).toLocaleString()} MMK</p>
                ${stockPillHtml}
                ${deletedRemarkHtml}
                <p class="product-meta"><strong>Exp:</strong> ${escapeHtml(item.exp)}</p>
                <p class="product-meta">${escapeHtml(item.specs)}</p>
                <button type="button" class="buy-btn" onclick="addToCart(${item.id})" ${isOutOfStock || isDeleted ? 'disabled' : ''}>
                    ${isDeleted ? '🚫 Deleted' : (!isOutOfStock ? '🛒 Add to Cart' : `🔴 ${t.out_of_stock}`)}
                </button>
                ${adminHtml}
                ${updatedMetaHtml}
            </div>
        `;
        productGrid.appendChild(card);
    });
}

function goHome() {
    document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
    activeCategoryFilter = null;
    searchInput.value = '';
    categoryTitle.innerText = translations[currentLang].all_items;
    if (currentStaffUser) switchStaffView('products');
    applyCurrentFilter();
}

function filterProducts(type, category) {
    document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
    activeCategoryFilter = { type, category };
    searchInput.value = '';
    categoryTitle.innerText = `${type} - ${translations[currentLang][category.toLowerCase()] || category}`;
    if (currentStaffUser) switchStaffView('products');
    applyCurrentFilter();
}

// ==========================================
// 7. MODALS, MULTI-ROLE LOGIN & RBAC UI
// ==========================================
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

function handleOutsideModalClick(e, id) {
    if (e.target && e.target.id === id) {
        closeModal(id);
    }
}

function openLoginModal() {
    document.getElementById('loginError').innerText = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginModal').style.display = 'block';
    setTimeout(() => document.getElementById('username').focus(), 100);
}

async function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const errEl = document.getElementById('loginError');
    const btn = document.getElementById('loginSubmitBtn');

    if (!user || !pass) {
        errEl.innerText = 'Please enter both username and password.';
        return;
    }

    if (useLocalFallback || !supabaseClient) {
        errEl.innerText = 'Supabase connection required for Staff & Admin authentication.';
        return;
    }

    btn.disabled = true;
    errEl.innerText = '';

    try {
        const { data, error } = await supabaseClient.rpc('rpc_staff_login', {
            p_username: user,
            p_password: pass,
            p_user_agent: navigator.userAgent
        });

        if (error) {
            errEl.innerText = 'Login error: ' + error.message;
            return;
        }

        if (!data || !data.success) {
            if (data && data.code === 'ALREADY_LOGGED_IN') {
                errEl.innerText = currentLang === 'mm'
                    ? 'ဤအကောင့်သည် အခြားစက်တစ်ခုတွင် ဝင်ရောက်အသုံးပြုနေပါသည်။ ထိုစက်မှ Logout အရင်လုပ်ပါ။'
                    : 'Already logged in on another device. Please logout from the other device first.';
            } else {
                errEl.innerText = (data && data.error) ? data.error : 'Invalid username or password';
            }
            return;
        }

        staffSessionToken = data.token;
        localStorage.setItem('kosoepets_staff_token_v75', staffSessionToken);
        currentStaffUser = data.user;
        currentPermissions = data.permissions || {};

        rebuildSupabaseClient();

        closeModal('loginModal');
        applyStaffUIState();
        showToast(`Welcome, ${currentStaffUser.display_name}!`);
    } catch (e) {
        errEl.innerText = 'Unexpected login error: ' + e.message;
    } finally {
        btn.disabled = false;
    }
}

async function logout() {
    if (!useLocalFallback && supabaseClient && staffSessionToken) {
        try {
            await supabaseClient.rpc('rpc_staff_logout', { p_user_agent: navigator.userAgent });
        } catch (_) {}
    }

    staffSessionToken = '';
    localStorage.removeItem('kosoepets_staff_token_v75');
    currentStaffUser = null;
    currentPermissions = {};
    rebuildSupabaseClient();
    applyStaffUIState();
}

function applyStaffUIState() {
    const loggedIn = Boolean(currentStaffUser);

    document.getElementById('loginBtn').classList.toggle('hidden', loggedIn);
    document.getElementById('logoutBtn').classList.toggle('hidden', !loggedIn);
    document.getElementById('changePassBtn').classList.toggle('hidden', !loggedIn);
    document.getElementById('staffNavBar').classList.toggle('hidden', !loggedIn);

    const badge = document.getElementById('staffBadge');
    if (loggedIn) {
        badge.classList.remove('hidden');
        badge.innerHTML = `<i class="fa fa-user-shield"></i> ${escapeHtml(currentStaffUser.display_name)} (${currentStaffUser.role.replace('_', ' ')})`;
    } else {
        badge.classList.add('hidden');
        badge.innerHTML = '';
    }

    document.getElementById('addBtn').classList.toggle('hidden', !hasPerm('product.add'));
    document.getElementById('editBannerBtn').classList.toggle('hidden', !hasPerm('settings.edit'));
    document.getElementById('editAboutBtn').classList.toggle('hidden', !hasPerm('settings.edit'));
    document.getElementById('editContactBtn').classList.toggle('hidden', !hasPerm('settings.edit'));

    document.getElementById('tabBtnUsers').classList.toggle('hidden', !hasPerm('users.manage'));
    document.getElementById('tabBtnLogs').classList.toggle('hidden', !hasPerm('logs.view'));
    document.getElementById('tabBtnSettings').classList.toggle('hidden', !hasPerm('settings.edit'));
    const posNavBtn = document.getElementById('openPosTerminalBtn');
    if (posNavBtn) posNavBtn.classList.toggle('hidden', !(hasPerm('pos.sell') || hasPerm('pos.restock')));

    if (!loggedIn) {
        clearTimeout(storefrontIdleTimer);
        switchStaffView('products');
    } else {
        updateDashboardMetrics();
        resetStorefrontInactivityTimer();
    }

    renderProducts(currentProducts);
}

function switchStaffView(viewName) {
    activeStaffView = viewName;

    document.querySelectorAll('.staff-tab').forEach(btn => btn.classList.remove('active'));
    const tabMap = {
        dashboard: 'tabBtnDashboard',
        products: 'tabBtnProducts',
        users: 'tabBtnUsers',
        logs: 'tabBtnLogs',
        settings: 'tabBtnSettings'
    };
    if (tabMap[viewName] && document.getElementById(tabMap[viewName])) {
        document.getElementById(tabMap[viewName]).classList.add('active');
    }

    document.getElementById('staffDashboardSection').classList.toggle('hidden', viewName !== 'dashboard');
    document.getElementById('staffUsersSection').classList.toggle('hidden', viewName !== 'users');
    document.getElementById('staffLogsSection').classList.toggle('hidden', viewName !== 'logs');
    document.getElementById('staffSettingsSection').classList.toggle('hidden', viewName !== 'settings');

    const showCatalog = !currentStaffUser || viewName === 'products';
    document.getElementById('catalogMainSection').classList.toggle('hidden', !showCatalog);
    document.getElementById('mainBannerSection').classList.toggle('hidden', !showCatalog);

    if (viewName === 'dashboard') updateDashboardMetrics();
    if (viewName === 'users' && hasPerm('users.manage')) fetchStaffUsers();
    if (viewName === 'logs' && hasPerm('logs.view')) refreshCurrentLogTab();
}

function updateDashboardMetrics() {
    if (!currentStaffUser) return;
    document.getElementById('dashTotalProducts').innerText = products.length;

    let inStockCount = 0;
    let lowStockCount = 0;
    let outStockCount = 0;

    products.forEach(p => {
        const s = getEffectiveProductStock(p);
        if (s.status === 'IN_STOCK') inStockCount++;
        else if (s.status === 'LOW_STOCK') lowStockCount++;
        else if (s.status === 'OUT_OF_STOCK') outStockCount++;
    });

    document.getElementById('dashInStock').innerText = inStockCount;
    document.getElementById('dashLowStock').innerText = lowStockCount;
    document.getElementById('dashOutStock').innerText = outStockCount;

    const rolePill = document.getElementById('dashboardRoleSummary');
    rolePill.className = `role-pill role-${currentStaffUser.role}`;
    rolePill.innerText = currentStaffUser.role.replace('_', ' ');

    // Render Staff Product Stock Summary Table
    const stockTbody = document.getElementById('staffStockTableBody');
    if (stockTbody) {
        if (products.length === 0) {
            stockTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products found.</td></tr>';
        } else {
            stockTbody.innerHTML = products.map(p => {
                const s = getEffectiveProductStock(p);
                let badge = '<span class="stock-status-pill unknown-stock">🟡 Stock Unavailable</span>';
                if (s.status === 'IN_STOCK') badge = '<span class="stock-status-pill in-stock">🟢 In Stock</span>';
                else if (s.status === 'LOW_STOCK') badge = '<span class="stock-status-pill low-stock">🟠 Low Stock</span>';
                else if (s.status === 'OUT_OF_STOCK') badge = '<span class="stock-status-pill out-stock">🔴 Out of Stock</span>';

                const syncedAt = s.lastSyncedAt ? new Date(s.lastSyncedAt).toLocaleString() : 'Not synced yet';
                return `
                    <tr>
                        <td><code>${escapeHtml(p.sku || '-')}</code></td>
                        <td><strong>${escapeHtml(p.name)}</strong></td>
                        <td>${Number(p.price).toLocaleString()} MMK</td>
                        <td><strong>${s.known && s.qty !== null ? s.qty : '-'}</strong></td>
                        <td>${badge}</td>
                        <td><small>${syncedAt}</small></td>
                    </tr>
                `;
            }).join('');
        }
    }

    const badgesEl = document.getElementById('myPermissionsBadges');
    badgesEl.innerHTML = ALL_PERMISSION_CODES.map(code => {
        const ok = hasPerm(code);
        return `<span class="perm-pill ${ok ? '' : 'denied'}">${ok ? '✓' : '✕'} ${code}</span>`;
    }).join('');
}

function openChangePass() {
    document.getElementById('oldPass').value = '';
    document.getElementById('newPass').value = '';
    document.getElementById('passError').innerText = '';
    document.getElementById('passModal').style.display = 'block';
}

async function savePassword() {
    const oldP = document.getElementById('oldPass').value.trim();
    const newP = document.getElementById('newPass').value.trim();
    const errEl = document.getElementById('passError');

    if (!oldP || !newP) {
        errEl.innerText = 'Both current and new password are required.';
        return;
    }

    const { data, error } = await supabaseClient.rpc('rpc_change_own_password', {
        p_old_password: oldP,
        p_new_password: newP,
        p_user_agent: navigator.userAgent
    });

    if (error) {
        errEl.innerText = 'Database error: ' + error.message;
        return;
    }
    if (!data || !data.success) {
        errEl.innerText = (data && data.error) ? data.error : 'Password update failed.';
        return;
    }

    closeModal('passModal');
    alert('Your password has been securely updated!');
}

// ==========================================
// 8. PRODUCT CRUD WITH GRANULAR PERMISSIONS & DIFF AUDIT LOGGING
// ==========================================
async function openAddModal() {
    if (!hasPerm('product.add')) {
        alert("Permission denied: You do not have 'product.add' permission.");
        return;
    }
    document.getElementById('addSku').value = 'Generating SKU...';
    if (!useLocalFallback && supabaseClient) {
        const { data, error } = await supabaseClient.rpc('generate_next_product_sku');
        document.getElementById('addSku').value = (!error && data) ? data : 'P00001';
    } else {
        document.getElementById('addSku').value = 'P' + String(Date.now()).slice(-5);
    }
    document.getElementById('addName').value = '';
    document.getElementById('addImg').value = '';
    document.getElementById('addImgFile').value = '';
    pendingAddImgUrl = '';
    document.getElementById('addPrice').value = '';
    document.getElementById('addExp').value = '';
    document.getElementById('addAvailability').value = 'true';
    document.getElementById('addSpecs').value = '';

    document.getElementById('addImageGroup').classList.toggle('hidden', !hasPerm('product.image_edit'));
    document.getElementById('addModal').style.display = 'block';
}

function openEdit(id) {
    if (!canEditAnyProductField()) {
        alert("Permission denied: You do not have permission to edit products.");
        return;
    }
    const item = products.find(p => Number(p.id) === Number(id));
    if (!item) return;

    document.getElementById('editId').value = item.id;
    document.getElementById('editSku').value = item.sku || '';
    document.getElementById('editName').value = item.name;
    document.getElementById('editImg').value = item.img;
    pendingEditImgUrl = '';
    document.getElementById('editPrice').value = item.price;
    document.getElementById('editExp').value = item.exp;
    document.getElementById('editAvailability').value = (item.is_available === false) ? 'false' : 'true';
    document.getElementById('editSpecs').value = item.specs;
    document.getElementById('editImgFile').value = '';

    document.getElementById('editDetailsGroup').classList.toggle('hidden', !hasPerm('product.edit'));
    document.getElementById('editImageGroup').classList.toggle('hidden', !hasPerm('product.image_edit'));
    document.getElementById('editPriceGroup').classList.toggle('hidden', !hasPerm('product.price_edit'));
    document.getElementById('editAvailabilityGroup').classList.toggle('hidden', !hasPerm('product.availability_edit'));
    document.getElementById('editSpecsGroup').classList.toggle('hidden', !hasPerm('product.specs_edit'));

    document.getElementById('editModal').style.display = 'block';
}

async function saveNewProduct() {
    if (!hasPerm('product.add')) {
        alert("Permission denied: product.add required.");
        return;
    }

    const uploadedOrLinkedImg = hasPerm('product.image_edit')
        ? (document.getElementById('addImg').value.trim() || pendingAddImgUrl || 'https://via.placeholder.com/400x300?text=No+Image')
        : 'https://via.placeholder.com/400x300?text=No+Image';

    const rawSku = document.getElementById('addSku').value.trim().toUpperCase();

    const newProd = {
        sku: rawSku || null,
        type: document.getElementById('addType').value,
        category: document.getElementById('addCategory').value,
        name: document.getElementById('addName').value.trim() || 'New Product',
        price: parseInt(document.getElementById('addPrice').value) || 0,
        exp: document.getElementById('addExp').value.trim() || 'N/A',
        img: uploadedOrLinkedImg,
        specs: document.getElementById('addSpecs').value.trim() || '',
        is_available: document.getElementById('addAvailability').value === 'true',
        created_at: Date.now()
    };

    if (useLocalFallback) {
        newProd.id = Date.now();
        products.unshift(newProd);
        localStorage.setItem('kosoepets_products_v741', JSON.stringify(products));
        fetchProducts();
    } else {
        const { data: inserted, error } = await supabaseClient.from('products').insert([newProd]).select().single();
        if (error) {
            alert("Database security blocked action: " + error.message);
            return;
        }
        await writeAuditLog(
            'ADD_PRODUCT',
            'PRODUCT',
            inserted ? String(inserted.id) : '',
            newProd.name,
            `Added product "${newProd.name}"${newProd.sku ? ` [${newProd.sku}]` : ''} (${newProd.type}/${newProd.category}) at ${Number(newProd.price).toLocaleString()} MMK`,
            null,
            newProd
        );
        if (pendingAddImgUrl || document.getElementById('addImg').value.trim()) {
            await writeAuditLog(
                'UPLOAD_IMAGE',
                'PRODUCT',
                inserted ? String(inserted.id) : '',
                newProd.name,
                `Uploaded initial image for "${newProd.name}"`,
                null,
                { img: newProd.img }
            );
        }
        await fetchProducts();
    }
    closeModal('addModal');
}

async function saveEdit() {
    const id = Number(document.getElementById('editId').value);
    const oldItem = products.find(p => Number(p.id) === id);
    if (!oldItem) return;

    const updates = {};
    const diffs = [];
    const oldSnap = {};
    const newSnap = {};

    if (hasPerm('product.edit')) {
        const newSku = document.getElementById('editSku').value.trim().toUpperCase() || null;
        const newName = document.getElementById('editName').value.trim();
        const newExp = document.getElementById('editExp').value.trim();
        if (newSku !== (oldItem.sku || null)) {
            updates.sku = newSku;
            oldSnap.sku = oldItem.sku;
            newSnap.sku = newSku;
            diffs.push(`SKU: ${oldItem.sku || 'None'} → ${newSku || 'None'}`);
        }
        if (newName && newName !== oldItem.name) {
            updates.name = newName;
            oldSnap.name = oldItem.name;
            newSnap.name = newName;
            diffs.push(`Name: "${oldItem.name}" → "${newName}"`);
        }
        if (newExp !== oldItem.exp) {
            updates.exp = newExp;
            oldSnap.exp = oldItem.exp;
            newSnap.exp = newExp;
            diffs.push(`Exp: ${oldItem.exp} → ${newExp}`);
        }
    }

    if (hasPerm('product.price_edit')) {
        const newPrice = parseInt(document.getElementById('editPrice').value) || 0;
        if (newPrice !== Number(oldItem.price)) {
            updates.price = newPrice;
            oldSnap.price = Number(oldItem.price);
            newSnap.price = newPrice;
            diffs.push(`Price: ${Number(oldItem.price).toLocaleString()} → ${newPrice.toLocaleString()} MMK`);
        }
    }

    if (hasPerm('product.specs_edit')) {
        const newSpecs = document.getElementById('editSpecs').value.trim();
        if (newSpecs !== (oldItem.specs || '')) {
            updates.specs = newSpecs;
            oldSnap.specs = oldItem.specs;
            newSnap.specs = newSpecs;
            diffs.push(`Specs updated`);
        }
    }

    if (hasPerm('product.image_edit')) {
        const newImg = document.getElementById('editImg').value.trim() || pendingEditImgUrl;
        if (newImg && newImg !== oldItem.img) {
            updates.img = newImg;
            oldSnap.img = oldItem.img;
            newSnap.img = newImg;
            diffs.push(`Product image replaced`);
        }
    }

    if (hasPerm('product.availability_edit')) {
        const newAvail = document.getElementById('editAvailability').value === 'true';
        const oldAvail = oldItem.is_available !== false;
        if (newAvail !== oldAvail) {
            updates.is_available = newAvail;
            oldSnap.is_available = oldAvail;
            newSnap.is_available = newAvail;
            diffs.push(`Availability Override: ${oldAvail ? 'Auto' : 'Forced Out'} → ${newAvail ? 'Auto' : 'Forced Out'}`);
        }
    }

    if (Object.keys(updates).length === 0) {
        closeModal('editModal');
        return;
    }

    if (useLocalFallback) {
        let index = products.findIndex(p => Number(p.id) === id);
        if (index > -1) {
            products[index] = { ...products[index], ...updates };
            localStorage.setItem('kosoepets_products_v741', JSON.stringify(products));
            fetchProducts();
        }
    } else {
        const { error } = await supabaseClient.from('products').update(updates).eq('id', id);
        if (error) {
            alert("Database security blocked update: " + error.message);
            return;
        }

        let primaryAction = 'UPDATE_PRODUCT';
        if (Object.keys(updates).length === 1) {
            if ('price' in updates) primaryAction = 'CHANGE_PRICE';
            else if ('specs' in updates) primaryAction = 'CHANGE_SPECS';
            else if ('img' in updates) primaryAction = 'REPLACE_IMAGE';
            else if ('is_available' in updates) primaryAction = 'CHANGE_AVAILABILITY';
        }

        const targetName = updates.name || oldItem.name;
        await writeAuditLog(
            primaryAction,
            'PRODUCT',
            String(id),
            targetName,
            `Updated "${targetName}": ${diffs.join(' | ')}`,
            oldSnap,
            newSnap
        );

        await fetchProducts();
    }
    closeModal('editModal');
}

async function deleteProduct(id) {
    if (!hasPerm('product.delete')) {
        alert("Permission denied: You do not have 'product.delete' permission.");
        return;
    }
    const targetItem = products.find(p => Number(p.id) === Number(id));
    if (confirm(`Soft-delete "${targetItem ? targetItem.name : id}"? It will be faded in POS & storefront with your username remark.`)) {
        if (useLocalFallback) {
            products = products.filter(p => Number(p.id) !== Number(id));
            localStorage.setItem('kosoepets_products_v741', JSON.stringify(products));
            fetchProducts();
        } else {
            const { data, error } = await supabaseClient.rpc('rpc_soft_delete_product', {
                p_product_id: id,
                p_user_agent: navigator.userAgent
            });
            if (error || !data || !data.success) {
                alert('Soft-delete failed: ' + ((data && data.error) ? data.error : (error ? error.message : 'Error')));
                return;
            }
            showToast(`Product soft-deleted (faded in POS/website).`);
            await fetchProducts();
        }
    }
}

// ==========================================
// 9. USER MANAGEMENT (SALES TEAM ACCOUNTS & PERMISSIONS)
// ==========================================
async function fetchStaffUsers() {
    if (!hasPerm('users.manage') || useLocalFallback || !supabaseClient) return;
    const tbody = document.getElementById('staffUsersTableBody');
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Loading staff accounts...</td></tr>';

    const { data, error } = await supabaseClient.rpc('rpc_list_staff_users');
    if (error) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#ff4757;">Error: ${escapeHtml(error.message)}</td></tr>`;
        return;
    }

    staffUsersList = Array.isArray(data) ? data : [];

    if (staffUsersList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No staff accounts found.</td></tr>';
        return;
    }

    tbody.innerHTML = staffUsersList.map(u => {
        const isSuper = u.role === 'SUPER_ADMIN';
        const isSelf = currentStaffUser && u.id === currentStaffUser.id;
        const shortId = String(u.id).slice(0, 8);
        const lastLogin = u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never';
        const createdStr = u.created_at ? new Date(u.created_at).toLocaleDateString() : '-';
        const updatedStr = u.updated_at ? new Date(u.updated_at).toLocaleDateString() : '-';

        const editButton = (!isSuper && !isSelf)
            ? `<button type="button" class="edit-btn" onclick="openUserFormModal('${u.id}')"><i class="fa fa-edit"></i> Edit / Perms</button>`
            : `<span style="color:#888;font-size:12px;">Protected</span>`;

        const unlockButton = (!isSuper && !isSelf)
            ? `<button type="button" class="mini-btn" style="background:#fff3cd;color:#856404;" onclick="forceUnlockStaffSession('${u.id}', '${escapeHtml(u.username)}')" title="Force logout this user from any active device"><i class="fa fa-unlock"></i> Unlock</button>`
            : '';

        const deleteUserButton = (!isSuper && !isSelf)
            ? `<button type="button" class="delete-btn" onclick="deleteStaffUser('${u.id}', '${escapeHtml(u.username)}')" title="Delete user account (keeps all historical logs)"><i class="fa fa-trash"></i> Del</button>`
            : '';

        const logsButton = hasPerm('logs.view')
            ? `<button type="button" class="mini-btn" onclick="viewUserActivityLogs('${escapeHtml(u.username)}')"><i class="fa fa-list"></i> Logs</button>`
            : '';

        return `
            <tr>
                <td><code>${shortId}</code></td>
                <td><strong>@${escapeHtml(u.username)}</strong></td>
                <td>${escapeHtml(u.display_name)}</td>
                <td>${escapeHtml(u.contact || '-')}</td>
                <td><span class="role-pill role-${u.role}">${u.role.replace('_', ' ')}</span></td>
                <td><span class="status-${u.status}">${u.status.toUpperCase()}</span></td>
                <td>${lastLogin}</td>
                <td><small>C: ${createdStr}<br>U: ${updatedStr}</small></td>
                <td style="display:flex;gap:6px;flex-wrap:wrap;">${editButton} ${unlockButton} ${deleteUserButton} ${logsButton}</td>
            </tr>
        `;
    }).join('');
}

function setAllPermissionCheckboxes(checked) {
    document.querySelectorAll('#permCheckboxGrid input[type="checkbox"]').forEach(cb => {
        cb.checked = checked;
    });
}

function openUserFormModal(userId = null) {
    if (!hasPerm('users.manage')) {
        alert("Permission denied: users.manage required.");
        return;
    }

    document.getElementById('userFormError').innerText = '';
    document.getElementById('formPassword').value = '';

    if (!userId) {
        document.getElementById('userFormTitle').innerText = 'Create Sales Team Account';
        document.getElementById('editUserId').value = '';
        document.getElementById('formUsername').value = '';
        document.getElementById('formUsername').disabled = false;
        document.getElementById('formDisplayName').value = '';
        document.getElementById('formContact').value = '';
        document.getElementById('formRole').value = 'SALES_TEAM';
        document.getElementById('formStatus').value = 'active';
        document.getElementById('formPasswordLabel').innerText = 'Initial Password (Min 4 chars):';
        setAllPermissionCheckboxes(false);
        ['product.view', 'pos.sell', 'pos.restock'].forEach(code => {
            const cb = document.querySelector(`#permCheckboxGrid input[value="${code}"]`);
            if (cb) cb.checked = true;
        });
    } else {
        const u = staffUsersList.find(item => item.id === userId);
        if (!u) return;

        document.getElementById('userFormTitle').innerText = `Edit Account: ${u.display_name}`;
        document.getElementById('editUserId').value = u.id;
        document.getElementById('formUsername').value = u.username;
        document.getElementById('formUsername').disabled = true;
        document.getElementById('formDisplayName').value = u.display_name;
        document.getElementById('formContact').value = u.contact || '';
        document.getElementById('formRole').value = u.role;
        document.getElementById('formStatus').value = u.status;
        document.getElementById('formPasswordLabel').innerText = 'Reset Password (Leave blank to keep current):';

        const perms = u.permissions || {};
        document.querySelectorAll('#permCheckboxGrid input[type="checkbox"]').forEach(cb => {
            cb.checked = Boolean(perms[cb.value]);
        });
    }

    const adminOption = document.querySelector('#formRole option[value="ADMIN"]');
    if (adminOption) {
        adminOption.disabled = !(currentStaffUser && currentStaffUser.role === 'SUPER_ADMIN');
    }

    document.getElementById('userFormModal').style.display = 'block';
}

async function saveStaffUser() {
    const errEl = document.getElementById('userFormError');
    const btn = document.getElementById('saveUserFormBtn');
    errEl.innerText = '';

    const targetId = document.getElementById('editUserId').value || null;
    const username = document.getElementById('formUsername').value.trim();
    const displayName = document.getElementById('formDisplayName').value.trim();
    const contact = document.getElementById('formContact').value.trim();
    const role = document.getElementById('formRole').value;
    const status = document.getElementById('formStatus').value;
    const password = document.getElementById('formPassword').value.trim();

    if (!targetId && !username) {
        errEl.innerText = 'Username is required.';
        return;
    }
    if (!displayName) {
        errEl.innerText = 'Display Name is required.';
        return;
    }

    const permsMap = {};
    document.querySelectorAll('#permCheckboxGrid input[type="checkbox"]').forEach(cb => {
        permsMap[cb.value] = cb.checked;
    });

    btn.disabled = true;
    try {
        const { data, error } = await supabaseClient.rpc('rpc_save_staff_user', {
            p_target_id: targetId,
            p_username: username,
            p_display_name: displayName,
            p_contact: contact,
            p_role: role,
            p_status: status,
            p_password: password || null,
            p_permissions: permsMap,
            p_user_agent: navigator.userAgent
        });

        if (error) {
            errEl.innerText = 'Database error: ' + error.message;
            return;
        }
        if (!data || !data.success) {
            errEl.innerText = (data && data.error) ? data.error : 'Failed to save user account.';
            return;
        }

        closeModal('userFormModal');
        showToast(targetId ? 'Staff account updated!' : 'Sales Team account created!');
        await fetchStaffUsers();
    } catch (e) {
        errEl.innerText = 'Unexpected error: ' + e.message;
    } finally {
        btn.disabled = false;
    }
}


async function forceUnlockStaffSession(userId, username) {
    if (!hasPerm('users.manage')) return;
    if (!confirm(`Force logout @${username} from all active devices so they can sign in again?`)) return;
    const { data, error } = await supabaseClient.rpc('rpc_force_logout_staff_user', {
        p_target_user_id: userId,
        p_user_agent: navigator.userAgent
    });
    if (error || !data || !data.success) {
        alert('Could not unlock session: ' + ((data && data.error) ? data.error : (error ? error.message : 'Error')));
        return;
    }
    showToast(`Session unlocked for @${username}`);
}


async function deleteStaffUser(userId, username) {
    if (!hasPerm('users.manage')) {
        alert('Permission denied: Admin access required.');
        return;
    }
    if (!confirm(`Delete user account "@${username}"?\n\nNote: All historical sales receipts, stock movements, and activity logs for @${username} will be preserved.`)) {
        return;
    }
    const { data, error } = await supabaseClient.rpc('rpc_delete_staff_user', {
        p_target_user_id: userId,
        p_user_agent: navigator.userAgent
    });
    if (error || !data || !data.success) {
        alert('Failed to delete user: ' + ((data && data.error) ? data.error : (error ? error.message : 'Error')));
        return;
    }
    showToast(`Account @${username} deleted (logs preserved).`);
    await fetchStaffUsers();
}

async function cleanSystemLogs(mode) {
    if (!hasPerm('logs.view')) {
        alert('Permission denied: Admin access required to clean logs.');
        return;
    }
    const rpcMode = mode === 'ACTIVITY_OLD' ? 'ACTIVITY_OLD' : 'ACTIVITY_ALL';
    const label = rpcMode === 'ACTIVITY_OLD'
        ? 'delete Staff Activity Logs older than 30 days'
        : 'clear ALL Staff Activity Logs';

    if (!confirm(`Are you sure you want to ${label}? This action cannot be undone.`)) {
        return;
    }

    const { data, error } = await supabaseClient.rpc('rpc_clear_system_logs', {
        p_log_type: rpcMode,
        p_older_than_days: 30,
        p_user_agent: navigator.userAgent
    });
    if (error || !data || !data.success) {
        alert('Log cleanup failed: ' + ((data && data.error) ? data.error : (error ? error.message : 'Error')));
        return;
    }
    showToast(`Cleaned ${data.deleted_count || 0} log entries.`);
    refreshCurrentLogTab();
}

function viewUserActivityLogs(username) {
    switchStaffView('logs');
    document.getElementById('logSearchUser').value = username;
    fetchAuditLogs();
}

// ==========================================
// 10. ACTIVITY AUDIT LOGS
// ==========================================
function refreshCurrentLogTab() {
    fetchAuditLogs();
}

async function writeAuditLog(action, entityType, entityId, entityName, description, oldVal = null, newVal = null, result = 'Success') {
    if (useLocalFallback || !supabaseClient || !staffSessionToken) return;
    try {
        await supabaseClient.rpc('rpc_write_audit_log', {
            p_action: action,
            p_entity_type: entityType,
            p_entity_id: entityId || null,
            p_entity_name: entityName || null,
            p_description: description,
            p_old_value: oldVal,
            p_new_value: newVal,
            p_result: result,
            p_user_agent: navigator.userAgent
        });
    } catch (e) {
        console.warn("Audit log write error:", e);
    }
}

async function fetchAuditLogs() {
    if (!hasPerm('logs.view') || useLocalFallback || !supabaseClient) return;
    const tbody = document.getElementById('auditLogsTableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading audit logs...</td></tr>';

    const { data, error } = await supabaseClient
        .from('activity_logs')
        .select('*')
        .order('id', { ascending: false })
        .limit(500);

    if (error) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#ff4757;">Error loading logs: ${escapeHtml(error.message)}</td></tr>`;
        return;
    }

    auditLogsList = data || [];

    const userSelect = document.getElementById('logFilterUserSelect');
    const prevSelected = userSelect.value;
    const uniqueUsers = [...new Set(auditLogsList.map(l => l.username).filter(Boolean))];
    userSelect.innerHTML = '<option value="">All Users</option>' +
        uniqueUsers.map(u => `<option value="${escapeHtml(u)}">@${escapeHtml(u)}</option>`).join('');
    userSelect.value = prevSelected;

    renderAuditLogs();
}

function renderAuditLogs() {
    const tbody = document.getElementById('auditLogsTableBody');
    const qUser = document.getElementById('logSearchUser').value.toLowerCase().trim();
    const qProd = document.getElementById('logSearchProduct').value.toLowerCase().trim();
    const fAction = document.getElementById('logFilterAction').value;
    const fUser = document.getElementById('logFilterUserSelect').value;
    const fDate = document.getElementById('logFilterDate').value;
    const sortOrder = document.getElementById('logSortOrder').value;

    let filtered = [...auditLogsList];

    if (qUser) {
        filtered = filtered.filter(l =>
            (l.username && l.username.toLowerCase().includes(qUser)) ||
            (l.display_name && l.display_name.toLowerCase().includes(qUser))
        );
    }
    if (qProd) {
        filtered = filtered.filter(l =>
            (l.entity_name && l.entity_name.toLowerCase().includes(qProd)) ||
            (l.description && l.description.toLowerCase().includes(qProd))
        );
    }
    if (fAction) {
        filtered = filtered.filter(l => l.action === fAction);
    }
    if (fUser) {
        filtered = filtered.filter(l => l.username === fUser);
    }
    if (fDate) {
        filtered = filtered.filter(l => {
            if (!l.created_at) return false;
            const localDate = new Date(l.created_at).toLocaleDateString('en-CA');
            return localDate === fDate;
        });
    }

    filtered.sort((a, b) => sortOrder === 'oldest' ? (Number(a.id) - Number(b.id)) : (Number(b.id) - Number(a.id)));

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#777;">No matching activity logs found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(log => {
        const formattedLogId = String(log.id).padStart(6, '0');
        const dtObj = new Date(log.created_at);
        const dtStr = dtObj.toLocaleString([], { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const resultColor = log.result === 'Success' ? '#2ed573' : '#ff4757';

        return `
            <tr class="clickable-row" onclick="openLogDetailModal(${log.id})" title="Click to inspect full activity details">
                <td><code>${formattedLogId}</code></td>
                <td style="white-space:nowrap;">${dtStr}</td>
                <td><strong>${escapeHtml(log.display_name)}</strong><br><small>@${escapeHtml(log.username)}</small></td>
                <td><span class="role-pill role-ADMIN">${escapeHtml(log.action)}</span></td>
                <td>${escapeHtml(log.entity_name || '-')}</td>
                <td>${escapeHtml(log.description)}</td>
                <td><strong style="color:${resultColor};">${escapeHtml(log.result || 'Success')}</strong></td>
            </tr>
        `;
    }).join('');
}

function openLogDetailModal(logId) {
    const log = auditLogsList.find(l => Number(l.id) === Number(logId));
    if (!log) return;

    const formattedLogId = String(log.id).padStart(6, '0');
    const dtObj = new Date(log.created_at);
    const datePart = dtObj.toLocaleDateString('en-CA');
    const timePart = dtObj.toTimeString().split(' ')[0];

    const oldHtml = log.old_value
        ? `<div><strong>Before (Old Value):</strong><div class="diff-box">${escapeHtml(JSON.stringify(log.old_value, null, 2))}</div></div>`
        : '';
    const newHtml = log.new_value
        ? `<div><strong>After (New Value):</strong><div class="diff-box">${escapeHtml(JSON.stringify(log.new_value, null, 2))}</div></div>`
        : '';

    document.getElementById('logDetailBody').innerHTML = `
        <p><strong>Log ID:</strong> <code>${formattedLogId}</code></p>
        <p><strong>User:</strong> ${escapeHtml(log.display_name)} (@${escapeHtml(log.username)})</p>
        <p><strong>Action:</strong> ${escapeHtml(log.action)}</p>
        <p><strong>Entity / Product:</strong> ${escapeHtml(log.entity_name || '-')} (${escapeHtml(log.entity_type)})</p>
        <p><strong>Description:</strong> ${escapeHtml(log.description)}</p>
        <p><strong>Date:</strong> ${datePart} &nbsp;|&nbsp; <strong>Time:</strong> ${timePart}</p>
        <p><strong>Result:</strong> ${escapeHtml(log.result || 'Success')}</p>
        <p><strong>Device / Browser:</strong> <small>${escapeHtml(log.user_agent || 'Not captured')}</small></p>
        ${oldHtml}
        ${newHtml}
    `;

    document.getElementById('logDetailModal').style.display = 'block';
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

// ==========================================
// 11. ABOUT & CONTACT EDITORS
// ==========================================
function openAboutEdit() {
    if (!hasPerm('settings.edit')) {
        alert("Permission denied: settings.edit required.");
        return;
    }
    document.getElementById('editAboutText').value = document.getElementById('aboutTextEl').innerText;
    document.getElementById('aboutModal').style.display = 'block';
}
async function saveAbout() {
    if (!hasPerm('settings.edit')) return;
    const oldTxt = document.getElementById('aboutTextEl').innerText;
    const txt = document.getElementById('editAboutText').value.trim();
    document.getElementById('aboutTextEl').innerText = txt;
    localStorage.setItem('kosoepets_about_v741', txt);
    await writeAuditLog('UPDATE_SETTINGS', 'SETTINGS', 'about', 'About Us', 'Updated About Us footer text', { about: oldTxt }, { about: txt });
    closeModal('aboutModal');
}
function openContactEdit() {
    if (!hasPerm('settings.edit')) {
        alert("Permission denied: settings.edit required.");
        return;
    }
    document.getElementById('editPhone').value = document.getElementById('contactPhoneEl').innerText.trim();
    document.getElementById('editEmail').value = document.getElementById('contactEmailEl').innerText.trim();
    document.getElementById('editFb').value = document.getElementById('fbLinkEl').href;
    document.getElementById('editTiktok').value = document.getElementById('tiktokLinkEl').href;
    document.getElementById('contactModal').style.display = 'block';
}
async function saveContact() {
    if (!hasPerm('settings.edit')) return;
    const phone = document.getElementById('editPhone').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const fb = document.getElementById('editFb').value.trim();
    const tiktok = document.getElementById('editTiktok').value.trim();
    
    let cleanPhone = phone.replace(/[^0-9+]/g, '');
    document.getElementById('contactPhoneEl').href = `tel:${cleanPhone}`;
    document.getElementById('contactPhoneEl').innerHTML = `<i class="fa fa-phone" style="color:#ff9a9e;"></i> ${phone}`;
    document.getElementById('contactEmailEl').innerHTML = `<i class="fa fa-envelope" style="color:#ff9a9e;"></i> ${email}`;
    document.getElementById('fbLinkEl').href = fb;
    document.getElementById('tiktokLinkEl').href = tiktok;
    
    localStorage.setItem('kosoepets_contact_v741', JSON.stringify({ phone, email, fb, tiktok }));
    await writeAuditLog('UPDATE_SETTINGS', 'SETTINGS', 'contact', 'Contact Us', 'Updated Contact Us links', null, { phone, email, fb, tiktok });
    closeModal('contactModal');
}


// ==========================================
// 12. 90-SECOND INACTIVITY AUTO-SIGNOUT (INTERACTION-DRIVEN, ZERO FALSE LOGOUTS)
// ==========================================
let storefrontIdleTimer = null;
let lastStorefrontTouchMs = 0;

function resetStorefrontInactivityTimer() {
    if (!currentStaffUser || !staffSessionToken) return;
    clearTimeout(storefrontIdleTimer);
    storefrontIdleTimer = setTimeout(async () => {
        if (!currentStaffUser) return;
        await logout();
        alert(currentLang === 'mm'
            ? 'လှုပ်ရှားမှုမရှိသည်မှာ စက္ကန့် ၉၀ ကျော်သွားပါသဖြင့် အလိုအလျောက် Sign Out ဖြစ်သွားပါသည်။'
            : 'Signed out automatically after 90 seconds of inactivity.');
    }, 90000);

    const now = Date.now();
    if (now - lastStorefrontTouchMs > 25000 && !useLocalFallback && supabaseClient) {
        lastStorefrontTouchMs = now;
        supabaseClient.rpc('rpc_touch_session').then(({ data }) => {
            if (data && data.expired && currentStaffUser) {
                clearTimeout(storefrontIdleTimer);
                logout();
            }
        }).catch(() => {});
    }
}

['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
    window.addEventListener(evt, resetStorefrontInactivityTimer, { passive: true });
});
