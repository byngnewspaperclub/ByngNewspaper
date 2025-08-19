let articles = [];

// Fetch articles from Google Sheets API
async function fetchArticles() {
    try {
        const sheetID = "1c8v1J5hhyKN72zRbhwtkgsw558JJKKm7EKQ0lb-ZbVo";
        const apiKey = "AIzaSyAc04F5b2l3-BhRNO3em_RcY6tnCng40X0"; 
        const range = "Form Responses 1!A1:I100";

        const script = document.createElement('script');
        script.src = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${range}?key=${apiKey}&callback=handleArticlesResponse`;
        document.head.appendChild(script);

    } catch (error) {
        console.error("Error fetching articles:", error);
    }
}

function handleArticlesResponse(response) {
    if (!response.values || response.values.length < 2) {
        console.error("No valid data found in Google Sheets.");
        return;
    }

    const headers = response.values[0]; // First row contains column headers
    const dataRows = response.values.slice(1);

    //Use index as ID
    articles = dataRows.map((row, index) => {
        let articleObject = {};
        headers.forEach((header, idx) => {
            articleObject[header.toLowerCase()] = row[idx] || "";
        });
        articleObject.id = index + 1;
        return articleObject;
    });

    if (articles.length === 0) {
        console.error("No articles to display.");
        return;
    }
    handlePageLoad();
}

// Load articles when the page loads
document.addEventListener("DOMContentLoaded", fetchArticles);

// Handle loading articles depending on the current page
function handlePageLoad() {
    const currentPage = getCurrentPage();

    if (currentPage === "home") {
        loadArticles("home", "home-articles");
        MoreArticles();
    } else if (currentPage === "news") {
        loadArticles("School News", "schoolnews-articles");
        loadArticles("Local News", "localnews-articles");
    } else if (currentPage === "allarticles") {
        loadArticles("all", "all-articles");
    } else if (currentPage === "article") {
        loadArticlePage();
    }
}

// Function to determine current page
function getCurrentPage() {
    const path = window.location.pathname.split("/").pop().toLowerCase();
    if (!path || path === "index.html") return "home";
    return path.replace(".html", "");
}

function loadArticles(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }
    container.innerHTML = ''; // Clear existing content

    // Sort articles by ID (latest first)
    const sortedArticles = [...articles].sort((a, b) => b.id - a.id);

    let filteredArticles;
    if (category === "home") {
        filteredArticles = sortedArticles.slice(0, 12);
    } else if (category === "all") {
        filteredArticles = sortedArticles;
    } else {
        filteredArticles = sortedArticles.filter(article => {
            const articleCategories = article.category.split(",").map(cat => cat.trim());
            return articleCategories.includes(category);
        });
    }

    if (filteredArticles.length === 0) {
        container.innerHTML = '<p>No articles found for this section.</p>';
        return;
    }

    filteredArticles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article');
    
        // Ensure the image URL is using the export=view format
        let validImageUrl = article.image ? article.image : 'default-image.jpg';
        
        if (validImageUrl.includes("drive.google.com")) {
            validImageUrl = validImageUrl
                .replace("open", "thumbnail") // Convert to export format
                + "&sz=s1000";
        }

        articleDiv.innerHTML = `
            <div class="image-container">
                <img src="${validImageUrl}" class="article-image" loading="lazy" alt="${article.title}"
                    onerror="this.onerror=null; this.src='default-image.jpg';">
            </div>
            <div class="article-details">
                <h3 class="article-category">${article.category}</h3>
                <h5 class="article-title">${article.title}</h5>
                <p class="article-description">${article.description}</p>
            </div>
        `;
    
        // Add event listener to navigate to the full article page on click
        articleDiv.addEventListener('click', () => {
            const currentPage = window.location.pathname.split("/").pop().toLowerCase();
            const articlePagePath = currentPage === "index.html" || currentPage === ""
                ? `Pages/article.html?id=${article.id}`
                : `article.html?id=${article.id}`;
            window.location.href = articlePagePath;
        });
    
        container.appendChild(articleDiv);
    });    
}

function loadArticlePage() {
    const params = new URLSearchParams(window.location.search);
    const articleId = parseInt(params.get('id')); // Get the id from URL

    if (!articles.length) {
        setTimeout(loadArticlePage, 100); // Retry if data isn't loaded yet
        return;
    }

    // Find the correct article by converting the ID to the index (id - 1)
    const articleIndex = articleId - 1;
    const article = articles[articleIndex]; // Get the article by its index

    if (article) {
        document.querySelector('.article-title').textContent = article.title;
        const imageElement = document.querySelector('.article-image');

        // Check if the article has an image
        if (article.image) {
            let validImageUrl = article.image ? article.image : 'default-image.jpg';
        
        if (validImageUrl.includes("drive.google.com")) {
            validImageUrl = validImageUrl
                .replace("open", "thumbnail") // Convert to export format
                + "&sz=s1000";
        }

            // Set the image source to the thumbnail URL
            imageElement.src = validImageUrl;
            imageElement.alt = article.title;
        } else {
            console.log("No image found for this article.");
            imageElement.style.display = "none"; // Hide the image if no image is available
        }
    } else {
        window.location.href = '../index.html'; // Redirect if article not found
    }
}

// Menu
function setupHamburgerMenu() {
    const hamburgerButton = document.getElementById('hamburger-button');
    const closeButton = document.getElementById('close-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburgerButton && mobileMenu && closeButton) {
        hamburgerButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('visible');
            mobileMenu.classList.toggle('hidden');
        });

        closeButton.addEventListener('click', () => {
            mobileMenu.classList.remove('visible');
            mobileMenu.classList.add('hidden');
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const href = link.getAttribute('href');
                mobileMenu.classList.remove('visible');
                mobileMenu.classList.add('hidden');
                window.location.href = href;
            });
        });
    }
}

//More Articles
function MoreArticles() {
    const moreArticlesButton = document.getElementById('more-articles');
    if (!moreArticlesButton) {
        console.error('More Articles button not found.');
        return;
    }

    moreArticlesButton.addEventListener('click', () => {
        window.location.href = "Pages/Allarticles.html";
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupHamburgerMenu();
});

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // scrolling down
        header.classList.add("hide-on-scroll");
      } else {
        // scrolling up
        header.classList.remove("hide-on-scroll");
      }

      lastScrollY = currentScrollY;
    });
  });