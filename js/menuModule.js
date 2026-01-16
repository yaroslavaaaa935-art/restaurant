import { menuItems } from './data.js';

export function renderMenuItems(currentCategory, onAddToCart) {
    const menuItemsContainer = document.getElementById('menu-items');
    menuItemsContainer.innerHTML = '';
    
    // Фильтрация блюд по категории
    let filteredItems = menuItems;
    if (currentCategory !== 'all') {
        filteredItems = menuItems.filter(item => item.category === currentCategory);
    }
    
    // Создание карточек блюд
    filteredItems.forEach(item => {
        const menuItemElement = document.createElement('div');
        menuItemElement.className = 'menu-item';
        menuItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="menu-item-img">
            <div class="menu-item-content">
                <h3 class="menu-item-title">${item.name}</h3>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <div>
                        <div class="menu-item-price">${item.price} ₽</div>
                        <div class="menu-item-cooking-time">
                            <i class="fas fa-clock"></i>
                            <span>${item.cookingTime} мин.</span>
                        </div>
                    </div>
                </div>
                <button class="add-to-cart-btn" data-id="${item.id}">
                    <i class="fas fa-plus"></i>
                    Добавить в корзину
                </button>
            </div>
        `;
        
        menuItemsContainer.appendChild(menuItemElement);
    });
    
    // Добавление обработчиков к кнопкам "Добавить в корзину"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            onAddToCart(itemId);
        });
    });
}