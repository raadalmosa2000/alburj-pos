document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =========================================================
     إكسبريس البرج
     نظام مبيعات + مخزون + زبائن + ديون
     جميع البيانات تحفظ داخل المتصفح LocalStorage
  ========================================================= */

  const APP_NAME = "إكسبريس البرج";
  const CURRENCY = "ل.س";

  const KEYS = {
    products: "alburj_products_v4",
    sales: "alburj_sales_v4",
    customers: "alburj_customers_v4",
    debts: "alburj_debts_v4",
    dailyReset: "alburj_daily_reset_v4"
  };

  let cart = [];
  let currentCustomerId = null;

  const defaultProducts = [
    {
      id: 1,
      name: "عصير برتقال",
      price: 5000,
      cost: 3500,
      stock: 20,
      minStock: 5
    },
    {
      id: 2,
      name: "مياه معدنية",
      price: 2000,
      cost: 1200,
      stock: 50,
      minStock: 10
    },
    {
      id: 3,
      name: "بيبسي",
      price: 4000,
      cost: 2500,
      stock: 30,
      minStock: 5
    },
    {
      id: 4,
      name: "شيبس",
      price: 3500,
      cost: 2200,
      stock: 25,
      minStock: 5
    },
    {
      id: 5,
      name: "بسكويت",
      price: 3000,
      cost: 1800,
      stock: 25,
      minStock: 5
    },
    {
      id: 6,
      name: "حليب",
      price: 6000,
      cost: 4000,
      stock: 15,
      minStock: 3
    }
  ];

  /* =========================================================
     أدوات عامة
  ========================================================= */

  const app = document.querySelector(".app");

  if (!app) {
    console.error("لم يتم العثور على العنصر .app");
    return;
  }

  function uid(prefix = "ID") {
    return (
      prefix +
      Date.now() +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      const parsed = JSON.parse(value);

      return parsed;
    } catch (error) {
      console.error("خطأ في قراءة البيانات:", key, error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", key, error);
    }
  }

  function money(value) {
    return (
      Number(value || 0).toLocaleString("ar-SY") +
      " " +
      CURRENCY
    );
  }

  function number(value) {
    return Number(value || 0);
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function dateOnly(date) {
    return new Date(date).toLocaleDateString("ar-SY");
  }

  function dateTime(date) {
    return new Date(date).toLocaleString("ar-SY", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function todayKey(date = new Date()) {
    const d = new Date(date);

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function monthKey(date = new Date()) {
    const d = new Date(date);

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0")
    ].join("-");
  }

  function generateInvoice() {
    return (
      "INV-" +
      new Date().getTime() +
      "-" +
      Math.floor(Math.random() * 999)
    );
  }

  /* =========================================================
     البيانات
  ========================================================= */

  function getProducts() {
    const products = read(KEYS.products, null);

    if (!Array.isArray(products)) {
      write(KEYS.products, defaultProducts);
      return [...defaultProducts];
    }

    return products.map(normalizeProduct);
  }

  function saveProducts(products) {
    write(KEYS.products, products);
  }

  function normalizeProduct(product) {
    return {
      id: product.id ?? uid("P-"),
      name: String(product.name || "منتج"),
      price: number(product.price),
      cost: number(product.cost),
      stock: number(product.stock),
      minStock:
        product.minStock === undefined
          ? 5
          : number(product.minStock)
    };
  }

  function getSales() {
    const sales = read(KEYS.sales, []);
    return Array.isArray(sales) ? sales : [];
  }

  function saveSales(sales) {
    write(KEYS.sales, sales);
  }

  function getCustomers() {
    const customers = read(KEYS.customers, []);
    return Array.isArray(customers) ? customers : [];
  }

  function saveCustomers(customers) {
    write(KEYS.customers, customers);
  }

  function getDebts() {
    const debts = read(KEYS.debts, []);
    return Array.isArray(debts) ? debts : [];
  }

  function saveDebts(debts) {
    write(KEYS.debts, debts);
  }

  /* =========================================================
     تصحيح البيانات القديمة
  ========================================================= */

  function migrateOldData() {
    const oldProducts = read("alburj_products", null);

    if (
      oldProducts &&
      Array.isArray(oldProducts) &&
      !localStorage.getItem(KEYS.products)
    ) {
      const products = oldProducts.map((p) =>
        normalizeProduct({
          ...p,
          cost: p.cost || 0,
          stock:
            p.stock === undefined
              ? 0
              : p.stock,
          minStock:
            p.minStock === undefined
              ? 5
              : p.minStock
        })
      );

      saveProducts(products);
    }

    const oldSales = read("alburj_sales", null);

    if (
      oldSales &&
      Array.isArray(oldSales) &&
      !localStorage.getItem(KEYS.sales)
    ) {
      saveSales(oldSales);
    }
  }

  migrateOldData();

  /* =========================================================
     تصفير الحسابات اليومية
     مهم: لا نحذف المبيعات القديمة.
     فقط نحدد بداية يوم جديد.
  ========================================================= */

  function checkDailyReset() {
    const current = todayKey();
    const saved = localStorage.getItem(KEYS.dailyReset);

    if (!saved) {
      localStorage.setItem(KEYS.dailyReset, current);
      return;
    }

    if (saved !== current) {
      localStorage.setItem(KEYS.dailyReset, current);
    }
  }

  checkDailyReset();

  function resetDailyAccounts() {
    const answer = confirm(
      "هل تريد تصفير الحسابات اليومية؟\n\n" +
      "سيتم بدء يوم جديد للحسابات اليومية، " +
      "لكن لن يتم حذف سجل المبيعات أو الفواتير أو الديون."
    );

    if (!answer) {
      return;
    }

    localStorage.setItem(
      KEYS.dailyReset,
      todayKey()
    );

    alert(
      "تم تصفير الحسابات اليومية بنجاح.\n" +
      "السجل القديم محفوظ."
    );

    showDashboard();
  }

  /* =========================================================
     إحصائيات
  ========================================================= */

  function getTodaySales() {
    const today = todayKey();

    return getSales().filter(
      (sale) =>
        todayKey(sale.createdAt) === today
    );
  }

  function getTodayTotal() {
    return getTodaySales().reduce(
      (sum, sale) =>
        sum + number(sale.total),
      0
    );
  }

  function getTodayProfit() {
    return getTodaySales().reduce(
      (sum, sale) =>
        sum + number(sale.profit),
      0
    );
  }

  function getStockCount() {
    return getProducts().reduce(
      (sum, product) =>
        sum + number(product.stock),
      0
    );
  }

  function getTotalDebt() {
    return getDebts().reduce(
      (sum, debt) =>
        sum + number(debt.remaining),
      0
    );
  }

  /* =========================================================
     التنقل السفلي
  ========================================================= */

  function bottomNav(active = "home") {
    return `
      <nav class="bottom-nav">

        <button
          class="nav-item ${active === "home" ? "active" : ""}"
          data-nav="home"
        >
          <span>⌂</span>
          <small>الرئيسية</small>
        </button>

        <button
          class="nav-item ${active === "sales" ? "active" : ""}"
          data-nav="sales"
        >
          <span>▣</span>
          <small>المبيعات</small>
        </button>

        <button
          class="nav-item main-sale ${active === "sale" ? "active" : ""}"
          data-nav="sale"
        >
          <span>＋</span>
          <small>بيع</small>
        </button>

        <button
          class="nav-item ${active === "products" ? "active" : ""}"
          data-nav="products"
        >
          <span>□</span>
          <small>المخزون</small>
        </button>

        <button
          class="nav-item ${active === "more" ? "active" : ""}"
          data-nav="more"
        >
          <span>☰</span>
          <small>المزيد</small>
        </button>

      </nav>
    `;
  }

  function setupNav() {
    document
      .querySelectorAll("[data-nav]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const nav = button.dataset.nav;

          if (nav === "home") {
            showDashboard();
          }

          if (nav === "sales") {
            showSalesHistory();
          }

          if (nav === "sale") {
            showSalesScreen();
          }

          if (nav === "products") {
            showInventory();
          }

          if (nav === "more") {
            showMore();
          }
        });
      });
  }

  /* =========================================================
     الهيدر
  ========================================================= */

  function pageHeader(title, subtitle = "") {
    return `
      <header class="page-header">

        <div>
          <span class="kicker">${APP_NAME}</span>
          <h1>${escapeHTML(title)}</h1>

          ${
            subtitle
              ? `<p>${escapeHTML(subtitle)}</p>`
              : ""
          }
        </div>

        <div class="brand-mark">
          EB
        </div>

      </header>
    `;
  }

  /* =========================================================
     لوحة التحكم
  ========================================================= */

  function showDashboard() {
    checkDailyReset();

    const todaySales = getTodaySales();
    const todayTotal = getTodayTotal();
    const todayProfit = getTodayProfit();
    const products = getProducts();
    const customers = getCustomers();
    const totalDebt = getTotalDebt();

    const recentSales = getSales()
      .slice()
      .reverse()
      .slice(0, 6);

    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          "لوحة التحكم",
          "إدارة المبيعات والمخزون والزبائن من مكان واحد"
        )}

        <section class="hero">

          <div class="hero-content">
            <span class="hero-label">
              أهلاً بك في
            </span>

            <h2>
              إكسبريس البرج
            </h2>

            <p>
              نظامك اليومي لإدارة البيع والمخزون والديون.
            </p>

            <div class="hero-actions">

              <button
                class="primary-button"
                id="dashboardSale"
              >
                ＋ بيع جديد
              </button>

              <button
                class="secondary-button"
                id="dashboardInventory"
              >
                📦 المخزون
              </button>

            </div>
          </div>

          <div class="coffee-space">
            <div class="coffee-placeholder">
              ☕
              <small>مساحة صورة القهوة</small>
            </div>
          </div>

        </section>

        <section class="stats">

          <div class="stat">
            <span>مبيعات اليوم</span>
            <strong>${money(todayTotal)}</strong>
            <small>${todaySales.length} فاتورة</small>
          </div>

          <div class="stat">
            <span>أرباح اليوم</span>
            <strong>${money(todayProfit)}</strong>
            <small>تقديري</small>
          </div>

          <div class="stat">
            <span>المخزون</span>
            <strong>${products.length}</strong>
            <small>${getStockCount()} قطعة</small>
          </div>

          <div class="stat">
            <span>ديون الزبائن</span>
            <strong>${money(totalDebt)}</strong>
            <small>${customers.length} زبون</small>
          </div>

        </section>

        <section class="section">

          <div class="section-heading">
            <h3>اختصارات العمل</h3>
            <span>الوصول السريع</span>
          </div>

          <div class="quickgrid">

            <button class="quick-card" id="newSaleButton">
              <span class="quick-icon">＋</span>
              <strong>بيع جديد</strong>
              <small>إنشاء فاتورة</small>
            </button>

            <button class="quick-card" id="newProductButton">
              <span class="quick-icon">📦</span>
              <strong>منتج جديد</strong>
              <small>إضافة للمخزون</small>
            </button>

            <button class="quick-card" id="customersButton">
              <span class="quick-icon">👤</span>
              <strong>الزبائن</strong>
              <small>الحسابات والمشتريات</small>
            </button>

            <button class="quick-card" id="debtsButton">
              <span class="quick-icon">💳</span>
              <strong>ديون الزبائن</strong>
              <small>المبالغ المستحقة</small>
            </button>

            <button class="quick-card" id="inventoryButton">
              <span class="quick-icon">▥</span>
              <strong>المخزون</strong>
              <small>تعديل وحذف وجرد</small>
            </button>

            <button class="quick-card" id="resetDailyButton">
              <span class="quick-icon">↻</span>
              <strong>تصفير اليوم</strong>
              <small>بدء حساب يوم جديد</small>
            </button>

          </div>

        </section>

        <section class="section">

          <div class="section-heading">
            <h3>آخر المبيعات</h3>

            <button id="viewAllSales">
              عرض الكل
            </button>
          </div>

          <div class="activity-list">

            ${
              recentSales.length
                ? recentSales
                    .map(saleCard)
                    .join("")
                : `
                  <div class="empty-state">
                    <span>🧾</span>
                    <strong>لا توجد مبيعات بعد</strong>
                    <small>
                      عند إنشاء أول فاتورة ستظهر هنا.
                    </small>
                  </div>
                `
            }

          </div>

        </section>

      </div>

      ${bottomNav("home")}
    `;

    document
      .getElementById("dashboardSale")
      ?.addEventListener(
        "click",
        showSalesScreen
      );

    document
      .getElementById("dashboardInventory")
      ?.addEventListener(
        "click",
        showInventory
      );

    document
      .getElementById("newSaleButton")
      ?.addEventListener(
        "click",
        showSalesScreen
      );

    document
      .getElementById("newProductButton")
      ?.addEventListener(
        "click",
        () => showProductForm()
      );

    document
      .getElementById("customersButton")
      ?.addEventListener(
        "click",
        showCustomers
      );

    document
      .getElementById("debtsButton")
      ?.addEventListener(
        "click",
        showDebts
      );

    document
      .getElementById("inventoryButton")
      ?.addEventListener(
        "click",
        showInventory
      );

    document
      .getElementById("resetDailyButton")
      ?.addEventListener(
        "click",
        resetDailyAccounts
      );

    document
      .getElementById("viewAllSales")
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    setupNav();
  }

  /* =========================================================
     بطاقة البيع
  ========================================================= */

  function saleCard(sale) {
    const customer = sale.customerName
      ? sale.customerName
      : "زبون نقدي";

    return `
      <button
        class="sale-card"
        data-invoice="${escapeHTML(
          sale.invoiceNumber
        )}"
        style="width:100%;"
      >

        <div>
          <strong>
            ${escapeHTML(sale.invoiceNumber)}
          </strong>

          <small>
            ${dateTime(sale.createdAt)}
          </small>

          <small>
            ${escapeHTML(customer)}
            ·
            ${escapeHTML(
              sale.paymentMethod || "نقدي"
            )}
          </small>
        </div>

        <div class="sale-total">
          ${money(sale.total)}
        </div>

      </button>
    `;
  }

  /* =========================================================
     البيع
  ========================================================= */

  function showSalesScreen() {
    cart = [];
    currentCustomerId = null;

    const products = getProducts();
    const customers = getCustomers();

    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          "بيع جديد",
          "اختر المنتجات ثم أكمل الفاتورة"
        )}

        <section class="form-card">

          <input
            id="productSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن منتج..."
          >

        </section>

        <section class="section">

          <div class="section-heading">
            <h3>المنتجات</h3>
            <span id="productCounter">
              ${products.length} منتج
            </span>
          </div>

          <div
            class="products-grid"
            id="productsGrid"
          >

            ${products
              .map(
                (product) => `
                  <button
                    class="product-button"
                    data-id="${product.id}"
                    data-name="${escapeHTML(
                      product.name
                    )}"
                  >

                    <strong>
                      ${escapeHTML(
                        product.name
                      )}
                    </strong>

                    <small>
                      ${money(product.price)}
                    </small>

                    <small>
                      المخزون:
                      ${product.stock}
                    </small>

                  </button>
                `
              )
              .join("")}

          </div>

        </section>

        <section class="section cart">

          <div class="section-heading">
            <h3>السلة</h3>
            <span id="cartCount">0 منتج</span>
          </div>

          <div
            class="form-card"
            id="cartContainer"
          ></div>

          <div
            class="form-card"
            style="margin-top:15px;"
          >

            <label>الزبون</label>

            <select
              id="saleCustomer"
              class="search-input"
            >

              <option value="">
                زبون نقدي / بدون حساب
              </option>

              ${customers
                .map(
                  (customer) => `
                    <option value="${customer.id}">
                      ${escapeHTML(
                        customer.name
                      )}
                    </option>
                  `
                )
                .join("")}

            </select>

            <input
              id="customerNameInput"
              class="search-input"
              type="text"
              placeholder="أو اكتب اسم الزبون..."
              style="margin-top:10px;"
            >

          </div>

          <div
            class="total-box"
            style="margin-top:15px;"
          >

            <span>الإجمالي</span>

            <strong id="totalElement">
              0 ${CURRENCY}
            </strong>

          </div>

          <div
            style="
              display:grid;
              gap:10px;
              margin-top:15px;
            "
          >

            <button
              class="primary-button"
              id="completeSale"
            >
              ✓ إتمام البيع
            </button>

            <button
              class="secondary-button"
              id="clearCart"
            >
              مسح السلة
            </button>

          </div>

        </section>

      </div>

      ${bottomNav("sale")}
    `;

    document
      .getElementById("productSearch")
      ?.addEventListener(
        "input",
        filterSaleProducts
      );

    document
      .querySelectorAll(".product-button")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const id = Number(button.dataset.id);

          const product = getProducts().find(
            (item) =>
              Number(item.id) === id
          );

          if (product) {
            addToCart(product);
          }
        });
      });

    document
      .getElementById("completeSale")
      ?.addEventListener(
        "click",
        completeSale
      );

    document
      .getElementById("clearCart")
      ?.addEventListener(
        "click",
        () => {
          cart = [];
          renderCart();
        }
      );

    setupNav();
    renderCart();
  }

  function filterSaleProducts(event) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    let visible = 0;

    document
      .querySelectorAll(".product-button")
      .forEach((button) => {
        const name =
          button.dataset.name.toLowerCase();

        const show =
          name.includes(search);

        button.style.display =
          show ? "" : "none";

        if (show) {
          visible++;
        }
      });

    const counter =
      document.getElementById(
        "productCounter"
      );

    if (counter) {
      counter.textContent =
        visible + " منتج";
    }
  }

  function addToCart(product) {
    if (number(product.stock) <= 0) {
      alert("هذا المنتج غير متوفر في المخزون.");
      return;
    }

    const existing = cart.find(
      (item) =>
        Number(item.id) ===
        Number(product.id)
    );

    if (existing) {
      if (
        existing.qty >=
        number(product.stock)
      ) {
        alert(
          "لا يمكن تجاوز كمية المخزون المتوفرة."
        );
        return;
      }

      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: number(product.price),
        cost: number(product.cost),
        qty: 1
      });
    }

    renderCart();
  }

  function renderCart() {
    const container =
      document.getElementById(
        "cartContainer"
      );

    const totalElement =
      document.getElementById(
        "totalElement"
      );

    const countElement =
      document.getElementById(
        "cartCount"
      );

    if (!container) return;

    const total = cart.reduce(
      (sum, item) =>
        sum +
        number(item.price) *
          number(item.qty),
      0
    );

    const count = cart.reduce(
      (sum, item) =>
        sum + number(item.qty),
      0
    );

    if (countElement) {
      countElement.textContent =
        count + " منتج";
    }

    if (totalElement) {
      totalElement.textContent =
        money(total);
    }

    if (!cart.length) {
      container.innerHTML = `
        <div class="empty-state">
          <span>🛒</span>
          <strong>السلة فارغة</strong>
          <small>
            اختر منتجًا لإضافته إلى الفاتورة.
          </small>
        </div>
      `;

      return;
    }

    container.innerHTML = cart
      .map(
        (item, index) => `
          <div class="cart-item">

            <div>
              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <small>
                ${money(item.price)}
              </small>
            </div>

            <div
              style="
                display:flex;
                align-items:center;
                gap:5px;
              "
            >

              <button
                class="secondary-button"
                data-cart-action="increase"
                data-index="${index}"
              >
                +
              </button>

              <strong>
                ${item.qty}
              </strong>

              <button
                class="secondary-button"
                data-cart-action="decrease"
                data-index="${index}"
              >
                −
              </button>

              <button
                class="danger-button"
                data-cart-action="remove"
                data-index="${index}"
              >
                ×
              </button>

            </div>

          </div>
        `
      )
      .join("");

    container
      .querySelectorAll("[data-cart-action]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const index =
            Number(button.dataset.index);

          const action =
            button.dataset.cartAction;

          if (action === "increase") {
            const product =
              getProducts().find(
                (p) =>
                  Number(p.id) ===
                  Number(cart[index].id)
              );

            if (
              product &&
              cart[index].qty <
                number(product.stock)
            ) {
              cart[index].qty++;
            } else {
              alert(
                "لا يمكن تجاوز كمية المخزون."
              );
            }
          }

          if (action === "decrease") {
            cart[index].qty--;

            if (cart[index].qty <= 0) {
              cart.splice(index, 1);
            }
          }

          if (action === "remove") {
            cart.splice(index, 1);
          }

          renderCart();
        });
      });
  }

  /* =========================================================
     إتمام البيع
  ========================================================= */

  function completeSale() {
    if (!cart.length) {
      alert("السلة فارغة.");
      return;
    }

    const customerSelect =
      document.getElementById(
        "saleCustomer"
      );

    const customerInput =
      document.getElementById(
        "customerNameInput"
      );

    let customerId =
      customerSelect?.value || null;

    let customerName =
      customerInput?.value.trim() || "";

    const customers = getCustomers();

    if (customerId) {
      const customer =
        customers.find(
          (c) =>
            String(c.id) ===
            String(customerId)
        );

      if (customer) {
        customerName =
          customer.name;
      }
    }

    if (!customerId && customerName) {
      let existing =
        customers.find(
          (c) =>
            c.name.trim() ===
            customerName
        );

      if (!existing) {
        existing = {
          id: uid("C-"),
          name: customerName,
          phone: "",
          note: "",
          createdAt:
            new Date().toISOString()
        };

        customers.push(existing);
        saveCustomers(customers);
      }

      customerId = existing.id;
      customerName = existing.name;
    }

    const products = getProducts();

    for (const item of cart) {
      const product =
        products.find(
          (p) =>
            Number(p.id) ===
            Number(item.id)
        );

      if (!product) {
        alert(
          "أحد المنتجات لم يعد موجودًا."
        );
        return;
      }

      if (
        number(product.stock) <
        number(item.qty)
      ) {
        alert(
          `المخزون غير كافٍ للمنتج: ${product.name}`
        );
        return;
      }
    }

    const total = cart.reduce(
      (sum, item) =>
        sum +
        number(item.price) *
          number(item.qty),
      0
    );

    const paymentMethod =
      prompt(
        "طريقة الدفع:\n\n" +
        "اكتب: نقدي\n" +
        "أو: بطاقة\n" +
        "أو: دين",
        "نقدي"
      );

    if (paymentMethod === null) {
      return;
    }

    const normalizedPayment =
      paymentMethod.trim();

    let payment = "نقدي";

    if (
      normalizedPayment === "بطاقة"
    ) {
      payment = "بطاقة";
    }

    if (
      normalizedPayment === "دين"
    ) {
      if (!customerId) {
        alert(
          "لا يمكن تسجيل بيع بالدين بدون اسم زبون."
        );
        return;
      }

      payment = "دين";
    }

    const paidInput =
      prompt(
        payment === "دين"
          ? "كم دفع الزبون الآن؟\nاكتب 0 إذا لم يدفع شيئًا."
          : "المبلغ المدفوع:",
        payment === "دين"
          ? "0"
          : String(total)
      );

    if (paidInput === null) {
      return;
    }

    let paid = number(
      paidInput.replaceAll(",", "")
    );

    if (paid < 0) {
      paid = 0;
    }

    if (paid > total) {
      paid = total;
    }

    if (
      payment !== "دين" &&
      paid < total
    ) {
      alert(
        "إذا كان هناك مبلغ متبقٍ، اختر طريقة الدفع «دين»."
      );
      return;
    }

    const remaining =
      Math.max(
        0,
        total - paid
      );

    const profit = cart.reduce(
      (sum, item) =>
        sum +
        (
          number(item.price) -
          number(item.cost)
        ) *
          number(item.qty),
      0
    );

    const sale = {
      invoiceNumber:
        generateInvoice(),

      createdAt:
        new Date().toISOString(),

      customerId:
        customerId || null,

      customerName:
        customerName || "",

      paymentMethod:
        payment,

      total,
      paid,
      remaining,
      profit,

      items: cart.map(
        (item) => ({
          id: item.id,
          name: item.name,
          qty: number(item.qty),
          price: number(item.price),
          cost: number(item.cost),
          subtotal:
            number(item.price) *
            number(item.qty)
        })
      )
    };

    const sales = getSales();
    sales.push(sale);
    saveSales(sales);

    /* خصم الكمية من المخزون */
    cart.forEach((item) => {
      const product =
        products.find(
          (p) =>
            Number(p.id) ===
            Number(item.id)
        );

      if (product) {
        product.stock =
          Math.max(
            0,
            number(product.stock) -
              number(item.qty)
          );
      }
    });

    saveProducts(products);

    /* إنشاء دين إذا بقي مبلغ */
    if (
      customerId &&
      remaining > 0
    ) {
      const debts = getDebts();

      debts.push({
        id: uid("D-"),
        customerId,
        customerName,
        type: "sale",
        description:
          `دين فاتورة ${sale.invoiceNumber}`,
        productNames:
          cart
            .map(
              (item) =>
                `${item.name} × ${item.qty}`
            )
            .join("، "),
        amount: remaining,
        paid: 0,
        remaining,
        createdAt:
          new Date().toISOString(),
        saleId:
          sale.invoiceNumber
      });

      saveDebts(debts);
    }

    cart = [];

    showInvoice(sale);
  }

  /* =========================================================
     الفاتورة
  ========================================================= */

  function showInvoice(sale) {
    app.innerHTML = `
      <div class="page">

        <div class="invoice">

          <div class="invoice-header">

            <div class="brand-mark">
              EB
            </div>

            <h1>
              ${APP_NAME}
            </h1>

            <strong>
              فاتورة بيع
            </strong>

            <p>
              ${dateTime(sale.createdAt)}
            </p>

          </div>

          <div class="invoice-meta">

            <div>
              <strong>رقم الفاتورة:</strong>
              ${escapeHTML(
                sale.invoiceNumber
              )}
            </div>

            <div>
              <strong>الزبون:</strong>
              ${
                escapeHTML(
                  sale.customerName ||
                    "زبون نقدي"
                )
              }
            </div>

            <div>
              <strong>طريقة الدفع:</strong>
              ${escapeHTML(
                sale.paymentMethod
              )}
            </div>

          </div>

          <table class="invoice-table">

            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>المجموع</th>
              </tr>
            </thead>

            <tbody>

              ${sale.items
                .map(
                  (item) => `
                    <tr>
                      <td>
                        ${escapeHTML(
                          item.name
                        )}
                      </td>

                      <td>
                        ${item.qty}
                      </td>

                      <td>
                        ${money(item.price)}
                      </td>

                      <td>
                        ${money(
                          item.subtotal
                        )}
                      </td>
                    </tr>
                  `
                )
                .join("")}

            </tbody>

          </table>

          <div class="invoice-total">

            <span>الإجمالي</span>

            <h2>
              ${money(sale.total)}
            </h2>

          </div>

          <div
            class="invoice-payment"
            style="margin-top:15px;"
          >

            <p>
              المدفوع:
              <strong>
                ${money(sale.paid)}
              </strong>
            </p>

            ${
              sale.remaining > 0
                ? `
                  <p>
                    المتبقي:
                    <strong>
                      ${money(
                        sale.remaining
                      )}
                    </strong>
                  </p>
                `
                : ""
            }

          </div>

          <div
            class="no-print"
            style="
              display:grid;
              gap:10px;
              margin-top:20px;
            "
          >

            <button
              class="primary-button"
              id="printInvoice"
            >
              🖨️ طباعة الفاتورة
            </button>

            <button
              class="secondary-button"
              id="invoiceNewSale"
            >
              ＋ بيع جديد
            </button>

            <button
              class="secondary-button"
              id="invoiceSales"
            >
              📋 سجل المبيعات
            </button>

            <button
              class="secondary-button"
              id="invoiceHome"
            >
              🏠 لوحة التحكم
            </button>

          </div>

        </div>

      </div>
    `;

    document
      .getElementById("printInvoice")
      ?.addEventListener(
        "click",
        () => window.print()
      );

    document
      .getElementById("invoiceNewSale")
      ?.addEventListener(
        "click",
        showSalesScreen
      );

    document
      .getElementById("invoiceSales")
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    document
      .getElementById("invoiceHome")
      ?.addEventListener(
        "click",
        showDashboard
      );
  }

  /* =========================================================
     سجل المبيعات
  ========================================================= */

  function showSalesHistory() {
    const sales = getSales();

    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          "سجل المبيعات",
          "جميع الفواتير والعمليات السابقة"
        )}

        <section class="form-card">

          <input
            id="salesSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث برقم الفاتورة أو اسم الزبون أو المنتج..."
          >

        </section>

        <section class="stats">

          <div class="stat">
            <span>الفواتير</span>
            <strong>${sales.length}</strong>
          </div>

          <div class="stat">
            <span>الإجمالي</span>
            <strong>
              ${money(
                sales.reduce(
                  (s, x) =>
                    s + number(x.total),
                  0
                )
              )}
            </strong>
          </div>

          <div class="stat">
            <span>ديون الفواتير</span>
            <strong>
              ${money(
                sales.reduce(
                  (s, x) =>
                    s +
                    number(
                      x.remaining
                    ),
                  0
                )
              )}
            </strong>
          </div>

        </section>

        <section class="section">

          <div
            id="salesList"
            class="activity-list"
          >
            ${renderSalesList(sales)}
          </div>

        </section>

      </div>

      ${bottomNav("sales")}
    `;

    document
      .getElementById("salesSearch")
      ?.addEventListener(
        "input",
        (event) => {
          const search =
            event.target.value
              .trim()
              .toLowerCase();

          const filtered =
            getSales().filter(
              (sale) => {
                const text = [
                  sale.invoiceNumber,
                  sale.customerName,
                  sale.paymentMethod,
                  ...sale.items.map(
                    (i) => i.name
                  )
                ]
                  .join(" ")
                  .toLowerCase();

                return text.includes(search);
              }
            );

          const list =
            document.getElementById(
              "salesList"
            );

          if (list) {
            list.innerHTML =
              renderSalesList(
                filtered
              );

            setupInvoiceButtons();
          }
        }
      );

    setupInvoiceButtons();
    setupNav();
  }

  function renderSalesList(sales) {
    if (!sales.length) {
      return `
        <div class="empty-state">
          <span>🧾</span>
          <strong>لا توجد فواتير</strong>
          <small>
            لم يتم العثور على نتائج.
          </small>
        </div>
      `;
    }

    return sales
      .slice()
      .reverse()
      .map(
        (sale) => `
          <button
            class="sale-card"
            data-open-invoice="${escapeHTML(
              sale.invoiceNumber
            )}"
            style="
              width:100%;
              text-align:right;
            "
          >
            <div>
              <strong>
                ${escapeHTML(
                  sale.invoiceNumber
                )}
              </strong>

              <small>
                ${dateTime(
                  sale.createdAt
                )}
              </small>

              <small>
                ${
                  escapeHTML(
                    sale.customerName ||
                      "زبون نقدي"
                  )
                }
                ·
                ${escapeHTML(
                  sale.paymentMethod
                )}
              </small>
            </div>

            <div class="sale-total">
              ${money(sale.total)}
            </div>
          </button>
        `
      )
      .join("");
  }

  function setupInvoiceButtons() {
    document
      .querySelectorAll(
        "[data-open-invoice]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const invoice =
              button.dataset
                .openInvoice;

            const sale =
              getSales().find(
                (item) =>
                  item.invoiceNumber ===
                  invoice
              );

            if (sale) {
              showInvoice(sale);
            }
          }
        );
      });
  }

  /* =========================================================
     المخزون والمنتجات
  ========================================================= */

  function showInventory() {
    const products = getProducts();

    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          "المخزون",
          "إضافة وتعديل وحذف المنتجات وجرد الكميات"
        )}

        <section class="form-card">

          <div
            style="
              display:grid;
              gap:10px;
            "
          >

            <input
              id="inventorySearch"
              class="search-input"
              type="search"
              placeholder="🔎 ابحث عن منتج..."
            >

            <button
              class="primary-button"
              id="addProduct"
            >
              ＋ إضافة منتج
            </button>

          </div>

        </section>

        <section class="stats">

          <div class="stat">
            <span>عدد المنتجات</span>
            <strong>${products.length}</strong>
          </div>

          <div class="stat">
            <span>إجمالي القطع</span>
            <strong>${getStockCount()}</strong>
          </div>

          <div class="stat">
            <span>منخفض المخزون</span>
            <strong>
              ${
                products.filter(
                  (p) =>
                    number(p.stock) <=
                    number(p.minStock)
                ).length
              }
            </strong>
          </div>

        </section>

        <section class="section">

          <div
            id="inventoryList"
            class="activity-list"
          >
            ${renderInventory(products)}
          </div>

        </section>

      </div>

      ${bottomNav("products")}
    `;

    document
      .getElementById("addProduct")
      ?.addEventListener(
        "click",
        () => showProductForm()
      );

    document
      .getElementById("inventorySearch")
      ?.addEventListener(
        "input",
        (event) => {
          const search =
            event.target.value
              .trim()
              .toLowerCase();

          const filtered =
            getProducts().filter(
              (product) =>
                product.name
                  .toLowerCase()
                  .includes(search)
            );

          const list =
            document.getElementById(
              "inventoryList"
            );

          if (list) {
            list.innerHTML =
              renderInventory(
                filtered
              );

            setupInventoryButtons();
          }
        }
      );

    setupInventoryButtons();
    setupNav();
  }

  function renderInventory(products) {
    if (!products.length) {
      return `
        <div class="empty-state">
          <span>📦</span>
          <strong>لا توجد منتجات</strong>
          <small>
            أضف أول منتج إلى المخزون.
          </small>
        </div>
      `;
    }

    return products
      .map(
        (product) => `
          <div
            class="sale-card"
            style="display:flex;"
          >

            <div style="flex:1;">

              <strong>
                ${escapeHTML(
                  product.name
                )}
              </strong>

              <small>
                سعر البيع:
                ${money(product.price)}
              </small>

              <small>
                التكلفة:
                ${money(product.cost)}
              </small>

              <small>
                الكمية:
                ${product.stock}
              </small>

              ${
                number(product.stock) <=
                number(product.minStock)
                  ? `
                    <small
                      style="color:#ffb86b;"
                    >
                      ⚠️ المخزون منخفض
                    </small>
                  `
                  : ""
              }

            </div>

            <div
              style="
                display:flex;
                gap:6px;
                align-items:center;
              "
            >

              <button
                class="secondary-button"
                data-edit-product="${product.id}"
              >
                ✎
              </button>

              <button
                class="danger-button"
                data-delete-product="${product.id}"
              >
                ×
              </button>

            </div>

          </div>
        `
      )
      .join("");
  }

  function setupInventoryButtons() {
    document
      .querySelectorAll(
        "[data-edit-product]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            showProductForm(
              button.dataset.editProduct
            );
          }
        );
      });

    document
      .querySelectorAll(
        "[data-delete-product]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            deleteProduct(
              button.dataset.deleteProduct
            );
          }
        );
      });
  }

  function showProductForm(productId = null) {
    const products = getProducts();

    const product = productId
      ? products.find(
          (p) =>
            String(p.id) ===
            String(productId)
        )
      : null;

    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          product
            ? "تعديل المنتج"
            : "إضافة منتج",
          product
            ? "تعديل بيانات المنتج والمخزون"
            : "إضافة منتج جديد إلى المخزون"
        )}

        <section class="form-card">

          <label>اسم المنتج</label>

          <input
            id="productName"
            class="search-input"
            value="${escapeHTML(
              product?.name || ""
            )}"
            placeholder="مثال: قهوة عربية"
          >

          <label>سعر البيع</label>

          <input
            id="productPrice"
            class="search-input"
            type="number"
            min="0"
            value="${product?.price ?? ""}"
            placeholder="سعر البيع"
          >

          <label>سعر التكلفة</label>

          <input
            id="productCost"
            class="search-input"
            type="number"
            min="0"
            value="${product?.cost ?? ""}"
            placeholder="سعر الشراء"
          >

          <label>الكمية الحالية</label>

          <input
            id="productStock"
            class="search-input"
            type="number"
            min="0"
            value="${product?.stock ?? 0}"
          >

          <label>حد التنبيه</label>

          <input
            id="productMinStock"
            class="search-input"
            type="number"
            min="0"
            value="${product?.minStock ?? 5}"
          >

          <div
            style="
              display:grid;
              gap:10px;
              margin-top:15px;
            "
          >

            <button
              class="primary-button"
              id="saveProduct"
            >
              ✓ حفظ المنتج
            </button>

            <button
              class="secondary-button"
              id="cancelProduct"
            >
              إلغاء
            </button>

          </div>

        </section>

      </div>

      ${bottomNav("products")}
    `;

    document
      .getElementById("saveProduct")
      ?.addEventListener(
        "click",
        () => saveProduct(productId)
      );

    document
      .getElementById("cancelProduct")
      ?.addEventListener(
        "click",
        showInventory
      );

    setupNav();
  }

  function saveProduct(productId) {
    const name =
      document
        .getElementById("productName")
        ?.value.trim();

    const price =
      number(
        document.getElementById(
          "productPrice"
        )?.value
      );

    const cost =
      number(
        document.getElementById(
          "productCost"
        )?.value
      );

    const stock =
      number(
        document.getElementById(
          "productStock"
        )?.value
      );

    const minStock =
      number(
        document.getElementById(
          "productMinStock"
        )?.value
      );

    if (!name) {
      alert("اكتب اسم المنتج.");
      return;
    }

    if (price <= 0) {
      alert("أدخل سعر بيع صحيح.");
      return;
    }

    const products = getProducts();

    if (productId) {
      const index =
        products.findIndex(
          (p) =>
            String(p.id) ===
            String(productId)
        );

      if (index === -1) {
        alert(
          "المنتج غير موجود."
        );
        return;
      }

      products[index] = {
        ...products[index],
        name,
        price,
        cost,
        stock,
        minStock
      };
    } else {
      products.push({
        id: uid("P-"),
        name,
        price,
        cost,
        stock,
        minStock,
        createdAt:
          new Date().toISOString()
      });
    }

    saveProducts(products);

    alert(
      productId
        ? "تم تعديل المنتج."
        : "تمت إضافة المنتج."
    );

    showInventory();
  }

  function deleteProduct(productId) {
    const products = getProducts();

    const product =
      products.find(
        (p) =>
          String(p.id) ===
          String(productId)
      );

    if (!product) return;

    const answer = confirm(
      `هل تريد حذف المنتج «${product.name}»؟\n\n` +
      "لن يتم حذف المنتج من الفواتير القديمة."
    );

    if (!answer) return;

    const filtered =
      products.filter(
        (p) =>
          String(p.id) !==
          String(productId)
      );

    saveProducts(filtered);

    showInventory();
  }

  /* =========================================================
     الزبائن
  ========================================================= */

  function showCustomers() {
    const customers = getCustomers();

    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          "الزبائن",
          "حسابات الزبائن ومشترياتهم وديونهم"
        )}

        <section class="form-card">

          <input
            id="customerSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن زبون..."
          >

          <button
            class="primary-button"
            id="addCustomer"
            style="margin-top:10px;"
          >
            ＋ إضافة زبون
          </button>

        </section>

        <section class="stats">

          <div class="stat">
            <span>عدد الزبائن</span>
            <strong>${customers.length}</strong>
          </div>

          <div class="stat">
            <span>إجمالي الديون</span>
            <strong>${money(getTotalDebt())}</strong>
          </div>

        </section>

        <section class="section">

          <div
            id="customersList"
            class="activity-list"
          >
            ${renderCustomers(
              customers
            )}
          </div>

        </section>

      </div>

      ${bottomNav("more")}
    `;

    document
      .getElementById("addCustomer")
      ?.addEventListener(
        "click",
        () => showCustomerForm()
      );

    document
      .getElementById("customerSearch")
      ?.addEventListener(
        "input",
        (event) => {
          const search =
            event.target.value
              .trim()
              .toLowerCase();

          const filtered =
            getCustomers().filter(
              (customer) =>
                customer.name
                  .toLowerCase()
                  .includes(search)
            );

          const list =
            document.getElementById(
              "customersList"
            );

          if (list) {
            list.innerHTML =
              renderCustomers(
                filtered
              );

            setupCustomerButtons();
          }
        }
      );

    setupCustomerButtons();
    setupNav();
  }

  function renderCustomers(customers) {
    if (!customers.length) {
      return `
        <div class="empty-state">
          <span>👤</span>
          <strong>لا يوجد زبائن</strong>
          <small>
            أضف الزبائن الذين لديهم حسابات أو ديون.
          </small>
        </div>
      `;
    }

    return customers
      .map((customer) => {
        const debt =
          getCustomerDebt(
            customer.id
          );

        const monthly =
          getCustomerMonthlyPurchases(
            customer.id
          );

        return `
          <button
            class="sale-card"
            data-customer="${customer.id}"
            style="
              width:100%;
              text-align:right;
            "
          >

            <div>

              <strong>
                ${escapeHTML(
                  customer.name
                )}
              </strong>

              <small>
                مشتريات هذا الشهر:
                ${money(monthly)}
              </small>

              <small>
                عليه:
                ${money(debt)}
              </small>

            </div>

            <div class="sale-total">
              ${debt > 0 ? "💳" : "✓"}
            </div>

          </button>
        `;
      })
      .join("");
  }

  function setupCustomerButtons() {
    document
      .querySelectorAll(
        "[data-customer]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            showCustomerDetails(
              button.dataset.customer
            );
          }
        );
      });
  }

  function showCustomerForm(customerId = null) {
    const customers = getCustomers();

    const customer = customerId
      ? customers.find(
          (c) =>
            String(c.id) ===
            String(customerId)
        )
      : null;

    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          customer
            ? "تعديل الزبون"
            : "إضافة زبون",
          "بيانات الزبون"
        )}

        <section class="form-card">

          <label>اسم الزبون</label>

          <input
            id="customerName"
            class="search-input"
            value="${escapeHTML(
              customer?.name || ""
            )}"
            placeholder="اسم الزبون"
          >

          <label>رقم الهاتف</label>

          <input
            id="customerPhone"
            class="search-input"
            value="${escapeHTML(
              customer?.phone || ""
            )}"
            placeholder="رقم الهاتف"
          >

          <label>ملاحظات</label>

          <textarea
            id="customerNote"
            class="search-input"
            rows="4"
            placeholder="ملاحظات"
          >${escapeHTML(
            customer?.note || ""
          )}</textarea>

          <div
            style="
              display:grid;
              gap:10px;
              margin-top:15px;
            "
          >

            <button
              class="primary-button"
              id="saveCustomer"
            >
              ✓ حفظ
            </button>

            <button
              class="secondary-button"
              id="cancelCustomer"
            >
              إلغاء
            </button>

          </div>

        </section>

      </div>

      ${bottomNav("more")}
    `;

    document
      .getElementById("saveCustomer")
      ?.addEventListener(
        "click",
        () => saveCustomer(customerId)
      );

    document
      .getElementById("cancelCustomer")
      ?.addEventListener(
        "click",
        showCustomers
      );

    setupNav();
  }

  function saveCustomer(customerId) {
    const name =
      document
        .getElementById(
          "customerName"
        )
        ?.value.trim();

    const phone =
      document
        .getElementById(
          "customerPhone"
        )
        ?.value.trim();

    const note =
      document
        .getElementById(
          "customerNote"
        )
        ?.value.trim();

    if (!name) {
      alert("اكتب اسم الزبون.");
      return;
    }

    const customers = getCustomers();

    if (customerId) {
      const index =
        customers.findIndex(
          (c) =>
            String(c.id) ===
            String(customerId)
        );

      if (index !== -1) {
        customers[index] = {
          ...customers[index],
          name,
          phone,
          note
        };
      }
    } else {
      customers.push({
        id: uid("C-"),
        name,
        phone,
        note,
        createdAt:
          new Date().toISOString()
      });
    }

    saveCustomers(customers);

    showCustomers();
  }

  /* =========================================================
     تفاصيل الزبون
  ========================================================= */

  function getCustomerDebt(customerId) {
    return getDebts()
      .filter(
        (debt) =>
          String(debt.customerId) ===
          String(customerId)
      )
      .reduce(
        (sum, debt) =>
          sum + number(debt.remaining),
        0
      );
  }

  function getCustomerMonthlyPurchases(
    customerId
  ) {
    const month = monthKey();

    return getSales()
      .filter(
        (sale) =>
          String(
            sale.customerId
          ) === String(customerId) &&
          monthKey(sale.createdAt) ===
            month
      )
      .reduce(
        (sum, sale) =>
          sum + number(sale.total),
        0
      );
  }

  function getCustomerPaidThisMonth(
    customerId
  ) {
    const month = monthKey();

    return getSales()
      .filter(
        (sale) =>
          String(
            sale.customerId
          ) === String(customerId) &&
          monthKey(sale.createdAt) ===
            month
      )
      .reduce(
        (sum, sale) =>
          sum + number(sale.paid),
        0
      );
  }

  function showCustomerDetails(customerId) {
    const customer =
      getCustomers().find(
        (c) =>
          String(c.id) ===
          String(customerId)
      );

    if (!customer) {
      showCustomers();
      return;
    }

    const debt =
      getCustomerDebt(
        customerId
      );

    const monthly =
      getCustomerMonthlyPurchases(
        customerId
      );

    const paidMonth =
      getCustomerPaidThisMonth(
        customerId
      );

    const sales =
      getSales()
        .filter(
          (sale) =>
            String(
              sale.customerId
            ) === String(customerId)
        )
        .slice()
        .reverse();

    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          customer.name,
          "ملف الزبون والحساب"
        )}

        <section class="stats">

          <div class="stat">
            <span>عليه الآن</span>
            <strong>${money(debt)}</strong>
          </div>

          <div class="stat">
            <span>مشتريات الشهر</span>
            <strong>${money(monthly)}</strong>
          </div>

          <div class="stat">
            <span>دفع هذا الشهر</span>
            <strong>${money(paidMonth)}</strong>
          </div>

        </section>

        <section class="form-card">

          <strong>
            بيانات الزبون
          </strong>

          <p>
            الهاتف:
            ${escapeHTML(
              customer.phone ||
                "غير مسجل"
            )}
          </p>

          <p>
            ملاحظات:
            ${escapeHTML(
              customer.note ||
                "لا توجد"
            )}
          </p>

          <div
            style="
              display:grid;
              gap:10px;
              margin-top:15px;
            "
          >

            <button
              class="primary-button"
              id="addOldDebt"
            >
              ＋ إضافة دين قديم
            </button>

            <button
              class="secondary-button"
              id="payDebt"
            >
              💰 تسجيل دفعة
            </button>

            <button
              class="secondary-button"
              id="editCustomer"
            >
              ✎ تعديل بيانات الزبون
            </button>

          </div>

        </section>

        <section class="section">

          <div class="section-heading">
            <h3>ديون الزبون</h3>
          </div>

          <div class="activity-list">
            ${renderCustomerDebts(
              customerId
            )}
          </div>

        </section>

        <section class="section">

          <div class="section-heading">
            <h3>مشتريات الزبون</h3>
            <span>${sales.length} فاتورة</span>
          </div>

          <div class="activity-list">

            ${
              sales.length
                ? sales
                    .map(
                      saleCard
                    )
                    .join("")
                : `
                  <div class="empty-state">
                    <span>🧾</span>
                    <strong>
                      لا توجد مشتريات
                    </strong>
                  </div>
                `
            }

          </div>

        </section>

      </div>

      ${bottomNav("more")}
    `;

    document
      .getElementById("addOldDebt")
      ?.addEventListener(
        "click",
        () =>
          showOldDebtForm(
            customerId
          )
      );

    document
      .getElementById("payDebt")
      ?.addEventListener(
        "click",
        () =>
          showDebtPayment(
            customerId
          )
      );

    document
      .getElementById("editCustomer")
      ?.addEventListener(
        "click",
        () =>
          showCustomerForm(
            customerId
          )
      );

    setupInvoiceButtons();
    setupNav();
  }

  function renderCustomerDebts(
    customerId
  ) {
    const debts =
      getDebts().filter(
        (debt) =>
          String(debt.customerId) ===
          String(customerId) &&
          number(debt.remaining) > 0
      );

    if (!debts.length) {
      return `
        <div class="empty-state">
          <span>✓</span>
          <strong>لا يوجد دين مستحق</strong>
          <small>
            حساب الزبون مسدد حاليًا.
          </small>
        </div>
      `;
    }

    return debts
      .map(
        (debt) => `
          <div class="sale-card">

            <div>

              <strong>
                ${escapeHTML(
                  debt.description ||
                    "دين"
                )}
              </strong>

              <small>
                ${escapeHTML(
                  debt.productNames ||
                    ""
                )}
              </small>

              <small>
                ${dateOnly(
                  debt.createdAt
                )}
              </small>

            </div>

            <div class="sale-total">
              ${money(
                debt.remaining
              )}
            </div>

          </div>
        `
      )
      .join("");
  }

  /* =========================================================
     الديون القديمة والجديدة
  ========================================================= */

  function showDebts() {
    const debts =
      getDebts();

    const total =
      getTotalDebt();

    const customers =
      getCustomers();

    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          "ديون الزبائن",
          "الديون القديمة والجديدة والمدفوعات"
        )}

        <section class="stats">

          <div class="stat">
            <span>إجمالي الديون</span>
            <strong>${money(total)}</strong>
          </div>

          <div class="stat">
            <span>الزبائن</span>
            <strong>${customers.length}</strong>
          </div>

          <div class="stat">
            <span>الحسابات المدينة</span>
            <strong>
              ${
                customers.filter(
                  (c) =>
                    getCustomerDebt(
                      c.id
                    ) > 0
                ).length
              }
            </strong>
          </div>

        </section>

        <section class="form-card">

          <input
            id="debtSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث باسم الزبون..."
          >

          <button
            class="primary-button"
            id="newOldDebt"
            style="margin-top:10px;"
          >
            ＋ إضافة دين قديم
          </button>

        </section>

        <section class="section">

          <div
            id="debtsList"
            class="activity-list"
          >
            ${renderDebtsSummary(
              customers
            )}
          </div>

        </section>

      </div>

      ${bottomNav("more")}
    `;

    document
      .getElementById("newOldDebt")
      ?.addEventListener(
        "click",
        () => showOldDebtForm()
      );

    document
      .getElementById("debtSearch")
      ?.addEventListener(
        "input",
        (event) => {
          const search =
            event.target.value
              .trim()
              .toLowerCase();

          const filtered =
            getCustomers().filter(
              (customer) =>
                customer.name
                  .toLowerCase()
                  .includes(search)
            );

          const list =
            document.getElementById(
              "debtsList"
            );

          if (list) {
            list.innerHTML =
              renderDebtsSummary(
                filtered
              );
          }
        }
      );

    setupDebtCustomerButtons();
    setupNav();
  }

  function renderDebtsSummary(
    customers
  ) {
    if (!customers.length) {
      return `
        <div class="empty-state">
          <span>💳</span>
          <strong>لا يوجد زبائن</strong>
        </div>
      `;
    }

    const withDebt =
      customers.filter(
        (customer) =>
          getCustomerDebt(
            customer.id
          ) > 0
      );

    if (!withDebt.length) {
      return `
        <div class="empty-state">
          <span>✓</span>
          <strong>لا توجد ديون حاليًا</strong>
          <small>
            جميع الحسابات مسددة.
          </small>
        </div>
      `;
    }

    return withDebt
      .map(
        (customer) => `
          <button
            class="sale-card"
            data-debt-customer="${customer.id}"
            style="
              width:100%;
              text-align:right;
            "
          >

            <div>
              <strong>
                ${escapeHTML(
                  customer.name
                )}
              </strong>

              <small>
                مشتريات الشهر:
                ${money(
                  getCustomerMonthlyPurchases(
                    customer.id
                  )
                )}
              </small>
            </div>

            <div class="sale-total">
              ${money(
                getCustomerDebt(
                  customer.id
                )
              )}
            </div>

          </button>
        `
      )
      .join("");
  }

  function setupDebtCustomerButtons() {
    document
      .querySelectorAll(
        "[data-debt-customer]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            showCustomerDetails(
              button.dataset
                .debtCustomer
            );
          }
        );
      });
  }

  /* =========================================================
     إضافة دين قديم
  ========================================================= */

  function showOldDebtForm(
    customerId = null
  ) {
    const customers =
      getCustomers();

    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          "إضافة دين قديم",
          "نقل الحسابات القديمة من الدفتر إلى النظام"
        )}

        <section class="form-card">

          <label>الزبون</label>

          <select
            id="oldDebtCustomer"
            class="search-input"
          >

            <option value="">
              اختر الزبون
            </option>

            ${customers
              .map(
                (customer) => `
                  <option
                    value="${customer.id}"
                    ${
                      String(
                        customer.id
                      ) ===
                      String(
                        customerId
                      )
                        ? "selected"
                        : ""
                    }
                  >
                    ${escapeHTML(
                      customer.name
                    )}
                  </option>
                `
              )
              .join("")}

          </select>

          <label>اسم المنتج</label>

          <input
            id="oldDebtProduct"
            class="search-input"
            placeholder="مثال: قهوة، سكر، دخان..."
          >

          <label>وصف الدين</label>

          <input
            id="oldDebtDescription"
            class="search-input"
            placeholder="مثال: دين قديم من الدفتر"
          >

          <label>المبلغ</label>

          <input
            id="oldDebtAmount"
            class="search-input"
            type="number"
            min="0"
            placeholder="المبلغ المستحق"
          >

          <label>ملاحظات</label>

          <textarea
            id="oldDebtNote"
            class="search-input"
            rows="4"
            placeholder="أي تفاصيل إضافية"
          ></textarea>

          <div
            style="
              display:grid;
              gap:10px;
              margin-top:15px;
            "
          >

            <button
              class="primary-button"
              id="saveOldDebt"
            >
              ✓ حفظ الدين
            </button>

            <button
              class="secondary-button"
              id="cancelOldDebt"
            >
              إلغاء
            </button>

          </div>

        </section>

      </div>

      ${bottomNav("more")}
    `;

    document
      .getElementById("saveOldDebt")
      ?.addEventListener(
        "click",
        saveOldDebt
      );

    document
      .getElementById("cancelOldDebt")
      ?.addEventListener(
        "click",
        showDebts
      );

    setupNav();
  }

  function saveOldDebt() {
    const customerId =
      document.getElementById(
        "oldDebtCustomer"
      )?.value;

    const product =
      document.getElementById(
        "oldDebtProduct"
      )?.value.trim();

    const description =
      document.getElementById(
        "oldDebtDescription"
      )?.value.trim();

    const amount =
      number(
        document.getElementById(
          "oldDebtAmount"
        )?.value
      );

    const note =
      document.getElementById(
        "oldDebtNote"
      )?.value.trim();

    if (!customerId) {
      alert("اختر الزبون.");
      return;
    }

    if (amount <= 0) {
      alert("أدخل مبلغ الدين.");
      return;
    }

    const customer =
      getCustomers().find(
        (c) =>
          String(c.id) ===
          String(customerId)
      );

    if (!customer) {
      alert("الزبون غير موجود.");
      return;
    }

    const debts =
      getDebts();

    debts.push({
      id: uid("D-"),
      customerId,
      customerName:
        customer.name,
      type: "old",
      description:
        description ||
        "دين قديم",
      productNames:
        product || "",
      note: note || "",
      amount,
      paid: 0,
      remaining: amount,
      createdAt:
        new Date().toISOString()
    });

    saveDebts(debts);

    alert(
      "تم تسجيل الدين القديم بنجاح."
    );

    showCustomerDetails(
      customerId
    );
  }

  /* =========================================================
     تسجيل دفعة
  ========================================================= */

  function showDebtPayment(
    customerId
  ) {
    const customer =
      getCustomers().find(
        (c) =>
          String(c.id) ===
          String(customerId)
      );

    if (!customer) return;

    const debt =
      getCustomerDebt(
        customerId
      );

    if (debt <= 0) {
      alert(
        "لا يوجد مبلغ مستحق على هذا الزبون."
      );
      return;
    }

    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          "تسجيل دفعة",
          customer.name
        )}

        <section class="form-card">

          <div class="total-box">
            <span>المبلغ المستحق</span>
            <strong>${money(debt)}</strong>
          </div>

          <label style="margin-top:15px;">
            المبلغ المدفوع
          </label>

          <input
            id="debtPaymentAmount"
            class="search-input"
            type="number"
            min="0"
            max="${debt}"
            placeholder="المبلغ"
          >

          <label>ملاحظة</label>

          <textarea
            id="debtPaymentNote"
            class="search-input"
            rows="3"
            placeholder="مثال: دفعة نقدية"
          ></textarea>

          <div
            style="
              display:grid;
              gap:10px;
              margin-top:15px;
            "
          >

            <button
              class="primary-button"
              id="saveDebtPayment"
            >
              ✓ تسجيل الدفعة
            </button>

            <button
              class="secondary-button"
              id="cancelDebtPayment"
            >
              إلغاء
            </button>

          </div>

        </section>

      </div>

      ${bottomNav("more")}
    `;

    document
      .getElementById(
        "saveDebtPayment"
      )
      ?.addEventListener(
        "click",
        () =>
          saveDebtPayment(
            customerId
          )
      );

    document
      .getElementById(
        "cancelDebtPayment"
      )
      ?.addEventListener(
        "click",
        () =>
          showCustomerDetails(
            customerId
          )
      );

    setupNav();
  }

  function saveDebtPayment(
    customerId
  ) {
    const amount =
      number(
        document.getElementById(
          "debtPaymentAmount"
        )?.value
      );

    const note =
      document.getElementById(
        "debtPaymentNote"
      )?.value.trim();

    const totalDebt =
      getCustomerDebt(
        customerId
      );

    if (amount <= 0) {
      alert(
        "أدخل مبلغ الدفعة."
      );
      return;
    }

    if (amount > totalDebt) {
      alert(
        "المبلغ أكبر من الدين المستحق."
      );
      return;
    }

    let remainingPayment =
      amount;

    const debts =
      getDebts();

    const customerDebts =
      debts
        .filter(
          (debt) =>
            String(
              debt.customerId
            ) === String(customerId) &&
            number(
              debt.remaining
            ) > 0
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt)
        );

    for (
      const debt of customerDebts
    ) {
      if (
        remainingPayment <= 0
      ) {
        break;
      }

      const apply =
        Math.min(
          remainingPayment,
          number(
            debt.remaining
          )
        );

      debt.paid =
        number(debt.paid) +
        apply;

      debt.remaining =
        Math.max(
          0,
          number(
            debt.remaining
          ) - apply
        );

      remainingPayment -=
        apply;
    }

    saveDebts(debts);

    const customer =
      getCustomers().find(
        (c) =>
          String(c.id) ===
          String(customerId)
      );

    const paymentHistory =
      read(
        "alburj_debt_payments_v4",
        []
      );

    paymentHistory.push({
      id: uid("DP-"),
      customerId,
      customerName:
        customer?.name || "",
      amount,
      note: note || "",
      createdAt:
        new Date().toISOString()
    });

    write(
      "alburj_debt_payments_v4",
      paymentHistory
    );

    alert(
      "تم تسجيل الدفعة بنجاح."
    );

    showCustomerDetails(
      customerId
    );
  }

  /* =========================================================
     المزيد
  ========================================================= */

  function showMore() {
    app.innerHTML = `
      <div class="page">

        ${pageHeader(
          "المزيد",
          "أدوات إدارة إكسبريس البرج"
        )}

        <section class="quickgrid">

          <button
            class="quick-card"
            id="moreCustomers"
          >
            <span class="quick-icon">👤</span>
            <strong>الزبائن</strong>
            <small>
              ملفات وحسابات الزبائن
            </small>
          </button>

          <button
            class="quick-card"
            id="moreDebts"
          >
            <span class="quick-icon">💳</span>
            <strong>ديون الزبائن</strong>
            <small>
              القديم والجديد والمدفوع
            </small>
          </button>

          <button
            class="quick-card"
            id="moreInventory"
          >
            <span class="quick-icon">📦</span>
            <strong>المخزون</strong>
            <small>
              إدارة المنتجات
            </small>
          </button>

          <button
            class="quick-card"
            id="moreDailyReset"
          >
            <span class="quick-icon">↻</span>
            <strong>تصفير الحسابات اليومية</strong>
            <small>
              بدء يوم جديد
            </small>
          </button>

          <button
            class="quick-card"
            id="moreSales"
          >
            <span class="quick-icon">📋</span>
            <strong>سجل المبيعات</strong>
            <small>
              جميع الفواتير
            </small>
          </button>

        </section>

      </div>

      ${bottomNav("more")}
    `;

    document
      .getElementById("moreCustomers")
      ?.addEventListener(
        "click",
        showCustomers
      );

    document
      .getElementById("moreDebts")
      ?.addEventListener(
        "click",
        showDebts
      );

    document
      .getElementById("moreInventory")
      ?.addEventListener(
        "click",
        showInventory
      );

    document
      .getElementById("moreDailyReset")
      ?.addEventListener(
        "click",
        resetDailyAccounts
      );

    document
      .getElementById("moreSales")
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    setupNav();
  }

  /* =========================================================
     بدء التطبيق
  ========================================================= */

  showDashboard();
});
