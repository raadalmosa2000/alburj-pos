document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =========================================
     إكسبريس البرج
     نظام المبيعات والمخزون والعملاء والديون
  ========================================= */

  const APP_NAME = "إكسبريس البرج";
  const CURRENCY = "ل.س";

  const KEYS = {
    products: "alburj_products_v3",
    sales: "alburj_sales_v3",
    customers: "alburj_customers_v3",
    debts: "alburj_debts_v3",
    payments: "alburj_payments_v3",
    daily: "alburj_daily_v3"
  };

  let cart = [];

  /* =========================================
     أدوات التخزين
  ========================================= */

  function readStorage(key, fallback = []) {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        return fallback;
      }

      const parsed = JSON.parse(value);

      return parsed ?? fallback;
    } catch (error) {
      console.error("Storage error:", key, error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Storage save error:", key, error);
      alert("تعذر حفظ البيانات في المتصفح.");
      return false;
    }
  }

  function getProducts() {
    return readStorage(KEYS.products, [
      {
        id: 1,
        name: "عصير برتقال",
        price: 5000,
        stock: 20,
        minStock: 5
      },
      {
        id: 2,
        name: "مياه معدنية",
        price: 2000,
        stock: 30,
        minStock: 5
      },
      {
        id: 3,
        name: "بيبسي",
        price: 4000,
        stock: 25,
        minStock: 5
      },
      {
        id: 4,
        name: "شيبس",
        price: 3500,
        stock: 20,
        minStock: 5
      },
      {
        id: 5,
        name: "بسكويت",
        price: 3000,
        stock: 20,
        minStock: 5
      },
      {
        id: 6,
        name: "حليب",
        price: 6000,
        stock: 15,
        minStock: 5
      }
    ]);
  }

  function getSales() {
    return readStorage(KEYS.sales, []);
  }

  function getCustomers() {
    return readStorage(KEYS.customers, []);
  }

  function getDebts() {
    return readStorage(KEYS.debts, []);
  }

  function getPayments() {
    return readStorage(KEYS.payments, []);
  }

  function saveProducts(data) {
    return writeStorage(KEYS.products, data);
  }

  function saveSales(data) {
    return writeStorage(KEYS.sales, data);
  }

  function saveCustomers(data) {
    return writeStorage(KEYS.customers, data);
  }

  function saveDebts(data) {
    return writeStorage(KEYS.debts, data);
  }

  function savePayments(data) {
    return writeStorage(KEYS.payments, data);
  }

  /* =========================================
     أدوات عامة
  ========================================= */

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

  function todayKey(date = new Date()) {
    const d = new Date(date);

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("ar-SY");
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString("ar-SY", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function generateId(prefix = "ID") {
    return (
      prefix +
      "-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 100000)
    );
  }

  function generateInvoiceNumber() {
    return (
      "INV-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 999)
    );
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getApp() {
    return document.querySelector(".app");
  }

  /* =========================================
     حساب ديون الزبائن
  ========================================= */

  function getCustomerDebt(customerId) {
    const debts = getDebts();
    const payments = getPayments();

    const totalDebt = debts
      .filter(
        debt =>
          String(debt.customerId) ===
          String(customerId)
      )
      .reduce(
        (sum, debt) =>
          sum + number(debt.amount),
        0
      );

    const totalPaid = payments
      .filter(
        payment =>
          String(payment.customerId) ===
          String(customerId)
      )
      .reduce(
        (sum, payment) =>
          sum + number(payment.amount),
        0
      );

    return {
      totalDebt,
      totalPaid,
      remaining: Math.max(
        0,
        totalDebt - totalPaid
      )
    };
  }

  function getTotalDebts() {
    const customers = getCustomers();

    return customers.reduce(
      (sum, customer) =>
        sum +
        getCustomerDebt(customer.id).remaining,
      0
    );
  }

  /* =========================================
     إحصائيات اليوم
  ========================================= */

  function getTodaySales() {
    const key = todayKey();

    return getSales().filter(
      sale =>
        todayKey(sale.createdAt) === key
    );
  }

  function getTodayTotal() {
    return getTodaySales().reduce(
      (sum, sale) =>
        sum + number(sale.total),
      0
    );
  }

  /* =========================================
     بداية لوحة التحكم
  ========================================= */

  function showDashboard() {
    const app = getApp();

    if (!app) return;

    const sales = getSales();
    const products = getProducts();
    const customers = getCustomers();

    const todaySales = getTodaySales();
    const todayTotal = getTodayTotal();
    const totalDebts = getTotalDebts();

    const stockCount = products.reduce(
      (sum, product) =>
        sum + number(product.stock),
      0
    );

    app.innerHTML = `
      <div class="page">

        <header class="topbar">

          <div class="brand">

            <div class="brand-logo">
              EB
            </div>

            <div class="brand-text">

              <small>
                نظام إدارة المتجر
              </small>

              <h1>
                ${APP_NAME}
              </h1>

            </div>

          </div>

          <button
            class="icon-button"
            id="refreshDashboard"
            title="تحديث"
          >
            ↻
          </button>

        </header>

        <section class="hero">

          <div>

            <span class="hero-label">
              إجمالي مبيعات اليوم
            </span>

            <h2>
              ${money(todayTotal)}
            </h2>

            <p>
              ${todaySales.length}
              فاتورة اليوم
            </p>

          </div>

          <div class="seal">
            EB<br>
            EXPRESS
          </div>

        </section>

        <section class="stats">

          <div class="stat">
            <span>مبيعات اليوم</span>
            <strong>
              ${money(todayTotal)}
            </strong>
            <small>ليرة سورية</small>
          </div>

          <div class="stat">
            <span>فواتير اليوم</span>
            <strong>
              ${todaySales.length}
            </strong>
            <small>فاتورة</small>
          </div>

          <div class="stat">
            <span>الزبائن</span>
            <strong>
              ${customers.length}
            </strong>
            <small>زبون</small>
          </div>

          <div class="stat">
            <span>ديون الزبائن</span>
            <strong>
              ${money(totalDebts)}
            </strong>
            <small>المتبقي</small>
          </div>

        </section>

        <section class="section">

          <div class="section-heading">
            <h3>الوصول السريع</h3>
            <span>إكسبريس البرج</span>
          </div>

          <div class="quickgrid">

            <button
              class="quick-card"
              id="newSaleButton"
            >
              <span class="quick-icon">＋</span>
              <strong>بيع جديد</strong>
              <small>إنشاء فاتورة</small>
            </button>

            <button
              class="quick-card"
              id="productsButton"
            >
              <span class="quick-icon">▦</span>
              <strong>المنتجات والمخزون</strong>
              <small>إضافة وتعديل وجرد</small>
            </button>

            <button
              class="quick-card"
              id="customersButton"
            >
              <span class="quick-icon">♙</span>
              <strong>الزبائن</strong>
              <small>العملاء ومشترياتهم</small>
            </button>

            <button
              class="quick-card"
              id="debtsButton"
            >
              <span class="quick-icon">د</span>
              <strong>ديون الزبائن</strong>
              <small>
                ${money(totalDebts)}
              </small>
            </button>

          </div>

        </section>

        <section class="section">

          <div class="section-heading">

            <h3>
              آخر المبيعات
            </h3>

            <button id="viewAllSales">
              عرض الكل
            </button>

          </div>

          <div class="activity-list">

            ${
              sales.length === 0
                ? `
                  <div class="empty-state">
                    <span>🧾</span>
                    <strong>
                      لا توجد مبيعات بعد
                    </strong>
                    <small>
                      ستظهر الفواتير هنا بعد أول عملية بيع.
                    </small>
                  </div>
                `
                : sales
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map(createSaleCard)
                    .join("")
            }

          </div>

        </section>

      </div>

      ${createBottomNavigation("home")}
    `;

    document
      .getElementById("refreshDashboard")
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById("newSaleButton")
      ?.addEventListener(
        "click",
        showSalesScreen
      );

    document
      .getElementById("productsButton")
      ?.addEventListener(
        "click",
        showProducts
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
      .getElementById("viewAllSales")
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    setupNavigation();
  }

  /* =========================================
     بطاقة المبيعات
  ========================================= */

  function createSaleCard(sale) {
    return `
      <button
        class="sale-card"
        data-open-invoice="${escapeHtml(
          sale.invoiceNumber
        )}"
      >

        <div>

          <strong>
            ${escapeHtml(
              sale.invoiceNumber
            )}
          </strong>

          <small>
            ${formatDate(
              sale.createdAt
            )}
            -
            ${formatTime(
              sale.createdAt
            )}
          </small>

          <small>
            ${
              sale.customerName
                ? "الزبون: " +
                  escapeHtml(
                    sale.customerName
                  )
                : "زبون نقدي"
            }
          </small>

        </div>

        <div class="sale-total">
          ${money(sale.total)}
        </div>

      </button>
    `;
  }

  /* =========================================
     فتح الفاتورة من البطاقات
  ========================================= */

  function bindInvoiceButtons() {
    document
      .querySelectorAll(
        "[data-open-invoice]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const invoice =
              button.dataset.openInvoice;

            const sale =
              getSales().find(
                item =>
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

  /* =========================================
     التنقل السفلي
  ========================================= */

  function createBottomNavigation(active) {
    return `
      <nav class="bottom-nav">

        <button
          class="nav-item ${
            active === "home"
              ? "active"
              : ""
          }"
          data-nav="home"
        >
          <span>⌂</span>
          <small>الرئيسية</small>
        </button>

        <button
          class="nav-item ${
            active === "sales"
              ? "active"
              : ""
          }"
          data-nav="sales"
        >
          <span>▣</span>
          <small>المبيعات</small>
        </button>

        <button
          class="nav-item main-sale ${
            active === "sale"
              ? "active"
              : ""
          }"
          data-nav="sale"
        >
          <span>＋</span>
          <small>بيع</small>
        </button>

        <button
          class="nav-item ${
            active === "products"
              ? "active"
              : ""
          }"
          data-nav="products"
        >
          <span>□</span>
          <small>المنتجات</small>
        </button>

        <button
          class="nav-item ${
            active === "more"
              ? "active"
              : ""
          }"
          data-nav="more"
        >
          <span>☰</span>
          <small>المزيد</small>
        </button>

      </nav>
    `;
  }

  function setupNavigation() {
    document
      .querySelectorAll("[data-nav]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const page =
              button.dataset.nav;

            if (page === "home") {
              showDashboard();
            }

            if (page === "sales") {
              showSalesHistory();
            }

            if (page === "sale") {
              showSalesScreen();
            }

            if (page === "products") {
              showProducts();
            }

            if (page === "more") {
              showMore();
            }

          }
        );

      });
  }

  /* =========================================
     تشغيل التطبيق
  ========================================= */

  showDashboard();

});    },
    {
      id: 3,
      name: "بيبسي",
      price: 4000,
      stock: 60,
      minStock: 5
    },
    {
      id: 4,
      name: "شيبس",
      price: 3500,
      stock: 40,
      minStock: 5
    },
    {
      id: 5,
      name: "بسكويت",
      price: 3000,
      stock: 40,
      minStock: 5
    },
    {
      id: 6,
      name: "حليب",
      price: 6000,
      stock: 30,
      minStock: 5
    }
  ];

  // =========================================================
  // أدوات LocalStorage
  // =========================================================

  function readStorage(key, fallback = []) {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        return fallback;
      }

      const parsed = JSON.parse(value);

      return parsed ?? fallback;
    } catch (error) {
      console.error("خطأ في قراءة البيانات:", key, error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", key, error);
      alert("حدث خطأ أثناء حفظ البيانات.");
      return false;
    }
  }

  // =========================================================
  // المنتجات
  // =========================================================

  function getProducts() {
    const products = readStorage(
      STORAGE.PRODUCTS,
      null
    );

    if (!Array.isArray(products)) {
      writeStorage(
        STORAGE.PRODUCTS,
        defaultProducts
      );

      return [...defaultProducts];
    }

    return products;
  }

  function saveProducts(products) {
    return writeStorage(
      STORAGE.PRODUCTS,
      products
    );
  }

  // =========================================================
  // المبيعات
  // =========================================================

  function getSales() {
    return readStorage(
      STORAGE.SALES,
      []
    );
  }

  function saveSales(sales) {
    return writeStorage(
      STORAGE.SALES,
      sales
    );
  }

  // =========================================================
  // العملاء
  // =========================================================

  function getCustomers() {
    return readStorage(
      STORAGE.CUSTOMERS,
      []
    );
  }

  function saveCustomers(customers) {
    return writeStorage(
      STORAGE.CUSTOMERS,
      customers
    );
  }

  // =========================================================
  // الحسابات اليومية
  // =========================================================

  function getDailyData() {
    return readStorage(
      STORAGE.DAILY,
      {
        date: getDateKey(new Date()),
        resetAt: null,
        resetSalesTotal: 0,
        resetInvoices: 0
      }
    );
  }

  function saveDailyData(data) {
    return writeStorage(
      STORAGE.DAILY,
      data
    );
  }

  // =========================================================
  // التهيئة
  // =========================================================

  function initializeStorage() {
    if (!localStorage.getItem(STORAGE.PRODUCTS)) {
      saveProducts(defaultProducts);
    }

    if (!localStorage.getItem(STORAGE.SALES)) {
      saveSales([]);
    }

    if (!localStorage.getItem(STORAGE.CUSTOMERS)) {
      saveCustomers([]);
    }

    if (!localStorage.getItem(STORAGE.DAILY)) {
      saveDailyData({
        date: getDateKey(new Date()),
        resetAt: null,
        resetSalesTotal: 0,
        resetInvoices: 0
      });
    }
  }

  // =========================================================
  // تنسيق الأرقام
  // =========================================================

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("ar-SY");
  }

  function formatMoney(value) {
    return `${formatNumber(value)} ${CURRENCY}`;
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString(
      "ar-SY",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    );
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString(
      "ar-SY",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  function getDateKey(date) {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      d.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getMonthKey(date) {
    const d = new Date(date);

    return (
      d.getFullYear() +
      "-" +
      String(
        d.getMonth() + 1
      ).padStart(2, "0")
    );
  }

  // =========================================================
  // حماية النصوص
  // =========================================================

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =========================================================
  // أرقام
  // =========================================================

  function numberValue(value) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  }

  // =========================================================
  // رقم الفاتورة
  // =========================================================

  function generateInvoiceNumber() {
    return (
      "INV-" +
      Date.now() +
      "-" +
      Math.floor(
        Math.random() * 900 + 100
      )
    );
  }

  // =========================================================
  // إيجاد التطبيق
  // =========================================================

  function getApp() {
    return document.querySelector(".app");
  }

  // =========================================================
  // إجمالي السلة
  // =========================================================

  function getCartTotal() {
    return cart.reduce(
      (sum, item) =>
        sum +
        numberValue(item.price) *
          numberValue(item.qty),
      0
    );
  }

  function getCartCount() {
    return cart.reduce(
      (sum, item) =>
        sum + numberValue(item.qty),
      0
    );
  }

  // =========================================================
  // مبيعات اليوم
  // =========================================================

  function getTodaySales() {
    const today = getDateKey(
      new Date()
    );

    return getSales().filter(
      sale =>
        getDateKey(
          sale.createdAt
        ) === today
    );
  }

  function getTodaySalesTotal() {
    return getTodaySales().reduce(
      (sum, sale) =>
        sum + numberValue(sale.total),
      0
    );
  }

  // =========================================================
  // مبيعات الشهر
  // =========================================================

  function getMonthSales(month = null) {
    const target =
      month ||
      getMonthKey(new Date());

    return getSales().filter(
      sale =>
        getMonthKey(
          sale.createdAt
        ) === target
    );
  }

  // =========================================================
  // التنقل السفلي
  // =========================================================

  function createBottomNavigation(active) {
    return `
      <nav class="bottom-nav">

        <button
          class="nav-item ${
            active === "home"
              ? "active"
              : ""
          }"
          data-nav="home"
        >
          <span>⌂</span>
          <small>الرئيسية</small>
        </button>

        <button
          class="nav-item ${
            active === "sales"
              ? "active"
              : ""
          }"
          data-nav="sales"
        >
          <span>📋</span>
          <small>المبيعات</small>
        </button>

        <button
          class="nav-item main-sale ${
            active === "sale"
              ? "active"
              : ""
          }"
          data-nav="sale"
        >
          <span>＋</span>
          <small>بيع</small>
        </button>

        <button
          class="nav-item ${
            active === "products"
              ? "active"
              : ""
          }"
          data-nav="products"
        >
          <span>📦</span>
          <small>المنتجات</small>
        </button>

        <button
          class="nav-item ${
            active === "customers"
              ? "active"
              : ""
          }"
          data-nav="customers"
        >
          <span>👥</span>
          <small>العملاء</small>
        </button>

      </nav>
    `;
  }

  function setupNavigation() {
    document
      .querySelectorAll("[data-nav]")
      .forEach(button => {

        button.onclick = () => {

          const page =
            button.dataset.nav;

          if (page === "home") {
            showDashboard();
          }

          if (page === "sales") {
            showSalesHistory();
          }

          if (page === "sale") {
            showSalesScreen();
          }

          if (page === "products") {
            showProducts();
          }

          if (page === "customers") {
            showCustomers();
          }
        };
      });
  }

  // =========================================================
  // لوحة التحكم
  // =========================================================

  function showDashboard() {
    const app = getApp();

    if (!app) return;

    const sales = getSales();
    const todaySales = getTodaySales();

    const todayTotal =
      getTodaySalesTotal();

    const allTotal =
      sales.reduce(
        (sum, sale) =>
          sum + numberValue(sale.total),
        0
      );

    const products =
      getProducts();

    const customers =
      getCustomers();

    const lowStock =
      products.filter(
        product =>
          numberValue(product.stock) <=
          numberValue(product.minStock)
      );

    app.innerHTML = `
      <div class="page">

        <div class="topbar">
          <div>
            <span class="kicker">
              نظام نقاط البيع
            </span>

            <h1>
              سوبر ماركت البرج
            </h1>
          </div>

          <button
            class="icon-button"
            id="refreshDashboard"
          >
            ↻
          </button>
        </div>

        <div class="hero">
          <div>

            <span class="hero-label">
              مبيعات اليوم
            </span>

            <h2>
              ${formatMoney(todayTotal)}
            </h2>

            <p>
              ${todaySales.length}
              فاتورة اليوم
            </p>

          </div>

          <div class="seal">
            AL<br>
            BURJ
          </div>
        </div>

        <div class="stats">

          <div class="stat">
            <span>فواتير اليوم</span>
            <strong>
              ${todaySales.length}
            </strong>
            <small>فاتورة</small>
          </div>

          <div class="stat">
            <span>إجمالي المبيعات</span>
            <strong>
              ${formatMoney(allTotal)}
            </strong>
            <small>ل.س</small>
          </div>

          <div class="stat">
            <span>المنتجات</span>
            <strong>
              ${products.length}
            </strong>
            <small>منتج</small>
          </div>

          <div class="stat">
            <span>العملاء</span>
            <strong>
              ${customers.length}
            </strong>
            <small>عميل</small>
          </div>

        </div>

        ${
          lowStock.length
            ? `
              <div class="section">
                <div class="section-heading">
                  <h3>تنبيه المخزون</h3>
                  <span>
                    ${lowStock.length} منتج
                  </span>
                </div>

                <div class="activity-list">
                  ${lowStock
                    .map(
                      product => `
                        <div class="sale-card">
                          <div>
                            <strong>
                              ${escapeHtml(
                                product.name
                              )}
                            </strong>

                            <small>
                              الكمية الحالية:
                              ${formatNumber(
                                product.stock
                              )}
                            </small>
                          </div>

                          <div class="sale-total">
                            منخفض
                          </div>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              </div>
            `
            : ""
        }

        <div class="section">

          <div class="section-heading">
            <h3>العمليات السريعة</h3>
          </div>

          <div class="quickgrid">

            <button
              class="quick-card"
              id="newSaleButton"
            >
              <div class="quick-icon">🛒</div>
              <strong>بيع جديد</strong>
              <small>إنشاء فاتورة</small>
            </button>

            <button
              class="quick-card"
              id="salesHistoryButton"
            >
              <div class="quick-icon">📋</div>
              <strong>المبيعات</strong>
              <small>سجل الفواتير</small>
            </button>

            <button
              class="quick-card"
              id="productsButton"
            >
              <div class="quick-icon">📦</div>
              <strong>المنتجات</strong>
              <small>المخزون والأسعار</small>
            </button>

            <button
              class="quick-card"
              id="customersButton"
            >
              <div class="quick-icon">👥</div>
              <strong>العملاء</strong>
              <small>الحسابات والمشتريات</small>
            </button>

          </div>

        </div>

        <div class="section">

          <div class="section-heading">
            <h3>آخر المبيعات</h3>

            <button
              id="viewAllSales"
              class="secondary-button"
            >
              عرض الكل
            </button>
          </div>

          <div class="activity-list">

            ${
              sales.length === 0
                ? `
                  <div class="empty-state">
                    <span>🧾</span>
                    <strong>
                      لا توجد مبيعات
                    </strong>
                    <small>
                      ابدأ بإنشاء أول فاتورة.
                    </small>
                  </div>
                `
                : sales
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map(createSaleCard)
                    .join("")
            }

          </div>

        </div>

        <div class="section">

          <div class="section-heading">
            <h3>الحسابات اليومية</h3>
          </div>

          <div class="form-card">

            <p>
              يمكنك تصفير أرقام اليوم دون حذف الفواتير
              القديمة.
            </p>

            <button
              class="danger-button"
              id="resetDaily"
            >
              🧹 تصفير الحسابات اليومية
            </button>

          </div>

        </div>

      </div>

      ${createBottomNavigation("home")}
    `;

    document
      .getElementById("refreshDashboard")
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById("newSaleButton")
      ?.addEventListener(
        "click",
        showSalesScreen
      );

    document
      .getElementById("salesHistoryButton")
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    document
      .getElementById("productsButton")
      ?.addEventListener(
        "click",
        showProducts
      );

    document
      .getElementById("customersButton")
      ?.addEventListener(
        "click",
        showCustomers
      );

    document
      .getElementById("viewAllSales")
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    document
      .getElementById("resetDaily")
      ?.addEventListener(
        "click",
        resetDailyAccounts
      );

    setupNavigation();
  }

  // =========================================================
  // بطاقة البيع
  // =========================================================

  function createSaleCard(sale) {
    return `
      <button
        class="sale-card"
        data-open-invoice="${escapeHtml(
          sale.invoiceNumber
        )}"
        style="
          width:100%;
          border:1px solid var(--border);
          text-align:right;
        "
      >

        <div>

          <strong>
            ${escapeHtml(
              sale.invoiceNumber
            )}
          </strong>

          <small>
            ${formatDate(
              sale.createdAt
            )}
            -
            ${formatTime(
              sale.createdAt
            )}
          </small>

          <small>
            ${
              sale.customerName
                ? "العميل: " +
                  escapeHtml(
                    sale.customerName
                  )
                : "عميل نقدي"
            }
          </small>

        </div>

        <div class="sale-total">
          ${formatMoney(sale.total)}
        </div>

      </button>
    `;
  }

  function setupInvoiceButtons() {
    document
      .querySelectorAll(
        "[data-open-invoice]"
      )
      .forEach(button => {

        button.onclick = () => {

          const invoice =
            button.dataset.openInvoice;

          const sale =
            getSales().find(
              item =>
                item.invoiceNumber ===
                invoice
            );

          if (sale) {
            showInvoice(sale);
          }
        };
      });
  }

  // =========================================================
  // شاشة البيع
  // =========================================================

  function showSalesScreen() {
    const app = getApp();

    if (!app) return;

    cart = [];

    const products =
      getProducts().filter(
        product =>
          numberValue(product.stock) > 0
      );

    const customers =
      getCustomers();

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backToDashboard"
          >
            ←
          </button>

          <div>
            <h1>بيع جديد</h1>
          </div>

        </div>

        <div class="form-card">

          <label>
            العميل
          </label>

          <select
            id="saleCustomer"
            class="search-input"
          >

            <option value="">
              عميل نقدي / بدون عميل
            </option>

            ${customers
              .map(
                customer => `
                  <option
                    value="${customer.id}"
                  >
                    ${escapeHtml(
                      customer.name
                    )}
                  </option>
                `
              )
              .join("")}

          </select>

        </div>

        <div class="form-card">

          <input
            id="productSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن منتج..."
          >

        </div>

        <div class="section">

          <div class="section-heading">
            <h3>المنتجات</h3>
            <span>
              ${products.length} منتج
            </span>
          </div>

          <div
            class="products-grid"
            id="productsGrid"
          >

            ${
              products.length
                ? products
                    .map(
                      product => `
                        <button
                          class="product-button"
                          data-id="${product.id}"
                          data-name="${escapeHtml(
                            product.name
                          )}"
                        >

                          <strong>
                            ${escapeHtml(
                              product.name
                            )}
                          </strong>

                          <small>
                            ${formatMoney(
                              product.price
                            )}
                          </small>

                          <small>
                            المخزون:
                            ${formatNumber(
                              product.stock
                            )}
                          </small>

                        </button>
                      `
                    )
                    .join("")
                : `
                  <div class="empty-state">
                    <span>📦</span>
                    <strong>
                      لا توجد منتجات متاحة
                    </strong>
                  </div>
                `
            }

          </div>

        </div>

        <div class="section">

          <div class="section-heading">
            <h3>السلة</h3>

            <span id="cartCount">
              0 منتج
            </span>
          </div>

          <div
            class="form-card"
            id="cartContainer"
          ></div>

          <div
            class="total-box"
          >

            <span>
              الإجمالي
            </span>

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
              ✓ إتمام البيع وحفظ الفاتورة
            </button>

            <button
              class="secondary-button"
              id="clearCart"
            >
              مسح السلة
            </button>

          </div>

        </div>

      </div>

      ${createBottomNavigation("sale")}
    `;

    document
      .getElementById("backToDashboard")
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .querySelectorAll(".product-button")
      .forEach(button => {

        button.onclick = () => {

          const id =
            Number(
              button.dataset.id
            );

          const product =
            getProducts().find(
              item =>
                Number(item.id) ===
                id
            );

          if (product) {
            addToCart(product);
          }
        };
      });

    document
      .getElementById("productSearch")
      ?.addEventListener(
        "input",
        filterProducts
      );

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

    renderCart();

    setupNavigation();
  }

  // =========================================================
  // إضافة للسلة
  // =========================================================

  function addToCart(product) {

    const currentStock =
      numberValue(product.stock);

    const existing =
      cart.find(
        item =>
          Number(item.id) ===
          Number(product.id)
      );

    if (existing) {

      if (
        existing.qty >=
        currentStock
      ) {
        alert(
          "لا توجد كمية كافية في المخزون."
        );

        return;
      }

      existing.qty += 1;

    } else {

      if (currentStock <= 0) {
        alert(
          "هذا المنتج غير متوفر في المخزون."
        );

        return;
      }

      cart.push({
        id: product.id,
        name: product.name,
        price: numberValue(
          product.price
        ),
        qty: 1
      });
    }

    renderCart();
  }

  // =========================================================
  // عرض السلة
  // =========================================================

  function renderCart() {

    const container =
      document.getElementById(
        "cartContainer"
      );

    const totalElement =
      document.getElementById(
        "totalElement"
      );

    const cartCount =
      document.getElementById(
        "cartCount"
      );

    if (!container) return;

    const total =
      getCartTotal();

    const count =
      getCartCount();

    if (cartCount) {
      cartCount.textContent =
        `${count} منتج`;
    }

    if (totalElement) {
      totalElement.textContent =
        formatMoney(total);
    }

    if (!cart.length) {

      container.innerHTML = `
        <div class="empty-state">
          <span>🛒</span>
          <strong>
            السلة فارغة
          </strong>
          <small>
            اختر منتجًا لإضافته.
          </small>
        </div>
      `;

      return;
    }

    container.innerHTML =
      cart
        .map(
          (item, index) => `
            <div class="cart-item">

              <div>

                <strong>
                  ${escapeHtml(
                    item.name
                  )}
                </strong>

                <small>
                  ${formatMoney(
                    item.price
                  )}
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
                  data-action="increase"
                  data-index="${index}"
                  style="
                    width:38px;
                    min-height:38px;
                    padding:5px;
                  "
                >
                  +
                </button>

                <strong>
                  ${item.qty}
                </strong>

                <button
                  class="secondary-button"
                  data-action="decrease"
                  data-index="${index}"
                  style="
                    width:38px;
                    min-height:38px;
                    padding:5px;
                  "
                >
                  −
                </button>

                <button
                  class="danger-button"
                  data-action="remove"
                  data-index="${index}"
                  style="
                    width:38px;
                    min-height:38px;
                    padding:5px;
                  "
                >
                  ×
                </button>

              </div>

            </div>
          `
        )
        .join("");

    container
      .querySelectorAll(
        "[data-action]"
      )
      .forEach(button => {

        button.onclick = () => {

          const index =
            Number(
              button.dataset.index
            );

          const action =
            button.dataset.action;

          if (!cart[index]) {
            return;
          }

          if (
            action === "increase"
          ) {

            const product =
              getProducts().find(
                item =>
                  Number(item.id) ===
                  Number(
                    cart[index].id
                  )
              );

            if (
              product &&
              cart[index].qty <
                numberValue(
                  product.stock
                )
            ) {
              cart[index].qty += 1;
            } else {
              alert(
                "لا توجد كمية إضافية في المخزون."
              );
            }
          }

          if (
            action === "decrease"
          ) {

            cart[index].qty -= 1;

            if (
              cart[index].qty <= 0
            ) {
              cart.splice(
                index,
                1
              );
            }
          }

          if (
            action === "remove"
          ) {
            cart.splice(
              index,
              1
            );
          }

          renderCart();
        };
      });
  }

  // =========================================================
  // البحث عن المنتجات أثناء البيع
  // =========================================================

  function filterProducts(event) {

    const search =
      event.target.value
        .trim()
        .toLowerCase();

    document
      .querySelectorAll(
        ".product-button"
      )
      .forEach(button => {

        const name =
          String(
            button.dataset.name
          ).toLowerCase();

        button.style.display =
          name.includes(search)
            ? ""
            : "none";
      });
  }

  // =========================================================
  // إتمام البيع
  // =========================================================

  function completeSale() {

    if (!cart.length) {

      alert(
        "أضف منتجًا إلى السلة أولًا."
      );

      return;
    }

    const total =
      getCartTotal();

    const customerSelect =
      document.getElementById(
        "saleCustomer"
      );

    const customerId =
      customerSelect
        ? customerSelect.value
        : "";

    const customers =
      getCustomers();

    const customer =
      customers.find(
        item =>
          String(item.id) ===
          String(customerId)
      );

    const paymentMethod =
      prompt(
        "طريقة الدفع:\n\nاكتب نقدي أو آجل أو بطاقة",
        customer
          ? "نقدي"
          : "نقدي"
      );

    if (
      paymentMethod ===
      null
    ) {
      return;
    }

    const paymentText =
      paymentMethod
        .trim()
        .toLowerCase();

    let payment = "نقدي";

    if (
      paymentText.includes(
        "آجل"
      ) ||
      paymentText.includes(
        "اجل"
      )
    ) {
      payment = "آجل";
    } else if (
      paymentText.includes(
        "بطاقة"
      )
    ) {
      payment = "بطاقة";
    }

    let paid = total;

    if (
      customer &&
      payment === "آجل"
    ) {

      const paidInput =
        prompt(
          `إجمالي الفاتورة: ${formatMoney(
            total
          )}\n\nكم دفع العميل الآن؟`,
          "0"
        );

      if (
        paidInput ===
        null
      ) {
        return;
      }

      paid =
        Math.max(
          0,
          Math.min(
            total,
            numberValue(
              paidInput
            )
          )
        );

    } else if (
      customer &&
      payment !== "آجل"
    ) {
      paid = total;
    }

    const remaining =
      Math.max(
        0,
        total - paid
      );

    const products =
      getProducts();

    // فحص المخزون قبل الحفظ
    for (const item of cart) {

      const product =
        products.find(
          product =>
            Number(product.id) ===
            Number(item.id)
        );

      if (!product) {

        alert(
          `المنتج ${item.name} لم يعد موجودًا.`
        );

        return;
      }

      if (
        numberValue(
          product.stock
        ) < numberValue(item.qty)
      ) {

        alert(
          `الكمية غير كافية للمنتج: ${item.name}`
        );

        return;
      }
    }

    // خصم المخزون
    cart.forEach(item => {

      const product =
        products.find(
          product =>
            Number(product.id) ===
            Number(item.id)
        );

      product.stock =
        numberValue(
          product.stock
        ) -
        numberValue(
          item.qty
        );
    });

    saveProducts(products);

    const sale = {

      invoiceNumber:
        generateInvoiceNumber(),

      createdAt:
        new Date().toISOString(),

      total,

      paid,

      remaining,

      paymentMethod:
        payment,

      customerId:
        customer
          ? customer.id
          : null,

      customerName:
        customer
          ? customer.name
          : "",

      items:
        cart.map(
          item => ({
            id: item.id,
            name: item.name,
            qty: numberValue(
              item.qty
            ),
            price: numberValue(
              item.price
            ),
            subtotal:
              numberValue(
                item.qty
              ) *
              numberValue(
                item.price
              )
          })
        )
    };

    const sales =
      getSales();

    sales.push(sale);

    if (!saveSales(sales)) {
      return;
    }

    // تحديث حساب العميل
    if (customer) {

      const updatedCustomers =
        getCustomers();

      const customerIndex =
        updatedCustomers.findIndex(
          item =>
            Number(item.id) ===
            Number(customer.id)
        );

      if (
        customerIndex !==
        -1
      ) {

        updatedCustomers[
          customerIndex
        ].totalPurchases =
          numberValue(
            updatedCustomers[
              customerIndex
            ].totalPurchases
          ) + total;

        updatedCustomers[
          customerIndex
        ].totalPaid =
          numberValue(
            updatedCustomers[
              customerIndex
            ].totalPaid
          ) + paid;

        updatedCustomers[
          customerIndex
        ].balance =
          Math.max(
            0,
            numberValue(
              updatedCustomers[
                customerIndex
              ].totalPurchases
            ) -
            numberValue(
              updatedCustomers[
                customerIndex
              ].totalPaid
            )
          );
      }

      saveCustomers(
        updatedCustomers
      );
    }

    cart = [];

    showInvoice(sale);
  }

  // =========================================================
  // الفاتورة
  // =========================================================

  function showInvoice(sale) {

    const app = getApp();

    if (!app) return;

    app.innerHTML = `
      <div class="page">

        <div class="invoice">

          <div class="invoice-header">

            <h1>
              سوبر ماركت البرج
            </h1>

            <strong>
              فاتورة بيع
            </strong>

            <p>
              العملة: الليرة السورية
            </p>

          </div>

          <div class="invoice-meta">

            <div>
              <strong>
                رقم الفاتورة:
              </strong>

              ${escapeHtml(
                sale.invoiceNumber
              )}
            </div>

            <div>
              <strong>
                التاريخ:
              </strong>

              ${formatDate(
                sale.createdAt
              )}
            </div>

            <div>
              <strong>
                الوقت:
              </strong>

              ${formatTime(
                sale.createdAt
              )}
            </div>

            <div>
              <strong>
                العميل:
              </strong>

              ${
                sale.customerName
                  ? escapeHtml(
                      sale.customerName
                    )
                  : "عميل نقدي"
              }
            </div>

            <div>
              <strong>
                طريقة الدفع:
              </strong>

              ${escapeHtml(
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
                  item => `
                    <tr>

                      <td>
                        ${escapeHtml(
                          item.name
                        )}
                      </td>

                      <td>
                        ${formatNumber(
                          item.qty
                        )}
                      </td>

                      <td>
                        ${formatNumber(
                          item.price
                        )}
                      </td>

                      <td>
                        ${formatNumber(
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

            <span>
              الإجمالي
            </span>

            <h2>
              ${formatMoney(
                sale.total
              )}
            </h2>

          </div>

          ${
            numberValue(
              sale.paid
            ) !==
              numberValue(
                sale.total
              )
              ? `
                <div class="invoice-meta">

                  <div>
                    <strong>
                      المدفوع:
                    </strong>

                    ${formatMoney(
                      sale.paid
                    )}
                  </div>

                  <div>
                    <strong>
                      المتبقي:
                    </strong>

                    ${formatMoney(
                      sale.remaining
                    )}
                  </div>

                </div>
              `
              : ""
          }

          <div
            class="no-print"
            style="
              display:grid;
              gap:10px;
              margin-top:18px;
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
              id="goToSales"
            >
              📋 سجل المبيعات
            </button>

            <button
              class="secondary-button"
              id="newSaleAfterInvoice"
            >
              🛒 بيع جديد
            </button>

            <button
              class="secondary-button"
              id="backHomeAfterInvoice"
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
      .getElementById("goToSales")
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    document
      .getElementById(
        "newSaleAfterInvoice"
      )
      ?.addEventListener(
        "click",
        showSalesScreen
      );

    document
      .getElementById(
        "backHomeAfterInvoice"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );
  }

  // =========================================================
  // سجل المبيعات
  // =========================================================

  function showSalesHistory() {

    const app = getApp();

    if (!app) return;

    const sales =
      getSales();

    const total =
      sales.reduce(
        (sum, sale) =>
          sum +
          numberValue(
            sale.total
          ),
        0
      );

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backFromSales"
          >
            ←
          </button>

          <div>
            <h1>
              سجل المبيعات
            </h1>
          </div>

        </div>

        <div class="form-card">

          <input
            id="salesSearch"
            class="search-input"
            type="search"
            placeholder="🔎 رقم الفاتورة أو اسم العميل أو المنتج..."
          >

        </div>

        <div class="stats">

          <div class="stat">
            <span>
              عدد الفواتير
            </span>

            <strong>
              ${sales.length}
            </strong>
          </div>

          <div class="stat">
            <span>
              إجمالي المبيعات
            </span>

            <strong>
              ${formatMoney(total)}
            </strong>
          </div>

        </div>

        <div class="section">

          <div class="section-heading">
            <h3>الفواتير</h3>

            <span
              id="salesResultCount"
            >
              ${sales.length} فاتورة
            </span>
          </div>

          <div
            class="activity-list"
            id="salesList"
          >
            ${renderSalesList(
              sales
            )}
          </div>

        </div>

      </div>

      ${createBottomNavigation("sales")}
    `;

    document
      .getElementById(
        "backFromSales"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById(
        "salesSearch"
      )
      ?.addEventListener(
        "input",
        searchSales
      );

    setupInvoiceButtons();
    setupNavigation();
  }

  function renderSalesList(
    sales
  ) {

    if (!sales.length) {

      return `
        <div class="empty-state">
          <span>🧾</span>

          <strong>
            لا توجد فواتير
          </strong>

          <small>
            لا توجد نتائج مطابقة.
          </small>
        </div>
      `;
    }

    return sales
      .slice()
      .reverse()
      .map(
        sale => `
          ${createSaleCard(sale)}
        `
      )
      .join("");
  }

  function searchSales(event) {

    const search =
      event.target.value
        .trim()
        .toLowerCase();

    const sales =
      getSales();

    const filtered =
      sales.filter(
        sale => {

          const invoice =
            String(
              sale.invoiceNumber
            ).toLowerCase();

          const customer =
            String(
              sale.customerName || ""
            ).toLowerCase();

          const payment =
            String(
              sale.paymentMethod || ""
            ).toLowerCase();

          const products =
            sale.items
              .map(
                item =>
                  String(
                    item.name
                  )
              )
              .join(" ")
              .toLowerCase();

          return (
            invoice.includes(search) ||
            customer.includes(search) ||
            payment.includes(search) ||
            products.includes(search)
          );
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
    }

    const counter =
      document.getElementById(
        "salesResultCount"
      );

    if (counter) {
      counter.textContent =
        `${filtered.length} فاتورة`;
    }

    setupInvoiceButtons();
  }

  // =========================================================
  // قسم المنتجات والمخزون
  // =========================================================

  function showProducts() {

    const app = getApp();

    if (!app) return;

    const products =
      getProducts();

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backFromProducts"
          >
            ←
          </button>

          <div>
            <h1>
              المنتجات والمخزون
            </h1>
          </div>

        </div>

        <div class="form-card">

          <input
            id="productListSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن منتج..."
          >

          <button
            class="primary-button"
            id="addProductButton"
            style="margin-top:10px"
          >
            ＋ إضافة منتج
          </button>

        </div>

        <div class="stats">

          <div class="stat">
            <span>عدد المنتجات</span>
            <strong>
              ${products.length}
            </strong>
          </div>

          <div class="stat">
            <span>قيمة المخزون</span>
            <strong>
              ${formatMoney(
                products.reduce(
                  (sum, product) =>
                    sum +
                    numberValue(
                      product.price
                    ) *
                    numberValue(
                      product.stock
                    ),
                  0
                )
              )}
            </strong>
          </div>

        </div>

        <div
          class="section"
          id="productsList"
        >
          ${renderProductsList(
            products
          )}
        </div>

      </div>

      ${createBottomNavigation("products")}
    `;

    document
      .getElementById(
        "backFromProducts"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById(
        "addProductButton"
      )
      ?.addEventListener(
        "click",
        () => openProductForm()
      );

    document
      .getElementById(
        "productListSearch"
      )
      ?.addEventListener(
        "input",
        searchProductList
      );

    setupNavigation();
  }

  function renderProductsList(
    products
  ) {

    if (!products.length) {

      return `
        <div class="empty-state">
          <span>📦</span>
          <strong>
            لا توجد منتجات
          </strong>
        </div>
      `;
    }

    return products
      .map(
        product => {

          const low =
            numberValue(
              product.stock
            ) <=
            numberValue(
              product.minStock
            );

          return `
            <div
              class="sale-card"
              data-product-row="${product.id}"
            >

              <div>

                <strong>
                  ${escapeHtml(
                    product.name
                  )}
                </strong>

                <small>
                  السعر:
                  ${formatMoney(
                    product.price
                  )}
                </small>

                <small>
                  المخزون:
                  ${formatNumber(
                    product.stock
                  )}
                  ${
                    low
                      ? " ⚠️ منخفض"
                      : ""
                  }
                </small>

              </div>

              <div
                style="
                  display:flex;
                  gap:6px;
                  align-items:center;
                  flex-wrap:wrap;
                  justify-content:flex-end;
                "
              >

                <button
                  class="secondary-button"
                  data-edit-product="${product.id}"
                >
                  تعديل
                </button>

                <button
                  class="danger-button"
                  data-delete-product="${product.id}"
                >
                  حذف
                </button>

              </div>

            </div>
          `;
        }
      )
      .join("");
  }

  function setupProductButtons() {

    document
      .querySelectorAll(
        "[data-edit-product]"
      )
      .forEach(button => {

        button.onclick = () => {

          const id =
            Number(
              button.dataset
                .editProduct
            );

          openProductForm(id);
        };
      });

    document
      .querySelectorAll(
        "[data-delete-product]"
      )
      .forEach(button => {

        button.onclick = () => {

          const id =
            Number(
              button.dataset
                .deleteProduct
            );

          deleteProduct(id);
        };
      });
  }

  function searchProductList(event) {

    const search =
      event.target.value
        .trim()
        .toLowerCase();

    const products =
      getProducts();

    const filtered =
      products.filter(
        product =>
          String(
            product.name
          )
            .toLowerCase()
            .includes(search)
      );

    const list =
      document.getElementById(
        "productsList"
      );

    if (list) {
      list.innerHTML =
        renderProductsList(
          filtered
        );

      setupProductButtons();
    }
  }

  // =========================================================
  // نموذج إضافة / تعديل المنتج
  // =========================================================

  function openProductForm(
    productId = null
  ) {

    const products =
      getProducts();

    const product =
      productId !== null
        ? products.find(
            item =>
              Number(item.id) ===
              Number(productId)
          )
        : null;

    const name =
      prompt(
        product
          ? "اسم المنتج:"
          : "اسم المنتج:",
        product
          ? product.name
          : ""
      );

    if (
      name === null
    ) {
      return;
    }

    const cleanName =
      name.trim();

    if (!cleanName) {

      alert(
        "اكتب اسم المنتج."
      );

      return;
    }

    const priceInput =
      prompt(
        "سعر البيع:",
        product
          ? product.price
          : "0"
      );

    if (
      priceInput ===
      null
    ) {
      return;
    }

    const price =
      numberValue(
        priceInput
      );

    if (price < 0) {

      alert(
        "السعر غير صحيح."
      );

      return;
    }

    const stockInput =
      prompt(
        "كمية المخزون:",
        product
          ? product.stock
          : "0"
      );

    if (
      stockInput ===
      null
    ) {
      return;
    }

    const stock =
      numberValue(
        stockInput
      );

    if (stock < 0) {

      alert(
        "كمية المخزون غير صحيحة."
      );

      return;
    }

    const minStockInput =
      prompt(
        "حد التنبيه للمخزون:",
        product
          ? product.minStock
          : "5"
      );

    if (
      minStockInput ===
      null
    ) {
      return;
    }

    const minStock =
      numberValue(
        minStockInput
      );

    if (product) {

      product.name =
        cleanName;

      product.price =
        price;

      product.stock =
        stock;

      product.minStock =
        minStock;

    } else {

      const newProduct = {

        id:
          Date.now(),

        name:
          cleanName,

        price,

        stock,

        minStock
      };

      products.push(
        newProduct
      );
    }

    saveProducts(products);

    showProducts();
  }

  // =========================================================
  // حذف المنتج
  // =========================================================

  function deleteProduct(
    productId
  ) {

    const products =
      getProducts();

    const product =
      products.find(
        item =>
          Number(item.id) ===
          Number(productId)
      );

    if (!product) {
      return;
    }

    const confirmed =
      confirm(
        `هل تريد حذف المنتج "${product.name}"؟\n\nلن يؤثر ذلك على الفواتير القديمة.`
      );

    if (!confirmed) {
      return;
    }

    const filtered =
      products.filter(
        item =>
          Number(item.id) !==
          Number(productId)
      );

    saveProducts(filtered);

    showProducts();
  }

  // =========================================================
  // العملاء
  // =========================================================

  function showCustomers() {

    const app = getApp();

    if (!app) return;

    const customers =
      getCustomers();

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backFromCustomers"
          >
            ←
          </button>

          <div>
            <h1>
              العملاء
            </h1>
          </div>

        </div>

        <div class="form-card">

          <input
            id="customerSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن اسم العميل..."
          >

          <button
            class="primary-button"
            id="addCustomerButton"
            style="margin-top:10px"
          >
            ＋ إضافة عميل
          </button>

        </div>

        <div
          class="section"
          id="customersList"
        >
          ${renderCustomersList(
            customers
          )}
        </div>

      </div>

      ${createBottomNavigation("customers")}
    `;

    document
      .getElementById(
        "backFromCustomers"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById(
        "addCustomerButton"
      )
      ?.addEventListener(
        "click",
        () =>
          openCustomerForm()
      );

    document
      .getElementById(
        "customerSearch"
      )
      ?.addEventListener(
        "input",
        searchCustomers
      );

    setupCustomerButtons();
    setupNavigation();
  }

  function renderCustomersList(
    customers
  ) {

    if (!customers.length) {

      return `
        <div class="empty-state">
          <span>👥</span>

          <strong>
            لا يوجد عملاء
          </strong>

          <small>
            أضف أول عميل من الزر أعلاه.
          </small>
        </div>
      `;
    }

    return customers
      .map(
        customer => {

          const monthly =
            getCustomerMonthlyStats(
              customer.id
            );

          return `
            <div
              class="sale-card"
            >

              <div>

                <strong>
                  ${escapeHtml(
                    customer.name
                  )}
                </strong>

                <small>
                  الهاتف:
                  ${
                    escapeHtml(
                      customer.phone ||
                      "غير مسجل"
                    )
                  }
                </small>

                <small>
                  مشتريات الشهر:
                  ${formatMoney(
                    monthly.total
                  )}
                </small>

                <small>
                  مدفوع الشهر:
                  ${formatMoney(
                    monthly.paid
                  )}
                </small>

                <small>
                  المتبقي الشهر:
                  ${formatMoney(
                    monthly.remaining
                  )}
                </small>

                <small>
                  إجمالي مشترياته:
                  ${formatMoney(
                    customer.totalPurchases
                  )}
                </small>

                <small>
                  الرصيد الحالي:
                  ${formatMoney(
                    customer.balance
                  )}
                </small>

              </div>

              <div
                style="
                  display:flex;
                  flex-direction:column;
                  gap:6px;
                "
              >

                <button
                  class="primary-button"
                  data-view-customer="${customer.id}"
                >
                  التفاصيل
                </button>

                <button
                  class="secondary-button"
                  data-edit-customer="${customer.id}"
                >
                  تعديل
                </button>

                <button
                  class="danger-button"
                  data-delete-customer="${customer.id}"
                >
                  حذف
                </button>

              </div>

            </div>
          `;
        }
      )
      .join("");
  }

  // =========================================================
  // إحصائيات العميل
  // =========================================================

  function getCustomerMonthlyStats(
    customerId
  ) {

    const month =
      getMonthKey(
        new Date()
      );

    const sales =
      getSales().filter(
        sale =>
          Number(
            sale.customerId
          ) ===
            Number(
              customerId
            ) &&
          getMonthKey(
            sale.createdAt
          ) === month
      );

    return {
      total:
        sales.reduce(
          (sum, sale) =>
            sum +
            numberValue(
              sale.total
            ),
          0
        ),

      paid:
        sales.reduce(
          (sum, sale) =>
            sum +
            numberValue(
              sale.paid
            ),
          0
        ),

      remaining:
        sales.reduce(
          (sum, sale) =>
            sum +
            numberValue(
              sale.remaining
            ),
          0
        ),

      invoices:
        sales.length
    };
  }

  function getCustomerAllSales(
    customerId
  ) {

    return getSales().filter(
      sale =>
        Number(
          sale.customerId
        ) ===
        Number(
          customerId
        )
    );
  }

  // =========================================================
  // تفاصيل العميل
  // =========================================================

  function showCustomerDetails(
    customerId
  ) {

    const customer =
      getCustomers().find(
        item =>
          Number(item.id) ===
          Number(customerId)
      );

    if (!customer) {
      return;
    }

    const monthly =
      getCustomerMonthlyStats(
        customerId
      );

    const allSales =
      getCustomerAllSales(
        customerId
      );

    const app = getApp();

    if (!app) return;

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backCustomerDetails"
          >
            ←
          </button>

          <div>
            <h1>
              ${escapeHtml(
                customer.name
              )}
            </h1>
          </div>

        </div>

        <div class="stats">

          <div class="stat">
            <span>
              مشتريات هذا الشهر
            </span>

            <strong>
              ${formatMoney(
                monthly.total
              )}
            </strong>
          </div>

          <div class="stat">
            <span>
              مدفوع هذا الشهر
            </span>

            <strong>
              ${formatMoney(
                monthly.paid
              )}
            </strong>
          </div>

          <div class="stat">
            <span>
              باقي هذا الشهر
            </span>

            <strong>
              ${formatMoney(
                monthly.remaining
              )}
            </strong>
          </div>

          <div class="stat">
            <span>
              إجمالي الرصيد
            </span>

            <strong>
              ${formatMoney(
                customer.balance
              )}
            </strong>
          </div>

        </div>

        <div class="section">

          <div class="section-heading">
            <h3>
              بيانات العميل
            </h3>
          </div>

          <div class="form-card">

            <p>
              الاسم:
              <strong>
                ${escapeHtml(
                  customer.name
                )}
              </strong>
            </p>

            <p>
              الهاتف:
              <strong>
                ${
                  escapeHtml(
                    customer.phone ||
                    "غير مسجل"
                  )
                }
              </strong>
            </p>

            <p>
              العنوان:
              <strong>
                ${
                  escapeHtml(
                    customer.address ||
                    "غير مسجل"
                  )
                }
              </strong>
            </p>

            <p>
              إجمالي المشتريات:
              <strong>
                ${formatMoney(
                  customer.totalPurchases
                )}
              </strong>
            </p>

            <p>
              إجمالي المدفوع:
              <strong>
                ${formatMoney(
                  customer.totalPaid
                )}
              </strong>
            </p>

            <p>
              إجمالي المتبقي:
              <strong>
                ${formatMoney(
                  customer.balance
                )}
              </strong>
            </p>

          </div>

        </div>

        <div class="section">

          <div class="section-heading">
            <h3>
              فواتير العميل
            </h3>

            <span>
              ${allSales.length} فاتورة
            </span>
          </div>

          <div class="activity-list">

            ${
              allSales.length
                ? allSales
                    .slice()
                    .reverse()
                    .map(
                      sale =>
                        createSaleCard(
                          sale
                        )
                    )
                    .join("")
                : `
                  <div class="empty-state">
                    <span>🧾</span>
                    <strong>
                      لا توجد فواتير
                    </strong>
                  </div>
                `
            }

          </div>

        </div>

      </div>

      ${createBottomNavigation(
        "customers"
      )}
    `;

    document
      .getElementById(
        "backCustomerDetails"
      )
      ?.addEventListener(
        "click",
        showCustomers
      );

    setupInvoiceButtons();
    setupNavigation();
  }

  // =========================================================
  // إضافة / تعديل العميل
  // =========================================================

  function openCustomerForm(
    customerId = null
  ) {

    const customers =
      getCustomers();

    const customer =
      customerId !== null
        ? customers.find(
            item =>
              Number(item.id) ===
              Number(customerId)
          )
        : null;

    const name =
      prompt(
        "اسم العميل:",
        customer
          ? customer.name
          : ""
      );

    if (
      name === null
    ) {
      return;
    }

    const cleanName =
      name.trim();

    if (!cleanName) {

      alert(
        "اكتب اسم العميل."
      );

      return;
    }

    const phone =
      prompt(
        "رقم الهاتف:",
        customer
          ? customer.phone || ""
          : ""
      );

    if (
      phone === null
    ) {
      return;
    }

    const address =
      prompt(
        "العنوان:",
        customer
          ? customer.address || ""
          : ""
      );

    if (
      address === null
    ) {
      return;
    }

    if (customer) {

      customer.name =
        cleanName;

      customer.phone =
        phone.trim();

      customer.address =
        address.trim();

    } else {

      customers.push({

        id:
          Date.now(),

        name:
          cleanName,

        phone:
          phone.trim(),

        address:
          address.trim(),

        totalPurchases:
          0,

        totalPaid:
          0,

        balance:
          0
      });
    }

    saveCustomers(
      customers
    );

    showCustomers();
  }

  function setupCustomerButtons() {

    document
      .querySelectorAll(
        "[data-view-customer]"
      )
      .forEach(button => {

        button.onclick = () => {

          showCustomerDetails(
            Number(
              button.dataset
                .viewCustomer
            )
          );
        };
      });

    document
      .querySelectorAll(
        "[data-edit-customer]"
      )
      .forEach(button => {

        button.onclick = () => {

          openCustomerForm(
            Number(
              button.dataset
                .editCustomer
            )
          );
        };
      });

    document
      .querySelectorAll(
        "[data-delete-customer]"
      )
      .forEach(button => {

        button.onclick = () => {

          deleteCustomer(
            Number(
              button.dataset
                .deleteCustomer
            )
          );
        };
      });
  }

  function deleteCustomer(
    customerId
  ) {

    const customers =
      getCustomers();

    const customer =
      customers.find(
        item =>
          Number(item.id) ===
          Number(customerId)
      );

    if (!customer) {
      return;
    }

    const confirmed =
      confirm(
        `هل تريد حذف العميل "${customer.name}"؟\n\nالفواتير القديمة ستبقى محفوظة.`
      );

    if (!confirmed) {
      return;
    }

    const filtered =
      customers.filter(
        item =>
          Number(item.id) !==
          Number(customerId)
      );

    saveCustomers(
      filtered
    );

    showCustomers();
  }

  function searchCustomers(event) {

    const search =
      event.target.value
        .trim()
        .toLowerCase();

    const customers =
      getCustomers();

    const filtered =
      customers.filter(
        customer =>
          String(
            customer.name
          )
            .toLowerCase()
            .includes(search) ||
          String(
            customer.phone || ""
          )
            .toLowerCase()
            .includes(search)
      );

    const list =
      document.getElementById(
        "customersList"
      );

    if (list) {

      list.innerHTML =
        renderCustomersList(
          filtered
        );

      setupCustomerButtons();
    }
  }

  // =========================================================
  // تصفير الحسابات اليومية
  // =========================================================

  function resetDailyAccounts() {

    const todaySales =
      getTodaySales();

    if (!todaySales.length) {

      alert(
        "لا توجد مبيعات اليوم لتصفيرها."
      );

      return;
    }

    const total =
      getTodaySalesTotal();

    const confirmed =
      confirm(
        `سيتم تصفير أرقام الحسابات اليومية فقط.\n\nمبيعات اليوم: ${formatMoney(
          total
        )}\nعدد الفواتير: ${todaySales.length}\n\nالفواتير لن تُحذف من سجل المبيعات.\n\nهل تريد المتابعة؟`
      );

    if (!confirmed) {
      return;
    }

    saveDailyData({

      date:
        getDateKey(
          new Date()
        ),

      resetAt:
        new Date().toISOString(),

      resetSalesTotal:
        total,

      resetInvoices:
        todaySales.length
    });

    alert(
      "تم تصفير الحسابات اليومية بنجاح.\nسجل الفواتير لم يُحذف."
    );

    showDashboard();
  }

  // =========================================================
  // تشغيل البرنامج
  // =========================================================

  initializeStorage();

  showDashboard();
});      id: "p3",
      name: "بيبسي",
      price: 4000,
      stock: 25
    },
    {
      id: "p4",
      name: "شيبس",
      price: 3500,
      stock: 20
    },
    {
      id: "p5",
      name: "بسكويت",
      price: 3000,
      stock: 25
    },
    {
      id: "p6",
      name: "حليب",
      price: 6000,
      stock: 15
    }
  ];

  // =====================================================
  // أدوات التخزين
  // =====================================================

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error("خطأ في قراءة البيانات:", key, error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", key, error);

      alert(
        "تعذر حفظ البيانات في المتصفح."
      );

      return false;
    }
  }

  // =====================================================
  // المنتجات
  // =====================================================

  function getProducts() {
    const products = read(
      KEYS.products,
      null
    );

    if (!Array.isArray(products)) {
      write(
        KEYS.products,
        defaultProducts
      );

      return [...defaultProducts];
    }

    return products;
  }

  function saveProducts(products) {
    return write(
      KEYS.products,
      products
    );
  }

  // =====================================================
  // المبيعات
  // =====================================================

  function getSales() {
    const sales = read(
      KEYS.sales,
      []
    );

    return Array.isArray(sales)
      ? sales
      : [];
  }

  function saveSales(sales) {
    return write(
      KEYS.sales,
      sales
    );
  }

  // =====================================================
  // العملاء
  // =====================================================

  function getCustomers() {
    const customers = read(
      KEYS.customers,
      []
    );

    return Array.isArray(customers)
      ? customers
      : [];
  }

  function saveCustomers(customers) {
    return write(
      KEYS.customers,
      customers
    );
  }

  // =====================================================
  // الحسابات اليومية
  // =====================================================

  function getDailyData() {
    const data = read(
      KEYS.daily,
      null
    );

    if (
      !data ||
      typeof data !== "object"
    ) {
      return {
        date: getDateKey(),
        salesTotal: 0,
        salesCount: 0,
        paymentsTotal: 0,
        resetAt: null
      };
    }

    return data;
  }

  function saveDailyData(data) {
    return write(
      KEYS.daily,
      data
    );
  }

  function getDateKey(date = new Date()) {
    const d = new Date(date);

    return [
      d.getFullYear(),
      String(
        d.getMonth() + 1
      ).padStart(2, "0"),
      String(
        d.getDate()
      ).padStart(2, "0")
    ].join("-");
  }

  function ensureDailyData() {
    const data = getDailyData();

    const today = getDateKey();

    if (data.date !== today) {
      const fresh = {
        date: today,
        salesTotal: 0,
        salesCount: 0,
        paymentsTotal: 0,
        resetAt: null
      };

      saveDailyData(fresh);

      return fresh;
    }

    return data;
  }

  // =====================================================
  // تنسيق
  // =====================================================

  function formatMoney(value) {
    return (
      Number(value || 0).toLocaleString(
        "ar-SY"
      ) +
      " " +
      CURRENCY
    );
  }

  function formatNumber(value) {
    return Number(
      value || 0
    ).toLocaleString("ar-SY");
  }

  function formatDate(date) {
    return new Date(
      date
    ).toLocaleDateString(
      "ar-SY"
    );
  }

  function formatTime(date) {
    return new Date(
      date
    ).toLocaleTimeString(
      "ar-SY",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  function generateId(prefix) {
    return (
      prefix +
      "_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 100000
      )
    );
  }

  function generateInvoiceNumber() {
    return (
      "INV-" +
      Date.now() +
      "-" +
      Math.floor(
        Math.random() * 1000
      )
    );
  }

  function escapeHTML(value) {
    return String(
      value ?? ""
    )
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // =====================================================
  // التنقل السفلي
  // =====================================================

  function createBottomNavigation(active) {
    return `
      <nav class="bottom-nav">

        <button
          class="nav-item ${
            active === "home"
              ? "active"
              : ""
          }"
          data-nav="home"
        >
          <span>⌂</span>
          <small>الرئيسية</small>
        </button>

        <button
          class="nav-item ${
            active === "sales"
              ? "active"
              : ""
          }"
          data-nav="sales"
        >
          <span>📋</span>
          <small>المبيعات</small>
        </button>

        <button
          class="nav-item main-sale ${
            active === "sale"
              ? "active"
              : ""
          }"
          data-nav="sale"
        >
          <span>+</span>
          <small>بيع</small>
        </button>

        <button
          class="nav-item ${
            active === "products"
              ? "active"
              : ""
          }"
          data-nav="products"
        >
          <span>📦</span>
          <small>المنتجات</small>
        </button>

        <button
          class="nav-item ${
            active === "customers"
              ? "active"
              : ""
          }"
          data-nav="customers"
        >
          <span>👤</span>
          <small>العملاء</small>
        </button>

      </nav>
    `;
  }

  function setupNavigation() {
    document
      .querySelectorAll(
        "[data-nav]"
      )
      .forEach((button) => {
        button.onclick = () => {
          const page =
            button.dataset.nav;

          if (page === "home") {
            showDashboard();
          }

          if (page === "sales") {
            showSalesHistory();
          }

          if (page === "sale") {
            showSalesScreen();
          }

          if (page === "products") {
            showProducts();
          }

          if (page === "customers") {
            showCustomers();
          }
        };
      });
  }

  // =====================================================
  // لوحة التحكم
  // =====================================================

  function showDashboard() {
    const app =
      document.querySelector(
        ".app"
      );

    if (!app) return;

    const daily =
      ensureDailyData();

    const sales =
      getSales();

    const products =
      getProducts();

    const customers =
      getCustomers();

    const stockCount =
      products.reduce(
        (sum, product) =>
          sum +
          Number(
            product.stock || 0
          ),
        0
      );

    const allSalesTotal =
      sales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );

    app.innerHTML = `
      <div class="page">

        <div class="topbar">

          <div>
            <span class="kicker">
              نظام نقاط البيع
            </span>

            <h1>
              سوبر ماركت البرج
            </h1>
          </div>

          <button
            class="icon-button"
            id="refreshDashboard"
          >
            ↻
          </button>

        </div>

        <div class="hero">

          <div>

            <span class="hero-label">
              مبيعات اليوم
            </span>

            <h2>
              ${formatMoney(
                daily.salesTotal
              )}
            </h2>

            <p>
              ${
                daily.salesCount
              }
              فاتورة اليوم
            </p>

          </div>

          <div class="seal">
            AL<br>
            BURJ
          </div>

        </div>

        <div class="stats">

          <div class="stat">
            <span>
              مبيعات اليوم
            </span>

            <strong>
              ${formatMoney(
                daily.salesTotal
              )}
            </strong>

            <small>
              الليرة السورية
            </small>
          </div>

          <div class="stat">
            <span>
              فواتير اليوم
            </span>

            <strong>
              ${formatNumber(
                daily.salesCount
              )}
            </strong>

            <small>
              فاتورة
            </small>
          </div>

          <div class="stat">
            <span>
              المنتجات
            </span>

            <strong>
              ${formatNumber(
                products.length
              )}
            </strong>

            <small>
              صنف
            </small>
          </div>

          <div class="stat">
            <span>
              العملاء
            </span>

            <strong>
              ${formatNumber(
                customers.length
              )}
            </strong>

            <small>
              عميل
            </small>
          </div>

        </div>

        <div class="section">

          <div class="section-heading">
            <h3>
              العمليات السريعة
            </h3>
          </div>

          <div class="quickgrid">

            <button
              class="quick-card"
              id="newSaleButton"
            >
              <div class="quick-icon">
                🛒
              </div>

              <strong>
                بيع جديد
              </strong>

              <small>
                إنشاء فاتورة
              </small>
            </button>

            <button
              class="quick-card"
              id="salesButton"
            >
              <div class="quick-icon">
                📋
              </div>

              <strong>
                سجل المبيعات
              </strong>

              <small>
                عرض الفواتير
              </small>
            </button>

            <button
              class="quick-card"
              id="productsButton"
            >
              <div class="quick-icon">
                📦
              </div>

              <strong>
                المنتجات والمخزون
              </strong>

              <small>
                إضافة وتعديل وحذف
              </small>
            </button>

            <button
              class="quick-card"
              id="customersButton"
            >
              <div class="quick-icon">
                👤
              </div>

              <strong>
                العملاء
              </strong>

              <small>
                الحسابات والدفعات
              </small>
            </button>

          </div>

        </div>

        <div class="section">

          <div class="section-heading">

            <h3>
              الإدارة اليومية
            </h3>

          </div>

          <div class="form-card">

            <div class="two-columns">

              <button
                class="secondary-button"
                id="resetDaily"
              >
                🔄 تصفير حسابات اليوم
              </button>

              <button
                class="secondary-button"
                id="refreshData"
              >
                ↻ تحديث البيانات
              </button>

            </div>

            <p
              style="
                color:var(--muted);
                font-size:12px;
                margin-bottom:0;
              "
            >
              التصفير لا يحذف الفواتير أو العملاء
              أو المخزون.
            </p>

          </div>

        </div>

        <div class="section">

          <div class="section-heading">

            <h3>
              ملخص النظام
            </h3>

          </div>

          <div class="stats">

            <div class="stat">
              <span>
                إجمالي المبيعات
              </span>

              <strong>
                ${formatMoney(
                  allSalesTotal
                )}
              </strong>
            </div>

            <div class="stat">
              <span>
                عدد الفواتير
              </span>

              <strong>
                ${formatNumber(
                  sales.length
                )}
              </strong>
            </div>

            <div class="stat">
              <span>
                كمية المخزون
              </span>

              <strong>
                ${formatNumber(
                  stockCount
                )}
              </strong>

              <small>
                قطعة
              </small>
            </div>

            <div class="stat">
              <span>
                العملاء
              </span>

              <strong>
                ${formatNumber(
                  customers.length
                )}
              </strong>
            </div>

          </div>

        </div>

      </div>

      ${createBottomNavigation(
        "home"
      )}
    `;

    document
      .getElementById(
        "newSaleButton"
      )
      ?.addEventListener(
        "click",
        showSalesScreen
      );

    document
      .getElementById(
        "salesButton"
      )
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    document
      .getElementById(
        "productsButton"
      )
      ?.addEventListener(
        "click",
        showProducts
      );

    document
      .getElementById(
        "customersButton"
      )
      ?.addEventListener(
        "click",
        showCustomers
      );

    document
      .getElementById(
        "refreshDashboard"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById(
        "refreshData"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById(
        "resetDaily"
      )
      ?.addEventListener(
        "click",
        resetDailyAccounts
      );

    setupNavigation();
  }

  // =====================================================
  // تصفير الحسابات اليومية
  // =====================================================

  function resetDailyAccounts() {
    const answer =
      confirm(
        "هل تريد تصفير حسابات اليوم؟\n\n" +
        "سيتم تصفير إحصائيات اليوم فقط.\n" +
        "لن يتم حذف الفواتير أو العملاء أو المنتجات."
      );

    if (!answer) return;

    const data = {
      date: getDateKey(),
      salesTotal: 0,
      salesCount: 0,
      paymentsTotal: 0,
      resetAt:
        new Date().toISOString()
    };

    saveDailyData(data);

    alert(
      "تم تصفير الحسابات اليومية بنجاح."
    );

    showDashboard();
  }

  // =====================================================
  // شاشة البيع
  // =====================================================

  function showSalesScreen() {
    const app =
      document.querySelector(
        ".app"
      );

    if (!app) return;

    cart = [];

    const products =
      getProducts();

    const customers =
      getCustomers();

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backToDashboard"
          >
            ←
          </button>

          <div>
            <h1>
              بيع جديد
            </h1>
          </div>

        </div>

        <div class="form-card">

          <div class="form-group">

            <label>
              العميل
            </label>

            <select
              id="saleCustomer"
              class="form-select"
            >

              <option value="">
                عميل نقدي
              </option>

              ${customers
                .map(
                  (customer) => `
                    <option
                      value="${customer.id}"
                    >
                      ${escapeHTML(
                        customer.name
                      )}
                    </option>
                  `
                )
                .join("")}

            </select>

          </div>

          <div
            id="selectedCustomerInfo"
            class="mt"
          ></div>

        </div>

        <div class="form-card mt">

          <input
            id="productSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن منتج..."
          >

        </div>

        <div class="section">

          <div class="section-heading">

            <h3>
              المنتجات
            </h3>

            <span>
              ${products.length}
              منتج
            </span>

          </div>

          <div
            class="products-grid"
            id="productsGrid"
          >

            ${renderSaleProducts(
              products
            )}

          </div>

        </div>

        <div class="section">

          <div class="section-heading">

            <h3>
              السلة
            </h3>

            <span id="cartCount">
              0 منتج
            </span>

          </div>

          <div
            class="form-card"
            id="cartContainer"
          ></div>

          <div
            class="total-box"
          >

            <span>
              الإجمالي
            </span>

            <strong
              id="totalElement"
            >
              0 ${CURRENCY}
            </strong>

          </div>

          <div class="form-card mt">

            <div class="form-group">

              <label>
                نوع البيع
              </label>

              <select
                id="saleType"
                class="form-select"
              >

                <option value="cash">
                  نقدي
                </option>

                <option value="credit">
                  آجل
                </option>

              </select>

            </div>

            <div
              id="paidAmountBox"
              class="form-group mt"
              style="display:none;"
            >

              <label>
                المبلغ المدفوع
              </label>

              <input
                id="paidAmount"
                class="form-input"
                type="number"
                min="0"
                value="0"
                placeholder="0"
              >

            </div>

          </div>

          <div
            style="
              display:grid;
              gap:10px;
              margin-top:12px;
            "
          >

            <button
              class="primary-button"
              id="completeSale"
            >
              ✓ إتمام البيع وحفظ الفاتورة
            </button>

            <button
              class="secondary-button"
              id="clearCart"
            >
              مسح السلة
            </button>

          </div>

        </div>

      </div>

      ${createBottomNavigation(
        "sale"
      )}
    `;

    document
      .getElementById(
        "backToDashboard"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById(
        "productSearch"
      )
      ?.addEventListener(
        "input",
        filterSaleProducts
      );

    document
      .querySelectorAll(
        ".product-button"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const id =
              button.dataset.id;

            const product =
              getProducts().find(
                (item) =>
                  String(
                    item.id
                  ) === String(id)
              );

            if (product) {
              addToCart(product);
            }
          }
        );
      });

    document
      .getElementById(
        "saleCustomer"
      )
      ?.addEventListener(
        "change",
        updateSelectedCustomer
      );

    document
      .getElementById(
        "saleType"
      )
      ?.addEventListener(
        "change",
        updateSaleType
      );

    document
      .getElementById(
        "completeSale"
      )
      ?.addEventListener(
        "click",
        completeSale
      );

    document
      .getElementById(
        "clearCart"
      )
      ?.addEventListener(
        "click",
        () => {
          cart = [];
          renderCart();
        }
      );

    renderCart();

    setupNavigation();
  }

  function renderSaleProducts(
    products
  ) {
    return products
      .map(
        (product) => {

          const stock =
            Number(
              product.stock || 0
            );

          let stockClass =
            "stock-positive";

          if (stock === 0) {
            stockClass =
              "stock-empty";
          } else if (
            stock <= 5
          ) {
            stockClass =
              "stock-low";
          }

          return `
            <button
              class="product-button"
              data-id="${product.id}"
              data-name="${escapeHTML(
                product.name
              )}"
              ${
                stock <= 0
                  ? "disabled"
                  : ""
              }
            >

              <strong>
                ${escapeHTML(
                  product.name
                )}
              </strong>

              <small>
                ${formatMoney(
                  product.price
                )}
              </small>

              <small
                class="${stockClass}"
              >
                المخزون:
                ${formatNumber(
                  stock
                )}
              </small>

            </button>
          `;
        }
      )
      .join("");
  }

  function filterSaleProducts(
    event
  ) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    document
      .querySelectorAll(
        ".product-button"
      )
      .forEach((button) => {

        const name =
          button.dataset.name
            .toLowerCase();

        button.style.display =
          name.includes(search)
            ? ""
            : "none";
      });
  }

  // =====================================================
  // العميل أثناء البيع
  // =====================================================

  function updateSelectedCustomer() {
    const select =
      document.getElementById(
        "saleCustomer"
      );

    const box =
      document.getElementById(
        "selectedCustomerInfo"
      );

    if (!select || !box) return;

    const customerId =
      select.value;

    if (!customerId) {
      box.innerHTML = "";
      return;
    }

    const customer =
      getCustomers().find(
        (item) =>
          String(item.id) ===
          String(customerId)
      );

    if (!customer) {
      box.innerHTML = "";
      return;
    }

    const stats =
      getCustomerStats(
        customer.id
      );

    box.innerHTML = `
      <div class="customer-balance">

        <div class="balance-box">
          <span>
            مشتريات الشهر
          </span>

          <strong>
            ${formatMoney(
              stats.monthPurchases
            )}
          </strong>
        </div>

        <div class="balance-box">
          <span>
            المدفوع
          </span>

          <strong>
            ${formatMoney(
              stats.totalPaid
            )}
          </strong>
        </div>

        <div class="balance-box">
          <span>
            المتبقي
          </span>

          <strong>
            ${formatMoney(
              stats.balance
            )}
          </strong>
        </div>

      </div>
    `;
  }

  function updateSaleType() {
    const type =
      document.getElementById(
        "saleType"
      );

    const box =
      document.getElementById(
        "paidAmountBox"
      );

    if (!type || !box) return;

    box.style.display =
      type.value === "credit"
        ? "grid"
        : "none";
  }

  // =====================================================
  // السلة
  // =====================================================

  function addToCart(product) {
    const stock =
      Number(
        product.stock || 0
      );

    const existing =
      cart.find(
        (item) =>
          String(item.id) ===
          String(product.id)
      );

    if (
      existing &&
      existing.qty >= stock
    ) {
      alert(
        "لا توجد كمية كافية في المخزون."
      );

      return;
    }

    if (!existing) {
      if (stock <= 0) {
        alert(
          "هذا المنتج غير متوفر في المخزون."
        );

        return;
      }

      cart.push({
        id: product.id,
        name: product.name,
        price: Number(
          product.price
        ),
        qty: 1
      });
    } else {
      existing.qty += 1;
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

    const cartCount =
      document.getElementById(
        "cartCount"
      );

    if (!container) return;

    const total =
      getCartTotal();

    const count =
      cart.reduce(
        (sum, item) =>
          sum +
          Number(item.qty),
        0
      );

    if (cartCount) {
      cartCount.textContent =
        `${formatNumber(
          count
        )} منتج`;
    }

    if (totalElement) {
      totalElement.textContent =
        formatMoney(total);
    }

    if (!cart.length) {
      container.innerHTML = `
        <div class="empty-state">

          <span>
            🛒
          </span>

          <strong>
            السلة فارغة
          </strong>

          <small>
            اختر منتجًا لإضافته.
          </small>

        </div>
      `;

      return;
    }

    container.innerHTML =
      cart
        .map(
          (item, index) => `
            <div class="cart-item">

              <div>

                <strong>
                  ${escapeHTML(
                    item.name
                  )}
                </strong>

                <small>
                  ${formatMoney(
                    item.price
                  )}
                  ×
                  ${formatNumber(
                    item.qty
                  )}
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
                  ${formatNumber(
                    item.qty
                  )}
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
      .querySelectorAll(
        "[data-cart-action]"
      )
      .forEach((button) => {

        button.onclick = () => {

          const index =
            Number(
              button.dataset.index
            );

          const action =
            button.dataset
              .cartAction;

          if (
            action === "increase"
          ) {

            const product =
              getProducts().find(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    cart[index].id
                  )
              );

            if (
              product &&
              cart[index].qty <
                Number(
                  product.stock || 0
                )
            ) {
              cart[index].qty++;
            } else {
              alert(
                "لا توجد كمية إضافية في المخزون."
              );
            }
          }

          if (
            action === "decrease"
          ) {
            cart[index].qty--;

            if (
              cart[index].qty <= 0
            ) {
              cart.splice(
                index,
                1
              );
            }
          }

          if (
            action === "remove"
          ) {
            cart.splice(
              index,
              1
            );
          }

          renderCart();
        };
      });
  }

  function getCartTotal() {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.qty),
      0
    );
  }

  // =====================================================
  // إتمام البيع
  // =====================================================

  function completeSale() {
    if (!cart.length) {
      alert(
        "أضف منتجًا إلى السلة أولًا."
      );

      return;
    }

    const customerSelect =
      document.getElementById(
        "saleCustomer"
      );

    const saleType =
      document.getElementById(
        "saleType"
      );

    const paidInput =
      document.getElementById(
        "paidAmount"
      );

    const customerId =
      customerSelect?.value || "";

    const type =
      saleType?.value || "cash";

    const total =
      getCartTotal();

    let paid =
      type === "cash"
        ? total
        : Number(
            paidInput?.value || 0
          );

    if (paid < 0) {
      paid = 0;
    }

    if (paid > total) {
      paid = total;
    }

    if (
      type === "credit" &&
      !customerId
    ) {
      alert(
        "عند البيع الآجل يجب اختيار عميل."
      );

      return;
    }

    const products =
      getProducts();

    for (const item of cart) {

      const product =
        products.find(
          (p) =>
            String(p.id) ===
            String(item.id)
        );

      if (!product) {
        alert(
          `المنتج ${item.name} غير موجود.`
        );

        return;
      }

      if (
        Number(product.stock || 0) <
        Number(item.qty)
      ) {
        alert(
          `المخزون غير كافٍ للمنتج: ${item.name}`
        );

        return;
      }
    }

    const customer =
      customerId
        ? getCustomers().find(
            (c) =>
              String(c.id) ===
              String(customerId)
          )
        : null;

    const now =
      new Date();

    const sale = {
      id: generateId("sale"),

      invoiceNumber:
        generateInvoiceNumber(),

      createdAt:
        now.toISOString(),

      customerId:
        customer?.id || null,

      customerName:
        customer?.name ||
        "عميل نقدي",

      type:
        type,

      paymentMethod:
        type === "cash"
          ? "نقدي"
          : "آجل",

      total:
        total,

      paid:
        paid,

      remaining:
        Math.max(
          0,
          total - paid
        ),

      items:
        cart.map(
          (item) => ({
            id: item.id,
            name: item.name,
            price: Number(
              item.price
            ),
            qty: Number(
              item.qty
            ),
            subtotal:
              Number(
                item.price
              ) *
              Number(
                item.qty
              )
          })
        )
    };

    // خصم المخزون
    cart.forEach(
      (item) => {

        const product =
          products.find(
            (p) =>
              String(p.id) ===
              String(item.id)
          );

        if (product) {
          product.stock =
            Number(
              product.stock || 0
            ) -
            Number(
              item.qty
            );
        }
      }
    );

    saveProducts(
      products
    );

    const sales =
      getSales();

    sales.push(
      sale
    );

    saveSales(
      sales
    );

    // تحديث حساب اليوم
    const daily =
      ensureDailyData();

    daily.salesTotal +=
      total;

    daily.salesCount +=
      1;

    daily.paymentsTotal +=
      paid;

    saveDailyData(
      daily
    );

    cart = [];

    showInvoice(
      sale
    );
  }

  // =====================================================
  // الفاتورة
  // =====================================================

  function showInvoice(
    sale
  ) {
    const app =
      document.querySelector(
        ".app"
      );

    if (!app) return;

    app.innerHTML = `
      <div class="page">

        <div class="invoice">

          <div class="invoice-header">

            <h1>
              سوبر ماركت البرج
            </h1>

            <strong>
              فاتورة بيع
            </strong>

            <p>
              العملة: الليرة السورية
            </p>

          </div>

          <div class="invoice-meta">

            <div>
              <strong>
                رقم الفاتورة:
              </strong>

              ${escapeHTML(
                sale.invoiceNumber
              )}
            </div>

            <div>
              <strong>
                التاريخ:
              </strong>

              ${formatDate(
                sale.createdAt
              )}
            </div>

            <div>
              <strong>
                الوقت:
              </strong>

              ${formatTime(
                sale.createdAt
              )}
            </div>

            <div>
              <strong>
                العميل:
              </strong>

              ${escapeHTML(
                sale.customerName ||
                "عميل نقدي"
              )}
            </div>

            <div>
              <strong>
                طريقة الدفع:
              </strong>

              ${escapeHTML(
                sale.paymentMethod
              )}
            </div>

          </div>

          <table class="invoice-table">

            <thead>
              <tr>
                <th>
                  المنتج
                </th>

                <th>
                  الكمية
                </th>

                <th>
                  السعر
                </th>

                <th>
                  المجموع
                </th>
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
                        ${formatNumber(
                          item.qty
                        )}
                      </td>

                      <td>
                        ${formatMoney(
                          item.price
                        )}
                      </td>

                      <td>
                        ${formatMoney(
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

            <span>
              الإجمالي
            </span>

            <h2>
              ${formatMoney(
                sale.total
              )}
            </h2>

          </div>

          ${
            sale.type === "credit"
              ? `
                <div class="customer-balance">

                  <div class="balance-box">
                    <span>
                      المدفوع
                    </span>

                    <strong>
                      ${formatMoney(
                        sale.paid
                      )}
                    </strong>
                  </div>

                  <div class="balance-box">
                    <span>
                      المتبقي
                    </span>

                    <strong>
                      ${formatMoney(
                        sale.remaining
                      )}
                    </strong>
                  </div>

                </div>
              `
              : ""
          }

          <div
            class="no-print"
            style="
              display:grid;
              gap:10px;
              margin-top:18px;
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
              id="goToSales"
            >
              📋 سجل المبيعات
            </button>

            <button
              class="secondary-button"
              id="newSaleAfterInvoice"
            >
              🛒 بيع جديد
            </button>

            <button
              class="secondary-button"
              id="backHomeAfterInvoice"
            >
              🏠 لوحة التحكم
            </button>

          </div>

        </div>

      </div>
    `;

    document
      .getElementById(
        "printInvoice"
      )
      ?.addEventListener(
        "click",
        () => window.print()
      );

    document
      .getElementById(
        "goToSales"
      )
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    document
      .getElementById(
        "newSaleAfterInvoice"
      )
      ?.addEventListener(
        "click",
        showSalesScreen
      );

    document
      .getElementById(
        "backHomeAfterInvoice"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );
  }

  // =====================================================
  // سجل المبيعات
  // =====================================================

  function showSalesHistory() {
    const app =
      document.querySelector(
        ".app"
      );

    if (!app) return;

    const sales =
      getSales();

    const total =
      sales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backFromSales"
          >
            ←
          </button>

          <div>
            <h1>
              سجل المبيعات
            </h1>
          </div>

        </div>

        <div class="form-card">

          <input
            id="salesSearch"
            class="search-input"
            type="search"
            placeholder="🔎 رقم الفاتورة أو اسم العميل أو المنتج..."
          >

        </div>

        <div class="stats mt">

          <div class="stat">
            <span>
              الفواتير
            </span>

            <strong>
              ${formatNumber(
                sales.length
              )}
            </strong>
          </div>

          <div class="stat">
            <span>
              إجمالي المبيعات
            </span>

            <strong>
              ${formatMoney(
                total
              )}
            </strong>
          </div>

        </div>

        <div class="section">

          <div
            id="salesList"
            class="activity-list"
          >
            ${renderSalesList(
              sales
            )}
          </div>

        </div>

      </div>

      ${createBottomNavigation(
        "sales"
      )}
    `;

    document
      .getElementById(
        "backFromSales"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById(
        "salesSearch"
      )
      ?.addEventListener(
        "input",
        searchSales
      );

    bindInvoiceButtons();

    setupNavigation();
  }

  function renderSalesList(
    sales
  ) {
    if (!sales.length) {
      return `
        <div class="empty-state">

          <span>
            🧾
          </span>

          <strong>
            لا توجد فواتير
          </strong>

          <small>
            ستظهر المبيعات هنا بعد إتمام البيع.
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
          >

            <div>

              <strong>
                ${escapeHTML(
                  sale.invoiceNumber
                )}
              </strong>

              <small>
                ${escapeHTML(
                  sale.customerName ||
                  "عميل نقدي"
                )}
              </small>

              <small>
                ${formatDate(
                  sale.createdAt
                )}
                -
                ${formatTime(
                  sale.createdAt
                )}
              </small>

              <small>
                ${escapeHTML(
                  sale.paymentMethod ||
                  "نقدي"
                )}
              </small>

            </div>

            <div class="sale-total">
              ${formatMoney(
                sale.total
              )}
            </div>

          </button>
        `
      )
      .join("");
  }

  function bindInvoiceButtons() {
    document
      .querySelectorAll(
        "[data-open-invoice]"
      )
      .forEach((button) => {

        button.onclick = () => {

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
            showInvoice(
              sale
            );
          }
        };
      });
  }

  function searchSales(event) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    const filtered =
      getSales().filter(
        (sale) => {

          const invoice =
            String(
              sale.invoiceNumber
            ).toLowerCase();

          const customer =
            String(
              sale.customerName
            ).toLowerCase();

          const items =
            sale.items
              .map(
                (item) =>
                  item.name
              )
              .join(" ")
              .toLowerCase();

          return (
            invoice.includes(
              search
            ) ||
            customer.includes(
              search
            ) ||
            items.includes(
              search
            )
          );
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

      bindInvoiceButtons();
    }
  }

  // =====================================================
  // المنتجات والمخزون
  // =====================================================

  function showProducts() {
    const app =
      document.querySelector(
        ".app"
      );

    if (!app) return;

    const products =
      getProducts();

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backProducts"
          >
            ←
          </button>

          <div>
            <h1>
              المنتجات والمخزون
            </h1>
          </div>

        </div>

        <div class="form-card">

          <input
            id="productManagementSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن منتج..."
          >

          <button
            class="primary-button"
            id="addProductButton"
            style="
              width:100%;
              margin-top:10px;
            "
          >
            + إضافة منتج جديد
          </button>

        </div>

        <div class="section">

          <div
            class="section-heading"
          >
            <h3>
              المنتجات
            </h3>

            <span>
              ${formatNumber(
                products.length
              )}
              منتج
            </span>
          </div>

          <div
            id="productsList"
            class="activity-list"
          >
            ${renderProductsList(
              products
            )}
          </div>

        </div>

      </div>

      ${createBottomNavigation(
        "products"
      )}
    `;

    document
      .getElementById(
        "backProducts"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById(
        "addProductButton"
      )
      ?.addEventListener(
        "click",
        () =>
          openProductModal()
      );

    document
      .getElementById(
        "productManagementSearch"
      )
      ?.addEventListener(
        "input",
        searchManagedProducts
      );

    bindProductActions();

    setupNavigation();
  }

  function renderProductsList(
    products
  ) {
    if (!products.length) {
      return `
        <div class="empty-state">
          <span>📦</span>
          <strong>
            لا توجد منتجات
          </strong>
          <small>
            أضف أول منتج من الزر أعلاه.
          </small>
        </div>
      `;
    }

    return products
      .map(
        (product) => {

          const stock =
            Number(
              product.stock || 0
            );

          let stockClass =
            "stock-positive";

          if (stock === 0) {
            stockClass =
              "stock-empty";
          } else if (
            stock <= 5
          ) {
            stockClass =
              "stock-low";
          }

          return `
            <div class="stock-card">

              <div>

                <strong>
                  ${escapeHTML(
                    product.name
                  )}
                </strong>

                <small>
                  السعر:
                  ${formatMoney(
                    product.price
                  )}
                </small>

                <small
                  class="${stockClass}"
                >
                  المخزون:
                  ${formatNumber(
                    stock
                  )}
                </small>

              </div>

              <div
                class="actions"
              >

                <button
                  class="secondary-button"
                  data-product-action="increase"
                  data-id="${product.id}"
                >
                  + مخزون
                </button>

                <button
                  class="secondary-button"
                  data-product-action="edit"
                  data-id="${product.id}"
                >
                  ✏️ تعديل
                </button>

                <button
                  class="danger-button"
                  data-product-action="delete"
                  data-id="${product.id}"
                >
                  🗑️ حذف
                </button>

              </div>

            </div>
          `;
        }
      )
      .join("");
  }

  function bindProductActions() {
    document
      .querySelectorAll(
        "[data-product-action]"
      )
      .forEach((button) => {

        button.onclick = () => {

          const id =
            button.dataset.id;

          const action =
            button.dataset
              .productAction;

          const products =
            getProducts();

          const product =
            products.find(
              (item) =>
                String(item.id) ===
                String(id)
            );

          if (!product) return;

          if (
            action === "edit"
          ) {
            openProductModal(
              product
            );
          }

          if (
            action === "delete"
          ) {

            const yes =
              confirm(
                `هل تريد حذف المنتج "${product.name}"؟`
              );

            if (!yes) return;

            const updated =
              products.filter(
                (item) =>
                  String(
                    item.id
                  ) !== String(id)
              );

            saveProducts(
              updated
            );

            showProducts();
          }

          if (
            action === "increase"
          ) {

            const amount =
              prompt(
                "كمية المخزون التي تريد إضافتها؟",
                "1"
              );

            if (
              amount === null
            ) {
              return;
            }

            const value =
              Number(amount);

            if (
              !Number.isFinite(
                value
              ) ||
              value <= 0
            ) {
              alert(
                "أدخل كمية صحيحة."
              );

              return;
            }

            product.stock =
              Number(
                product.stock || 0
              ) + value;

            saveProducts(
              products
            );

            showProducts();
          }
        };
      });
  }

  function searchManagedProducts(
    event
  ) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    const filtered =
      getProducts().filter(
        (product) =>
          String(
            product.name
          )
            .toLowerCase()
            .includes(search)
      );

    const list =
      document.getElementById(
        "productsList"
      );

    if (list) {
      list.innerHTML =
        renderProductsList(
          filtered
        );

      bindProductActions();
    }
  }

  // =====================================================
  // نافذة إضافة / تعديل منتج
  // =====================================================

  function openProductModal(
    product = null
  ) {
    const editing =
      Boolean(product);

    const modal =
      document.createElement(
        "div"
      );

    modal.className =
      "modal";

    modal.innerHTML = `
      <div class="modal-card">

        <div class="modal-header">

          <h2>
            ${
              editing
                ? "تعديل المنتج"
                : "إضافة منتج"
            }
          </h2>

          <button
            class="back-button"
            id="closeProductModal"
          >
            ×
          </button>

        </div>

        <div class="form-grid">

          <div class="form-group full">

            <label>
              اسم المنتج
            </label>

            <input
              id="productName"
              class="form-input"
              value="${escapeHTML(
                product?.name || ""
              )}"
              placeholder="مثال: عصير برتقال"
            >

          </div>

          <div class="form-group">

            <label>
              السعر
            </label>

            <input
              id="productPrice"
              class="form-input"
              type="number"
              min="0"
              value="${
                product?.price ?? ""
              }"
            >

          </div>

          <div class="form-group">

            <label>
              المخزون
            </label>

            <input
              id="productStock"
              class="form-input"
              type="number"
              min="0"
              value="${
                product?.stock ?? 0
              }"
            >

          </div>

        </div>

        <button
          class="primary-button"
          id="saveProduct"
          style="
            width:100%;
            margin-top:15px;
          "
        >
          💾 حفظ المنتج
        </button>

      </div>
    `;

    document.body.appendChild(
      modal
    );

    document
      .getElementById(
        "closeProductModal"
      )
      ?.addEventListener(
        "click",
        () =>
          modal.remove()
      );

    document
      .getElementById(
        "saveProduct"
      )
      ?.addEventListener(
        "click",
        () => {

          const name =
            document
              .getElementById(
                "productName"
              )
              .value.trim();

          const price =
            Number(
              document
                .getElementById(
                  "productPrice"
                )
                .value
            );

          const stock =
            Number(
              document
                .getElementById(
                  "productStock"
                )
                .value
            );

          if (!name) {
            alert(
              "اكتب اسم المنتج."
            );

            return;
          }

          if (
            !Number.isFinite(
              price
            ) ||
            price < 0
          ) {
            alert(
              "أدخل سعرًا صحيحًا."
            );

            return;
          }

          if (
            !Number.isFinite(
              stock
            ) ||
            stock < 0
          ) {
            alert(
              "أدخل كمية مخزون صحيحة."
            );

            return;
          }

          const products =
            getProducts();

          if (editing) {

            const index =
              products.findIndex(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    product.id
                  )
              );

            if (index !== -1) {

              products[index] = {
                ...products[index],
                name,
                price,
                stock
              };

            }

          } else {

            products.push({
              id:
                generateId(
                  "product"
                ),

              name,

              price,

              stock
            });

          }

          saveProducts(
            products
          );

          modal.remove();

          showProducts();
        }
      );
  }

  // =====================================================
  // العملاء
  // =====================================================

  function showCustomers() {
    const app =
      document.querySelector(
        ".app"
      );

    if (!app) return;

    const customers =
      getCustomers();

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backCustomers"
          >
            ←
          </button>

          <div>
            <h1>
              العملاء
            </h1>
          </div>

        </div>

        <div class="form-card">

          <input
            id="customerSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن عميل..."
          >

          <button
            class="primary-button"
            id="addCustomerButton"
            style="
              width:100%;
              margin-top:10px;
            "
          >
            + إضافة عميل جديد
          </button>

        </div>

        <div
          class="section"
          id="customersList"
        >
          ${renderCustomersList(
            customers
          )}
        </div>

      </div>

      ${createBottomNavigation(
        "customers"
      )}
    `;

    document
      .getElementById(
        "backCustomers"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById(
        "addCustomerButton"
      )
      ?.addEventListener(
        "click",
        () =>
          openCustomerModal()
      );

    document
      .getElementById(
        "customerSearch"
      )
      ?.addEventListener(
        "input",
        searchCustomers
      );

    bindCustomerActions();

    setupNavigation();
  }

  function renderCustomersList(
    customers
  ) {
    if (!customers.length) {
      return `
        <div class="empty-state">

          <span>
            👤
          </span>

          <strong>
            لا يوجد عملاء
          </strong>

          <small>
            أضف أول عميل للبدء.
          </small>

        </div>
      `;
    }

    return `
      <div class="activity-list">

        ${customers
          .map(
            (customer) => {

              const stats =
                getCustomerStats(
                  customer.id
                );

              return `
                <div class="customer-card">

                  <div>

                    <strong>
                      ${escapeHTML(
                        customer.name
                      )}
                    </strong>

                    ${
                      customer.phone
                        ? `
                          <small>
                            📞
                            ${escapeHTML(
                              customer.phone
                            )}
                          </small>
                        `
                        : ""
                    }

                    <small>
                      مشتريات الشهر:
                      ${formatMoney(
                        stats.monthPurchases
                      )}
                    </small>

                    <small>
                      المتبقي:
                      ${formatMoney(
                        stats.balance
                      )}
                    </small>

                  </div>

                  <div class="actions">

                    <button
                      class="primary-button"
                      data-customer-action="view"
                      data-id="${customer.id}"
                    >
                      👁️ الحساب
                    </button>

                    <button
                      class="secondary-button"
                      data-customer-action="edit"
                      data-id="${customer.id}"
                    >
                      ✏️ تعديل
                    </button>

                    <button
                      class="danger-button"
                      data-customer-action="delete"
                      data-id="${customer.id}"
                    >
                      🗑️ حذف
                    </button>

                  </div>

                </div>
              `;
            }
          )
          .join("")}

      </div>
    `;
  }

  function bindCustomerActions() {
    document
      .querySelectorAll(
        "[data-customer-action]"
      )
      .forEach((button) => {

        button.onclick = () => {

          const id =
            button.dataset.id;

          const action =
            button.dataset
              .customerAction;

          const customers =
            getCustomers();

          const customer =
            customers.find(
              (item) =>
                String(
                  item.id
                ) ===
                String(id)
            );

          if (!customer) return;

          if (
            action === "view"
          ) {
            showCustomerAccount(
              customer
            );
          }

          if (
            action === "edit"
          ) {
            openCustomerModal(
              customer
            );
          }

          if (
            action === "delete"
          ) {

            const yes =
              confirm(
                `هل تريد حذف العميل "${customer.name}"؟\n\nلن يتم حذف فواتيره السابقة.`
              );

            if (!yes) return;

            const updated =
              customers.filter(
                (item) =>
                  String(
                    item.id
                  ) !==
                  String(id)
              );

            saveCustomers(
              updated
            );

            showCustomers();
          }
        };
      });
  }

  function searchCustomers(
    event
  ) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    const filtered =
      getCustomers().filter(
        (customer) =>
          String(
            customer.name
          )
            .toLowerCase()
            .includes(search) ||
          String(
            customer.phone || ""
          )
            .toLowerCase()
            .includes(search)
      );

    const list =
      document.getElementById(
        "customersList"
      );

    if (list) {
      list.innerHTML =
        renderCustomersList(
          filtered
        );

      bindCustomerActions();
    }
  }

  // =====================================================
  // إضافة / تعديل عميل
  // =====================================================

  function openCustomerModal(
    customer = null
  ) {
    const editing =
      Boolean(customer);

    const modal =
      document.createElement(
        "div"
      );

    modal.className =
      "modal";

    modal.innerHTML = `
      <div class="modal-card">

        <div class="modal-header">

          <h2>
            ${
              editing
                ? "تعديل العميل"
                : "إضافة عميل"
            }
          </h2>

          <button
            class="back-button"
            id="closeCustomerModal"
          >
            ×
          </button>

        </div>

        <div class="form-grid">

          <div class="form-group full">

            <label>
              اسم العميل
            </label>

            <input
              id="customerName"
              class="form-input"
              value="${escapeHTML(
                customer?.name || ""
              )}"
              placeholder="مثال: أحمد محمد"
            >

          </div>

          <div class="form-group">

            <label>
              رقم الهاتف
            </label>

            <input
              id="customerPhone"
              class="form-input"
              value="${escapeHTML(
                customer?.phone || ""
              )}"
              placeholder="اختياري"
            >

          </div>

          <div class="form-group">

            <label>
              العنوان
            </label>

            <input
              id="customerAddress"
              class="form-input"
              value="${escapeHTML(
                customer?.address || ""
              )}"
              placeholder="اختياري"
            >

          </div>

        </div>

        <button
          class="primary-button"
          id="saveCustomer"
          style="
            width:100%;
            margin-top:15px;
          "
        >
          💾 حفظ العميل
        </button>

      </div>
    `;

    document.body.appendChild(
      modal
    );

    document
      .getElementById(
        "closeCustomerModal"
      )
      ?.addEventListener(
        "click",
        () =>
          modal.remove()
      );

    document
      .getElementById(
        "saveCustomer"
      )
      ?.addEventListener(
        "click",
        () => {

          const name =
            document
              .getElementById(
                "customerName"
              )
              .value.trim();

          const phone =
            document
              .getElementById(
                "customerPhone"
              )
              .value.trim();

          const address =
            document
              .getElementById(
                "customerAddress"
              )
              .value.trim();

          if (!name) {
            alert(
              "اكتب اسم العميل."
            );

            return;
          }

          const customers =
            getCustomers();

          if (editing) {

            const index =
              customers.findIndex(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    customer.id
                  )
              );

            if (index !== -1) {

              customers[index] = {
                ...customers[index],
                name,
                phone,
                address
              };

            }

          } else {

            customers.push({
              id:
                generateId(
                  "customer"
                ),

              name,

              phone,

              address,

              createdAt:
                new Date().toISOString()
            });

          }

          saveCustomers(
            customers
          );

          modal.remove();

          showCustomers();
        }
      );
  }

  // =====================================================
  // حساب العميل
  // =====================================================

  function getCustomerStats(
    customerId
  ) {
    const sales =
      getSales().filter(
        (sale) =>
          String(
            sale.customerId
          ) ===
          String(customerId)
      );

    const now =
      new Date();

    const month =
      now.getMonth();

    const year =
      now.getFullYear();

    const monthSales =
      sales.filter(
        (sale) => {

          const date =
            new Date(
              sale.createdAt
            );

          return (
            date.getMonth() ===
              month &&
            date.getFullYear() ===
              year
          );
        }
      );

    const monthPurchases =
      monthSales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );

    const totalPurchases =
      sales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.total || 0
          ),
        0
      );

    const totalPaid =
      sales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.paid || 0
          ),
        0
      );

    const balance =
      sales.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.remaining || 0
          ),
        0
      );

    return {
      sales,
      monthSales,
      monthPurchases,
      totalPurchases,
      totalPaid,
      balance
    };
  }

  // =====================================================
  // حساب العميل بالتفصيل
  // =====================================================

  function showCustomerAccount(
    customer
  ) {
    const app =
      document.querySelector(
        ".app"
      );

    if (!app) return;

    const stats =
      getCustomerStats(
        customer.id
      );

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backCustomerAccount"
          >
            ←
          </button>

          <div>

            <span class="kicker">
              حساب العميل
            </span>

            <h1>
              ${escapeHTML(
                customer.name
              )}
            </h1>

          </div>

        </div>

        <div class="stats">

          <div class="stat">

            <span>
              مشتريات الشهر
            </span>

            <strong>
              ${formatMoney(
                stats.monthPurchases
              )}
            </strong>

          </div>

          <div class="stat">

            <span>
              إجمالي المشتريات
            </span>

            <strong>
              ${formatMoney(
                stats.totalPurchases
              )}
            </strong>

          </div>

          <div class="stat">

            <span>
              المدفوع
            </span>

            <strong>
              ${formatMoney(
                stats.totalPaid
              )}
            </strong>

          </div>

          <div class="stat">

            <span>
              المتبقي
            </span>

            <strong>
              ${formatMoney(
                stats.balance
              )}
            </strong>

          </div>

        </div>

        <div class="form-card">

          ${
            customer.phone
              ? `
                <p>
                  📞
                  ${escapeHTML(
                    customer.phone
                  )}
                </p>
              `
              : ""
          }

          ${
            customer.address
              ? `
                <p>
                  📍
                  ${escapeHTML(
                    customer.address
                  )}
                </p>
              `
              : ""
          }

          <button
            class="primary-button"
            id="addCustomerPayment"
            style="width:100%;"
          >
            💵 تسجيل دفعة
          </button>

        </div>

        <div class="section">

          <div class="section-heading">

            <h3>
              فواتير العميل
            </h3>

            <span>
              ${formatNumber(
                stats.sales.length
              )}
              فاتورة
            </span>

          </div>

          <div
            class="activity-list"
          >

            ${
              stats.sales.length
                ? stats.sales
                    .slice()
                    .reverse()
                    .map(
                      (sale) => `
                        <button
                          class="sale-card"
                          data-customer-invoice="${escapeHTML(
                            sale.invoiceNumber
                          )}"
                        >

                          <div>

                            <strong>
                              ${escapeHTML(
                                sale.invoiceNumber
                              )}
                            </strong>

                            <small>
                              ${formatDate(
                                sale.createdAt
                              )}
                              -
                              ${formatTime(
                                sale.createdAt
                              )}
                            </small>

                          </div>

                          <div class="sale-total">
                            ${formatMoney(
                              sale.total
                            )}
                          </div>

                        </button>
                      `
                    )
                    .join("")
                : `
                    <div class="empty-state">
                      <span>🧾</span>
                      <strong>
                        لا توجد فواتير
                      </strong>
                    </div>
                  `
            }

          </div>

        </div>

      </div>

      ${createBottomNavigation(
        "customers"
      )}
    `;

    document
      .getElementById(
        "backCustomerAccount"
      )
      ?.addEventListener(
        "click",
        showCustomers
      );

    document
      .getElementById(
        "addCustomerPayment"
      )
      ?.addEventListener(
        "click",
        () =>
          addCustomerPayment(
            customer.id
          )
      );

    document
      .querySelectorAll(
        "[data-customer-invoice]"
      )
      .forEach((button) => {

        button.onclick = () => {

          const invoice =
            button.dataset
              .customerInvoice;

          const sale =
            getSales().find(
              (item) =>
                item.invoiceNumber ===
                invoice
            );

          if (sale) {
            showInvoice(
              sale
            );
          }
        };
      });

    setupNavigation();
  }

  // =====================================================
  // تسجيل دفعة للعميل
  // =====================================================

  function addCustomerPayment(
    customerId
  ) {
    const stats =
      getCustomerStats(
        customerId
      );

    if (
      stats.balance <= 0
    ) {
      alert(
        "لا يوجد مبلغ متبقٍ على هذا العميل."
      );

      return;
    }

    const input =
      prompt(
        "أدخل قيمة الدفعة:",
        String(
          stats.balance
        )
      );

    if (input === null) {
      return;
    }

    const amount =
      Number(input);

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      alert(
        "أدخل مبلغًا صحيحًا."
      );

      return;
    }

    const payment =
      Math.min(
        amount,
        stats.balance
      );

    const sales =
      getSales();

    let remainingPayment =
      payment;

    // تسديد أقدم الديون أولًا
    const customerSales =
      sales
        .filter(
          (sale) =>
            String(
              sale.customerId
            ) ===
            String(
              customerId
            ) &&
            Number(
              sale.remaining || 0
            ) > 0
        )
        .sort(
          (a, b) =>
            new Date(
              a.createdAt
            ) -
            new Date(
              b.createdAt
            )
        );

    for (
      const sale
      of customerSales
    ) {

      if (
        remainingPayment <=
        0
      ) {
        break;
      }

      const due =
        Number(
          sale.remaining || 0
        );

      const pay =
        Math.min(
          due,
          remainingPayment
        );

      sale.paid =
        Number(
          sale.paid || 0
        ) + pay;

      sale.remaining =
        Math.max(
          0,
          due - pay
        );

      remainingPayment -=
        pay;
    }

    saveSales(
      sales
    );

    const daily =
      ensureDailyData();

    daily.paymentsTotal +=
      payment;

    saveDailyData(
      daily
    );

    alert(
      `تم تسجيل دفعة ${formatMoney(
        payment
      )}.`
    );

    const updatedCustomer =
      getCustomers().find(
        (item) =>
          String(item.id) ===
          String(customerId)
      );

    if (
      updatedCustomer
    ) {
      showCustomerAccount(
        updatedCustomer
      );
    } else {
      showCustomers();
    }
  }

  // =====================================================
  // بدء النظام
  // =====================================================

  ensureDailyData();

  showDashboard();
