// ============================================================
// Velvet Whisk — script.js  (Supabase edition)
// ============================================================

// --- Default Configuration ---
const IMGBB_API_KEY = "85d2b64330c82ad0a82284b10bacc47c";

// --- Supabase Client ---
// supabase-config.js (loaded before this file) provides SUPABASE_URL and SUPABASE_ANON_KEY
let supabaseClient = null;

function initSupabase() {
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.error('Supabase init failed. Did you fill in supabase-config.js?', e);
    }
}

// --- Products (populated from _data/products/*.json via CMS) ---
const products = {
    cakes: [], breads: [], pastries: [], cookies: [],
    muffins: [], savory: [], dried: []
};

// ============================================================
// Cart with localStorage persistence
// ============================================================
let cart = [];

function loadCartFromStorage() {
    try {
        const stored = localStorage.getItem('velvetwhisk_cart');
        if (stored) { cart = JSON.parse(stored); }
    } catch (e) { cart = []; }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('velvetwhisk_cart', JSON.stringify(cart));
    } catch (e) {
        console.warn('Could not save cart to localStorage');
    }
}

// ============================================================
// Load site content + products from CMS JSON files
// ============================================================
async function loadSiteContent() {
    try {
        const res = await fetch('/_data/site.json');
        if (!res.ok) return;
        const data = await res.json();

        if (data.hero_title_1 && data.hero_highlight_1) {
            const heroTitle = document.getElementById('hero-title');
            if (heroTitle) {
                heroTitle.innerHTML =
                    `${data.hero_title_1} <span class="highlight">${data.hero_highlight_1}</span>,<br>` +
                    ` ${data.hero_title_2 || 'Served with'} <span class="highlight">${data.hero_highlight_2 || 'Love'}</span>.`;
            }
        }
        if (data.hero_subtitle) {
            const sub = document.getElementById('hero-subtitle');
            if (sub) sub.textContent = data.hero_subtitle;
        }
        if (data.hero_cta) {
            const exploreBtn = document.getElementById('hero-cta-explore');
            if (exploreBtn) exploreBtn.innerHTML = `${data.hero_cta} <i class="fas fa-arrow-right"></i>`;
        }
        if (data.hero_cta_cake) {
            const cakeBtn = document.getElementById('hero-cta-cake');
            if (cakeBtn) cakeBtn.innerHTML = `${data.hero_cta_cake} <i class="fas fa-cake-candles"></i>`;
        }
        if (data.footer_tagline) {
            const tagline = document.getElementById('footer-tagline');
            if (tagline) tagline.textContent = data.footer_tagline;
        }
        if (data.phone_display) {
            const phone = document.getElementById('footer-phone');
            if (phone) phone.textContent = data.phone_display;
        }
        if (data.address) {
            const addr = document.getElementById('footer-address');
            if (addr) addr.textContent = data.address;
        }
    } catch (err) {
        console.log('site.json not found, using HTML defaults.');
    }
}

async function loadAllProducts() {
    const categories = ['cakes', 'breads', 'pastries', 'cookies', 'muffins', 'savory', 'dried'];
    const fetches = categories.map(async (cat) => {
        try {
            const res = await fetch(`/_data/products/${cat}.json`);
            if (!res.ok) return;
            const data = await res.json();
            products[cat] = (data.items || []).map((p, i) => ({
                ...p, id: `${cat}-${i}`, price: Number(p.price) || 0
            }));
        } catch (e) {
            console.log(`No product data found for: ${cat}`);
        }
    });
    await Promise.all(fetches);
    renderProducts();
}

