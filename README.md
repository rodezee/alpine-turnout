
<p align="center">
  <img src="data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='20' y='0' width='8' height='100' fill='%234A5568'/%3E%3Crect x='72' y='0' width='8' height='100' fill='%234A5568'/%3E%3Crect x='15' y='10' width='70' height='4' rx='1' fill='%23718096'/%3E%3Crect x='15' y='30' width='75' height='4' rx='1' fill='%23718096'/%3E%3Crect x='15' y='50' width='80' height='4' rx='1' fill='%23718096'/%3E%3Crect x='15' y='70' width='50' height='4' rx='1' fill='%23718096'/%3E%3Crect x='15' y='90' width='30' height='4' rx='1' fill='%23718096'/%3E%3Cpath d='M72 0 C 72 40, 20 70, 20 100' stroke='%234A5568' stroke-width='8' fill='none'/%3E%3Ccircle cx='72' cy='35' r='5' fill='%23E53E3E'/%3E%3C/svg%3E" width="120" alt="Alpine Turnout Logo">
</p>

<h1 align="center">Alpine Turnout</h1>

<p align="center">A lightweight, persistent tab-style switch for Alpine.js</p>

# <img src="data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='20' y='0' width='8' height='100' fill='%234A5568'/%3E%3Crect x='72' y='0' width='8' height='100' fill='%234A5568'/%3E%3Crect x='15' y='10' width='70' height='4' rx='1' fill='%23718096'/%3E%3Crect x='15' y='30' width='75' height='4' rx='1' fill='%23718096'/%3E%3Crect x='15' y='50' width='80' height='4' rx='1' fill='%23718096'/%3E%3Crect x='15' y='70' width='50' height='4' rx='1' fill='%23718096'/%3E%3Crect x='15' y='90' width='30' height='4' rx='1' fill='%23718096'/%3E%3Cpath d='M72 0 C 72 40, 20 70, 20 100' stroke='%234A5568' stroke-width='8' fill='none'/%3E%3Ccircle cx='72' cy='35' r='5' fill='%23E53E3E'/%3E%3C/svg%3E" width="40" vertical-align="middle"> Alpine Turnout

Unlike traditional routers that destroy and recreate DOM elements, **Alpine Turnout** treats your routes like railroad tracks. Every section stays in the DOM, preserving its internal state, while the "Turnout" guides the view and URL to the correct destination.

## Why Turnout?

-   **Persistence:** Forms, scroll positions, and component data are preserved when navigating away and back.
    
-   **Instant Switching:** No re-mounting or re-fetching logic on every click.
    
-   **Alpine-Native:** Uses a global store and a single directive.
    
-   **Transitions:** Works seamlessly with Alpine's `x-transition`.
    
-   **Zero-Config 404:** Handles "end of the line" paths automatically.
    

----------

## Installation

### Via CDN

Include the script before Alpine.js:

```html
<script src="https://unpkg.com/alpine-turnout" defer></script>
<script src="https://unpkg.com/alpinejs" defer></script>

```

### Via NPM

```bash
npm install alpine-turnout

```

----------

## Usage

### 1. Define your Tracks

Wrap your sections in a `main` tag (or any container) and use the `x-route` directive.

```html
<h1 x-data x-text="$store.turnout.title"></h1>

<main>
    <div x-route="/" x-title="Welcome Home" x-transition>
        <p>This is the homepage.</p>
    </div>

    <div x-route="/user/:name" x-title="User Profile" x-transition>
        <p>Hello, <strong x-text="name"></strong>!</p>
    </div>

    <div x-route="/search" x-title="Search" x-transition>
        <article x-data="{ query: '' }">
            <input type="text" x-model="query" placeholder="Type here...">
            <p>Your input is preserved even if you switch tabs!</p>
        </article>
    </div>
</main>

```

[Go Here](https://alpine-turnout.netlify.app) for a more extensive live example!

### 2. Navigation

Turnout automatically intercepts any internal `<a>` links. You can also navigate programmatically:

```html
<button @click="$store.turnout.go('/user/john')">Visit John</button>

```

----------

## How it Works

When you define an `x-route`, Alpine Turnout does three things:

1.  **Registers the path:** Adds the pattern to a global registry.
    
2.  **Injects Scope:** Makes route parameters (like `:name`) available directly to the HTML inside that div.
    
3.  **Manages Visibility:** Uses `x-show` logic under the hood. When the URL matches, the track becomes visible; otherwise, it is hidden with `display: none`.
    

----------

## API Reference

### Global Store: `$store.turnout`

Property

Type

Description  

`path`

`String`

The current URL pathname.  

`title`

`String`

The value of `x-title` for the active route.  

`notFound`

`Boolean`

True if the current path matches no registered routes.  

`go(path)`

`Function`

Programmatically navigate to a new track.  

### Directive: `x-route`

Used on a `div` or `section` to define a track.

-   **Static Routes:** `x-route="/about"`
    
-   **Dynamic Routes:** `x-route="/post/:id"` (makes `id` available in local scope).
    
-   **Wildcard (Custom 404):** `x-route="*"`
    

----------

## Default 404 Behavior

If no `x-route="*"` is found and the user hits an unregistered path, Turnout automatically injects a "Dead End" 404 section into your `main` element to prevent a blank screen.

----------

## Transitions

Because Turnout uses Alpine's visibility toggling, you can use standard transitions. Note that we recommend setting a `leave.duration.0ms` if you want the "old" page to disappear instantly while the new one fades in.

HTML

```
<div x-route="/fast" 
     x-transition.duration.500ms 
     x-transition:leave.duration.0ms>
    ...
</div>

```

----------

## Comparison with alpine-router

Feature

alpine-router

**alpine-turnout**

**DOM Logic**

Destroys/Creates

Hides/Shows (**Persistent**)

**State**

Reset on nav

Preserved (Forms/Input)

**Performance**

Lower Memory

Faster Switching

**Best For**

Massive apps

One-pagers & Dashboards
    

----------
## 🚀 Deployment

Since this is a Single Page Application (SPA) using the `History API`, your web server must be configured to serve `index.html` for all requests that don't match a static file.

### Example for Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

```

### Example for Netlify:
Simply include a file in the root of your repository, named: `netlify.toml`
```
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

```

----------


## 🧪 Testing

This project is tested using **Vitest** and **JSDOM**. Because Alpine.js initializes asynchronously, the test suite ensures that routes are correctly registered and cleared.

To run the tests:

Bash

```
npm install
npm test

```

### Example Test Case

Our suite covers:

-   Initial render of the Home route.
    
-   Navigation to parameterized routes (extracting `:name`).
    
-   DOM cleanup (ensuring the old route is removed).
    
-   404 fallback logic.
    

----------

## 💡 Why "Switch"?

Traditional routers often hide and show elements using `display: none`. **Alpine Switch Router** physically removes the previous route from the DOM before mounting the new one. This ensures:

1.  **No ID Collisions:** Two pages can't have the same `#id` at the same time.
    
2.  **Clean State:** Alpine components on the previous page are fully destroyed, firing their `x-cleanup` hooks.
    
3.  **Performance:** The browser only has to style and paint the content you are actually looking at.
    

----------

## ⚖️ License

MIT © [biensurerodezee@protonmail.com]

# alpine-turnout