/* =========================================
   المنتجات والمخزون
========================================= */

function showProducts() {
  const app = getApp();

  if (!app) return;

  const products = getProducts();

  const totalStock = products.reduce(
    (sum, product) =>
      sum + number(product.stock),
    0
  );

  const lowStock = products.filter(
    product =>
      number(product.stock) <=
      number(product.minStock)
  ).length;

  app.innerHTML = `
    <div class="page">

      <div class="page-header">

        <button
          class="back-button"
          id="backProducts"
        >
          ←
        </button>

        <div>
          <h1>المنتجات والمخزون</h1>
        </div>

      </div>

      <section class="stats">

        <div class="stat">
          <span>عدد المنتجات</span>
          <strong>${products.length}</strong>
          <small>منتج</small>
        </div>

        <div class="stat">
          <span>إجمالي المخزون</span>
          <strong>${totalStock}</strong>
          <small>قطعة</small>
        </div>

        <div class="stat">
          <span>مخزون منخفض</span>
          <strong>${lowStock}</strong>
          <small>منتج</small>
        </div>

        <div class="stat">
          <span>حالة المخزون</span>
          <strong>
            ${lowStock === 0 ? "جيد" : "تنبيه"}
          </strong>
          <small>
            ${lowStock === 0
              ? "كل شيء جيد"
              : "راجع المنتجات"}
          </small>
        </div>

      </section>

      <section class="section">

        <div class="section-heading">
          <h3>إدارة المنتجات</h3>

          <button
            class="primary-button"
            id="addProductButton"
            style="
              min-height:42px;
              padding:8px 14px;
            "
          >
            ＋ منتج جديد
          </button>
        </div>

        <div class="form-card">

          <input
            id="productManagementSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن اسم المنتج..."
          >

        </div>

      </section>

      <section class="section">

        <div
          id="productsManagementList"
          class="activity-list"
        >

          ${renderProductsManagement(products)}

        </div>

      </section>

    </div>

    ${createBottomNavigation("products")}
  `;

  document
    .getElementById("backProducts")
    ?.addEventListener(
      "click",
      showDashboard
    );

  document
    .getElementById("addProductButton")
    ?.addEventListener(
      "click",
      () => showProductForm()
    );

  document
    .getElementById(
      "productManagementSearch"
    )
    ?.addEventListener(
      "input",
      searchProductsManagement
    );

  bindProductActions();

  setupNavigation();
}


