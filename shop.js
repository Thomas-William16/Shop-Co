/* ============================================================
   SHOP.CO — shop.html filtering engine
   Depends on script.js being loaded first (loadProducts, renderProducts, etc.)
   ============================================================ */

const COLOR_HEX = {
  black: "#0f0f0f",
  white: "#ffffff",
  gray: "#9aa0a6",
  blue: "#2b5fad",
  red: "#c1272d",
  orange: "#d9713c",
  green: "#3f5e3a",
  navy: "#1c2541",
  beige: "#cdbfa5",
};

const CATEGORIES = ["T-shirts", "Shorts", "Shirts", "Hoodie", "Jeans"];
const SIZES = ["S", "M", "L", "XL"];
const STYLES = ["Casual", "Formal", "Party", "Gym"];
const PAGE_SIZE = 9;

let ALL_PRODUCTS = [];
let state = {
  categories: new Set(),
  colors: new Set(),
  sizes: new Set(),
  styles: new Set(),
  priceMin: 0,
  priceMax: 300,
  sort: "featured",
  search: "",
  page: 1,
};

/* ---------------- Filter sidebar rendering ---------------- */

function renderFilterOptions() {
  const catBox = document.getElementById("category-options");
  catBox.innerHTML = CATEGORIES.map(c => `
    <label>
      <input type="checkbox" data-filter="category" value="${c}">
      ${c}
    </label>`).join("");

  const colorBox = document.getElementById("color-options");
  colorBox.innerHTML = Object.entries(COLOR_HEX).map(([name, hex]) => `
    <span class="color-swatch" data-filter="color" data-value="${name}"
          style="background:${hex}; ${name === "white" ? "border:2px solid #ddd;" : ""}"
          title="${name}"></span>`).join("");

  const sizeBox = document.getElementById("size-options");
  sizeBox.innerHTML = SIZES.map(s => `
    <span class="size-chip" data-filter="size" data-value="${s}">${s}</span>`).join("");

  const styleBox = document.getElementById("style-options");
  styleBox.innerHTML = STYLES.map(s => `
    <label>
      <input type="checkbox" data-filter="style" value="${s}">
      ${s}
    </label>`).join("");
}

function wireFilterEvents() {
  // Category / style checkboxes
  document.querySelectorAll('input[data-filter="category"]').forEach(cb => {
    cb.addEventListener("change", () => {
      cb.checked ? state.categories.add(cb.value) : state.categories.delete(cb.value);
      state.page = 1;
      applyFilters();
    });
  });
  document.querySelectorAll('input[data-filter="style"]').forEach(cb => {
    cb.addEventListener("change", () => {
      cb.checked ? state.styles.add(cb.value) : state.styles.delete(cb.value);
      state.page = 1;
      applyFilters();
    });
  });

  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener("click", () => {
      const v = sw.dataset.value;
      if (state.colors.has(v)) {
        state.colors.delete(v);
        sw.classList.remove("selected");
      } else {
        state.colors.add(v);
        sw.classList.add("selected");
      }
      state.page = 1;
      applyFilters();
    });
  });

  // Size chips
  document.querySelectorAll('.size-chip').forEach(chip => {
    chip.addEventListener("click", () => {
      const v = chip.dataset.value;
      if (state.sizes.has(v)) {
        state.sizes.delete(v);
        chip.classList.remove("selected");
      } else {
        state.sizes.add(v);
        chip.classList.add("selected");
      }
      state.page = 1;
      applyFilters();
    });
  });

  // Price slider (two thumbs on one track)
  const minInput = document.getElementById("price-min");
  const maxInput = document.getElementById("price-max");
  const fill = document.getElementById("price-fill");
  const minLabel = document.getElementById("price-min-label");
  const maxLabel = document.getElementById("price-max-label");
  const trackMax = Number(minInput.max);

  function updatePriceUI() {
    let lo = Number(minInput.value);
    let hi = Number(maxInput.value);
    if (lo > hi) { [lo, hi] = [hi, lo]; }
    state.priceMin = lo;
    state.priceMax = hi;
    minLabel.textContent = `$${lo}`;
    maxLabel.textContent = `$${hi}`;
    fill.style.left = `${(lo / trackMax) * 100}%`;
    fill.style.right = `${100 - (hi / trackMax) * 100}%`;
  }
  [minInput, maxInput].forEach(input => {
    input.addEventListener("input", () => {
      updatePriceUI();
      state.page = 1;
      applyFilters();
    });
  });
  updatePriceUI();

  // Sort + search
  document.getElementById("sort-select").addEventListener("change", (e) => {
    state.sort = e.target.value;
    applyFilters();
  });
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.search = e.target.value.trim().toLowerCase();
      state.page = 1;
      applyFilters();
    });
  }

  // Clear all
  document.getElementById("clear-filters").addEventListener("click", resetFilters);

  // Mobile filter drawer
  const panel = document.getElementById("filters-panel");
  const mobileBtn = document.getElementById("mobile-filter-btn");
  if (mobileBtn) {
    mobileBtn.addEventListener("click", () => panel.classList.toggle("open"));
  }
}

