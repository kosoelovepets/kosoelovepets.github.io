// ==========================================
// 1. SUPABASE CONFIGURATION (Backend Sync)
// ==========================================
const APP_VERSION = 'v7.4.1';
const SUPABASE_URL = 'https://moggsrqzhygvavsdcanh.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_LEGACY_ANON_PUBLIC_KEY_HERE';

let supabaseClient = null;
let useLocalFallback = false;

try {
    if (SUPABASE_URL && SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_LEGACY') && window.supabase) {
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
        cart_title: "Your Cart", product: "Product", qty: "Qty", total: "Total (MMK)",
        discount: "Discount:", grand_total: "Grand Total:",
        buy_viber: "Buy via Viber", download_pdf: "Download PDF", cart_empty: "Your cart is empty.",
        img_limit: "File size exceeds the maximum limit of 5 MB. Please select another image.",
        search_res: "Search Results for", no_match: "No matching products found.",
        voucher_title: "Shopping Voucher", thank_you: "Thanks for your shopping!"
    },
    mm: {
        home: "ပင်မစာမျက်နှာ", cats: "ကြောင်များ", dogs: "ခွေးများ", accessories: "ဆက်စပ်ပစ္စည်းများ",
        snack: "သရေစာ", food: "အစားအစာ", medicine: "ဆေးဝါး", bowls: "ပန်းကန်များ", toys: "ကစားစရာများ", gear: "သုံးဆောင်များ",
        admin_login: "စီမံခန့်ခွဲသူဝင်ရန်", logout: "ထွက်ရန်", password: "စကားဝှက်",
        all_items: "လူကြိုက်များသော ပစ္စည်းများ", add_new: "ထုတ်ကုန်အသစ်ထည့်ရန်",
        about_us: "ကျွန်ုပ်တို့အကြောင်း", contact_us: "ဆက်သွယ်ရန်",
        cart_title: "သင့်စျေးခြင်းတောင်း", product: "ထုတ်ကုန်", qty: "အရေအတွက်", total: "စုစုပေါင်း (MMK)",
        discount: "လျှော့စျေး:", grand_total: "စုစုပေါင်း ကျသင့်ငွေ:",
        buy_viber: "Viber ဖြင့် ဝယ်မည်", download_pdf: "PDF ဒေါင်းလုဒ်ဆွဲရန်", cart_empty: "စျေးခြင်းတောင်း ဗလာဖြစ်နေပါသည်။",
        img_limit: "ဖိုင်အရွယ်အစားသည် အများဆုံး 5 MB ထက်ကျော်လွန်နေပါသည်။ ကျေးဇူးပြု၍ အခြားပုံတစ်ပုံကို ရွေးချယ်ပါ။",
        search_res: "ရှာဖွေမှုရလဒ်များ -", no_match: "ကိုက်ညီသော ထုတ်ကုန်မတွေ့ပါ။",
        voucher_title: "အဝယ်ဘောက်ချာ", thank_you: "ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါသည်!"
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
    if (document.getElementById('cartModal').style.display === 'block') {
        renderCartItems();
    }
}

// ==========================================
// 3. CENTRALIZED STATE & INIT
// ==========================================
let products = [];
let currentProducts = [];
let cart = JSON.parse(localStorage.getItem('kosoepets_cart_v741')) || [];
let isAdmin = false;
let currentAdminPass = localStorage.getItem('kosoepets_pass_v741') || 'admin';

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categoryTitle = document.getElementById('categoryTitle');

document.addEventListener('DOMContentLoaded', () => {
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
    fetchProducts();
    fetchSettings(); // Initialize centralized banner sync
});

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

function showToast() {
    const toast = document.getElementById('toastNotification');
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
            renderBannerSlideshow();
        }

        // Subscribe to real-time changes specifically for the banner
        supabaseClient.channel('public:store_settings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => {
                fetchSettings(); // Auto-refresh all connected devices
            })
            .subscribe();
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

// Add Supabase Storage Bucket Name Constant
const SUPABASE_BUCKET = 'product-images';