// ============================================================
// Render Products
// ============================================================
function renderProducts() {
    Object.keys(products).forEach(category => {
        const grid = document.getElementById(`${category}-grid`);
        if (!grid) return;
        grid.innerHTML = '';

        if (products[category].length === 0) {
            grid.innerHTML = `<p class="products-loading" style="opacity:0.6;">
                Products coming soon. <a href="#contact" style="color:var(--pink-dark);text-decoration:underline;">Contact us</a> to order.
            </p>`;
            return;
        }

        products[category].forEach(product => {
            const badgesHTML = (product.badges || []).map(badge => {
                const icon = badge === 'eggless' ? '<i class="fas fa-egg"></i>' : '<i class="fas fa-leaf"></i>';
                const text = badge === 'eggless' ? 'Eggless' : 'Vegan';
                return `<span class="badge ${badge}">${icon} ${text}</span>`;
            }).join('');

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-badges">${badgesHTML}</div>
                <div class="product-img">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.desc}</p>
                    <div class="product-bottom">
                        <span class="price">₹${product.price}</span>
                        <button
                            class="add-to-cart"
                            data-id="${product.id}"
                            data-category="${category}"
                            aria-label="Add ${product.name} to bag">
                            Add to Bag
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    });

    attachAddToCartListeners();
    revealOnScroll();
    attachMagneticEffect();
    applyFilters(); // Apply filters after rendering products
}

function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { id, category } = e.currentTarget.dataset;
            const product = products[category]?.find(p => p.id === id);
            if (!product) return;

            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.push({ ...product, qty: 1 });
            }

            saveCartToStorage();
            updateCartUI();

            const btn = e.currentTarget;
            btn.textContent = 'Added! ✓';
            btn.style.background = 'var(--pink-dark)';
            btn.style.color = 'white';
            setTimeout(() => {
                btn.textContent = 'Add to Bag';
                btn.style.background = '';
                btn.style.color = '';
            }, 1500);
        });
    });
}

// ============================================================
// Cart UI
// ============================================================
const cartBtn              = document.getElementById('openCart');
const cartSidebar          = document.getElementById('cartSidebar');
const cartOverlay          = document.getElementById('cartOverlay');
const closeCartBtn         = document.getElementById('closeCart');
const cartItemsContainer   = document.getElementById('cartItems');
const cartCountEl          = document.querySelector('.cart-count');
const cartTotalEl          = document.getElementById('cartTotal');
const checkoutBtn          = document.getElementById('checkoutBtn');
const checkoutModal        = document.getElementById('checkoutModal');
const closeModalBtn        = document.getElementById('closeModal');
const checkoutForm         = document.getElementById('checkoutForm');

cartBtn.addEventListener('click', () => {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
});

function closeCartPanel() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
}

closeCartBtn.addEventListener('click', closeCartPanel);
cartOverlay.addEventListener('click', closeCartPanel);

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your bag is empty.</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.qty;
            count += item.qty;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} × ${item.qty} = <strong>₹${item.price * item.qty}</strong></p>
                </div>
                <button class="remove-item" data-index="${index}" aria-label="Remove ${item.name}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    cartCountEl.textContent = count;
    cartTotalEl.textContent = `₹${total}`;

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            cart.splice(index, 1);
            saveCartToStorage();
            updateCartUI();
        });
    });
}

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    closeCartPanel();
    checkoutModal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) checkoutModal.classList.remove('active');
});

// ============================================================
// CHECKOUT FORM — Submit to Supabase
// ============================================================
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = checkoutForm.querySelector('button[type="submit"]');
    const name    = document.getElementById('custName').value.trim();
    const phone   = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    let total = 0;
    const orderItems = cart.map(item => {
        total += item.price * item.qty;
        return { name: item.name, qty: item.qty, price: item.price, subtotal: item.price * item.qty };
    });

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order…';

    try {
        if (!supabaseClient) throw new Error('Supabase not initialised. Check supabase-config.js.');

        const { error } = await supabaseClient
            .from('orders')
            .insert([{
                order_type:     'regular',
                customer_name:  name,
                phone:          phone,
                address:        address,
                items:          orderItems,
                total:          total,
                status:         'pending'
            }]);

        if (error) throw error;

        // ✅ Success
        cart = [];
        saveCartToStorage();
        updateCartUI();
        checkoutForm.reset();
        checkoutModal.classList.remove('active');
        showSuccessModal('🎉 Order Placed!', `Thank you, ${name}! Your order has been received. We'll contact you at <strong>${phone}</strong> to confirm delivery.`);

    } catch (err) {
        console.error('Order submission failed:', err);
        alert('Sorry, something went wrong. Please try again or call us directly.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Place Order <i class="fas fa-check"></i>';
    }
});

