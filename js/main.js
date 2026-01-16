import { menuItems, categories } from './data.js';
import { addToCart, removeFromCart, updateQuantity, calculateCartTotals } from './cartModule.js';
import { cleanupOldStorage, loadCart, saveCart, removeCompletedOrders, getActiveOrders } from './storageModule.js'; // Добавили getActiveOrders
import { showNotification } from './uiModule.js';
import { renderMenuItems } from './menuModule.js';
import { initOrder, openOrderModal, closeOrderModal, updateOrderCart } from './orderModule.js';

// Основные переменные приложения
let cart = loadCart();
let currentCategory = 'all';

// DOM элементы
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const totalCookingTime = document.getElementById('total-cooking-time');
const cartToggle = document.getElementById('cart-toggle');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCart = document.getElementById('close-cart');
const filterButtons = document.querySelectorAll('.filter-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const orderModal = document.getElementById('order-modal');
const emptyCart = document.getElementById('empty-cart');
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Функция для очистки корзины
function clearCart() {
    cart = [];
    saveCart(cart);
    updateCart();
    updateOrderCart(cart);
}

// Функция для обновления корзины (переместили вверх для правильного порядка)
function updateCart() {
    // Обновляем счетчик товаров
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Очищаем контейнер товаров в корзине
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCart.style.display = 'flex';
        // Сбрасывание суммы при пустой корзине
        cartSubtotal.textContent = '0 ₽';
        cartTotal.textContent = '0 ₽';
        document.getElementById('delivery-cost').textContent = '0 ₽';
        totalCookingTime.textContent = '0';
        return;
    }
    
    emptyCart.style.display = 'none';
    
    // Добавление товаров в корзину
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">${item.price} ₽</div>
                <div class="cart-item-time">~${item.cookingTime} мин.</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <span class="cart-item-quantity">${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Добавление обработчики для кнопок управления количеством
    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            const cartItem = cart.find(item => item.id === itemId);
            if (cartItem) {
                cart = updateQuantity(itemId, cartItem.quantity - 1, cart);
                saveCart(cart);
                updateCart();
                updateOrderCart(cart);
            }
        });
    });
    
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            const cartItem = cart.find(item => item.id === itemId);
            if (cartItem) {
                cart = updateQuantity(itemId, cartItem.quantity + 1, cart);
                saveCart(cart);
                updateCart();
                updateOrderCart(cart);
            }
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            cart = removeFromCart(itemId, cart);
            saveCart(cart);
            updateCart();
            updateOrderCart(cart);
        });
    });
    
    // Рассчитывание суммы и время
    const totals = calculateCartTotals(cart);
    cartSubtotal.textContent = `${totals.subtotal} ₽`;
    const deliveryCost = document.getElementById('delivery-cost');
    if (deliveryCost) {
        deliveryCost.textContent = totals.deliveryCost === 0 ? 'Бесплатно' : `${totals.deliveryCost} ₽`;
    }
    cartTotal.textContent = `${totals.total} ₽`;
    totalCookingTime.textContent = totals.totalCookingTimeValue;
    
    // Обновляем время в orderModule для будущего оформления
    updateOrderCart(cart);
}

// Функция для открытия/закрытия корзины
function toggleCart() {
    removeCompletedOrders(); // Проверяем завершенные заказы
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    updateCart(); // Пересчитываем время
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Очищаем старые данные localStorage
    cleanupOldStorage();
    removeCompletedOrders();
    
    // Инициализируем модуль заказа
    initOrder(cart, updateCart, clearCart);
    
    renderMenu();
    updateCart();
    setupEventListeners();
    
    // 2. Периодическая фоновая проверка (каждые 2 минуты)
    setInterval(() => {
        const activeOrdersBefore = getActiveOrders();
        const activeOrdersAfter = removeCompletedOrders();
        
        // Если удалили какие-то заказы, логируем
        if (activeOrdersBefore.length !== activeOrdersAfter.length) {
            console.log(`Удалено ${activeOrdersBefore.length - activeOrdersAfter.length} завершенных заказов`);
            // Если корзина открыта, обновляем время
            if (cartSidebar.classList.contains('active')) {
                updateCart();
            }
        }
    }, 120000); // 2 минуты
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Открытие/закрытие корзины
    cartToggle.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    
    // Фильтрация меню по категориям
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убрать активный класс у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавить активный класс текущей кнопке
            this.classList.add('active');
            // Установить текущую категорию и отрисовать меню
            currentCategory = this.getAttribute('data-category');
            renderMenu();
        });
    });
    
    // Оформление заказа
    checkoutBtn.addEventListener('click', () => {
        const totals = calculateCartTotals(cart);
        const opened = openOrderModal(cart, totals);
        if (opened) {
            toggleCart();
        }
    });
    
    // Мобильное меню
    menuToggle.addEventListener('click', function() {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Закрытие мобильного меню при клике на ссылку
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            }
        });
    });
    
    // Обработка формы бронирования
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Столик успешно забронирован! Мы свяжемся с вами для подтверждения.');
            this.reset();
        });
    }
    
    // Обработка формы подписки
    const subscribeForm = document.querySelector('.subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]');
            if (email.value) {
                showNotification('Спасибо за подписку!');
                email.value = '';
            }
        });
    }
    
    // Анимация хедера при скролле
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Адаптивное поведение навигации
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
        }
    });
}

// Отображение блюд меню
function renderMenu() {
    renderMenuItems(currentCategory, (itemId) => {
        cart = addToCart(itemId, cart);
        saveCart(cart);
        updateCart();
        updateOrderCart(cart);
        const item = menuItems.find(product => product.id === itemId);
        if (item) {
            showNotification(`${item.name} добавлен в корзину`);
        }
    });
}