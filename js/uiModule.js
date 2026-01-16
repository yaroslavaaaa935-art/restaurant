// Уведомления
export function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Разные цвета для типов уведомлений
    const backgroundColor = type === 'success' ? '#918C68' : '#ff6b6b';
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${backgroundColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 2000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        animation: slideInBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255,255,255,0.1);
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Стили для анимации
    if (!document.getElementById('notification-styles')) {
        const notificationStyles = document.createElement('style');
        notificationStyles.id = 'notification-styles';
        notificationStyles.textContent = `
            @keyframes slideInBottom {
                from { 
                    transform: translateY(100%); 
                    opacity: 0; 
                }
                to { 
                    transform: translateY(0); 
                    opacity: 1; 
                }
            }
            @keyframes slideOutBottom {
                from { 
                    transform: translateY(0); 
                    opacity: 1; 
                }
                to { 
                    transform: translateY(100%); 
                    opacity: 0; 
                }
            }
        `;
        document.head.appendChild(notificationStyles);
    }
    
    // Удаление уведомления через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOutBottom 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Форматирование цены
export const formatPrice = (price) => {
    return `${price} ₽`;
};

// Форматирование времени
export const formatTime = (minutes) => {
    return `${minutes} мин.`;
};