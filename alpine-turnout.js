document.addEventListener('alpine:init', () => {
    Alpine.store('turnout', {
        path: window.location.pathname,
        title: '',
        registeredRoutes: new Set(),
        notFound: false,

        init() {
            window.addEventListener('popstate', () => this.update());
            // Small delay to let directives register before initial check
            setTimeout(() => this.update(), 50);
        },

        go(path) {
            if (this.path !== path) {
                history.pushState(null, '', path);
                this.update();
            }
        },

        update() {
            this.path = window.location.pathname;
            const hasMatch = Array.from(this.registeredRoutes).some(route => {
                const regex = new RegExp(`^${route.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`);
                return this.path.match(regex);
            });
            this.notFound = !hasMatch;
            this.handleDefault404();
        },

        handleDefault404() {
            let fallbackEl = document.getElementById('alpine-turnout-404');
            const custom404 = document.querySelector('[x-route="*"]');
            
            if (this.notFound && !custom404) {
                if (!fallbackEl) {
                    fallbackEl = document.createElement('section');
                    fallbackEl.id = 'alpine-turnout-404';
                    fallbackEl.innerHTML = `
                        <article style="text-align: center;">
                            <h1>404</h1>
                            <p>End of the line. This track doesn't lead anywhere.</p>
                            <a href="/">Back to Station</a>
                        </article>`;
                    (document.querySelector('main') || document.body).appendChild(fallbackEl);
                }
                this.title = "Not Found";
            } else if (fallbackEl) {
                fallbackEl.remove();
            }
        }
    });

    // Global intercept for links
    window.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || !link.getAttribute('href')?.startsWith('/') || link.target === '_blank') return;
        e.preventDefault();
        Alpine.store('turnout').go(link.getAttribute('href'));
    });

    Alpine.directive('route', (el, { }, { effect }) => {
        const pathPattern = el.getAttribute('x-route');
        const routeTitle = el.getAttribute('x-title') || "";
        
        if (pathPattern !== '*') {
            Alpine.store('turnout').registeredRoutes.add(pathPattern);
        }

        const routeData = Alpine.reactive({ 
            _active: false 
        });

        // Injects reactive scope so x-text and x-show work
        Alpine.addScopeToNode(el, routeData);

        if (!el.hasAttribute('x-show')) {
            el.setAttribute('x-show', '_active');
        }

        effect(() => {
            const currentPath = Alpine.store('turnout').path;
            const is404Template = pathPattern === '*';
            
            let match = null;
            if (is404Template) {
                if (Alpine.store('turnout').notFound) match = { groups: {} };
            } else {
                const regexPattern = pathPattern.replace(/:(\w+)/g, '(?<$1>[^/]+)');
                match = currentPath.match(new RegExp(`^${regexPattern}$`));
            }

            if (match) {
                Object.assign(routeData, match.groups);
                routeData._active = true;
                
                if (routeTitle) {
                    Alpine.store('turnout').title = routeTitle;
                    document.title = routeTitle;
                }
            } else {
                routeData._active = false;
            }
        });
    });
});
