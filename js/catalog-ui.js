import { CATALOG, FLYER_CATEGORIES, catalogImagePath, waOrderUrl } from "./catalog.js";

let selectedProductId = null;
let allProducts = [];

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDescription(text) {
  return escapeHtml(text).split("\n").join("<br>");
}

function buildProductIndex() {
  const items = [];
  for (const category of CATALOG) {
    for (const product of category.products) {
      items.push({
        ...product,
        categoryId: category.id,
        categoryTitle: category.title,
        categoryIcon: category.icon,
        searchText: [
          product.title,
          product.shortDescription,
          product.description,
          category.title,
        ]
          .join(" ")
          .toLowerCase(),
      });
    }
  }
  return items;
}

function renderProductRow(product) {
  const imgSrc = product.image ? catalogImagePath(product.image) : "";
  const img = product.image
    ? `<img src="${escapeHtml(imgSrc)}" alt="" width="72" height="72" loading="lazy" />`
    : `<span class="catalog-item__placeholder" aria-hidden="true">&#128230;</span>`;
  const msg = `Hi, I'd like to order: ${product.title}`;
  const selected = selectedProductId === product.id ? " is-selected" : "";

  return `
    <article
      class="catalog-item${selected}"
      data-product-id="${product.id}"
      data-category="${product.categoryId}"
      data-search="${escapeHtml(product.searchText)}"
      aria-selected="${selectedProductId === product.id}"
    >
      <button type="button" class="catalog-item__main" aria-label="Select ${escapeHtml(product.title)}">
        <div class="catalog-item__thumb">${img}</div>
        <div class="catalog-item__info">
          <span class="catalog-item__badge">${escapeHtml(product.categoryIcon)} ${escapeHtml(product.categoryTitle)}</span>
          <h4 class="catalog-item__title">${escapeHtml(product.title)}</h4>
          <p class="catalog-item__desc">${escapeHtml(product.shortDescription)}</p>
          <p class="catalog-item__price">${escapeHtml(product.priceLabel)}</p>
        </div>
      </button>
      <a class="catalog-item__add" href="${waOrderUrl(msg)}" target="_blank" rel="noopener" aria-label="Order ${escapeHtml(product.title)} on WhatsApp" title="Order on WhatsApp">+</a>
    </article>
  `;
}

function renderFlyerRow(cat) {
  return `
    <a class="catalog-item catalog-item--link" href="#${cat.anchor}" data-category="flyer" data-search="${escapeHtml((cat.title + " " + cat.description).toLowerCase())}">
      <div class="catalog-item__thumb">
        <img src="${escapeHtml(cat.image)}" alt="" width="72" height="72" loading="lazy" />
      </div>
      <div class="catalog-item__info">
        <span class="catalog-item__badge">&#128722; More ranges</span>
        <h4 class="catalog-item__title">${escapeHtml(cat.title)}</h4>
        <p class="catalog-item__desc">${escapeHtml(cat.description)}</p>
        <p class="catalog-item__price catalog-item__price--link">View full price list &rarr;</p>
      </div>
    </a>
  `;
}

function findProduct(productId) {
  return allProducts.find((p) => p.id === productId) ?? null;
}

function openProductModal(product) {
  const modal = document.getElementById("product-modal");
  if (!modal || !product) return;

  const img = document.getElementById("product-modal-image");
  const title = document.getElementById("product-modal-title");
  const price = document.getElementById("product-modal-price");
  const body = document.getElementById("product-modal-body");
  const waBtn = document.getElementById("product-modal-wa");
  const listBtn = document.getElementById("product-modal-pricelist");

  if (product.image) {
    img.src = catalogImagePath(product.image);
    img.alt = product.title;
    img.classList.remove("hidden");
  } else {
    img.classList.add("hidden");
  }

  title.textContent = product.title;
  price.textContent = product.priceLabel;
  body.innerHTML = formatDescription(product.description);
  waBtn.href = waOrderUrl(`Hi, I'd like to order: ${product.title}`);
  listBtn.href = product.anchor ? `#${product.anchor}` : "#prices";

  modal.classList.add("is-open");
  document.body.classList.add("modal-open");
}

function selectProduct(productId, { openModal = true } = {}) {
  selectedProductId = productId;
  const root = document.getElementById("catalog-root");
  if (!root) return;

  root.querySelectorAll(".catalog-item[data-product-id]").forEach((el) => {
    const isSelected = el.getAttribute("data-product-id") === productId;
    el.classList.toggle("is-selected", isSelected);
    el.setAttribute("aria-selected", String(isSelected));
  });

  const product = findProduct(productId);
  if (product && openModal) openProductModal(product);
}

