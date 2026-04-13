/** @vitest-environment jsdom */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/dom';
import Alpine from 'alpinejs';
// Make sure this matches your filename!
import AlpineTurnout from './alpine-turnout.js'; 

beforeAll(() => {
  // Mock window.scrollTo
  window.scrollTo = vi.fn()

  // Mock Element.prototype.scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

describe('Alpine Turnout (Persistent Tab Router)', () => {
  beforeEach(async () => {
    // 1. Clear all spies/mocks to prevent pollution from previous tests
    vi.clearAllMocks();
    vi.restoreAllMocks();

    // 2. Reset URL to root
    window.history.pushState({}, '', '/');

    // 3. Inject Test HTML
    document.body.innerHTML = `
      <h1 x-data x-text="$store.turnout.title"></h1>
      <main id="router-root">
        <div x-route="/" x-title="Home" id="home">Home Content</div>
        <div x-route="/user/:name" x-title="User Profile" id="user">
            User: <span x-text="name"></span>
        </div>
        <div x-route="/about" x-title="About" id="about">About Content</div>
      </main>
    `;

    // 4. Ensure Alpine is started
    if (!window.AlpineInitialized) {
        window.Alpine = Alpine;
        Alpine.plugin(AlpineTurnout); // Load Alpine Turnout Plugin
        Alpine.start();
        window.AlpineInitialized = true;
    }

    // 5. Reset Turnout Store State
    const store = Alpine.store('turnout');
    if (store) {
        store.registeredRoutes.clear();
        const fallback = document.getElementById('alpine-turnout-404');
        if (fallback) fallback.remove();

        Alpine.initTree(document.body);
        store.update();
    }
  });

  it('initializes and shows the home route by default', async () => {
    await waitFor(() => {
      const home = document.getElementById('home');
      expect(home.style.display).not.toBe('none');
      expect(document.querySelector('h1').textContent).toBe('Home');
    });
  });

  it('navigates to a parameterized track and updates the view', async () => {
    Alpine.store('turnout').go('/user/john');

    await waitFor(() => {
      expect(window.location.pathname).toBe('/user/john');
      const user = document.getElementById('user');
      expect(user.style.display).not.toBe('none');
      expect(user.textContent).toContain('john');
    });
  });

  it('updates parameters reactively without re-mounting the element', async () => {
    Alpine.store('turnout').go('/user/john');
    await waitFor(() => expect(document.getElementById('user').textContent).toContain('john'));

    const originalNode = document.getElementById('user');
    Alpine.store('turnout').go('/user/jane');

    await waitFor(() => {
      expect(document.getElementById('user').textContent).toContain('jane');
      expect(document.getElementById('user')).toBe(originalNode);
    });
  });

  it('renders a 404 terminal when a track is not found', async () => {
    Alpine.store('turnout').go('/wrong-way');

    await waitFor(() => {
      const fallback = document.getElementById('alpine-turnout-404');
      expect(fallback).not.toBeNull();
      expect(document.getElementById('home').style.display).toBe('none');
    });
  });

  it('persists state (like attributes or input) when switching tracks', async () => {
    Alpine.store('turnout').go('/user/bobby');
    await waitFor(() => expect(document.getElementById('user').style.display).not.toBe('none'));
    
    const userEl = document.getElementById('user');
    userEl.setAttribute('data-passenger-status', 'seated');

    Alpine.store('turnout').go('/about');
    await waitFor(() => expect(userEl.style.display).toBe('none'));

    Alpine.store('turnout').go('/user/bobby');
    await waitFor(() => {
        expect(userEl.style.display).not.toBe('none');
        expect(userEl.getAttribute('data-passenger-status')).toBe('seated');
    });
  });

  it('intercepts internal links and prevents default behavior', async () => {
    const store = Alpine.store('turnout');
    const spy = vi.spyOn(store, 'go');

    const link = document.createElement('a');
    link.href = '/about';
    document.body.appendChild(link);

    link.click();

    expect(spy).toHaveBeenCalledWith('/about');
    link.remove();
  });

  it('ignores external links and allows standard navigation', async () => {
    const store = Alpine.store('turnout');
    // We create a fresh spy here
    const spy = vi.spyOn(store, 'go');

    const extLink = document.createElement('a');
    extLink.href = 'https://google.com';
    document.body.appendChild(extLink);

    // JSDOM throws "Not implemented" for external navigation.
    // We catch it because we only care that the ROUTER didn't try to handle it.
    try {
        extLink.click();
    } catch (e) {
        // Expected JSDOM error
    }

    expect(spy).not.toHaveBeenCalled();
    extLink.remove();
  });
});
