import { showNotification } from './uiModule.js';
import { calculateOrderTime } from './cartModule.js';
import { getActiveOrders, saveActiveOrder } from './storageModule.js';

// DOM элементы
let orderModal;
let closeModal;
let orderForm;
let modalOrderItems;
let modalOrderTotal;
let modalCookingTime;

// Модальное окно подтверждения
let confirmationModal;
let confirmationDetails;
let confirmationTotal;
let confirmationTime;
let closeConfirmationModalBtn;
let confirmationOkBtn;

let cart = [];
let updateCartCallback = null;
let clearCartCallback = null;

// Инициализация модуля заказа
export function initOrder(initialCart, callback, clearCallback) {
    cart = initialCart;
    updateCartCallback = callback;
    clearCartCallback = clearCallback;
    
    // DOM элементы для окна заказа
    orderModal = document.getElementById('order-modal');
    closeModal = document.getElementById('close-modal');
    orderForm = document.getElementById('order-form');
    modalOrderItems = document.getElementById('modal-order-items');
    modalOrderTotal = document.getElementById('modal-order-total');
    modalCookingTime = document.getElementById('modal-cooking-time');
    
    // DOM элементы для окна подтверждения
    confirmationModal = document.getElementById('confirmation-modal');
    confirmationDetails = document.getElementById('confirmation-details');
    confirmationTotal = document.getElementById('confirmation-total');
    confirmationTime = document.getElementById('confirmation-time');
    closeConfirmationModalBtn = document.getElementById('close-confirmation-modal');
    confirmationOkBtn = document.getElementById('confirmation-ok-btn');
    
    // Обработчики для окна заказа
    if (closeModal) {
        closeModal.addEventListener('click', closeOrderModal);
    }
    
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
    
    // Обработчики для окна подтверждения
    if (closeConfirmationModalBtn) {
        closeConfirmationModalBtn.addEventListener('click', closeConfirmationModal);
    }
    
    if (confirmationOkBtn) {
        confirmationOkBtn.addEventListener('click', handleConfirmationOk);
    }
    
    if (confirmationModal) {
        confirmationModal.addEventListener('click', (e) => {
            if (e.target === confirmationModal) {
                closeConfirmationModal();
            }
        });
    }
    
    // Обработчик Escape для всех модальных окон
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (orderModal.classList.contains('active')) {
                closeOrderModal();
            }
            if (confirmationModal.classList.contains('active')) {
                closeConfirmationModal();
            }
        }
    });
}

// Функции модального окна заказа
export function openOrderModal(cartItems, totals) {
    if (cartItems.length === 0) {
        showNotification('Добавьте товары в корзину перед оформлением заказа');
        return false;
    }
    
    // Обновляем локальную копию корзины
    cart = cartItems;
    
    // Заполняем модальное окно информацией о заказе
    modalOrderItems.innerHTML = '';
    
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const orderItem = document.createElement('div');
        orderItem.className = 'modal-order-item';
        orderItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>${item.name} x${item.quantity}</span>
                <span>${itemTotal} ₽</span>
            </div>
        `;
        modalOrderItems.appendChild(orderItem);
    });
    
    modalOrderTotal.textContent = `${totals.total} ₽`;
    modalCookingTime.textContent = totals.totalCookingTimeValue;
    
    // Показываем модальное окно
    orderModal.classList.add('active');
    return true;
}

export function closeOrderModal() {
    if (orderModal) {
        orderModal.classList.remove('active');
    }
}

// Обработчик отправки формы
function handleOrderSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const comments = document.getElementById('comments').value;
    
    // Валидация
    if (!name || !phone || !address) {
        showNotification('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Рассчитываем время приготовления для этого заказа
    const orderCookingTime = calculateOrderTime(cart);
    
    // Сохранение заказ в активные заказы
    const order = {
        id: Date.now(),
        items: [...cart],
        name,
        phone,
        address,
        comments,
        orderTime: Date.now(),
        cookingTime: orderCookingTime,
        completionTime: Date.now() + (orderCookingTime * 60000)
    };
    
    saveActiveOrder(order);
    
    // Создаем детали заказа для отображения
    let orderDetails = `Заказ для: ${name}\n`;
    orderDetails += `Телефон: ${phone}\n`;
    orderDetails += `Адрес: ${address}\n`;
    
    if (comments.trim() !== '') {
        orderDetails += `\nКомментарий: ${comments}\n`;
    }
    
    orderDetails += '\nСостав заказа:\n';
    
    let orderTotal = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        orderTotal += itemTotal;
        orderDetails += `\n• ${item.name} x${item.quantity} - ${itemTotal} ₽`;
    });
    
    const deliveryCost = orderTotal > 1000 ? 0 : 200;
    const totalWithDelivery = orderTotal + deliveryCost;
    
    orderDetails += `\n\nСумма заказа: ${orderTotal} ₽`;
    orderDetails += `\nДоставка: ${deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost} ₽`}`;
    orderDetails += `\nИтого к оплате: ${totalWithDelivery} ₽`;
    orderDetails += `\n\nВремя приготовления: ${orderCookingTime} мин.`;
    orderDetails += `\nСтатус: В обработке`;
    
    // Очищаем корзину и форму
    if (clearCartCallback) {
        clearCartCallback();
    }
    
    // Обнуляем локальную корзину
    cart = [];
    
    e.target.reset();
    closeOrderModal();
    
    // Показываем стильное модальное окно подтверждения
    openConfirmationModal(orderDetails, totalWithDelivery, orderCookingTime);
    
    return true;
}

// Функции модального окна подтверждения
function openConfirmationModal(orderDetails, total, cookingTime) {
    const activeOrders = getActiveOrders();
    let queueInfo = "";
    
    const currentOrderIndex = activeOrders.length;
    const ordersBeforeYou = currentOrderIndex - 1;
    
    if (ordersBeforeYou > 0) {
        queueInfo = `\nВы ${currentOrderIndex}-й в очереди. Заказов перед вами: ${ordersBeforeYou}\nВремя ожидания: ${cookingTime} мин.`;
    } else {
        queueInfo = `\nВаш заказ будет готов через ${cookingTime} мин. (Вы первый в очереди)`;
    }
    
    if (confirmationDetails) confirmationDetails.textContent = orderDetails + queueInfo;
    if (confirmationTotal) confirmationTotal.textContent = `${total} ₽`;
    if (confirmationTime) confirmationTime.textContent = `${cookingTime} мин.`;
    
    if (confirmationModal) {
        confirmationModal.classList.add('active');
    }
}

function closeConfirmationModal() {
    if (confirmationModal) {
        confirmationModal.classList.remove('active');
    }
}

function handleConfirmationOk() {
    closeConfirmationModal();
    
    const menuSection = document.getElementById('menu');
    if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Функция для обновления корзины в модуле
export function updateOrderCart(newCart) {
    cart = newCart;
}