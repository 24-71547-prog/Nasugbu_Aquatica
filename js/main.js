// Core UI logic for navigation, mock data rendering, filters, forms, and dashboard charts.
// Shared mock datasets for all business modules.
const appData = {
  inventory: [
    { name: "Tilapia", category: "Live Fish", qty: 8, unit: "kg", updated: "08:30 AM" },
    { name: "Bangus", category: "Live Fish", qty: 25, unit: "kg", updated: "08:10 AM" },
    { name: "Milkfish Fingerlings", category: "Fingerlings", qty: 140, unit: "pcs", updated: "08:12 AM" },
    { name: "Ornamental Fish", category: "Live Fish", qty: 0, unit: "pcs", updated: "07:58 AM" },
    { name: "Fish Feed", category: "Supplies", qty: 12, unit: "bags", updated: "08:40 AM" },
    { name: "Medicines", category: "Supplies", qty: 5, unit: "kits", updated: "08:16 AM" },
    { name: "Aquarium Accessories", category: "Accessories", qty: 17, unit: "pcs", updated: "07:49 AM" }
  ],
  purchases: [
    { supplier: "BlueWave Supplier", item: "Fish Feed", qty: 10, cost: 1200, date: "2026-10-05", status: "Delivered" },
    { supplier: "AquaMed", item: "Medicines", qty: 3, cost: 2500, date: "2026-10-04", status: "Pending" },
    { supplier: "Fingerling Farm Co.", item: "Milkfish Fingerlings", qty: 200, cost: 18, date: "2026-10-03", status: "Delivered" }
  ],
  sales: [
    { customer: "Restaurant A", product: "Tilapia", qty: 12, price: 190, date: "2026-10-05", payment: "Paid" },
    { customer: "Retail Buyer", product: "Bangus", qty: 6, price: 210, date: "2026-10-05", payment: "Pending" },
    { customer: "Pet Shop", product: "Ornamental Fish", qty: 8, price: 130, date: "2026-10-04", payment: "Paid" }
  ],
  packages: [
    { name: "Starter Aquaculture Package", products: "10 Fingerlings, 1 Bag Feed, Basic Medicine Kit", original: 2500, discount: 10, stock: 15, active: true },
    { name: "Grow-Out Package", products: "25 Fingerlings, 2 Bags Feed", original: 4500, discount: 12, stock: 9, active: true },
    { name: "Pond Health Kit", products: "Water Conditioner, Medicine Kit", original: 1800, discount: 8, stock: 0, active: false }
  ],
  stockAlerts: [
    { item: "Tilapia", note: "Only 8 available", severity: "Low Stock" },
    { item: "Ornamental Fish", note: "Out of stock", severity: "Critical" },
    { item: "Medicines", note: "Only 5 kits left", severity: "Low Stock" }
  ]
};

const statusBadge = (status) => {
  const map = {
    "In Stock": "status-available",
    "Low Stock": "status-low-stock",
    "Out of Stock": "status-critical",
    "Delivered": "status-normal",
    "Pending": "status-warning",
    "Paid": "status-normal",
    "Unpaid": "status-critical",
    "Active": "status-normal",
    "Inactive": "status-warning",
    "Low Stock": "status-low-stock",
    "Critical": "status-critical"
  };
  return `<span class="badge badge-soft ${map[status] || "status-available"}">${status}</span>`;
};

function setActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === page) link.classList.add("active");
  });
}

function setupSidebarToggle() {
  const sidebar = document.getElementById("appSidebar");
  const openBtn = document.getElementById("sidebarToggle");
  const closeBtn = document.getElementById("sidebarClose");
  if (!sidebar || !openBtn) return;
  openBtn.addEventListener("click", () => sidebar.classList.add("show"));
  closeBtn?.addEventListener("click", () => sidebar.classList.remove("show"));
  document.addEventListener("click", (e) => {
    if (window.innerWidth >= 992) return;
    if (!sidebar.contains(e.target) && !openBtn.contains(e.target)) sidebar.classList.remove("show");
  });
}

function setupNotificationBadge() {
  const count = appData.stockAlerts.length;
  document.querySelectorAll(".stock-alert-count").forEach((n) => (n.textContent = count));
}

function renderInventoryTable() {
  const tbody = document.getElementById("inventoryRows");
  if (!tbody) return;
  const search = document.getElementById("inventorySearch")?.value?.toLowerCase() || "";
  const catFilter = document.getElementById("inventoryCategory")?.value || "all";
  const statusFilter = document.getElementById("inventoryStatus")?.value || "all";

  const rows = appData.inventory.filter((item) => {
    const status = item.qty === 0 ? "Out of Stock" : item.qty <= 10 ? "Low Stock" : "In Stock";
    return (
      (item.name.toLowerCase().includes(search) || item.category.toLowerCase().includes(search)) &&
      (catFilter === "all" || item.category === catFilter) &&
      (statusFilter === "all" || statusFilter === status)
    );
  });

  tbody.innerHTML = rows
    .map((item) => {
      const status = item.qty === 0 ? "Out of Stock" : item.qty <= 10 ? "Low Stock" : "In Stock";
      return `<tr>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.qty}</td>
        <td>${item.unit}</td>
        <td>${statusBadge(status)}</td>
        <td>${item.updated}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary">Edit</button>
          <button class="btn btn-sm btn-outline-secondary">View Details</button>
        </td>
      </tr>`;
    })
    .join("");
}

