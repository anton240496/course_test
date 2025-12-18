document.addEventListener('DOMContentLoaded', function () {
    // ========== SVG АНИМАЦИЯ ==========
    const svgs = document.querySelectorAll('.svg_an');

  function floatAnimation() {
    const time = Date.now() * 0.001;

    svgs.forEach((svg, index) => {
        // задаем скорость
        const floatX = Math.sin(time * 0.3 + index) * (window.innerWidth / 2 - 100);
        const floatY = Math.cos(time * 0.4 + index) * (window.innerHeight / 2 - 100);

        // Вращение вокруг своей оси (разная скорость для каждого SVG)
        const rotation = (time * 30 + index * 60) % 360; // 30 градусов в секунду

        // Центр экрана как базовая точка
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Позиция относительно центра
        let newX = centerX + floatX;
        let newY = centerY + floatY;

        const svgWidth = svg.offsetWidth || 50;
        const svgHeight = svg.offsetHeight || 50;

        // Ограничиваем границами окна
        const maxX = window.innerWidth - svgWidth - 20;
        const maxY = window.innerHeight - svgHeight - 20;

        // Проверяем границы
        newX = Math.max(20, Math.min(newX, maxX));
        newY = Math.max(20, Math.min(newY, maxY));

        // Применяем позицию и вращение
        svg.style.position = 'fixed';
        svg.style.left = newX + 'px';
        svg.style.top = newY + 'px';
        svg.style.zIndex = '0';
        svg.style.transform = `rotate(${rotation}deg)`;
        svg.style.transition = 'all 0.1s linear'; // Для плавности
    });

    requestAnimationFrame(floatAnimation);
}
    // Запускаем анимацию
    floatAnimation();

    // Обновляем при изменении размера окна
    window.addEventListener('resize', function () {
        // Автоматически обновится в следующем кадре анимации
    });

    // ========== ФИЛЬТРАЦИЯ КАРТОЧЕК И ПОИСК ==========
    // Переменные состояния
    let currentCategory = 'all';
    let visibleCount = 9;
    let currentFilteredCards = [];
    let searchQuery = '';

    // Элементы поиска
    const searchInput = document.querySelector('.seach');
    const searchForm = document.querySelector('.seach_block');

    // Функция для подсчета карточек по категориям
    function countCardsByCategory() {
        const cards = document.querySelectorAll('.cart');
        const categoryCounts = {
            all: cards.length,
            Marketing: 0,
            Management: 0,
            HR: 0,
            Design: 0,
            Development: 0
        };

        cards.forEach(card => {
            const categoryId = card.id;
            if (categoryCounts.hasOwnProperty(categoryId)) {
                categoryCounts[categoryId]++;
            }
        });

        // Обновляем цифры в тегах
        const tagItems = document.querySelectorAll('.tag_item');

        tagItems.forEach(tagItem => {
            const tagLink = tagItem.querySelector('.tag_link');
            const href = tagLink.getAttribute('href');

            if (href === '#all') {
                const supElement = tagItem.querySelector('.tag_col');
                if (supElement) {
                    supElement.textContent = categoryCounts.all;
                }
            } else {
                const category = href.substring(1);
                const supElement = tagItem.querySelector('.tag_col');
                if (supElement && categoryCounts.hasOwnProperty(category)) {
                    supElement.textContent = categoryCounts[category];
                }
            }
        });
    }

    // Функция для поиска карточек по названию слева направо


function searchCardsByName(query) {
    const allCards = document.querySelectorAll('.cart');
    searchQuery = query.toLowerCase().trim();

    if (!searchQuery) {
        return getFilteredCards(currentCategory);
    }

    let filteredCards = [];

    allCards.forEach(card => {
        const cardName = card.querySelector('.cart_name').textContent.toLowerCase();

        // Проверяем соответствует ли карточка категории
        const matchesCategory = currentCategory === 'all' || card.id === currentCategory;
        
        // Проверяем начинается ли все название с поискового запроса
        const matchesSearch = cardName.startsWith(searchQuery);

        if (matchesCategory && matchesSearch) {
            filteredCards.push(card);
        }
    });

    return filteredCards;
}
    // Функция для получения отфильтрованных карточек
    function getFilteredCards(category) {
        const allCards = document.querySelectorAll('.cart');

        if (!searchQuery) {
            if (category === 'all') {
                return Array.from(allCards);
            } else {
                return Array.from(allCards).filter(card => card.id === category);
            }
        } else {
            // Если есть поисковый запрос, фильтруем и по категории и по поиску
            let filteredCards = [];

            allCards.forEach(card => {
                const cardName = card.querySelector('.cart_name').textContent.toLowerCase();
                const matchesCategory = category === 'all' || card.id === category;
                const matchesSearch = cardName.includes(searchQuery);

                if (matchesCategory && matchesSearch) {
                    filteredCards.push(card);
                }
            });

            return filteredCards;
        }
    }

    // Функция для отображения карточек
    function displayCards(cardsToShow, startIndex = 0, count = visibleCount) {
        const allCards = document.querySelectorAll('.cart');

        // Сначала скрываем все карточки
        allCards.forEach(card => {
            card.style.display = 'none';
        });

        // Показываем нужные карточки в диапазоне
        const endIndex = Math.min(startIndex + count, cardsToShow.length);

        for (let i = startIndex; i < endIndex; i++) {
            if (cardsToShow[i]) {
                cardsToShow[i].style.display = 'block';
            }
        }

        // Обновляем состояние кнопки Load More
        const loadMoreButton = document.querySelector('.more');
        if (loadMoreButton) {
            if (endIndex >= cardsToShow.length) {
                loadMoreButton.style.display = 'none';
            } else {
                loadMoreButton.style.display = 'flex';
            }
        }

        return endIndex;
    }

    // Функция для обновления отображения карточек
    function updateDisplay() {
        visibleCount = 9;

        if (searchQuery) {
            currentFilteredCards = searchCardsByName(searchQuery);
        } else {
            currentFilteredCards = getFilteredCards(currentCategory);
        }

        // Отображаем первые 9 карточек
        displayCards(currentFilteredCards, 0, visibleCount);

        // Обновляем счетчики в тегах для текущего поиска
        updateTagCountsForCurrentSearch();
    }

    // Функция для обновления счетчиков в тегах с учетом поиска
    function updateTagCountsForCurrentSearch() {
        const allCards = document.querySelectorAll('.cart');
        const categoryCounts = {
            all: 0,
            Marketing: 0,
            Management: 0,
            HR: 0,
            Design: 0,
            Development: 0
        };

        // Считаем карточки с учетом поискового запроса
        allCards.forEach(card => {
            const cardName = card.querySelector('.cart_name').textContent.toLowerCase();
            const categoryId = card.id;

            const matchesSearch = !searchQuery || cardName.includes(searchQuery);

            if (matchesSearch && categoryCounts.hasOwnProperty(categoryId)) {
                categoryCounts.all++;
                categoryCounts[categoryId]++;
            }
        });

        // Обновляем цифры в тегах
        const tagItems = document.querySelectorAll('.tag_item');

        tagItems.forEach(tagItem => {
            const tagLink = tagItem.querySelector('.tag_link');
            const href = tagLink.getAttribute('href');

            if (href === '#all') {
                const supElement = tagItem.querySelector('.tag_col');
                if (supElement) {
                    supElement.textContent = categoryCounts.all;
                }
            } else {
                const category = href.substring(1);
                const supElement = tagItem.querySelector('.tag_col');
                if (supElement && categoryCounts.hasOwnProperty(category)) {
                    supElement.textContent = categoryCounts[category];
                }
            }
        });
    }

    // Функция для загрузки следующих карточек
    function loadMoreCards() {
        if (currentFilteredCards.length === 0) {
            if (searchQuery) {
                currentFilteredCards = searchCardsByName(searchQuery);
            } else {
                currentFilteredCards = getFilteredCards(currentCategory);
            }
        }

        // Отображаем следующие 9 карточек
        visibleCount = displayCards(currentFilteredCards, 0, visibleCount + 9);
    }

    // Инициализация при загрузке страницы
    function initialize() {
        // Считаем карточки по категориям
        countCardsByCategory();

        // Показываем первые 9 карточек (все)
        currentFilteredCards = getFilteredCards('all');
        displayCards(currentFilteredCards, 0, 9);

        // Добавляем активный класс к тегу "All"
        const allTag = document.querySelector('a[href="#all"]');
        if (allTag) {
            allTag.classList.add('active');
        }

        // Обработчик поиска
        if (searchInput) {
            searchInput.addEventListener('input', function (e) {
                const query = e.target.value;

                // Сохраняем поисковый запрос
                searchQuery = query.toLowerCase().trim();

                // Сбрасываем видимые карточки
                visibleCount = 9;

                // Обновляем отображение
                updateDisplay();

                // Если есть поисковый запрос, снимаем активный класс с тегов
                if (searchQuery) {
                    const tagLinks = document.querySelectorAll('.tag_link');
                    tagLinks.forEach(link => {
                        link.classList.remove('active');
                    });
                } else {
                    // Если поиск очищен, активируем текущую категорию
                    const currentTag = document.querySelector(`a[href="#${currentCategory}"]`);
                    if (currentTag) {
                        const tagLinks = document.querySelectorAll('.tag_link');
                        tagLinks.forEach(link => {
                            link.classList.remove('active');
                        });
                        currentTag.classList.add('active');
                    }
                }
            });

            // Обработчик отправки формы (предотвращаем перезагрузку страницы)
            if (searchForm) {
                searchForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                });
            }
        }

        // Добавляем обработчики кликов на теги
        const tagLinks = document.querySelectorAll('.tag_link');

        tagLinks.forEach(tagLink => {
            tagLink.addEventListener('click', function (e) {
                e.preventDefault();

                // Сбрасываем поисковый запрос
                if (searchInput) {
                    searchInput.value = '';
                    searchQuery = '';
                }

                // Убираем активный класс у всех тегов
                tagLinks.forEach(link => {
                    link.classList.remove('active');
                });

                // Добавляем активный класс к текущему тегу
                this.classList.add('active');

                // Получаем категорию из href
                const href = this.getAttribute('href');
                currentCategory = href.substring(1);

                // Обновляем отображение
                updateDisplay();

                // Прокручиваем к началу
                const firstCard = document.querySelector('.cart[style*="display: block"]');
                if (firstCard) {
                    firstCard.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Обработчик для кнопки Load More
        const loadMoreButton = document.querySelector('.more');
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', loadMoreCards);
        }
    }

    // Запускаем инициализацию
    initialize();
});