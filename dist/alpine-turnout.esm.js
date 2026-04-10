//#region alpine-turnout.js
document.addEventListener("alpine:init", () => {
	Alpine.store("turnout", {
		path: window.location.pathname,
		title: "",
		registeredRoutes: /* @__PURE__ */ new Set(),
		notFound: !1,
		init() {
			window.addEventListener("popstate", () => this.update()), setTimeout(() => this.update(), 50);
		},
		go(e) {
			this.path !== e && (history.pushState(null, "", e), this.update());
		},
		update() {
			this.path = window.location.pathname, this.notFound = !Array.from(this.registeredRoutes).some((e) => {
				let t = RegExp(`^${e.replace(/:(\w+)/g, "(?<$1>[^/]+)")}$`);
				return this.path.match(t);
			}) && this.path !== "/", this.handleDefault404();
		},
		handleDefault404() {
			let e = document.getElementById("alpine-turnout-404"), t = document.querySelector("[x-route=\"*\"]");
			this.notFound && !t ? (e || (e = document.createElement("section"), e.id = "alpine-turnout-404", e.innerHTML = "\n                        <article style=\"text-align: center; padding: 2rem; font-family: sans-serif;\">\n                            <h1 style=\"font-size: 3rem; margin-bottom: 0.5rem;\">404</h1>\n                            <p style=\"color: #64748b;\">End of the line. This track doesn't lead anywhere.</p>\n                            <a href=\"/\" style=\"color: #6366f1; text-decoration: underline; font-weight: bold;\">Back to Station</a>\n                        </article>", (document.querySelector("main") || document.body).appendChild(e)), this.title = "Not Found") : e && e.remove();
		}
	}), Alpine.directive("route", (e, {}, { effect: t }) => {
		let n = e.getAttribute("x-route"), r = e.getAttribute("x-title") || "";
		n !== "*" && Alpine.store("turnout").registeredRoutes.add(n);
		let i = Alpine.reactive({
			_active: !1,
			id: null
		});
		Alpine.addScopeToNode(e, i), e.hasAttribute("x-show") || e.setAttribute("x-show", "_active"), t(() => {
			let e = Alpine.store("turnout").path, t = n === "*", a = null;
			if (t) Alpine.store("turnout").notFound && (a = { groups: {} });
			else {
				let t = n.replace(/:(\w+)/g, "(?<$1>[^/]+)");
				a = e.match(RegExp(`^${t}$`));
			}
			a ? (i._active = !0, Object.assign(i, a.groups), r && (Alpine.store("turnout").title = r, document.title = r)) : i._active = !1;
		});
	}), window.addEventListener("click", (e) => {
		let t = e.target.closest("a");
		if (!t) return;
		let n = t.getAttribute("href");
		!n || n.startsWith("#") || t.target === "_blank" || !n.startsWith("/") || (e.preventDefault(), Alpine.store("turnout").go(n));
	});
});
//#endregion