// Helper to convert HEIC/HEIF or resize large images, then upload to Supabase Storage (Cache-busting URL)
async function processAndUploadImage(file) {
    if (!supabaseClient) throw new Error("Supabase is not connected.");
    if (file.size > 5 * 1024 * 1024) throw new Error("File exceeds 5MB limit.");

    let processedFile = file;

    // Convert HEIC/HEIF to JPEG
    if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
        if (typeof heic2any !== 'undefined') {
            try {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8
                });
                processedFile = new File([convertedBlob], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: "image/jpeg" });
            } catch (e) {
                console.error("HEIC conversion failed:", e);
                throw new Error("Failed to convert HEIC image format.");
            }
        } else {
             throw new Error("HEIC conversion library not loaded.");
        }
    }

    // Upload to Supabase Storage with Cache-busting name
    const fileExt = processedFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage.from(SUPABASE_BUCKET).upload(filePath, processedFile);
    if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error("Failed to upload image to storage: " + uploadError.message);
    }

    // Get public URL
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
    document.getElementById('editBannerText').value = document.getElementById('bannerTextEl').innerText;
    document.getElementById('editBannerFiles').value = '';
    document.getElementById('editBannerImgUrls').value = '';
    tempBannerFiles = [];
    document.getElementById('bannerModal').style.display = 'block';
}

async function saveBanner() {
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
            alert("Storage quota exceeded! The uploaded images are too large for local browser storage. Please upload fewer images or use Image Links (URLs) instead.");
        }
    } else {
        // Sync Banner Settings to Supabase DB
        const { error } = await supabaseClient.from('store_settings').upsert({
            id: 1,
            banner_title: txt || 'Welcome To Ko Soe Love Pets',
            banner_images: newImgs
        });
        if (error) {
            alert("Error updating banner in database: " + error.message);
            return;
        }
        await fetchSettings(); // immediately refresh locally
        closeModal('bannerModal');
    }
}


// ==========================================
// 4. DATABASE SYNC & PRODUCT UPLOAD (Max 5MB)
// ==========================================
async function fetchProducts() {
    if (useLocalFallback) {
        let stored = localStorage.getItem('kosoepets_products_v741');
        products = stored ? JSON.parse(stored) : [
            { id: 1, type: 'Cats', category: 'Food', name: 'ကြောင်စာ (Premium Dry Cat Food)', price: 25000, exp: '2028-05-01', img: 'https://images.unsplash.com/photo-1574635677940-d98c25dbff45?auto=format&fit=crop&w=400&q=80', specs: 'ထိုင်းနိုင်ငံထုတ် ကြောင်ကလေးတွေအရမ်းကြိုက်', created_at: 1731400001000 },
            { id: 2, type: 'Dogs', category: 'Snack', name: 'Beef Chew Bones (အမဲရိုးသရေစာ)', price: 8500, exp: '2027-08-11', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=400&q=80', specs: 'သွားသန့်ရှင်းစေပြီး အကြာကြီးဝါးနိုင်သည်', created_at: 1731400002000 },
            { id: 3, type: 'Accessories', category: 'Gear', name: 'Reflective Dog Harness (ခွေးလည်ပတ်ကြိုး)', price: 18000, exp: 'N/A', img: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=400&q=80', specs: 'ခိုင်ခံ့ပြီး ညဘက်အလင်းပြန်သည်', created_at: 1731400003000 }
        ];
        products = sortNewestFirst(products);
        applyCurrentFilter();
    } else {
        const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Supabase fetch error:", error.message);
            productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ff4757;">Database connection error: ${error.message}</p>`;
            return;
        }
        products = sortNewestFirst(data || []);
        applyCurrentFilter();

        supabaseClient.channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                fetchProducts();
            })
            .subscribe();
    }
}

// State for pending uploaded images to prevent blocking the UI early
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
                     // Local fallback Base64
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
// 5. CART, INDIVIDUAL REMOVE & PDF VOUCHER
// ==========================================
function addToCart(id) {
    const item = products.find(p => Number(p.id) === Number(id));
    if (item) {
        let existing = cart.find(c => Number(c.id) === Number(id));
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...item, qty: 1 });
        }
        processCartStateChange();
        showToast();
    }
}

function updateCartQty(id, delta) {
    let item = cart.find(c => Number(c.id) === Number(id));
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(c => Number(c.id) !== Number(id));
        }
        processCartStateChange();
    }
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

// MULTI-TAB SYNC: Instantly updates UI if cart changes in another open tab
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
    
    // Quick scale animation
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