function applyFilters() {
  const root = document.getElementById("catalog-root");
  if (!root) return;

  const query = (root.querySelector("#catalog-search")?.value ?? "").trim().toLowerCase();
  const category = root.querySelector("#catalog-category-filter")?.value ?? "all";
  const list = root.querySelector("#catalog-list");
  const empty = root.querySelector("#catalog-empty");
  const countEl = root.querySelector("#catalog-count");

  let visible = 0;

  list?.querySelectorAll(".catalog-item").forEach((el) => {
    const itemCategory = el.getAttribute("data-category") ?? "";
    const searchBlob = el.getAttribute("data-search") ?? "";
    const matchSearch = !query || searchBlob.includes(query);
    const matchCategory =
      category === "all" ||
      (category === "flyer" && itemCategory === "flyer") ||
      itemCategory === category;
    const show = matchSearch && matchCategory;

    el.classList.toggle("hidden", !show);
    if (show) visible++;
  });

  if (countEl) {
    countEl.textContent =
      visible === 0 ? "No products match" : `${visible} product${visible === 1 ? "" : "s"}`;
  }
  empty?.classList.toggle("hidden", visible > 0);
}

function bindCatalogEvents(root) {
  root.querySelector("#catalog-search")?.addEventListener("input", applyFilters);
  root.querySelector("#catalog-category-filter")?.addEventListener("change", applyFilters);

  root.querySelectorAll(".catalog-item[data-product-id] .catalog-item__main").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".catalog-item")?.getAttribute("data-product-id");
      if (id) selectProduct(id, { openModal: true });
    });
  });

  const modal = document.getElementById("product-modal");
  if (modal) {
    const close = () => {
      modal.classList.remove("is-open");
      document.body.classList.remove("modal-open");
    };
    modal.querySelectorAll("[data-close-modal]").forEach((el) => el.addEventListener("click", close));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
    document.getElementById("product-modal-pricelist")?.addEventListener("click", close);
  }
}

export function initCatalog() {
  const root = document.getElementById("catalog-root");
  if (!root) return;

  allProducts = buildProductIndex();

  const categoryOptions = CATALOG.map(
    (c) => `<option value="${c.id}">${escapeHtml(c.icon + " " + c.title)}</option>`,
  ).join("");

  const productRows = allProducts.map(renderProductRow).join("");
  const flyerRows = FLYER_CATEGORIES.map(renderFlyerRow).join("");

  root.innerHTML = `
    <div class="catalog-panel">
      <div class="catalog-panel__head">
        <h2 class="catalog-panel__title">Catalogue</h2>
        <p class="catalog-panel__sub">Search or filter by category, tap a product to view details, or use + to order on WhatsApp.</p>
      </div>

      <div class="catalog-toolbar">
        <label class="catalog-toolbar__field catalog-toolbar__field--grow">
          <span class="catalog-toolbar__label">Search</span>
          <input
            type="search"
            id="catalog-search"
            class="catalog-search"
            placeholder="Search products&hellip; e.g. nova, bleach, sweets"
            autocomplete="off"
          />
        </label>
        <label class="catalog-toolbar__field">
          <span class="catalog-toolbar__label">Category</span>
          <select id="catalog-category-filter" class="catalog-select" aria-label="Filter by category">
            <option value="all">All categories</option>
            ${categoryOptions}
            <option value="flyer">More ranges (flyer)</option>
          </select>
        </label>
      </div>
      <p id="catalog-count" class="catalog-count">${allProducts.length + FLYER_CATEGORIES.length} products</p>

      <div
        id="catalog-list"
        class="catalog-list"
        role="list"
        aria-label="Product catalogue"
      >
        ${productRows}
        ${flyerRows}
      </div>

      <p id="catalog-empty" class="catalog-empty hidden" role="status">
        No products match your search. Try another keyword or choose &ldquo;All categories&rdquo;.
      </p>

      <p class="catalog-footnote">
        <a class="catalog-see-all" href="#prices">View complete price list</a>
        &nbsp;&middot;&nbsp;
        <a class="catalog-see-all" href="https://wa.me/27796544532" target="_blank" rel="noopener">Chat on WhatsApp</a>
      </p>
    </div>
  `;

  bindCatalogEvents(root);
  applyFilters();
}
