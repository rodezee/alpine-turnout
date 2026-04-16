export default function (Alpine) {
    Alpine.store('turnout', {
        path: window.location.pathname,
        title: '',
        registeredRoutes: new Set(),
        notFound: false,
        isPopState: false,
        scrollCache: {}, 

        init() {
            window.addEventListener('popstate', () => {
                this.isPopState = true;
                this.update();
            });
            setTimeout(() => this.update(), 50);
        },

        go(path) {
            const [cleanPath, hash] = path.split('#');
            this.scrollCache[this.path] = window.scrollY;

            if (this.path !== cleanPath) {
                this.isPopState = false;
                history.pushState(null, '', path);
                this.update();
            } else if (hash) {
                this.scrollToHash(hash);
            }
        },

        update() {
            if (!this.isPopState) {
                this.scrollCache[this.path] = window.scrollY;
            }

            this.path = window.location.pathname;
            const routes = Array.from(this.registeredRoutes);
            
            const hasMatch = routes.some(route => {
                const regex = new RegExp(`^${route.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`);
                return this.path.match(regex);
            });

            this.notFound = !hasMatch && this.path !== '/';
            this.handleDefault404();

            const hash = window.location.hash.replace('#', '');
            
            if (hash) {
                this.scrollToHash(hash);
            } else if (this.isPopState) {
                // Browser handles back
            } else {
                const savedScroll = this.scrollCache[this.path] || 0;
                Alpine.nextTick(() => {
                    window.scrollTo({ left: 0, top: savedScroll, behavior: 'smooth' });
                });
            }

            this.isPopState = false;
        },

        scrollToHash(hashId) {
            Alpine.nextTick(() => {
                const el = document.getElementById(hashId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                }
            });
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

    // 2. x-route Directive
    Alpine.directive('route', (el, { }, { effect }) => {
        const pathPattern = el.getAttribute('x-route');
        const routeTitle = el.getAttribute('x-title') || "";
        
        if (pathPattern !== '*') {
            Alpine.store('turnout').registeredRoutes.add(pathPattern);
        }

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
                Object.assign(state, match.groups);
                
                if (routeTitle) {
                    Alpine.store('turnout').title = routeTitle;
                    document.title = routeTitle;
                }
            } else {
                state._active = false;
            }
        });
    });

    // 2.5 x-arrive Directive (Entry)
    Alpine.directive('arrive', (el, { expression }, { evaluateLater, effect }) => {
        const evaluate = evaluateLater(expression);
        effect(() => {
            if (Alpine.evaluate(el, '_active')) {
                Alpine.nextTick(() => evaluate());
            }
        });
    });

    // NEW: 2.6 x-leave Directive (Exit)
    Alpine.directive('leave', (el, { expression }, { evaluateLater, effect }) => {
        const evaluate = evaluateLater(expression);
        let firstRun = true;

        effect(() => {
            const active = Alpine.evaluate(el, '_active');
            
            // We only want to trigger 'leave' if it WAS active and now isn't.
            // We skip the first run to avoid triggering it on page load.
            if (!active && !firstRun) {
                evaluate();
            }
            
            firstRun = false;
        });
    });

    // 3. Global Click Interceptor
    window.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || link.target === '_blank' || !href.startsWith('/')) return;
        
        e.preventDefault();
        Alpine.store('turnout').go(href);
    });
}