function renderPurchasesTable() {
  const tbody = document.getElementById("purchaseRows");
  if (!tbody) return;
  const q = document.getElementById("purchaseSearch")?.value?.toLowerCase() || "";
  const filtered = appData.purchases.filter((row) => `${row.supplier} ${row.item}`.toLowerCase().includes(q));

  tbody.innerHTML = filtered
    .map((row) => `<tr>
      <td>${row.supplier}</td>
      <td>${row.item}</td>
      <td>${row.qty}</td>
      <td>₱${Number(row.cost).toLocaleString()}</td>
      <td>₱${(row.qty * row.cost).toLocaleString()}</td>
      <td>${row.date}</td>
      <td>${statusBadge(row.status)}</td>
    </tr>`)
    .join("");
}

function renderSalesTable() {
  const tbody = document.getElementById("salesRows");
  if (!tbody) return;
  const q = document.getElementById("salesSearch")?.value?.toLowerCase() || "";
  const filtered = appData.sales.filter((row) => `${row.customer} ${row.product}`.toLowerCase().includes(q));

  tbody.innerHTML = filtered
    .map((row) => `<tr>
      <td>${row.customer}</td>
      <td>${row.product}</td>
      <td>${row.qty}</td>
      <td>₱${Number(row.price).toLocaleString()}</td>
      <td>₱${(row.qty * row.price).toLocaleString()}</td>
      <td>${row.date}</td>
      <td>${statusBadge(row.payment)}</td>
    </tr>`)
    .join("");
}

function setupCalcForm(formId, qtyId, amountId, totalId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const qty = document.getElementById(qtyId);
  const amount = document.getElementById(amountId);
  const total = document.getElementById(totalId);

  const recalc = () => {
    const val = (Number(qty.value || 0) * Number(amount.value || 0)).toFixed(2);
    total.value = val;
  };

  qty.addEventListener("input", recalc);
  amount.addEventListener("input", recalc);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Mock entry saved.");
    form.reset();
    recalc();
  });
}

function renderPackages() {
  const tbody = document.getElementById("packageRows");
  if (!tbody) return;
  tbody.innerHTML = appData.packages
    .map((p, i) => {
      const final = p.original * ((100 - p.discount) / 100);
      return `<tr>
        <td>${p.name}</td>
        <td>${p.products}</td>
        <td>₱${p.original.toLocaleString()}</td>
        <td>${p.discount}%</td>
        <td>₱${final.toLocaleString()}</td>
        <td><span id="pkg-stock-${i}">${p.stock}</span></td>
        <td>${statusBadge(p.active ? "Active" : "Inactive")}</td>
        <td>
          <button class="btn btn-sm btn-outline-success" onclick="simulatePackageSale(${i})">Simulate Sale</button>
          <button class="btn btn-sm btn-outline-primary">Edit</button>
          <button class="btn btn-sm btn-outline-danger">Delete</button>
        </td>
      </tr>`;
    })
    .join("");
}

// Simulates package sale and shows inventory deduction behavior in UI.
function simulatePackageSale(index) {
  const pkg = appData.packages[index];
  if (pkg.stock <= 0) return alert("Package is out of stock.");
  pkg.stock -= 1;
  document.getElementById(`pkg-stock-${index}`).textContent = pkg.stock;
  const msg = document.getElementById("packageDeductNote");
  if (msg) msg.textContent = `${pkg.name} sold: included item stocks would be deducted automatically in the live system.`;
}
window.simulatePackageSale = simulatePackageSale;

function renderStockAlerts() {
  const list = document.getElementById("stockAlertsList");
  if (!list) return;
  list.innerHTML = appData.stockAlerts
    .map((a) => `<div class="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div>
        <div class="fw-semibold">${a.item}</div>
        <small class="text-secondary">${a.note}</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        ${statusBadge(a.severity)}
        <button class="btn btn-sm btn-outline-primary">Restock</button>
        <button class="btn btn-sm btn-outline-secondary">Notify Customer</button>
        <button class="btn btn-sm btn-outline-dark">View Item</button>
      </div>
    </div>`)
    .join("");
}

function initCharts() {
  if (typeof Chart === "undefined") return;

  const salesCtx = document.getElementById("salesChart");
  if (salesCtx) {
    new Chart(salesCtx, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          { label: "Daily Sales (₱)", data: [7400, 9200, 8100, 10400, 9900, 11300, 9800], backgroundColor: "#0891b2" }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  const inventoryCtx = document.getElementById("inventoryChart");
  if (inventoryCtx) {
    new Chart(inventoryCtx, {
      type: "line",
      data: {
        labels: ["W1", "W2", "W3", "W4"],
        datasets: [
          { label: "Low Stock Trend", data: [6, 4, 7, 3], borderColor: "#f97316", backgroundColor: "rgba(249,115,22,.15)", fill: true }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

function bindFilters() {
  ["inventorySearch", "inventoryCategory", "inventoryStatus"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", renderInventoryTable);
    if (el) el.addEventListener("change", renderInventoryTable);
  });
  document.getElementById("purchaseSearch")?.addEventListener("input", renderPurchasesTable);
  document.getElementById("salesSearch")?.addEventListener("input", renderSalesTable);
}

function bindMockButtons() {
  document.querySelectorAll("[data-mock-action]").forEach((btn) => {
    btn.addEventListener("click", () => alert(`${btn.dataset.mockAction} (mock action)`));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  setupSidebarToggle();
  setupNotificationBadge();
  renderInventoryTable();
  renderPurchasesTable();
  renderSalesTable();
  renderPackages();
  renderStockAlerts();
  bindFilters();
  bindMockButtons();
  setupCalcForm("purchaseForm", "purchaseQty", "purchaseUnitCost", "purchaseTotal");
  setupCalcForm("salesForm", "saleQty", "salePrice", "saleTotal");
  initCharts();
});