function resetFilters() {
  state = { categories: new Set(), colors: new Set(), sizes: new Set(), styles: new Set(),
            priceMin: 0, priceMax: 300, sort: "featured", search: "", page: 1 };
  document.querySelectorAll('input[type="checkbox"][data-filter]').forEach(cb => cb.checked = false);
  document.querySelectorAll('.color-swatch.selected, .size-chip.selected').forEach(el => el.classList.remove("selected"));
  document.getElementById("price-min").value = 0;
  document.getElementById("price-max").value = 300;
  document.getElementById("sort-select").value = "featured";
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";
  document.getElementById("price-min").dispatchEvent(new Event("input"));
  applyFilters();
}

/* ---------------- Active-filter chips ---------------- */

function renderActiveChips() {
  const box = document.getElementById("active-filters");
  const chips = [];
  state.categories.forEach(c => chips.push({ label: c, group: "categories", value: c }));
  state.styles.forEach(s => chips.push({ label: s, group: "styles", value: s }));
  state.colors.forEach(c => chips.push({ label: c, group: "colors", value: c }));
  state.sizes.forEach(s => chips.push({ label: `Size ${s}`, group: "sizes", value: s }));
  if (state.priceMin > 0 || state.priceMax < 300) {
    chips.push({ label: `$${state.priceMin}–$${state.priceMax}`, group: "price" });
  }

  if (!chips.length) { box.innerHTML = ""; return; }

  box.innerHTML = chips.map(c => `
    <span class="chip" data-group="${c.group}" data-value="${c.value || ""}">
      ${c.label} <button aria-label="Remove filter">✕</button>
    </span>`).join("");

  box.querySelectorAll(".chip button").forEach(btn => {
    btn.addEventListener("click", () => {
      const chip = btn.closest(".chip");
      const group = chip.dataset.group;
      const value = chip.dataset.value;
      if (group === "price") {
        document.getElementById("price-min").value = 0;
        document.getElementById("price-max").value = 300;
        document.getElementById("price-min").dispatchEvent(new Event("input"));
      } else {
        state[group].delete(value);
        // Uncheck matching control
        document.querySelectorAll(`[data-value="${value}"], input[value="${value}"]`).forEach(el => {
          if (el.type === "checkbox") el.checked = false;
          el.classList && el.classList.remove("selected");
        });
      }
      state.page = 1;
      applyFilters();
    });
  });
}

/* ---------------- Core filter + sort + paginate ---------------- */

function getFilteredProducts() {
  let list = ALL_PRODUCTS.filter(p => {
    if (state.categories.size && !state.categories.has(p.category)) return false;
    if (state.styles.size && !state.styles.has(p.style)) return false;
    if (state.colors.size && !p.colors.some(c => state.colors.has(c))) return false;
    if (state.sizes.size && !p.sizes.some(s => state.sizes.has(s))) return false;
    if (p.price < state.priceMin || p.price > state.priceMax) return false;
    if (state.search && !p.name.toLowerCase().includes(state.search)) return false;
    return true;
  });

  switch (state.sort) {
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "rating-desc": list.sort((a, b) => b.rating - a.rating); break;
    case "newest": list.sort((a, b) => b.id - a.id); break;
    default: break; // featured = catalog order
  }
  return list;
}

function applyFilters() {
  const filtered = getFilteredProducts();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  document.getElementById("result-count").textContent =
    `${filtered.length} product${filtered.length === 1 ? "" : "s"} found`;

  renderProducts(document.getElementById("shop-grid"), pageItems);
  renderActiveChips();
  renderPagination(totalPages);

  const resetBtn = document.getElementById("empty-reset");
  if (resetBtn) resetBtn.addEventListener("click", resetFilters);
}

function renderPagination(totalPages) {
  const box = document.getElementById("pagination");
  if (totalPages <= 1) { box.innerHTML = ""; return; }
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === state.page ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  box.innerHTML = html;
  box.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      state.page = Number(btn.dataset.page);
      applyFilters();
      window.scrollTo({ top: document.querySelector(".shop-main-head").offsetTop - 100, behavior: "smooth" });
    });
  });
}



/* ---------------- URL param handoff (from homepage "Browse by dress style") ---------------- */

function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const style = params.get("style");
  

  if (style && STYLES.includes(style)) {
    state.styles.add(style);
    const cb = document.querySelector(`input[data-filter="style"][value="${style}"]`);
    if (cb) cb.checked = true;
  }
  applyFilters();
}

/* ---------------- Init ---------------- */

(async function initShopPage() {
  try {
    ALL_PRODUCTS = await loadProducts();
    renderFilterOptions();
    wireFilterEvents();
    applyUrlParams();
  } catch (err) {
    console.error(err);
    document.getElementById("shop-grid").innerHTML =
      `<p style="grid-column:1/-1; text-align:center; color:var(--gray-500);">Couldn't load products. Make sure products.json is served alongside this page.</p>`;
  }
})();
