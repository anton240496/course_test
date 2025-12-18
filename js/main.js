document.addEventListener('DOMContentLoaded', function () {
    // ========== SVG АНИМАЦИЯ ==========
    const svgs = document.querySelectorAll('.svg_an');

    function floatAnimation() {
        const time = Date.now() * 0.001;

        svgs.forEach((svg, index) => {
            const floatX = Math.sin(time * 0.3 + index) * (window.innerWidth / 2 - 100);
            const floatY = Math.cos(time * 0.4 + index) * (window.innerHeight / 2 - 100);
            const rotation = (time * 30 + index * 60) % 360;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            let newX = centerX + floatX;
            let newY = centerY + floatY;

            const svgWidth = svg.offsetWidth || 50;
            const svgHeight = svg.offsetHeight || 50;

            const maxX = window.innerWidth - svgWidth - 20;
            const maxY = window.innerHeight - svgHeight - 20;

            newX = Math.max(20, Math.min(newX, maxX));
            newY = Math.max(20, Math.min(newY, maxY));

            svg.style.position = 'fixed';
            svg.style.left = newX + 'px';
            svg.style.top = newY + 'px';
            svg.style.zIndex = '0';
            svg.style.transform = `rotate(${rotation}deg)`;
            svg.style.transition = 'all 0.1s linear';
        });

        requestAnimationFrame(floatAnimation);
    }

    floatAnimation();

    // ========== ФИЛЬТРАЦИЯ КАРТОЧЕК И ПОИСК ==========
    let currentCategory = 'all';
    let visibleCount = 9;
    let currentFilteredCards = [];
    let searchQuery = '';

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

        const tagItems = document.querySelectorAll('.tag_item');
        tagItems.forEach(tagItem => {
            const tagLink = tagItem.querySelector('.tag_link');
            const href = tagLink.getAttribute('href');

            if (href === '#all') {
                const supElement = tagItem.querySelector('.tag_col');
                if (supElement) supElement.textContent = categoryCounts.all;
            } else {
                const category = href.substring(1);
                const supElement = tagItem.querySelector('.tag_col');
                if (supElement && categoryCounts.hasOwnProperty(category)) {
                    supElement.textContent = categoryCounts[category];
                }
            }
        });
    }

    // Функция для поиска карточек по названию (только первое слово)
    function searchCardsByName(query) {
        const allCards = document.querySelectorAll('.cart');
        searchQuery = query.toLowerCase().trim();

        if (!searchQuery) return getFilteredCards(currentCategory);

        let filteredCards = [];

        allCards.forEach(card => {
            const cardName = card.querySelector('.cart_name').textContent.toLowerCase();
            const matchesCategory = currentCategory === 'all' || card.id === currentCategory;

            const words = cardName.split(/\s+/);
            const firstWord = words[0] || '';
            const matchesSearch = firstWord.startsWith(searchQuery);

            if (matchesCategory && matchesSearch) filteredCards.push(card);
        });

        return filteredCards;
    }

    // Функция для получения отфильтрованных карточек
    function getFilteredCards(category) {
        const allCards = document.querySelectorAll('.cart');

        if (!searchQuery) {
            return category === 'all' 
                ? Array.from(allCards) 
                : Array.from(allCards).filter(card => card.id === category);
        }

        let filteredCards = [];
        allCards.forEach(card => {
            const cardName = card.querySelector('.cart_name').textContent.toLowerCase();
            const words = cardName.split(/\s+/);
            const firstWord = words[0] || '';
            
            const matchesCategory = category === 'all' || card.id === category;
            const matchesSearch = firstWord.startsWith(searchQuery);

            if (matchesCategory && matchesSearch) filteredCards.push(card);
        });

        return filteredCards;
    }

    // Функция для отображения карточек
    function displayCards(cardsToShow, startIndex = 0, count = visibleCount) {
        const allCards = document.querySelectorAll('.cart');
        allCards.forEach(card => card.style.display = 'none');

        const endIndex = Math.min(startIndex + count, cardsToShow.length);
        for (let i = startIndex; i < endIndex; i++) {
            if (cardsToShow[i]) cardsToShow[i].style.display = 'block';
        }

        const loadMoreButton = document.querySelector('.more');
        if (loadMoreButton) {
            loadMoreButton.style.display = endIndex >= cardsToShow.length ? 'none' : 'flex';
        }

        return endIndex;
    }

    // Функция для обновления отображения карточек
    function updateDisplay() {
        visibleCount = 9;
        currentFilteredCards = searchQuery 
            ? searchCardsByName(searchQuery) 
            : getFilteredCards(currentCategory);
        
        displayCards(currentFilteredCards, 0, visibleCount);
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

        allCards.forEach(card => {
            const cardName = card.querySelector('.cart_name').textContent.toLowerCase();
            const categoryId = card.id;

            let matchesSearch = false;
            if (searchQuery) {
                const words = cardName.split(/\s+/);
                const firstWord = words[0] || '';
                matchesSearch = firstWord.startsWith(searchQuery);
            } else {
                matchesSearch = true;
            }

            if (matchesSearch && categoryCounts.hasOwnProperty(categoryId)) {
                categoryCounts.all++;
                categoryCounts[categoryId]++;
            }
        });

        const tagItems = document.querySelectorAll('.tag_item');
        tagItems.forEach(tagItem => {
            const tagLink = tagItem.querySelector('.tag_link');
            const href = tagLink.getAttribute('href');
            const supElement = tagItem.querySelector('.tag_col');
            
            if (!supElement) return;
            
            if (href === '#all') {
                supElement.textContent = categoryCounts.all;
            } else {
                const category = href.substring(1);
                if (categoryCounts.hasOwnProperty(category)) {
                    supElement.textContent = categoryCounts[category];
                }
            }
        });
    }

    // Функция для загрузки следующих карточек
    function loadMoreCards() {
        if (currentFilteredCards.length === 0) {
            currentFilteredCards = searchQuery 
                ? searchCardsByName(searchQuery) 
                : getFilteredCards(currentCategory);
        }
        
        visibleCount = displayCards(currentFilteredCards, 0, visibleCount + 9);
    }

    // Инициализация при загрузке страницы
    function initialize() {
        countCardsByCategory();
        currentFilteredCards = getFilteredCards('all');
        displayCards(currentFilteredCards, 0, 9);
        
        const allTag = document.querySelector('a[href="#all"]');
        if (allTag) allTag.classList.add('active');

        if (searchInput) {
            searchInput.addEventListener('input', function (e) {
                searchQuery = e.target.value.toLowerCase().trim();
                visibleCount = 9;
                updateDisplay();
                
                // При поиске активируем тег "All"
                if (searchQuery) {
                    const allTag = document.querySelector('a[href="#all"]');
                    const tagLinks = document.querySelectorAll('.tag_link');
                    tagLinks.forEach(link => link.classList.remove('active'));
                    if (allTag) {
                        allTag.classList.add('active');
                        currentCategory = 'all';
                    }
                }
            });
            
            if (searchForm) {
                searchForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                });
            }
        }

        const tagLinks = document.querySelectorAll('.tag_link');
        tagLinks.forEach(tagLink => {
            tagLink.addEventListener('click', function (e) {
                e.preventDefault();
                
                // НЕ очищаем поиск при переключении тегов
                // searchQuery сохраняется
                
                tagLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
                
                currentCategory = this.getAttribute('href').substring(1);
                updateDisplay();
                
                const firstCard = document.querySelector('.cart[style*="display: block"]');
                if (firstCard) firstCard.scrollIntoView({ behavior: 'smooth' });
            });
        });

        const loadMoreButton = document.querySelector('.more');
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', loadMoreCards);
        }
    }

    initialize();
});
