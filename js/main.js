import {
  CLEANING,
  PAPER,
  EQUIPMENT,
  CLEANING_COLUMNS,
  PAPER_COLUMNS,
  EQUIPMENT_COLUMNS,
  FOOTNOTE,
} from "./products.js";
import { initCatalog } from "./catalog-ui.js";

function formatPrice(value) {
  if (value == null) return '<span class="empty">—</span>';
  return "R " + value.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderTable(containerId, products, columns, caption) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const thead = columns.map((c) => `<th>${c.label}</th>`).join("");
  const rows = products
    .map((product) => {
      const cells = columns
        .map((col) => {
          const val = product.prices[col.key];
          return `<td>${formatPrice(val)}</td>`;
        })
        .join("");
      return `<tr data-name="${product.name.toLowerCase()}"><td>${product.name}</td>${cells}</tr>`;
    })
    .join("");

  container.innerHTML = `
    <table class="price-table">
      <caption>${caption}</caption>
      <thead><tr><th>Product</th>${thead}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function setupSearch() {
  const input = document.getElementById("product-search");
  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll(".price-table tbody tr").forEach((row) => {
      const name = row.getAttribute("data-name") || "";
      row.classList.toggle("hidden", q.length > 0 && !name.includes(q));
    });
  });
}

function setupNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

renderTable("prices-cleaning", CLEANING, CLEANING_COLUMNS, "Cleaning Detergents / Chemicals");
renderTable("prices-paper", PAPER, PAPER_COLUMNS, "Toilet Paper / Kitchen Towels / Tissues");
renderTable("prices-equipment", EQUIPMENT, EQUIPMENT_COLUMNS, "Cleaning Equipment");

const footnote = document.getElementById("cleaning-footnote");
if (footnote) footnote.textContent = FOOTNOTE;

setupSearch();
setupNav();
initCatalog();