// ============================================================
// CUSTOM CAKE FORM — Submit to Supabase
// ============================================================
const customForm       = document.getElementById('customCakeForm');
const fileInput        = document.getElementById('cakeImage');
const fileNameSpan     = document.getElementById('fileName');
const uploadProgress   = document.getElementById('uploadProgress');
const progressBar      = document.querySelector('.progress-bar');
let uploadedImageUrl   = '';

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameSpan.textContent = file.name;
    uploadProgress.style.display = 'block';
    progressBar.classList.add('uploading');

    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST', body: formData
        });
        const data = await response.json();

        if (data.success) {
            uploadedImageUrl = data.data.url;
            fileNameSpan.textContent = `✓ ${file.name} (Uploaded)`;
            fileNameSpan.style.color = 'var(--eggless)';
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        fileNameSpan.textContent = `✗ Upload failed — ${file.name}`;
        fileNameSpan.style.color = '#ff4d4d';
        uploadedImageUrl = '';
        alert('Image upload failed. You can still place the order and share the image when we contact you.');
    } finally {
        uploadProgress.style.display = 'none';
        progressBar.classList.remove('uploading');
    }
});

customForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = customForm.querySelector('button[type="submit"]');
    const weight    = document.getElementById('cakeWeight').value;
    const flavor    = document.getElementById('cakeFlavor').value;
    const notes     = document.getElementById('cakeNotes').value.trim();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Request…';

    try {
        if (!supabaseClient) throw new Error('Supabase not initialised. Check supabase-config.js.');

        const { error } = await supabaseClient
            .from('orders')
            .insert([{
                order_type:           'custom',
                customer_name:        null,   // custom form doesn't ask name — add a field if you want
                phone:                null,
                address:              null,
                cake_weight:          weight,
                cake_flavor:          flavor,
                cake_notes:           notes || null,
                reference_image_url:  uploadedImageUrl || null,
                status:               'pending'
            }]);

        if (error) throw error;

        // ✅ Success
        customForm.reset();
        fileNameSpan.textContent = 'Click to upload image';
        fileNameSpan.style.color = '';
        uploadedImageUrl = '';
        showSuccessModal('🎂 Custom Cake Request Sent!', 'We received your custom cake details and will reach out shortly to confirm the design, price, and delivery date.');

    } catch (err) {
        console.error('Custom order submission failed:', err);
        alert('Sorry, something went wrong. Please try again or call us directly.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Request <i class="fas fa-paper-plane"></i>';
    }
});

// ============================================================
// Success Modal helper
// ============================================================
function showSuccessModal(title, message) {
    const modal = document.getElementById('successModal');
    const titleEl   = document.getElementById('successTitle');
    const messageEl = document.getElementById('successMessage');
    if (!modal) return;
    titleEl.textContent = title;
    messageEl.innerHTML = message;
    modal.classList.add('active');
}

document.getElementById('closeSuccessModal')?.addEventListener('click', () => {
    document.getElementById('successModal')?.classList.remove('active');
});

document.getElementById('successModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('successModal')) {
        document.getElementById('successModal').classList.remove('active');
    }
});

// ============================================================
// Search & Filter Functionality
// ============================================================
let currentBadgeFilter = 'all';
let currentCategoryFilter = 'all';
let currentSearchQuery = '';

