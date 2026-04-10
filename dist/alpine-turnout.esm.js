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
			}), this.handleDefault404();
		},
		handleDefault404() {
			let e = document.getElementById("alpine-turnout-404"), t = document.querySelector("[x-route=\"*\"]");
			this.notFound && !t ? (e || (e = document.createElement("section"), e.id = "alpine-turnout-404", e.innerHTML = "\n                        <article style=\"text-align: center;\">\n                            <h1>404</h1>\n                            <p>End of the line. This track doesn't lead anywhere.</p>\n                            <a href=\"/\">Back to Station</a>\n                        </article>", (document.querySelector("main") || document.body).appendChild(e)), this.title = "Not Found") : e && e.remove();
		}
	}), window.addEventListener("click", (e) => {
		let t = e.target.closest("a");
		!t || !t.getAttribute("href")?.startsWith("/") || t.target === "_blank" || (e.preventDefault(), Alpine.store("turnout").go(t.getAttribute("href")));
	}), Alpine.directive("route", (e, {}, { effect: t }) => {
		let n = e.getAttribute("x-route"), r = e.getAttribute("x-title") || "";
		n !== "*" && Alpine.store("turnout").registeredRoutes.add(n);
		let i = Alpine.reactive({ _active: !1 });
		Alpine.addScopeToNode(e, i), e.hasAttribute("x-show") || e.setAttribute("x-show", "_active"), t(() => {
			let e = Alpine.store("turnout").path, t = n === "*", a = null;
			if (t) Alpine.store("turnout").notFound && (a = { groups: {} });
			else {
				let t = n.replace(/:(\w+)/g, "(?<$1>[^/]+)");
				a = e.match(RegExp(`^${t}$`));
			}
			a ? (Object.assign(i, a.groups), i._active = !0, r && (Alpine.store("turnout").title = r, document.title = r)) : i._active = !1;
		});
	});
});
//#endregion