/* =========================================
   عرض المنتجات
========================================= */

function renderProductsManagement(
  products
) {

  if (!products.length) {
    return `
      <div class="empty-state">

        <span>📦</span>

        <strong>
          لا توجد منتجات
        </strong>

        <small>
          أضف أول منتج إلى المخزون.
        </small>

      </div>
    `;
  }

  return products
    .map(product => {

      const stock =
        number(product.stock);

      const minStock =
        number(product.minStock);

      const low =
        stock <= minStock;

      return `
        <div
          class="inventory-card"
          data-product-card="${product.id}"
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              align-items:flex-start;
              gap:15px;
            "
          >

            <div class="customer-info">

              <strong class="customer-name">
                ${escapeHtml(product.name)}
              </strong>

              <small>
                السعر:
                ${money(product.price)}
              </small>

              <small>
                الحد الأدنى:
                ${minStock}
              </small>

            </div>

            <div
              style="
                text-align:left;
              "
            >

              <strong
                class="${
                  low
                    ? "remaining-amount"
                    : "paid-amount"
                }"
                style="
                  display:block;
                  font-size:18px;
                "
              >
                ${stock}
              </strong>

              <small
                style="
                  color:var(--muted);
                  font-size:10px;
                "
              >
                قطعة بالمخزون
              </small>

              <div
                style="
                  margin-top:6px;
                "
              >
                ${
                  low
                    ? `
                      <span class="badge badge-danger">
                        مخزون منخفض
                      </span>
                    `
                    : `
                      <span class="badge badge-success">
                        متوفر
                      </span>
                    `
                }
              </div>

            </div>

          </div>

          <div
            style="
              display:grid;
              grid-template-columns:
                repeat(3,1fr);
              gap:7px;
              margin-top:15px;
            "
          >

            <button
              class="secondary-button"
              data-product-edit="${product.id}"
              style="
                min-height:40px;
                padding:7px;
              "
            >
              ✎ تعديل
            </button>

            <button
              class="warning-button"
              data-product-stock="${product.id}"
              style="
                min-height:40px;
                padding:7px;
              "
            >
              ＋ جرد
            </button>

            <button
              class="danger-button"
              data-product-delete="${product.id}"
              style="
                min-height:40px;
                padding:7px;
              "
            >
              حذف
            </button>

          </div>

        </div>
      `;
    })
    .join("");
}


