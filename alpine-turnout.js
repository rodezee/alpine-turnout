document.addEventListener('alpine:init', () => {
    Alpine.store('turnout', {
        path: window.location.pathname,
        title: '',
        registeredRoutes: new Set(),
        notFound: false,

        init() {
            window.addEventListener('popstate', () => this.update());
            // Small delay to ensure all directives are registered
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
            const routes = Array.from(this.registeredRoutes);
            
            const hasMatch = routes.some(route => {
                const regex = new RegExp(`^${route.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`);
                return this.path.match(regex);
            });

            // Feature: Ignore 404 on root if not explicitly registered (Hash support)
            this.notFound = !hasMatch && this.path !== '/';
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
                        <article style="text-align: center; padding: 2rem; font-family: sans-serif;">
                            <h1 style="font-size: 3rem; margin-bottom: 0.5rem;">404</h1>
                            <p style="color: #64748b;">End of the line. This track doesn't lead anywhere.</p>
                            <a href="/" style="color: #6366f1; text-decoration: underline; font-weight: bold;">Back to Station</a>
                        </article>`;
                    (document.querySelector('main') || document.body).appendChild(fallbackEl);
                }
                this.title = "Not Found";
            } else if (fallbackEl) {
                fallbackEl.remove();
            }
        }
    });

    Alpine.directive('route', (el, { }, { effect }) => {
        const pathPattern = el.getAttribute('x-route');
        const routeTitle = el.getAttribute('x-title') || "";
        
        if (pathPattern !== '*') {
            Alpine.store('turnout').registeredRoutes.add(pathPattern);
        }

        // Feature Fix: Initialize state immediately to prevent "undefined" errors
        const state = Alpine.reactive({ _active: false, id: null });
        Alpine.addScopeToNode(el, state);

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
                state._active = true;
                // Feature: Dynamic URL param injection (e.g., :id)
                Object.assign(state, match.groups);
                
                // Feature: Dynamic title updates
                if (routeTitle) {
                    Alpine.store('turnout').title = routeTitle;
                    document.title = routeTitle;
                }
            } else {
                state._active = false;
            }
        });
    });

    // Global Click Interceptor
    window.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        
        // Feature: Hash-Guard + External Link Protection
        if (!href || href.startsWith('#') || link.target === '_blank' || !href.startsWith('/')) return;
        
        e.preventDefault();
        Alpine.store('turnout').go(href);
    });
});
