export const cleanupOldStorage = () => {
    // Удаление старого ключа 'activeOrders'
    if (localStorage.getItem('activeOrders')) {
        localStorage.removeItem('activeOrders');
        console.log('Старый ключ "activeOrders" удален из localStorage');
    }
    return true;
};

export const loadCart = () => {
    const cartData = localStorage.getItem('restaurantCart');
    return cartData ? JSON.parse(cartData) : [];
};

export const saveCart = (cart) => {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
};

// Функции для работы с активными заказами
const ACTIVE_ORDERS_KEY = 'restaurantActiveOrders';

export const getActiveOrders = () => {
    try {
        const ordersData = localStorage.getItem(ACTIVE_ORDERS_KEY);
        return ordersData ? JSON.parse(ordersData) : [];
    } catch (error) {
        console.error('Error loading active orders:', error);
        return [];
    }
};

export const saveActiveOrder = (order) => {
    try {
        const orders = getActiveOrders();
        orders.push(order);
        localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
        console.error('Error saving active order:', error);
    }
};

export const removeCompletedOrders = () => {
    try {
        const now = Date.now();
        const orders = getActiveOrders();
        // Фильтруем только те заказы, которые еще не завершены
        const activeOrders = orders.filter(order => order.completionTime > now);
        localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(activeOrders));
        return activeOrders;
    } catch (error) {
        console.error('Error removing completed orders:', error);
        return [];
    }
};