/* =========================================
   نموذج إضافة / تعديل منتج
========================================= */

function showProductForm(productId = null) {

  const app = getApp();

  if (!app) return;

  const products = getProducts();

  const product =
    productId !== null
      ? products.find(
          item =>
            String(item.id) ===
            String(productId)
        )
      : null;

  const editing = Boolean(product);

  app.innerHTML = `
    <div class="page">

      <div class="page-header">

        <button
          class="back-button"
          id="backProductForm"
        >
          ←
        </button>

        <div>
          <h1>
            ${editing
              ? "تعديل المنتج"
              : "إضافة منتج جديد"}
          </h1>
        </div>

      </div>

      <section class="form-card">

        <form id="productForm">

          <div class="form-grid">

            <div class="form-group full">

              <label>
                اسم المنتج
              </label>

              <input
                id="productName"
                class="form-input"
                type="text"
                required
                value="${
                  editing
                    ? escapeHtml(product.name)
                    : ""
                }"
                placeholder="مثال: عصير برتقال"
              >

            </div>

            <div class="form-group">

              <label>
                سعر البيع
              </label>

              <input
                id="productPrice"
                class="form-input"
                type="number"
                min="0"
                step="1"
                required
                value="${
                  editing
                    ? number(product.price)
                    : ""
                }"
                placeholder="5000"
              >

            </div>

            <div class="form-group">

              <label>
                كمية المخزون
              </label>

              <input
                id="productStock"
                class="form-input"
                type="number"
                min="0"
                step="1"
                required
                value="${
                  editing
                    ? number(product.stock)
                    : ""
                }"
                placeholder="20"
              >

            </div>

            <div class="form-group">

              <label>
                حد التنبيه للمخزون
              </label>

              <input
                id="productMinStock"
                class="form-input"
                type="number"
                min="0"
                step="1"
                value="${
                  editing
                    ? number(product.minStock)
                    : 5
                }"
                placeholder="5"
              >

            </div>

          </div>

          <div
            style="
              display:grid;
              gap:10px;
              margin-top:18px;
            "
          >

            <button
              class="primary-button"
              type="submit"
            >
              ${
                editing
                  ? "✓ حفظ التعديلات"
                  : "＋ إضافة المنتج"
              }
            </button>

            ${
              editing
                ? `
                  <button
                    class="danger-button"
                    type="button"
                    id="deleteProductFromForm"
                  >
                    حذف المنتج
                  </button>
                `
                : ""
            }

          </div>

        </form>

      </section>

    </div>

    ${createBottomNavigation("products")}
  `;

  document
    .getElementById("backProductForm")
    ?.addEventListener(
      "click",
      showProducts
    );

  document
    .getElementById("productForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        saveProductForm(productId);
      }
    );

  document
    .getElementById(
      "deleteProductFromForm"
    )
    ?.addEventListener(
      "click",
      () => {

        if (productId !== null) {
          deleteProduct(productId);
        }

      }
    );

  setupNavigation();
}