function applyFilters() {
    const categorySections = document.querySelectorAll('.category-section');
    
    categorySections.forEach(section => {
        const sectionCategory = section.dataset.category;
        const grid = section.querySelector('.menu-grid');
        const cards = grid.querySelectorAll('.product-card');
        let visibleCardsInCategory = 0;
        
        // Check if category matches
        const categoryMatches = currentCategoryFilter === 'all' || currentCategoryFilter === sectionCategory;
        
        if (!categoryMatches) {
            section.classList.add('hidden');
            return;
        } else {
            section.classList.remove('hidden');
        }
        
        cards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();
            const badges = card.querySelectorAll('.badge');
            
            // Check badge filter
            let badgeMatches = true;
            if (currentBadgeFilter !== 'all') {
                badgeMatches = Array.from(badges).some(badge => badge.classList.contains(currentBadgeFilter));
            }
            
            // Check search query
            const searchMatches = currentSearchQuery === '' || 
                                  name.includes(currentSearchQuery) || 
                                  desc.includes(currentSearchQuery);
            
            if (badgeMatches && searchMatches) {
                card.style.display = '';
                visibleCardsInCategory++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Hide category section if no products match
        if (visibleCardsInCategory === 0) {
            section.classList.add('hidden');
        }
    });
}

// Search input handler
const productSearchInput = document.getElementById('productSearch');
if (productSearchInput) {
    productSearchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
    });
}

// Badge filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        e.currentTarget.classList.add('active');
        currentBadgeFilter = e.currentTarget.dataset.filter;
        applyFilters();
    });
});

// Category filter dropdown
const categoryFilterSelect = document.getElementById('categoryFilter');
if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener('change', (e) => {
        currentCategoryFilter = e.target.value;
        applyFilters();
    });
}

// ============================================================
// View More → WhatsApp enquiry REMOVED (buttons removed from HTML)
// ============================================================

// ============================================================
// Hamburger / Mobile Nav
// ============================================================
const hamburgerBtn      = document.getElementById('hamburgerBtn');
const mobileNav         = document.getElementById('mobileNav');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const closeMobileNavBtn = document.getElementById('closeMobileNav');

function openMobileNav() {
    mobileNav.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    hamburgerBtn.classList.add('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
    mobileNav.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', () => {
    mobileNav.classList.contains('active') ? closeMobileNav() : openMobileNav();
});
closeMobileNavBtn.addEventListener('click', closeMobileNav);
mobileMenuOverlay.addEventListener('click', closeMobileNav);
document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
});

// ============================================================
// Particle System (Flour Dust Effect)
// ============================================================
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

if (!('ontouchstart' in window)) {
    window.addEventListener('mousemove', (e) => {
        for (let i = 0; i < 2; i++) { particles.push(new Particle(e.clientX, e.clientY)); }
    });
}

class Particle {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.size   = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color  = `rgba(253, 248, 245, ${Math.random() * 0.5 + 0.3})`;
        this.life   = 100;
    }
    update() { this.x += this.speedX; this.y += this.speedY; this.life -= 1; this.size *= 0.98; }
    draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(); particles[i].draw();
        if (particles[i].life <= 0 || particles[i].size <= 0.1) particles.splice(i, 1);
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ============================================================
// Scroll Reveal
// ============================================================
const reveals = document.querySelectorAll('.reveal');

function revealOnScroll() {
    reveals.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
            el.classList.add('active');
        }
    });
}
window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

// ============================================================
// Magnetic Button Effect (desktop only)
// ============================================================
function attachMagneticEffect() {
    if ('ontouchstart' in window) return;
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('mousemove', (e) => {
            const rect = newBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            newBtn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        newBtn.addEventListener('mouseleave', () => { newBtn.style.transform = 'translate(0, 0)'; });
    });
}

// ============================================================
// Init
// ============================================================
async function init() {
    initSupabase();
    loadCartFromStorage();
    updateCartUI();
    await loadSiteContent();
    await loadAllProducts();
    attachMagneticEffect();
    applyFilters(); // Initialize filters after products are loaded
}

init();
