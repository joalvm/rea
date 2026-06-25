document.addEventListener("DOMContentLoaded", () => {
    renderChrome();

    const root = document.documentElement;
    const btn = document.getElementById("themeBtn");
    const label = document.getElementById("themeLabel");
    const requestedTheme = new URLSearchParams(location.search).get("theme");
    const saved = localStorage.getItem("rea-design-theme");
    const systemTheme =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    function applyTheme(next) {
        root.setAttribute("data-theme", next);
        const isDark = next === "dark";
        const icon = document.getElementById("themeIcon");
        if (label) label.textContent = isDark ? "Modo claro" : "Modo oscuro";
        if (icon) icon.setAttribute("data-lucide", isDark ? "sun" : "moon");
        if (btn) btn.setAttribute("aria-pressed", String(isDark));
        localStorage.setItem("rea-design-theme", next);
        renderLucideIcons();
    }

    if (requestedTheme === "dark" || requestedTheme === "light") applyTheme(requestedTheme);
    else if (saved === "dark" || saved === "light") applyTheme(saved);
    else applyTheme(systemTheme);

    if (btn)
        btn.addEventListener("click", () => applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark"));

    const page = document.body.dataset.page || "index";
    document.querySelectorAll(".nav a[data-nav]").forEach((link) => {
        const active = link.dataset.nav === page;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "page");
    });

    renderLucideIcons();
    window.addEventListener("load", renderLucideIcons, { once: true });
});

function renderLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
    }
}

function renderChrome() {
    const page = document.body.dataset.page || "index";
    const title = document.body.dataset.title || "Sistema de diseno";
    const sidebar = document.getElementById("siteSidebar");
    const topbar = document.getElementById("siteTopbar");
    const pages = [
        ["index", "./index.html", "Fundamentos"],
        ["color", "./color.html", "Color"],
        ["typography", "./typography.html", "Tipografia"],
        ["icons", "./icons.html", "Iconos"],
        ["space", "./space.html", "Forma y espacio"],
        ["components", "./components.html", "Componentes"],
        ["hero", "./hero.html", "Hero"],
        ["calendar", "./calendar.html", "Calendario"],
    ];
    const quickLinks = [
        ["./index.html#marca", "Marca"],
        ["./index.html#contenido-producto", "Contenido"],
        ["./color.html#roles-interfaz", "Roles de interfaz"],
        ["./color.html#fases-y-estados", "Fases del ciclo"],
        ["./components.html#checkin", "Check-in"],
        ["./components.html#navegacion-mobile", "Navegacion mobile"],
    ];

    if (sidebar) {
        sidebar.innerHTML = `
            <div class="side-brand">
                <span class="logo-asset logo-mark" role="img" aria-label="Isotipo Rea"></span>
                <div class="side-brand-text"><strong>Rea</strong><span>Design system</span></div>
            </div>
            <nav class="nav" aria-label="Indice del sistema">
                <div class="nav-group">
                    <div class="nav-label">Sistema mobile</div>
                    ${pages.map(([key, href, labelText]) => `<a data-nav="${key}" href="${href}">${labelText}</a>`).join("")}
                </div>
                <div class="nav-group">
                    <div class="nav-label">Referencia rapida</div>
                    ${quickLinks.map(([href, labelText]) => `<a href="${href}">${labelText}</a>`).join("")}
                </div>
            </nav>`;
    }

    if (topbar) {
        topbar.innerHTML = `
            <div class="crumbs">docs/design/${page === "index" ? "index" : page}.html · ${title}</div>
            <button class="theme-toggle" id="themeBtn" type="button" aria-label="Cambiar modo de color">
                <i class="icon sm" id="themeIcon" data-lucide="moon" aria-hidden="true"></i>
                <span id="themeLabel">Modo oscuro</span>
            </button>`;
    }
}