/* =========================================
   حفظ المنتج
========================================= */

function saveProductForm(productId) {

  const name =
    document
      .getElementById("productName")
      ?.value
      .trim();

  const price =
    number(
      document
        .getElementById("productPrice")
        ?.value
    );

  const stock =
    number(
      document
        .getElementById("productStock")
        ?.value
    );

  const minStock =
    number(
      document
        .getElementById("productMinStock")
        ?.value
    );

  if (!name) {
    alert("اكتب اسم المنتج.");
    return;
  }

  if (price < 0) {
    alert("السعر غير صحيح.");
    return;
  }

  if (stock < 0) {
    alert("كمية المخزون غير صحيحة.");
    return;
  }

  const products = getProducts();

  if (productId === null) {

    const exists =
      products.some(
        product =>
          product.name.trim()
            .toLowerCase() ===
          name.toLowerCase()
      );

    if (exists) {
      alert("هذا المنتج موجود مسبقًا.");
      return;
    }

    products.push({
      id: generateId("PROD"),
      name,
      price,
      stock,
      minStock
    });

  } else {

    const index =
      products.findIndex(
        product =>
          String(product.id) ===
          String(productId)
      );

    if (index === -1) {
      alert("المنتج غير موجود.");
      return;
    }

    products[index] = {
      ...products[index],
      name,
      price,
      stock,
      minStock
    };
  }

  if (saveProducts(products)) {

    alert(
      productId === null
        ? "تمت إضافة المنتج بنجاح."
        : "تم حفظ تعديلات المنتج."
    );

    showProducts();
  }
}