function downloadCartPDF() {
    if (cart.length === 0) {
        alert(translations[currentLang].cart_empty);
        return;
    }

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
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                    .voucher-box { border: none; padding: 0; }
                }
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
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                <div class="totals">
                    <div><span>${t.discount}</span><span>0 MMK</span></div>
                    <div class="grand"><span>${t.grand_total}</span><span>${grandTotal.toLocaleString()} MMK</span></div>
                </div>
                <div class="footer">${t.thank_you}</div>
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    voucherWindow.document.close();
}

function redirectToViber() {
    if (cart.length === 0) return;

    const t = translations[currentLang];
    let grandTotal = 0;
    let orderSummary = `Items | Selected products%0A`;
    cart.forEach(item => {
        let rowTotal = Number(item.price) * item.qty;
        grandTotal += rowTotal;
        orderSummary += `${t.product} | ${item.name}%0A${t.qty} | ${item.qty}%0APrice | ${Number(item.price).toLocaleString()} MMK%0A-%0A`;
    });
    orderSummary += `${t.grand_total} ${grandTotal.toLocaleString()} MMK%0A`;
    orderSummary += `${t.discount} 0 MMK%0A%0A`;
    orderSummary += `${t.thank_you}`;

    const viberUrl = `viber://chat?number=%2B959262597117&text=${orderSummary}`;
    window.location.href = viberUrl;
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
            (p.category && p.category.toLowerCase().includes(term))
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
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        let adminHtml = isAdmin ? `
            <div class="card-admin-actions">
                <button type="button" class="edit-btn" onclick="openEdit(${item.id})"><i class="fa fa-edit"></i> Edit</button>
                <button type="button" class="delete-btn" onclick="deleteProduct(${item.id})"><i class="fa fa-trash"></i> Del</button>
            </div>` : '';

        // Added error handler to hide broken images entirely from the card
        let imgHtml = item.img ? `<img src="${item.img}" alt="${item.name}" class="product-img" onclick="openImageZoom('${item.img}')" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="product-img-broken hidden" style="display:none;"><i class="fa fa-image"></i></div>` 
            : `<div class="product-img-broken"><i class="fa fa-image"></i></div>`;

        card.innerHTML = `
            ${imgHtml}
            <div class="product-info">
                <h3>${item.name}</h3>
                <p class="price">${Number(item.price).toLocaleString()} MMK</p>
                <p class="product-meta"><strong>Exp:</strong> ${item.exp}</p>
                <p class="product-meta">${item.specs}</p>
                <button type="button" class="buy-btn" onclick="addToCart(${item.id})">🛒 Add to Cart</button>
                ${adminHtml}
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
    applyCurrentFilter();
}

function filterProducts(type, category) {
    document.querySelectorAll('.has-sub').forEach(el => el.classList.remove('open'));
    activeCategoryFilter = { type, category };
    searchInput.value = '';
    categoryTitle.innerText = `${type} - ${translations[currentLang][category.toLowerCase()] || category}`;
    applyCurrentFilter();
}

// ==========================================
// 7. MODALS & ADMIN AUTHENTICATION
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

function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if (user === 'admin' && pass === currentAdminPass) {
        isAdmin = true;
        closeModal('loginModal');
        document.querySelectorAll('.admin-btn').forEach(btn => btn.classList.remove('hidden'));
        document.getElementById('editBannerBtn').classList.remove('hidden');
        document.getElementById('editAboutBtn').classList.remove('hidden');
        document.getElementById('editContactBtn').classList.remove('hidden');
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');
        renderProducts(currentProducts);
    } else {
        document.getElementById('loginError').innerText = 'Invalid username or password';
    }
}

function logout() {
    isAdmin = false;
    document.querySelectorAll('.admin-btn').forEach(btn => btn.classList.add('hidden'));
    document.getElementById('editBannerBtn').classList.add('hidden');
    document.getElementById('editAboutBtn').classList.add('hidden');
    document.getElementById('editContactBtn').classList.add('hidden');
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    renderProducts(currentProducts);
}

function openChangePass() {
    document.getElementById('oldPass').value = '';
    document.getElementById('newPass').value = '';
    document.getElementById('passError').innerText = '';
    document.getElementById('passModal').style.display = 'block';
}

function savePassword() {
    const oldP = document.getElementById('oldPass').value.trim();
    const newP = document.getElementById('newPass').value.trim();
    if (oldP !== currentAdminPass) {
        document.getElementById('passError').innerText = 'Current password incorrect!';
        return;
    }
    if (!newP) {
        document.getElementById('passError').innerText = 'New password cannot be empty!';
        return;
    }
    currentAdminPass = newP;
    localStorage.setItem('kosoepets_pass_v741', newP);
    closeModal('passModal');
    alert('Password updated successfully!');
}

function openAddModal() {
    document.getElementById('addName').value = '';
    document.getElementById('addImg').value = '';
    document.getElementById('addImgFile').value = '';
    pendingAddImgUrl = '';
    document.getElementById('addPrice').value = '';
    document.getElementById('addExp').value = '';
    document.getElementById('addSpecs').value = '';
    document.getElementById('addModal').style.display = 'block';
}

function openEdit(id) {
    const item = products.find(p => Number(p.id) === Number(id));
    if (!item) return;
    document.getElementById('editId').value = item.id;
    document.getElementById('editName').value = item.name;
    document.getElementById('editImg').value = item.img;
    pendingEditImgUrl = '';
    document.getElementById('editPrice').value = item.price;
    document.getElementById('editExp').value = item.exp;
    document.getElementById('editSpecs').value = item.specs;
    document.getElementById('editImgFile').value = '';
    document.getElementById('editModal').style.display = 'block';
}

async function saveNewProduct() {
    const finalImg = document.getElementById('addImg').value.trim() || pendingAddImgUrl || 'https://via.placeholder.com/400x300?text=No+Image';
    const newProd = {
        type: document.getElementById('addType').value,
        category: document.getElementById('addCategory').value,
        name: document.getElementById('addName').value.trim() || 'New Product',
        price: parseInt(document.getElementById('addPrice').value) || 0,
        exp: document.getElementById('addExp').value.trim() || 'N/A',
        img: finalImg,
        specs: document.getElementById('addSpecs').value.trim() || '',
        created_at: Date.now()
    };

    if (useLocalFallback) {
        newProd.id = Date.now();
        products.unshift(newProd);
        localStorage.setItem('kosoepets_products_v741', JSON.stringify(products));
        fetchProducts();
    } else {
        const { error } = await supabaseClient.from('products').insert([newProd]);
        if (error) {
            alert("Error saving to Supabase: " + error.message);
            return;
        }
        await fetchProducts();
    }
    closeModal('addModal');
}

async function saveEdit() {
    const id = Number(document.getElementById('editId').value);
    const finalImg = document.getElementById('editImg').value.trim() || pendingEditImgUrl;
    const updates = {
        name: document.getElementById('editName').value.trim(),
        img: finalImg,
        price: parseInt(document.getElementById('editPrice').value) || 0,
        exp: document.getElementById('editExp').value.trim(),
        specs: document.getElementById('editSpecs').value.trim()
    };

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
            alert("Error updating Supabase: " + error.message);
            return;
        }
        await fetchProducts();
    }
    closeModal('editModal');
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        if (useLocalFallback) {
            products = products.filter(p => Number(p.id) !== Number(id));
            localStorage.setItem('kosoepets_products_v741', JSON.stringify(products));
            fetchProducts();
        } else {
            const { error } = await supabaseClient.from('products').delete().eq('id', id);
            if (error) {
                alert("Error deleting from Supabase: " + error.message);
                return;
            }
            await fetchProducts();
        }
    }
}

// About & Contact Editors
function openAboutEdit() {
    document.getElementById('editAboutText').value = document.getElementById('aboutTextEl').innerText;
    document.getElementById('aboutModal').style.display = 'block';
}
function saveAbout() {
    const txt = document.getElementById('editAboutText').value.trim();
    document.getElementById('aboutTextEl').innerText = txt;
    localStorage.setItem('kosoepets_about_v741', txt);
    closeModal('aboutModal');
}
function openContactEdit() {
    document.getElementById('editPhone').value = document.getElementById('contactPhoneEl').innerText.trim();
    document.getElementById('editEmail').value = document.getElementById('contactEmailEl').innerText.trim();
    document.getElementById('editFb').value = document.getElementById('fbLinkEl').href;
    document.getElementById('editTiktok').value = document.getElementById('tiktokLinkEl').href;
    document.getElementById('contactModal').style.display = 'block';
}
function saveContact() {
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
    closeModal('contactModal');
}
