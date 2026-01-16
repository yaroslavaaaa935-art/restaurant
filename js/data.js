// Массив с данными о блюдах
const menuItems = [
    {
        id: 1,
        name: "Брускетта с томатами",
        category: "appetizers",
        description: "Хрустящий хлеб с помидорами, базиликом и оливковым маслом",
        price: 320,
        cookingTime: 10,
        complexity: 1,
        image: 'assets/shutterstock_454361815_1579876041-e1579876086639-scaled.jpg'
    },
    {
        id: 2,
        name: "Карпаччо из лосося",
        category: "appetizers",
        description: "Тонко нарезанный лосось с каперсами и лимонным соусом",
        price: 450,
        cookingTime: 15,
        complexity: 2,
        image: 'assets/karpacho-iz-lososya-770x513.jpg'
    },
    {
        id: 3,
        name: "Сырная тарелка",
        category: "appetizers",
        description: "Ассорти из французских сыров с орехами и медом",
        price: 580,
        cookingTime: 5,
        complexity: 1,
        image: '../assets/norm131.jpg'
    },
    {
        id: 4,
        name: "Стейк Рибай",
        category: "main",
        description: "Сочный стейк из говядины с овощами на гриле",
        price: 1200,
        cookingTime: 25,
        complexity: 4,
        image: '../assets/e1deb7394fdd7f15ede274980b1ee6e7baac4eba.jpg'
    },
    {
        id: 5,
        name: "Паста Карбонара",
        category: "main",
        description: "Спагетти с беконом, сыром пармезан и соусом на основе яиц",
        price: 650,
        cookingTime: 20,
        complexity: 2,
        image: '../assets/carbonara-recipe-e1557844142474.jpg'
    },
    {
        id: 6,
        name: "Лосось в медовом соусе",
        category: "main",
        description: "Филе лосося с брокколи и картофельным пюре",
        price: 890,
        cookingTime: 22,
        complexity: 3,
        image: '../assets/99d76662f846ce04b7260ab26d9639a6.jpg'
    },
    {
        id: 7,
        name: "Равиоли с трюфелем",
        category: "main",
        description: "Домашние равиоли с начинкой из грибов и трюфельным соусом",
        price: 780,
        cookingTime: 18,
        complexity: 4,
        image: '../assets/Culinaryon_Marko_MK_.jpg'
    },
    {
        id: 8,
        name: "Тирамису",
        category: "desserts",
        description: "Классический итальянский десерт с маскарпоне и кофе",
        price: 380,
        cookingTime: 10,
        complexity: 2,
        image: '../assets/tiramisu.jpg'
    },
    {
        id: 9,
        name: "Чизкейк Нью-Йорк",
        category: "desserts",
        description: "Нежный чизкейк с ягодным соусом",
        price: 420,
        cookingTime: 5,
        complexity: 1,
        image: '../assets/avtckUp4GG8.jpg'
    },
    {
        id: 10,
        name: "Молочный коктейль",
        category: "drinks",
        description: "Ванильный коктейль с мороженым и шоколадной крошкой",
        price: 280,
        cookingTime: 7,
        complexity: 1,
        image: '../assets/shokoladno-molochnii_kokteil_s_morojenim-803295.jpg'
    },
    {
        id: 11,
        name: "Лимонад свежий",
        category: "drinks",
        description: "Домашний лимонад с мятой и лаймом",
        price: 220,
        cookingTime: 5,
        complexity: 1,
        image: '../assets/h434rzmjfk5umsqwryzmv55hbbrq5u0h.png'
    },
    {
        id: 12,
        name: "Кофе Латте",
        category: "drinks",
        description: "Ароматный кофе с молочной пенкой",
        price: 250,
        cookingTime: 8,
        complexity: 1,
        image: '../assets/Coffee_Cappuccino_Cream_Cup_Saucer_525045_2048x1152.jpg'
    }
];

// Категории меню
const categories = [
    { id: "all", name: "Все" },
    { id: "appetizers", name: "Закуски" },
    { id: "main", name: "Основные блюда" },
    { id: "desserts", name: "Десерты" },
    { id: "drinks", name: "Напитки" }
];

export { menuItems, categories };