/* =========================================
   حذف منتج
========================================= */

function deleteProduct(productId) {

  const products = getProducts();

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(productId)
    );

  if (!product) {
    alert("المنتج غير موجود.");
    return;
  }

  const confirmed =
    confirm(
      `هل تريد حذف المنتج "${product.name}"؟`
    );

  if (!confirmed) {
    return;
  }

  const filtered =
    products.filter(
      item =>
        String(item.id) !==
        String(productId)
    );

  if (saveProducts(filtered)) {

    alert("تم حذف المنتج.");

    showProducts();
  }
}


/* =========================================
   جرد المخزون
========================================= */

function updateProductStock(productId) {

  const products = getProducts();

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(productId)
    );

  if (!product) {
    alert("المنتج غير موجود.");
    return;
  }

  const value =
    prompt(
      `كمية المخزون الجديدة لـ "${product.name}"؟`,
      String(product.stock)
    );

  if (value === null) {
    return;
  }

  const stock =
    Number(value);

  if (
    !Number.isFinite(stock) ||
    stock < 0
  ) {
    alert("أدخل كمية صحيحة.");
    return;
  }

  product.stock = Math.floor(stock);

  if (saveProducts(products)) {

    alert("تم تحديث المخزون.");

    showProducts();
  }
}


/* =========================================
   البحث في المنتجات
========================================= */

