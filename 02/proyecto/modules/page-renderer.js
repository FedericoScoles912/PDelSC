import path from 'path';
import { upperCase } from 'upper-case';
import { buildMenu } from './menu.js';
import { getWeatherData, renderWeatherWidget } from './modules-weather.js';
import { renderCalculator } from './modules-maths.js';
import { ROUTES, getRoute } from './routes.js';
import { readFileUtf8 } from './file-service.js';

export const estimateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

export const renderTemplate = (template, replacements) => Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template
);

export const buildFeaturedCards = (entries, currentPath) => entries.map((entry) => `
    <div class="col-12 col-md-6 col-xl-4">
        <article class="card featured-card shadow-sm border-0 h-100 ${entry.path === currentPath ? 'border border-primary border-2' : ''}">
            <div class="card-body p-4 d-flex flex-column">
                <p class="section-kicker mb-2">${upperCase(entry.category)}</p>
                <h3 class="h4 mb-3">${entry.title}</h3>
                <p class="text-secondary flex-grow-1 mb-4">${entry.lead}</p>
                <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span class="small text-secondary">${entry.readingTime} min de lectura</span>
                    <a class="btn btn-outline-primary btn-sm rounded-pill px-3" href="${entry.path}">Leer nota</a>
                </div>
            </div>
        </article>
    </div>
`).join('');

export const buildArticleLinks = (entries, currentPath) => entries.map((entry) => `
    <a href="${entry.path}" class="list-group-item list-group-item-action py-3 ${entry.path === currentPath ? 'active' : ''}">
        <div class="d-flex w-100 justify-content-between align-items-start gap-3">
            <div>
                <p class="small mb-1 ${entry.path === currentPath ? 'text-white-50' : 'text-secondary'}">${entry.label}</p>
                <h3 class="h6 mb-0">${entry.title}</h3>
            </div>
            <span class="badge rounded-pill ${entry.path === currentPath ? 'text-bg-light text-primary' : 'text-bg-primary'}">${entry.readingTime} min</span>
        </div>
    </a>
`).join('');

export const createPageRenderer = ({ pagesDir, articlesDir }) => {
    const loadArticles = async () => {
        const articles = await Promise.all(ROUTES.map(async (route) => {
            const content = await readFileUtf8(path.join(articlesDir, route.file));
            return {
                ...route,
                content,
                readingTime: estimateReadingTime(content)
            };
        }));

        return articles;
    };

    const renderPage = async (pathname) => {
        const currentRoute = getRoute(pathname) || getRoute('/');
        const [layout, articleEntries] = await Promise.all([
            readFileUtf8(path.join(pagesDir, 'index.html')),
            loadArticles()
        ]);

        const currentArticle = articleEntries.find((article) => article.path === currentRoute.path);
        const weather = getWeatherData('Buenos Aires');
        const menu = buildMenu(currentRoute.path);
        
        let mainContent = currentArticle.content;
        if (currentRoute.path === '/calculadora') {
            mainContent = renderCalculator();
        } else if (currentRoute.path === '/clima') {
            mainContent = renderWeatherWidget(weather);
        }

        const todayLabel = upperCase(
            new Date().toLocaleDateString('es-AR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        );

        return renderTemplate(layout, {
            PAGE_TITLE: `Diario Federal | ${currentRoute.label}`,
            PAGE_KICKER: upperCase(currentRoute.category),
            PAGE_HEADING: currentRoute.title,
            PAGE_LEAD: currentRoute.lead,
            UPPER_DATE: todayLabel,
            MENU: menu,
            FEATURED_CARDS: buildFeaturedCards(articleEntries, currentRoute.path),
            MAIN_CONTENT: mainContent,
            ARTICLE_LINKS: buildArticleLinks(articleEntries, currentRoute.path),
            NEWS_STATS: '' // Removed as per request
        });
    };

    return {
        renderPage
    };
};
