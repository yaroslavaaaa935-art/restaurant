import { menuItems } from './data.js';
import { getActiveOrders, removeCompletedOrders } from './storageModule.js';

// Функции корзины
export function addToCart(itemId, cart) {
    const item = menuItems.find(product => product.id === itemId);
    if (!item) return cart;
    
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            cookingTime: item.cookingTime,
            complexity: item.complexity || 1,
            quantity: 1
        });
    }
    
    return cart;
}

export function removeFromCart(itemId, cart) {
    return cart.filter(item => item.id !== itemId);
}

export function updateQuantity(itemId, newQuantity, cart) {
    if (newQuantity < 1) {
        return removeFromCart(itemId, cart);
    }
    
    const cartItem = cart.find(item => item.id === itemId);
    if (cartItem) {
        cartItem.quantity = newQuantity;
    }
    
    return cart;
}

// расчет времени приготовления
function calculateCartTime(cart) {
    if (cart.length === 0) return 0;
    
    let totalTime = 0;
    let maxComplexity = 0;
    let totalItems = 0;
    
    cart.forEach(item => {
        totalItems += item.quantity;
        const complexity = item.complexity || 1;
        if (complexity > maxComplexity) {
            maxComplexity = complexity;
        }
        
        // Реальный расчет:
        // - Первый экземпляр: 100% времени
        // - Второй экземпляр: +30% времени
        // - Третий и более: +20% времени каждый
        for (let i = 0; i < item.quantity; i++) {
            if (i === 0) {
                totalTime += item.cookingTime;
            } else if (i === 1) {
                totalTime += item.cookingTime * 0.3;
            } else {
                totalTime += item.cookingTime * 0.2;
            }
        }
    });
    
    // Учет сложности
    const complexityMultiplier = 1 + (maxComplexity - 1) * 0.05;
    
    // Время на упаковку
    const packagingTime = cart.length * 1 + Math.floor(totalItems / 3);
    
    totalTime = (totalTime + packagingTime) * complexityMultiplier;
    
    // Минимальное реальное время для любого заказа: 5 минут
    return Math.max(Math.round(totalTime), 5);
}

// расчет времени с учетом очереди
export function calculateRealisticTime(cartTime, activeOrders) {
    const now = Date.now();
    
    // Фильтруем только активные заказы
    const trulyActiveOrders = activeOrders.filter(order => {
        // Заказ считается активным, если он еще не завершен
        return order.completionTime > now;
    });
    
    if (trulyActiveOrders.length === 0) {
        // Если нет активных заказов - только время приготовления
        return Math.max(cartTime, 5);
    }
    
    // 1. Считаем, сколько заказов сейчас в работе
    // 2. Учитываем, что в ресторане 2-3 повара
    const chefsCount = 2;
    
    const maxSimultaneousOrders = chefsCount * 2; // Максимум 4 заказа одновременно
    const recentOrders = trulyActiveOrders
        .sort((a, b) => b.orderTime - a.orderTime) // Новые заказы в начале
        .slice(0, maxSimultaneousOrders);
    
    let additionalWaitTime = 0;
    
    recentOrders.forEach(order => {
        // Определяем тип заказа по времени приготовления
        if (order.cookingTime <= 10) {
            additionalWaitTime += 3; // Простой заказ добавляет немного
        } else if (order.cookingTime <= 20) {
            additionalWaitTime += 5; // Средний заказ
        } else {
            additionalWaitTime += 8; // Сложный заказ
        }
    });
    
    // 5. Учитываем поваров - они работают параллельно
    // Но даже с 2 поварами эффективность не 100%
    const effectiveWaitTime = additionalWaitTime / chefsCount * 0.7;
    
    // 6. Общее время: время приготовления + время ожидания
    let totalTime = cartTime + effectiveWaitTime;
    
    // 7. Ограничения:
    // - Максимальное время для простых заказов меньше
    // - Сложные заказы могут ждать дольше
    
    const maxTimeBasedOnComplexity = cartTime <= 10 ? 
        Math.min(30, cartTime * 3) : // Для простых заказов: не более 30 минут
        Math.min(100, cartTime * 2);   // Для сложных: не более 100 минут
    
    return Math.min(Math.round(totalTime), maxTimeBasedOnComplexity);
}

export function calculateCartTotals(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCost = subtotal > 1000 ? 0 : 200;
    const total = subtotal + deliveryCost;
    
    // 1. Рассчитываем базовое время для текущей корзины
    const cartTime = calculateCartTime(cart);
    
    // 2. Учитываем активные заказы
    removeCompletedOrders();
    const activeOrders = getActiveOrders();
    
    // 3. Рассчитываем реальное время с учетом загруженности
    const totalCookingTimeValue = calculateRealisticTime(cartTime, activeOrders);
    
    return { 
        subtotal, 
        deliveryCost, 
        total, 
        totalCookingTimeValue
    };
}

// Функция для расчета времени заказа при оформлении
export function calculateOrderTime(cart) {
    const cartTime = calculateCartTime(cart);
    const activeOrders = getActiveOrders();
    return calculateRealisticTime(cartTime, activeOrders);
}