function searchProductsManagement(event) {

  const search =
    event.target.value
      .trim()
      .toLowerCase();

  const products =
    getProducts();

  const filtered =
    products.filter(
      product =>
        product.name
          .toLowerCase()
          .includes(search)
    );

  const list =
    document.getElementById(
      "productsManagementList"
    );

  if (list) {
    list.innerHTML =
      renderProductsManagement(
        filtered
      );
  }

  bindProductActions();
}


/* =========================================
   أزرار المنتجات
========================================= */

function bindProductActions() {

  document
    .querySelectorAll(
      "[data-product-edit]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showProductForm(
            button.dataset.productEdit
          );

        }
      );

    });

  document
    .querySelectorAll(
      "[data-product-delete]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteProduct(
            button.dataset.productDelete
          );

        }
      );

    });

  document
    .querySelectorAll(
      "[data-product-stock]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          updateProductStock(
            button.dataset.productStock
          );

        }
      );

    });
}
/* =========================================
   قسم الزبائن
========================================= */

function showCustomers() {
  const app = getApp();

  if (!app) return;

  const customers = getCustomers();

  const totalCustomers = customers.length;

  const totalDebts =
    getTotalDebts();

  const totalPurchases =
    customers.reduce(
      (sum, customer) =>
        sum + getCustomerPurchases(customer.id),
      0
    );

  app.innerHTML = `
    <div class="page">

      <div class="page-header">

        <button
          class="back-button"
          id="backCustomers"
        >
          ←
        </button>

        <div>
          <h1>الزبائن</h1>
        </div>

      </div>

      <section class="stats">

        <div class="stat">
          <span>عدد الزبائن</span>
          <strong>
            ${totalCustomers}
          </strong>
          <small>زبون</small>
        </div>

        <div class="stat">
          <span>مشترياتهم</span>
          <strong>
            ${money(totalPurchases)}
          </strong>
          <small>ل.س</small>
        </div>

        <div class="stat">
          <span>الديون</span>
          <strong>
            ${money(totalDebts)}
          </strong>
          <small>متبقي</small>
        </div>

      </section>

      <section class="section">

        <div class="section-heading">

          <h3>
            إدارة الزبائن
          </h3>

          <button
            class="primary-button"
            id="addCustomerButton"
            style="
              min-height:42px;
              padding:8px 14px;
            "
          >
            ＋ زبون جديد
          </button>

        </div>

        <div class="form-card">

          <input
            id="customerSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث باسم الزبون أو الهاتف..."
          >

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

    ${createBottomNavigation("more")}
  `;

  document
    .getElementById("backCustomers")
    ?.addEventListener(
      "click",
      showDashboard
    );

  document
    .getElementById("addCustomerButton")
    ?.addEventListener(
      "click",
      () => showCustomerForm()
    );

  document
    .getElementById("customerSearch")
    ?.addEventListener(
      "input",
      searchCustomers
    );

  bindCustomerActions();

  setupNavigation();
}


/* =========================================
   إجمالي مشتريات الزبون
========================================= */

function getCustomerPurchases(
  customerId
) {

  return getSales()
    .filter(
      sale =>
        String(sale.customerId) ===
        String(customerId)
    )
    .reduce(
      (sum, sale) =>
        sum + number(sale.total),
      0
    );
}


/* =========================================
   عدد مشتريات الزبون
========================================= */

function getCustomerInvoiceCount(
  customerId
) {

  return getSales()
    .filter(
      sale =>
        String(sale.customerId) ===
        String(customerId)
    ).length;
}


/* =========================================
   مشتريات هذا الشهر
========================================= */

function getCustomerMonthlyPurchases(
  customerId
) {

  const now = new Date();

  return getSales()
    .filter(sale => {

      if (
        String(sale.customerId) !==
        String(customerId)
      ) {
        return false;
      }

      const date =
        new Date(sale.createdAt);

      return (
        date.getFullYear() ===
          now.getFullYear() &&
        date.getMonth() ===
          now.getMonth()
      );
    })
    .reduce(
      (sum, sale) =>
        sum + number(sale.total),
      0
    );
}


/* =========================================
   عرض الزبائن
========================================= */

function renderCustomers(
  customers
) {

  if (!customers.length) {

    return `
      <div class="empty-state">

        <span>♙</span>

        <strong>
          لا يوجد زبائن
        </strong>

        <small>
          أضف أول زبون إلى النظام.
        </small>

      </div>
    `;
  }

  return customers
    .map(customer => {

      const debt =
        getCustomerDebt(
          customer.id
        );

      const purchases =
        getCustomerPurchases(
          customer.id
        );

      const monthly =
        getCustomerMonthlyPurchases(
          customer.id
        );

      const invoices =
        getCustomerInvoiceCount(
          customer.id
        );

      return `
        <div
          class="customer-card"
          data-customer-card="${customer.id}"
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              gap:12px;
              align-items:flex-start;
            "
          >

            <div class="customer-info">

              <strong class="customer-name">
                ${escapeHtml(
                  customer.name
                )}
              </strong>

              ${
                customer.phone
                  ? `
                    <small>
                      ☎
                      ${escapeHtml(
                        customer.phone
                      )}
                    </small>
                  `
                  : ""
              }

              ${
                customer.notes
                  ? `
                    <small>
                      ${escapeHtml(
                        customer.notes
                      )}
                    </small>
                  `
                  : ""
              }

            </div>

            <div
              style="
                text-align:left;
              "
            >

              <strong
                class="${
                  debt.remaining > 0
                    ? "remaining-amount"
                    : "paid-amount"
                }"
                style="
                  display:block;
                  font-size:18px;
                "
              >
                ${money(
                  debt.remaining
                )}
              </strong>

              <small>
                ${
                  debt.remaining > 0
                    ? "المتبقي"
                    : "لا يوجد عليه دين"
                }
              </small>

            </div>

          </div>


          <div
            class="customer-stats"
            style="
              margin-top:15px;
              display:grid;
              grid-template-columns:
                repeat(3,1fr);
              gap:8px;
            "
          >

            <div class="mini-stat">
              <small>المشتريات</small>
              <strong>
                ${money(purchases)}
              </strong>
            </div>

            <div class="mini-stat">
              <small>هذا الشهر</small>
              <strong>
                ${money(monthly)}
              </strong>
            </div>

            <div class="mini-stat">
              <small>الفواتير</small>
              <strong>
                ${invoices}
              </strong>
            </div>

          </div>


          <div
            style="
              display:grid;
              grid-template-columns:
                repeat(3,1fr);
              gap:7px;
              margin-top:12px;
            "
          >

            <button
              class="primary-button"
              data-customer-profile="${customer.id}"
              style="
                min-height:40px;
                padding:7px;
              "
            >
              الملف
            </button>

            <button
              class="secondary-button"
              data-customer-edit="${customer.id}"
              style="
                min-height:40px;
                padding:7px;
              "
            >
              ✎ تعديل
            </button>

            <button
              class="danger-button"
              data-customer-delete="${customer.id}"
              style="
                min-height:40px;
                padding:7px;
              "
            >
              حذف
            </button>

          </div>

        </div>
      `;
    })
    .join("");
}


/* =========================================
   نموذج الزبون
========================================= */

function showCustomerForm(
  customerId = null
) {

  const app = getApp();

  if (!app) return;

  const customers =
    getCustomers();

  const customer =
    customerId !== null
      ? customers.find(
          item =>
            String(item.id) ===
            String(customerId)
        )
      : null;

  const editing =
    Boolean(customer);

  app.innerHTML = `
    <div class="page">

      <div class="page-header">

        <button
          class="back-button"
          id="backCustomerForm"
        >
          ←
        </button>

        <div>
          <h1>
            ${
              editing
                ? "تعديل الزبون"
                : "إضافة زبون"
            }
          </h1>
        </div>

      </div>


      <section class="form-card">

        <form id="customerForm">

          <div class="form-grid">

            <div class="form-group full">

              <label>
                اسم الزبون
              </label>

              <input
                id="customerName"
                class="form-input"
                type="text"
                required
                value="${
                  editing
                    ? escapeHtml(
                        customer.name
                      )
                    : ""
                }"
                placeholder="مثال: أحمد محمد"
              >

            </div>


            <div class="form-group">

              <label>
                رقم الهاتف
              </label>

              <input
                id="customerPhone"
                class="form-input"
                type="tel"
                value="${
                  editing
                    ? escapeHtml(
                        customer.phone || ""
                      )
                    : ""
                }"
                placeholder="09xxxxxxxx"
              >

            </div>


            <div class="form-group">

              <label>
                ملاحظات
              </label>

              <input
                id="customerNotes"
                class="form-input"
                type="text"
                value="${
                  editing
                    ? escapeHtml(
                        customer.notes || ""
                      )
                    : ""
                }"
                placeholder="ملاحظات اختيارية"
              >

            </div>

          </div>


          <div
            style="
              display:grid;
              gap:10px;
              margin-top:18px;
            "
          >

            <button
              class="primary-button"
              type="submit"
            >
              ${
                editing
                  ? "✓ حفظ التعديلات"
                  : "＋ إضافة الزبون"
              }
            </button>

            ${
              editing
                ? `
                  <button
                    class="danger-button"
                    type="button"
                    id="deleteCustomerFromForm"
                  >
                    حذف الزبون
                  </button>
                `
                : ""
            }

          </div>

        </form>

      </section>

    </div>

    ${createBottomNavigation("more")}
  `;


  document
    .getElementById("backCustomerForm")
    ?.addEventListener(
      "click",
      showCustomers
    );


  document
    .getElementById("customerForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        saveCustomerForm(
          customerId
        );

      }
    );


  document
    .getElementById(
      "deleteCustomerFromForm"
    )
    ?.addEventListener(
      "click",
      () => {

        if (customerId !== null) {
          deleteCustomer(
            customerId
          );
        }

      }
    );


  setupNavigation();
}


/* =========================================
   حفظ الزبون
========================================= */

function saveCustomerForm(
  customerId
) {

  const name =
    document
      .getElementById(
        "customerName"
      )
      ?.value
      .trim();

  const phone =
    document
      .getElementById(
        "customerPhone"
      )
      ?.value
      .trim();

  const notes =
    document
      .getElementById(
        "customerNotes"
      )
      ?.value
      .trim();


  if (!name) {
    alert("اكتب اسم الزبون.");
    return;
  }


  const customers =
    getCustomers();


  if (customerId === null) {

    const exists =
      customers.some(
        customer =>
          customer.name
            .trim()
            .toLowerCase() ===
          name.toLowerCase()
      );


    if (exists) {

      alert(
        "يوجد زبون بهذا الاسم مسبقًا."
      );

      return;
    }


    customers.push({
      id: generateId("CUS"),
      name,
      phone,
      notes,
      createdAt:
        new Date().toISOString()
    });

  } else {

    const index =
      customers.findIndex(
        customer =>
          String(customer.id) ===
          String(customerId)
      );


    if (index === -1) {

      alert(
        "الزبون غير موجود."
      );

      return;
    }


    customers[index] = {
      ...customers[index],
      name,
      phone,
      notes
    };
  }


  if (
    saveCustomers(customers)
  ) {

    alert(
      customerId === null
        ? "تمت إضافة الزبون بنجاح."
        : "تم حفظ تعديلات الزبون."
    );

    showCustomers();
  }
}


/* =========================================
   حذف الزبون
========================================= */

function deleteCustomer(
  customerId
) {

  const customers =
    getCustomers();

  const customer =
    customers.find(
      item =>
        String(item.id) ===
        String(customerId)
    );


  if (!customer) {

    alert(
      "الزبون غير موجود."
    );

    return;
  }


  const debt =
    getCustomerDebt(
      customerId
    );


  if (debt.remaining > 0) {

    alert(
      "لا يمكن حذف هذا الزبون لأن عليه دينًا بقيمة " +
      money(debt.remaining) +
      "."
    );

    return;
  }


  const confirmed =
    confirm(
      `هل تريد حذف الزبون "${customer.name}"؟`
    );


  if (!confirmed) {
    return;
  }


  const filtered =
    customers.filter(
      item =>
        String(item.id) !==
        String(customerId)
    );


  if (
    saveCustomers(filtered)
  ) {

    alert(
      "تم حذف الزبون."
    );

    showCustomers();
  }
}


/* =========================================
   البحث عن الزبائن
========================================= */

function searchCustomers(
  event
) {

  const search =
    event.target.value
      .trim()
      .toLowerCase();


  const customers =
    getCustomers();


  const filtered =
    customers.filter(
      customer => {

        const name =
          String(
            customer.name || ""
          ).toLowerCase();

        const phone =
          String(
            customer.phone || ""
          ).toLowerCase();

        return (
          name.includes(search) ||
          phone.includes(search)
        );
      }
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
  }


  bindCustomerActions();
}


/* =========================================
   أزرار الزبائن
========================================= */

function bindCustomerActions() {

  document
    .querySelectorAll(
      "[data-customer-profile]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showCustomerProfile(
            button.dataset
              .customerProfile
          );

        }
      );

    });


  document
    .querySelectorAll(
      "[data-customer-edit]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showCustomerForm(
            button.dataset
              .customerEdit
          );

        }
      );

    });


  document
    .querySelectorAll(
      "[data-customer-delete]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteCustomer(
            button.dataset
              .customerDelete
          );

        }
      );

    });
}


/* =========================================
   ملف الزبون
========================================= */

function showCustomerProfile(
  customerId
) {

  const app = getApp();

  if (!app) return;


  const customer =
    getCustomers().find(
      item =>
        String(item.id) ===
        String(customerId)
    );


  if (!customer) {

    alert(
      "الزبون غير موجود."
    );

    showCustomers();

    return;
  }


  const debt =
    getCustomerDebt(
      customerId
    );


  const purchases =
    getCustomerPurchases(
      customerId
    );


  const monthly =
    getCustomerMonthlyPurchases(
      customerId
    );


  const sales =
    getSales()
      .filter(
        sale =>
          String(
            sale.customerId
          ) ===
          String(customerId)
      );


  const debts =
    getDebts()
      .filter(
        item =>
          String(
            item.customerId
          ) ===
          String(customerId)
      );


  app.innerHTML = `
    <div class="page">

      <div class="page-header">

        <button
          class="back-button"
          id="backCustomerProfile"
        >
          ←
        </button>

        <div>
          <h1>
            ملف الزبون
          </h1>
        </div>

      </div>


      <section class="hero">

        <div>

          <span class="hero-label">
            الزبون
          </span>

          <h2>
            ${escapeHtml(
              customer.name
            )}
          </h2>

          <p>
            ${
              customer.phone
                ? "☎ " +
                  escapeHtml(
                    customer.phone
                  )
                : "لا يوجد رقم هاتف"
            }
          </p>

        </div>

        <div class="seal">
          EB
        </div>

      </section>


      <section class="stats">

        <div class="stat">
          <span>كل المشتريات</span>
          <strong>
            ${money(purchases)}
          </strong>
          <small>ل.س</small>
        </div>

        <div class="stat">
          <span>هذا الشهر</span>
          <strong>
            ${money(monthly)}
          </strong>
          <small>ل.س</small>
        </div>

        <div class="stat">
          <span>المدفوع</span>
          <strong>
            ${money(debt.totalPaid)}
          </strong>
          <small>ل.س</small>
        </div>

        <div class="stat">
          <span>المتبقي</span>
          <strong>
            ${money(debt.remaining)}
          </strong>
          <small>ل.س</small>
        </div>

      </section>


      <section class="section">

        <div class="section-heading">
          <h3>
            إجراءات الزبون
          </h3>
        </div>

        <div
          class="quickgrid"
          style="
            grid-template-columns:
              repeat(2,1fr);
          "
        >

          <button
            class="quick-card"
            id="customerEditProfile"
          >
            <span class="quick-icon">
              ✎
            </span>

            <strong>
              تعديل البيانات
            </strong>

            <small>
              تعديل اسم أو هاتف
            </small>

          </button>


          <button
            class="quick-card"
            id="customerPaymentButton"
          >
            <span class="quick-icon">
              ₪
            </span>

            <strong>
              تسجيل دفعة
            </strong>

            <small>
              تسجيل مبلغ مدفوع
            </small>

          </button>

        </div>

      </section>


      <section class="section">

        <div class="section-heading">
          <h3>
            المشتريات
          </h3>

          <span>
            ${sales.length} فاتورة
          </span>
        </div>

        <div class="activity-list">

          ${
            sales.length
              ? sales
                  .slice()
                  .reverse()
                  .map(
                    sale => `
                      <button
                        class="sale-card"
                        data-open-invoice="${
                          escapeHtml(
                            sale.invoiceNumber
                          )
                        }"
                      >

                        <div>

                          <strong>
                            ${escapeHtml(
                              sale.invoiceNumber
                            )}
                          </strong>

                          <small>
                            ${formatDate(
                              sale.createdAt
                            )}
                          </small>

                        </div>

                        <div class="sale-total">
                          ${money(
                            sale.total
                          )}
                        </div>

                      </button>
                    `
                  )
                  .join("")
              : `
                <div class="empty-state">
                  <span>🧾</span>
                  <strong>
                    لا توجد مشتريات
                  </strong>
                  <small>
                    لم يتم تسجيل مبيعات لهذا الزبون.
                  </small>
                </div>
              `
          }

        </div>

      </section>


      <section class="section">

        <div class="section-heading">
          <h3>
            المشتريات بالدين
          </h3>

          <span>
            ${debts.length} عملية
          </span>
        </div>

        <div class="activity-list">

          ${
            debts.length
              ? debts
                  .slice()
                  .reverse()
                  .map(
                    debtItem => `
                      <div class="debt-card">

                        <strong>
                          ${escapeHtml(
                            debtItem.productName
                          )}
                        </strong>

                        <small>
                          الكمية:
                          ${number(
                            debtItem.qty
                          )}
                        </small>

                        <small>
                          التاريخ:
                          ${formatDate(
                            debtItem.createdAt
                          )}
                        </small>

                        <strong
                          class="remaining-amount"
                        >
                          ${money(
                            debtItem.amount
                          )}
                        </strong>

                      </div>
                    `
                  )
                  .join("")
              : `
                <div class="empty-state">
                  <span>✓</span>
                  <strong>
                    لا توجد مشتريات بالدين
                  </strong>
                  <small>
                    حساب الزبون خالٍ من الديون المسجلة.
                  </small>
                </div>
              `
          }

        </div>

      </section>

    </div>

    ${createBottomNavigation("more")}
  `;


  document
    .getElementById(
      "backCustomerProfile"
    )
    ?.addEventListener(
      "click",
      showCustomers
    );


  document
    .getElementById(
      "customerEditProfile"
    )
    ?.addEventListener(
      "click",
      () =>
        showCustomerForm(
          customerId
        )
    );


  document
    .getElementById(
      "customerPaymentButton"
    )
    ?.addEventListener(
      "click",
      () =>
        addCustomerPayment(
          customerId
        )
    );


  bindInvoiceButtons();

  setupNavigation();
}


/* =========================================
   تسجيل دفعة من الزبون
========================================= */

function addCustomerPayment(
  customerId
) {

  const customer =
    getCustomers().find(
      item =>
        String(item.id) ===
        String(customerId)
    );


  if (!customer) {
    alert("الزبون غير موجود.");
    return;
  }


  const debt =
    getCustomerDebt(
      customerId
    );


  if (debt.remaining <= 0) {

    alert(
      "لا يوجد مبلغ متبقي على هذا الزبون."
    );

    return;
  }


  const value =
    prompt(
      `المبلغ المتبقي على ${customer.name}: ${money(
        debt.remaining
      )}\n\nاكتب المبلغ المدفوع:`,
      String(debt.remaining)
    );


  if (value === null) {
    return;
  }


  const amount =
    Number(value);


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    alert(
      "أدخل مبلغًا صحيحًا."
    );

    return;
  }


  if (amount > debt.remaining) {

    alert(
      "المبلغ أكبر من الدين المتبقي."
    );

    return;
  }


  const payments =
    getPayments();


  payments.push({
    id: generateId("PAY"),
    customerId:
      customer.id,
    customerName:
      customer.name,
    amount,
    createdAt:
      new Date().toISOString()
  });


  if (
    savePayments(payments)
  ) {

    alert(
      "تم تسجيل الدفعة بنجاح."
    );

    showCustomerProfile(
      customerId
    );
  }
}
});
