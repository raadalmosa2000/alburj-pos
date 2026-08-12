document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =====================================================
     إكسبريس البرج | APP.JS
     نظام مبيعات + منتجات + مخزون + زبائن + ديون
     ===================================================== */

  const APP_NAME = "إكسبريس البرج";
  const CURRENCY = "ل.س";

  const KEYS = {
    products: "alburj_products",
    sales: "alburj_sales",
    customers: "alburj_customers",
    debts: "alburj_debts",
    payments: "alburj_payments"
  };

  let cart = [];

  /* =====================================================
     أدوات عامة
     ===================================================== */

  function getApp() {
    return document.querySelector(".app");
  }

  function number(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function money(value) {
    return number(value).toLocaleString("ar-SY") + " " + CURRENCY;
  }

  function dateText(value) {
    const date = new Date(value);
    return date.toLocaleDateString("ar-SY");
  }

  function timeText(value) {
    const date = new Date(value);

    return date.toLocaleTimeString("ar-SY", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function todayKey(value = new Date()) {
    const date = new Date(value);

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function monthKey(value = new Date()) {
    const date = new Date(value);

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0")
    ].join("-");
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

  function invoiceNumber() {
    return (
      "INV-" +
      new Date().getFullYear() +
      "-" +
      Date.now().toString().slice(-8)
    );
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readStorage(key, fallback = []) {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        return fallback;
      }

      const parsed = JSON.parse(value);

      return parsed;
    } catch (error) {
      console.error("Storage error:", key, error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;
    } catch (error) {
      console.error("Save error:", key, error);

      alert(
        "تعذر حفظ البيانات في المتصفح."
      );

      return false;
    }
  }

  /* =====================================================
     المنتجات
     ===================================================== */

  const DEFAULT_PRODUCTS = [
    {
      id: "P-1",
      name: "عصير برتقال",
      price: 5000,
      cost: 3500,
      stock: 20,
      minStock: 5,
      unit: "قطعة",
      barcode: "",
      createdAt: new Date().toISOString()
    },
    {
      id: "P-2",
      name: "مياه معدنية",
      price: 2000,
      cost: 1200,
      stock: 40,
      minStock: 10,
      unit: "قطعة",
      barcode: "",
      createdAt: new Date().toISOString()
    },
    {
      id: "P-3",
      name: "بيبسي",
      price: 4000,
      cost: 2500,
      stock: 30,
      minStock: 8,
      unit: "قطعة",
      barcode: "",
      createdAt: new Date().toISOString()
    },
    {
      id: "P-4",
      name: "شيبس",
      price: 3500,
      cost: 2200,
      stock: 25,
      minStock: 5,
      unit: "قطعة",
      barcode: "",
      createdAt: new Date().toISOString()
    },
    {
      id: "P-5",
      name: "بسكويت",
      price: 3000,
      cost: 1800,
      stock: 25,
      minStock: 5,
      unit: "قطعة",
      barcode: "",
      createdAt: new Date().toISOString()
    },
    {
      id: "P-6",
      name: "حليب",
      price: 6000,
      cost: 4200,
      stock: 15,
      minStock: 5,
      unit: "قطعة",
      barcode: "",
      createdAt: new Date().toISOString()
    }
  ];

  function getProducts() {
    const products =
      readStorage(
        KEYS.products,
        null
      );

    if (!Array.isArray(products)) {
      writeStorage(
        KEYS.products,
        DEFAULT_PRODUCTS
      );

      return [...DEFAULT_PRODUCTS];
    }

    return products;
  }

  function saveProducts(products) {
    return writeStorage(
      KEYS.products,
      products
    );
  }

  /* =====================================================
     المبيعات
     ===================================================== */

  function getSales() {
    const sales =
      readStorage(
        KEYS.sales,
        []
      );

    return Array.isArray(sales)
      ? sales
      : [];
  }

  function saveSales(sales) {
    return writeStorage(
      KEYS.sales,
      sales
    );
  }

  /* =====================================================
     الزبائن
     ===================================================== */

  function getCustomers() {
    const customers =
      readStorage(
        KEYS.customers,
        []
      );

    return Array.isArray(customers)
      ? customers
      : [];
  }

  function saveCustomers(customers) {
    return writeStorage(
      KEYS.customers,
      customers
    );
  }

  /* =====================================================
     الديون
     ===================================================== */

  function getDebts() {
    const debts =
      readStorage(
        KEYS.debts,
        []
      );

    return Array.isArray(debts)
      ? debts
      : [];
  }

  function saveDebts(debts) {
    return writeStorage(
      KEYS.debts,
      debts
    );
  }

  /* =====================================================
     الدفعات
     ===================================================== */

  function getPayments() {
    const payments =
      readStorage(
        KEYS.payments,
        []
      );

    return Array.isArray(payments)
      ? payments
      : [];
  }

  function savePayments(payments) {
    return writeStorage(
      KEYS.payments,
      payments
    );
  }

  /* =====================================================
     حساب ديون الزبون
     ===================================================== */

  function getCustomerDebt(customerId) {
    const debts =
      getDebts().filter(
        debt =>
          String(debt.customerId) ===
          String(customerId)
      );

    const payments =
      getPayments().filter(
        payment =>
          String(payment.customerId) ===
          String(customerId)
      );

    const totalDebt =
      debts.reduce(
        (sum, debt) =>
          sum + number(debt.amount),
        0
      );

    const totalPaid =
      payments.reduce(
        (sum, payment) =>
          sum + number(payment.amount),
        0
      );

    return {
      totalDebt,
      totalPaid,
      remaining:
        Math.max(
          0,
          totalDebt - totalPaid
        )
    };
  }

  function getTotalDebts() {
    const debts =
      getDebts();

    const payments =
      getPayments();

    const totalDebt =
      debts.reduce(
        (sum, debt) =>
          sum + number(debt.amount),
        0
      );

    const totalPaid =
      payments.reduce(
        (sum, payment) =>
          sum + number(payment.amount),
        0
      );

    return Math.max(
      0,
      totalDebt - totalPaid
    );
  }

  /* =====================================================
     مشتريات الزبون
     ===================================================== */

  function getCustomerPurchases(customerId) {
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

  function getCustomerMonthlyPurchases(customerId) {
    const currentMonth =
      monthKey();

    return getSales()
      .filter(sale => {
        return (
          String(sale.customerId) ===
            String(customerId) &&
          monthKey(sale.createdAt) ===
            currentMonth
        );
      })
      .reduce(
        (sum, sale) =>
          sum + number(sale.total),
        0
      );
  }

  /* =====================================================
     التنقل
     ===================================================== */

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

          if (page === "more") {
            showMore();
          }
        };
      });
  }

  /* =====================================================
     لوحة التحكم
     ===================================================== */

  function showDashboard() {
    const app = getApp();

    if (!app) return;

    const sales =
      getSales();

    const products =
      getProducts();

    const today =
      todayKey();

    const todaySales =
      sales.filter(
        sale =>
          todayKey(
            sale.createdAt
          ) === today
      );

    const todayTotal =
      todaySales.reduce(
        (sum, sale) =>
          sum + number(sale.total),
        0
      );

    const todayProfit =
      todaySales.reduce(
        (sum, sale) =>
          sum +
          sale.items.reduce(
            (
              itemSum,
              item
            ) =>
              itemSum +
              (
                number(item.price) -
                number(item.cost)
              ) *
                number(item.qty),
            0
          ),
        0
      );

    const stockCount =
      products.reduce(
        (sum, product) =>
          sum + number(product.stock),
        0
      );

    const totalDebts =
      getTotalDebts();

    app.innerHTML = `
      <div class="page">

        <div class="topbar">

          <div>

            <span class="kicker">
              نظام نقاط البيع
            </span>

            <h1>
              ${APP_NAME}
            </h1>

            <p>
              إدارة مبيعاتك ومخزونك وزبائنك
              من مكان واحد.
            </p>

          </div>

          <div class="seal">
            EB
          </div>

        </div>


        <section class="hero">

          <div>

            <span class="hero-label">
              مبيعات اليوم
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
            EB
          </div>

        </section>


        <section class="stats">

          <div class="stat">
            <span>مبيعات اليوم</span>
            <strong>
              ${money(todayTotal)}
            </strong>
            <small>ل.س</small>
          </div>

          <div class="stat">
            <span>الفواتير</span>
            <strong>
              ${todaySales.length}
            </strong>
            <small>فاتورة</small>
          </div>

          <div class="stat">
            <span>الأرباح</span>
            <strong>
              ${money(todayProfit)}
            </strong>
            <small>تقريبي</small>
          </div>

          <div class="stat">
            <span>المخزون</span>
            <strong>
              ${stockCount}
            </strong>
            <small>قطعة</small>
          </div>

        </section>


        <section class="section">

          <div class="section-heading">
            <h3>اختصارات</h3>
            <span>إدارة سريعة</span>
          </div>

          <div class="quickgrid">

            <button
              class="quick-card"
              id="dashboardSale"
            >
              <span class="quick-icon">＋</span>
              <strong>بيع جديد</strong>
              <small>إنشاء فاتورة</small>
            </button>

            <button
              class="quick-card"
              id="dashboardProduct"
            >
              <span class="quick-icon">□</span>
              <strong>منتج جديد</strong>
              <small>إضافة للمخزون</small>
            </button>

            <button
              class="quick-card"
              id="dashboardCustomer"
            >
              <span class="quick-icon">♙</span>
              <strong>زبون جديد</strong>
              <small>إضافة زبون</small>
            </button>

            <button
              class="quick-card"
              id="dashboardDebt"
            >
              <span class="quick-icon">₪</span>
              <strong>الديون</strong>
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

            <button
              id="viewAllSales"
            >
              عرض الكل
            </button>

          </div>

          <div class="activity-list">

            ${
              sales.length
                ? sales
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map(
                      createSaleCard
                    )
                    .join("")
                : `
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
            }

          </div>

        </section>

      </div>

      ${createBottomNavigation("home")}
    `;

    document
      .getElementById(
        "dashboardSale"
      )
      ?.addEventListener(
        "click",
        showSalesScreen
      );

    document
      .getElementById(
        "dashboardProduct"
      )
      ?.addEventListener(
        "click",
        () =>
          showProductForm()
      );

    document
      .getElementById(
        "dashboardCustomer"
      )
      ?.addEventListener(
        "click",
        () =>
          showCustomerForm()
      );

    document
      .getElementById(
        "dashboardDebt"
      )
      ?.addEventListener(
        "click",
        showDebts
      );

    document
      .getElementById(
        "viewAllSales"
      )
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    setupNavigation();
  }

  /* =====================================================
     بطاقة المبيعات
     ===================================================== */

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
            ${dateText(
              sale.createdAt
            )}
            -
            ${timeText(
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

  function bindInvoiceButtons() {
    document
      .querySelectorAll(
        "[data-open-invoice]"
      )
      .forEach(button => {

        button.onclick = () => {

          const invoice =
            button.dataset
              .openInvoice;

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

  /* =====================================================
     البيع
     ===================================================== */

  function showSalesScreen() {
    const app = getApp();

    if (!app) return;

    cart = [];

    const products =
      getProducts()
        .filter(
          product =>
            number(product.stock) > 0
        );

    const customers =
      getCustomers();

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backSale"
          >
            ←
          </button>

          <div>
            <h1>بيع جديد</h1>
          </div>

        </div>


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
                          data-product-id="${
                            product.id
                          }"
                          data-name="${
                            escapeHtml(
                              product.name
                            )
                          }"
                        >

                          <strong>
                            ${escapeHtml(
                              product.name
                            )}
                          </strong>

                          <small>
                            ${money(
                              product.price
                            )}
                          </small>

                          <small>
                            المتوفر:
                            ${number(
                              product.stock
                            )}
                          </small>

                        </button>
                      `
                    )
                    .join("")
                : `
                  <div class="empty-state">
                    <span>□</span>
                    <strong>
                      لا توجد منتجات متوفرة
                    </strong>
                    <small>
                      أضف منتجات أو حدّث المخزون.
                    </small>
                  </div>
                `
            }

          </div>

        </section>


        <section class="section">

          <div class="section-heading">
            <h3>السلة</h3>

            <span id="cartCount">
              0 منتج
            </span>
          </div>


          <div
            class="form-card"
            id="cartContainer"
          >
            <div class="empty-state">
              <span>🛒</span>
              <strong>السلة فارغة</strong>
              <small>
                اضغط على منتج لإضافته.
              </small>
            </div>
          </div>


          <div class="total-box">

            <span>
              الإجمالي
            </span>

            <strong id="totalElement">
              ${money(0)}
            </strong>

          </div>


          <div
            class="form-card"
            style="margin-top:15px"
          >

            <label>
              الزبون
            </label>

            <select
              id="saleCustomer"
              class="form-input"
            >

              <option value="">
                زبون نقدي
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


            <label
              style="margin-top:12px"
            >
              طريقة الدفع
            </label>

            <select
              id="salePayment"
              class="form-input"
            >

              <option value="نقدي">
                نقدي
              </option>

              <option value="بطاقة">
                بطاقة
              </option>

              <option value="آجل">
                آجل
              </option>

            </select>

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

        </section>

      </div>

      ${createBottomNavigation("sale")}
    `;

    document
      .getElementById(
        "backSale"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .querySelectorAll(
        ".product-button"
      )
      .forEach(button => {

        button.onclick = () => {

          const product =
            getProducts().find(
              item =>
                String(item.id) ===
                String(
                  button.dataset
                    .productId
                )
            );

          if (product) {
            addToCart(product);
          }
        };
      });

    document
      .getElementById(
        "productSearch"
      )
      ?.addEventListener(
        "input",
        filterProducts
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

  function addToCart(product) {
    const current =
      cart.find(
        item =>
          String(item.id) ===
          String(product.id)
      );

    const stock =
      number(product.stock);

    if (current) {

      if (
        current.qty >= stock
      ) {

        alert(
          "لا توجد كمية إضافية من هذا المنتج."
        );

        return;
      }

      current.qty += 1;

    } else {

      cart.push({
        id: product.id,
        name: product.name,
        price: number(
          product.price
        ),
        cost: number(
          product.cost
        ),
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

    const cartCount =
      document.getElementById(
        "cartCount"
      );

    if (!container) return;

    const total =
      cart.reduce(
        (sum, item) =>
          sum +
          number(item.price) *
            number(item.qty),
        0
      );

    const count =
      cart.reduce(
        (sum, item) =>
          sum + number(item.qty),
        0
      );

    if (totalElement) {
      totalElement.textContent =
        money(total);
    }

    if (cartCount) {
      cartCount.textContent =
        count + " منتج";
    }

    if (!cart.length) {

      container.innerHTML = `
        <div class="empty-state">
          <span>🛒</span>
          <strong>السلة فارغة</strong>
          <small>
            اضغط على منتج لإضافته.
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
                  ${money(
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
                  data-cart-action="increase"
                  data-index="${index}"
                  style="
                    width:36px;
                    min-height:36px;
                    padding:4px;
                  "
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
                  style="
                    width:36px;
                    min-height:36px;
                    padding:4px;
                  "
                >
                  −
                </button>

                <button
                  class="danger-button"
                  data-cart-action="remove"
                  data-index="${index}"
                  style="
                    width:36px;
                    min-height:36px;
                    padding:4px;
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
        "[data-cart-action]"
      )
      .forEach(button => {

        button.onclick = () => {

          const index =
            Number(
              button.dataset.index
            );

          const action =
            button.dataset
              .cartAction;

          const product =
            getProducts().find(
              item =>
                String(item.id) ===
                String(
                  cart[index]?.id
                )
            );

          if (!cart[index]) {
            return;
          }

          if (
            action === "increase"
          ) {

            const stock =
              number(
                product?.stock
              );

            if (
              cart[index].qty >=
              stock
            ) {

              alert(
                "لا توجد كمية إضافية في المخزون."
              );

              return;
            }

            cart[index].qty += 1;
          }

          if (
            action === "decrease"
          ) {

            cart[index].qty -= 1;

            if (
              cart[index].qty <= 0
            ) {
              cart.splice(index, 1);
            }
          }

          if (
            action === "remove"
          ) {
            cart.splice(index, 1);
          }

          renderCart();
        };
      });
  }

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

  /* =====================================================
     إتمام البيع
     ===================================================== */

  function completeSale() {
    if (!cart.length) {

      alert(
        "أضف منتجًا إلى السلة أولًا."
      );

      return;
    }

    const products =
      getProducts();

    for (const item of cart) {

      const product =
        products.find(
          product =>
            String(product.id) ===
            String(item.id)
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
          `الكمية المتوفرة من ${product.name} هي ${product.stock} فقط.`
        );

        return;
      }
    }

    const customerSelect =
      document.getElementById(
        "saleCustomer"
      );

    const paymentSelect =
      document.getElementById(
        "salePayment"
      );

    const customerId =
      customerSelect?.value || "";

    const paymentMethod =
      paymentSelect?.value ||
      "نقدي";

    let customer = null;

    if (customerId) {

      customer =
        getCustomers().find(
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
    }

    if (
      paymentMethod === "آجل" &&
      !customer
    ) {

      alert(
        "يجب اختيار زبون عند تسجيل البيع بالدين."
      );

      return;
    }

    const total =
      cart.reduce(
        (sum, item) =>
          sum +
          number(item.price) *
            number(item.qty),
        0
      );

    const sale = {
      invoiceNumber:
        invoiceNumber(),

      createdAt:
        new Date().toISOString(),

      customerId:
        customer
          ? customer.id
          : "",

      customerName:
        customer
          ? customer.name
          : "",

      paymentMethod,

      total,

      items:
        cart.map(item => ({
          id: item.id,
          name: item.name,
          qty: number(item.qty),
          price: number(item.price),
          cost: number(item.cost),
          subtotal:
            number(item.price) *
            number(item.qty)
        }))
    };

    const sales =
      getSales();

    sales.push(sale);

    if (!saveSales(sales)) {
      return;
    }

    /* خصم المخزون */

    cart.forEach(item => {

      const product =
        products.find(
          product =>
            String(product.id) ===
            String(item.id)
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

    if (
      !saveProducts(products)
    ) {
      return;
    }

    /* إنشاء دين */

    if (
      paymentMethod === "آجل" &&
      customer
    ) {

      const debts =
        getDebts();

      cart.forEach(item => {

        debts.push({
          id:
            generateId("DEBT"),

          customerId:
            customer.id,

          customerName:
            customer.name,

          saleId:
            sale.invoiceNumber,

          productId:
            item.id,

          productName:
            item.name,

          qty:
            number(item.qty),

          amount:
            number(item.price) *
            number(item.qty),

          createdAt:
            new Date().toISOString()
        });
      });

      if (
        !saveDebts(debts)
      ) {
        return;
      }
    }

    cart = [];

    showInvoice(sale);
  }

  /* =====================================================
     الفاتورة
     ===================================================== */

  function showInvoice(sale) {
    const app = getApp();

    if (!app) return;

    app.innerHTML = `
      <div class="page">

        <div class="invoice">

          <div class="invoice-header">

            <h1>
              ${APP_NAME}
            </h1>

            <strong>
              فاتورة بيع
            </strong>

            <p>
              الليرة السورية
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

              ${dateText(
                sale.createdAt
              )}
            </div>

            <div>
              <strong>
                الوقت:
              </strong>

              ${timeText(
                sale.createdAt
              )}
            </div>

            <div>
              <strong>
                الزبون:
              </strong>

              ${
                sale.customerName
                  ? escapeHtml(
                      sale.customerName
                    )
                  : "نقدي"
              }
            </div>

            <div>
              <strong>
                الدفع:
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
                        ${number(
                          item.qty
                        )}
                      </td>

                      <td>
                        ${money(
                          item.price
                        )}
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

            <span>
              الإجمالي
            </span>

            <h2>
              ${money(
                sale.total
              )}
            </h2>

          </div>


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
              id="invoiceSales"
            >
              📋 سجل المبيعات
            </button>

            ${
              sale.customerId
                ? `
                  <button
                    class="secondary-button"
                    id="invoiceCustomer"
                  >
                    👤 ملف الزبون
                  </button>
                `
                : ""
            }

            <button
              class="secondary-button"
              id="invoiceNewSale"
            >
              ＋ بيع جديد
            </button>

            <button
              class="secondary-button"
              id="invoiceHome"
            >
              🏠 الرئيسية
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
        "invoiceSales"
      )
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    document
      .getElementById(
        "invoiceNewSale"
      )
      ?.addEventListener(
        "click",
        showSalesScreen
      );

    document
      .getElementById(
        "invoiceHome"
      )
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById(
        "invoiceCustomer"
      )
      ?.addEventListener(
        "click",
        () =>
          showCustomerProfile(
            sale.customerId
          )
      );
  }

  /* =====================================================
     سجل المبيعات
     ===================================================== */

  function showSalesHistory() {
    const app = getApp();

    if (!app) return;

    const sales =
      getSales();

    const total =
      sales.reduce(
        (sum, sale) =>
          sum + number(sale.total),
        0
      );

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backSales"
          >
            ←
          </button>

          <div>
            <h1>
              سجل المبيعات
            </h1>
          </div>

        </div>


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
            <strong>
              ${sales.length}
            </strong>
            <small>فاتورة</small>
          </div>

          <div class="stat">
            <span>الإجمالي</span>
            <strong>
              ${money(total)}
            </strong>
            <small>ل.س</small>
          </div>

        </section>


        <section class="section">

          <div class="section-heading">

            <h3>
              الفواتير
            </h3>

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

        </section>

      </div>

      ${createBottomNavigation("sales")}
    `;

    document
      .getElementById(
        "backSales"
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
          <span>🧾</span>
          <strong>
            لا توجد فواتير
          </strong>
          <small>
            لم يتم العثور على مبيعات.
          </small>
        </div>
      `;
    }

    return sales
      .slice()
      .reverse()
      .map(
        createSaleCard
      )
      .join("");
  }

  function searchSales(event) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    const filtered =
      getSales().filter(
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
        filtered.length +
        " فاتورة";
    }

    bindInvoiceButtons();
  }

  /* =====================================================
     المنتجات والمخزون
     ===================================================== */

  function showProducts() {
    const app = getApp();

    if (!app) return;

    const products =
      getProducts();

    const totalStock =
      products.reduce(
        (sum, product) =>
          sum + number(product.stock),
        0
      );

    const lowStock =
      products.filter(
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
            <h1>
              المنتجات والمخزون
            </h1>
          </div>

        </div>


        <section class="stats">

          <div class="stat">
            <span>المنتجات</span>
            <strong>
              ${products.length}
            </strong>
            <small>صنف</small>
          </div>

          <div class="stat">
            <span>الكمية</span>
            <strong>
              ${totalStock}
            </strong>
            <small>قطعة</small>
          </div>

          <div class="stat">
            <span>منخفض المخزون</span>
            <strong>
              ${lowStock}
            </strong>
            <small>صنف</small>
          </div>

        </section>


        <section class="section">

          <div class="section-heading">

            <h3>
              إدارة المنتجات
            </h3>

            <button
              class="primary-button"
              id="addProduct"
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
              id="productInventorySearch"
              class="search-input"
              type="search"
              placeholder="🔎 ابحث عن منتج..."
            >

          </div>

        </section>


        <section class="section">

          <div
            id="productsList"
            class="activity-list"
          >
            ${renderProducts(
              products
            )}
          </div>

        </section>

      </div>

      ${createBottomNavigation("products")}
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
        "addProduct"
      )
      ?.addEventListener(
        "click",
        () =>
          showProductForm()
      );

    document
      .getElementById(
        "productInventorySearch"
      )
      ?.addEventListener(
        "input",
        searchProducts
      );

    bindProductActions();

    setupNavigation();
  }

  function renderProducts(
    products
  ) {

    if (!products.length) {

      return `
        <div class="empty-state">
          <span>□</span>
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

        const min =
          number(product.minStock);

        const low =
          stock <= min;

        return `
          <div
            class="product-card"
            data-product-card="${product.id}"
          >

            <div
              style="
                display:flex;
                justify-content:space-between;
                gap:12px;
              "
            >

              <div>

                <strong>
                  ${escapeHtml(
                    product.name
                  )}
                </strong>

                <small>
                  سعر البيع:
                  ${money(
                    product.price
                  )}
                </small>

                <small>
                  التكلفة:
                  ${money(
                    product.cost
                  )}
                </small>

                ${
                  product.barcode
                    ? `
                      <small>
                        باركود:
                        ${escapeHtml(
                          product.barcode
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
                  style="
                    display:block;
                    font-size:19px;
                  "
                >
                  ${stock}
                </strong>

                <small>
                  ${escapeHtml(
                    product.unit ||
                    "قطعة"
                  )}
                </small>

                <small
                  style="
                    color:${
                      low
                        ? "var(--danger, #c62828)"
                        : "inherit"
                    };
                  "
                >
                  ${
                    low
                      ? "مخزون منخفض"
                      : "متوفر"
                  }
                </small>

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
                data-edit-product="${product.id}"
                style="
                  min-height:40px;
                  padding:7px;
                "
              >
                ✎ تعديل
              </button>

              <button
                class="secondary-button"
                data-stock-product="${product.id}"
                style="
                  min-height:40px;
                  padding:7px;
                "
              >
                ＋ جرد
              </button>

              <button
                class="danger-button"
                data-delete-product="${product.id}"
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

  function bindProductActions() {

    document
      .querySelectorAll(
        "[data-edit-product]"
      )
      .forEach(button => {

        button.onclick = () =>
          showProductForm(
            button.dataset
              .editProduct
          );
      });

    document
      .querySelectorAll(
        "[data-stock-product]"
      )
      .forEach(button => {

        button.onclick = () =>
          adjustStock(
            button.dataset
              .stockProduct
          );
      });

    document
      .querySelectorAll(
        "[data-delete-product]"
      )
      .forEach(button => {

        button.onclick = () =>
          deleteProduct(
            button.dataset
              .deleteProduct
          );
      });
  }

  function searchProducts(event) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    const products =
      getProducts();

    const filtered =
      products.filter(
        product => {

          const name =
            String(
              product.name
            ).toLowerCase();

          const barcode =
            String(
              product.barcode || ""
            ).toLowerCase();

          return (
            name.includes(search) ||
            barcode.includes(search)
          );
        }
      );

    const list =
      document.getElementById(
        "productsList"
      );

    if (list) {
      list.innerHTML =
        renderProducts(
          filtered
        );
    }

    bindProductActions();
  }

  function showProductForm(
    productId = null
  ) {

    const app = getApp();

    if (!app) return;

    const products =
      getProducts();

    const product =
      productId !== null
        ? products.find(
            item =>
              String(item.id) ===
              String(productId)
          )
        : null;

    const editing =
      Boolean(product);

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
              ${
                editing
                  ? "تعديل المنتج"
                  : "إضافة منتج"
              }
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
                      ? escapeHtml(
                          product.name
                        )
                      : ""
                  }"
                  placeholder="اسم المنتج"
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
                      ? number(
                          product.price
                        )
                      : ""
                  }"
                >

              </div>


              <div class="form-group">

                <label>
                  سعر التكلفة
                </label>

                <input
                  id="productCost"
                  class="form-input"
                  type="number"
                  min="0"
                  step="1"
                  value="${
                    editing
                      ? number(
                          product.cost
                        )
                      : ""
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
                  step="1"
                  value="${
                    editing
                      ? number(
                          product.stock
                        )
                      : "0"
                  }"
                >

              </div>


              <div class="form-group">

                <label>
                  حد التنبيه
                </label>

                <input
                  id="productMinStock"
                  class="form-input"
                  type="number"
                  min="0"
                  step="1"
                  value="${
                    editing
                      ? number(
                          product.minStock
                        )
                      : "5"
                  }"
                >

              </div>


              <div class="form-group">

                <label>
                  الوحدة
                </label>

                <input
                  id="productUnit"
                  class="form-input"
                  type="text"
                  value="${
                    editing
                      ? escapeHtml(
                          product.unit ||
                          "قطعة"
                        )
                      : "قطعة"
                  }"
                >

              </div>


              <div class="form-group">

                <label>
                  الباركود
                </label>

                <input
                  id="productBarcode"
                  class="form-input"
                  type="text"
                  value="${
                    editing
                      ? escapeHtml(
                          product.barcode ||
                          ""
                        )
                      : ""
                  }"
                  placeholder="اختياري"
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
                    : "＋ حفظ المنتج"
                }
              </button>

              ${
                editing
                  ? `
                    <button
                      class="danger-button"
                      type="button"
                      id="deleteProductForm"
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
      .getElementById(
        "backProductForm"
      )
      ?.addEventListener(
        "click",
        showProducts
      );

    document
      .getElementById(
        "productForm"
      )
      ?.addEventListener(
        "submit",
        event => {

          event.preventDefault();

          saveProductForm(
            productId
          );
        }
      );

    document
      .getElementById(
        "deleteProductForm"
      )
      ?.addEventListener(
        "click",
        () =>
          deleteProduct(
            productId
          )
      );

    setupNavigation();
  }

  function saveProductForm(
    productId
  ) {

    const name =
      document
        .getElementById(
          "productName"
        )
        ?.value
        .trim();

    const price =
      Number(
        document
          .getElementById(
            "productPrice"
          )
          ?.value
      );

    const cost =
      Number(
        document
          .getElementById(
            "productCost"
          )
          ?.value || 0
      );

    const stock =
      Number(
        document
          .getElementById(
            "productStock"
          )
          ?.value || 0
      );

    const minStock =
      Number(
        document
          .getElementById(
            "productMinStock"
          )
          ?.value || 0
      );

    const unit =
      document
        .getElementById(
          "productUnit"
        )
        ?.value
        .trim() ||
      "قطعة";

    const barcode =
      document
        .getElementById(
          "productBarcode"
        )
        ?.value
        .trim() ||
      "";

    if (!name) {

      alert(
        "اكتب اسم المنتج."
      );

      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {

      alert(
        "أدخل سعر بيع صحيح."
      );

      return;
    }

    const products =
      getProducts();

    const duplicate =
      products.some(
        product =>
          product.name
            .trim()
            .toLowerCase() ===
            name.toLowerCase() &&
          String(product.id) !==
            String(productId)
      );

    if (duplicate) {

      alert(
        "يوجد منتج بهذا الاسم مسبقًا."
      );

      return;
    }

    if (productId === null) {

      products.push({
        id: generateId("PROD"),
        name,
        price,
        cost:
          Number.isFinite(cost)
            ? cost
            : 0,
        stock:
          Number.isFinite(stock)
            ? stock
            : 0,
        minStock:
          Number.isFinite(
            minStock
          )
            ? minStock
            : 0,
        unit,
        barcode,
        createdAt:
          new Date().toISOString()
      });

    } else {

      const index =
        products.findIndex(
          product =>
            String(product.id) ===
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
        cost:
          Number.isFinite(cost)
            ? cost
            : 0,
        stock:
          Number.isFinite(stock)
            ? stock
            : 0,
        minStock:
          Number.isFinite(
            minStock
          )
            ? minStock
            : 0,
        unit,
        barcode
      };
    }

    if (
      saveProducts(products)
    ) {

      alert(
        productId === null
          ? "تم حفظ المنتج بنجاح."
          : "تم حفظ تعديلات المنتج."
      );

      showProducts();
    }
  }

  function deleteProduct(
    productId
  ) {

    if (!productId) return;

    const products =
      getProducts();

    const product =
      products.find(
        item =>
          String(item.id) ===
          String(productId)
      );

    if (!product) {

      alert(
        "المنتج غير موجود."
      );

      return;
    }

    const used =
      getSales().some(
        sale =>
          sale.items.some(
            item =>
              String(item.id) ===
              String(productId)
          )
      );

    if (used) {

      alert(
        "لا يمكن حذف منتج له فواتير سابقة. يمكنك تعديل اسمه أو سعره بدلًا من حذفه."
      );

      return;
    }

    if (
      !confirm(
        `هل تريد حذف "${product.name}"؟`
      )
    ) {
      return;
    }

    const filtered =
      products.filter(
        item =>
          String(item.id) !==
          String(productId)
      );

    if (
      saveProducts(filtered)
    ) {

      alert(
        "تم حذف المنتج."
      );

      showProducts();
    }
  }

  function adjustStock(
    productId
  ) {

    const products =
      getProducts();

    const product =
      products.find(
        item =>
          String(item.id) ===
          String(productId)
      );

    if (!product) {

      alert(
        "المنتج غير موجود."
      );

      return;
    }

    const value =
      prompt(
        `المخزون الحالي: ${product.stock}\n\nأدخل الكمية الجديدة:`,
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

      alert(
        "أدخل كمية صحيحة."
      );

      return;
    }

    product.stock =
      Math.floor(stock);

    if (
      saveProducts(products)
    ) {

      alert(
        "تم تحديث المخزون."
      );

      showProducts();
    }
  }

  /* =====================================================
     الزبائن
     ===================================================== */

  function showCustomers() {
    const app = getApp();

    if (!app) return;

    const customers =
      getCustomers();

    const purchases =
      customers.reduce(
        (sum, customer) =>
          sum +
          getCustomerPurchases(
            customer.id
          ),
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
            <span>الزبائن</span>
            <strong>
              ${customers.length}
            </strong>
            <small>زبون</small>
          </div>

          <div class="stat">
            <span>المشتريات</span>
            <strong>
              ${money(purchases)}
            </strong>
            <small>ل.س</small>
          </div>

          <div class="stat">
            <span>الديون</span>
            <strong>
              ${money(
                getTotalDebts()
              )}
            </strong>
            <small>متبقي</small>
          </div>

        </section>


        <section class="section">

          <div class="section-heading">

            <h3>
              قائمة الزبائن
            </h3>

            <button
              class="primary-button"
              id="addCustomer"
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
              placeholder="🔎 ابحث عن اسم أو هاتف..."
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
      .getElementById(
        "backCustomers"
      )
      ?.addEventListener(
        "click",
        showMore
      );

    document
      .getElementById(
        "addCustomer"
      )
      ?.addEventListener(
        "click",
        () =>
          showCustomerForm()
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
            أضف أول زبون.
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

        return `
          <div class="customer-card">

            <div
              style="
                display:flex;
                justify-content:space-between;
                gap:12px;
              "
            >

              <div>

                <strong>
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

              </div>


              <div
                style="
                  text-align:left;
                "
              >

                <strong>
                  ${money(
                    debt.remaining
                  )}
                </strong>

                <small>
                  المتبقي
                </small>

              </div>

            </div>


            <div
              style="
                display:grid;
                grid-template-columns:
                  repeat(3,1fr);
                gap:8px;
                margin-top:12px;
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
                <small>المدفوع</small>
                <strong>
                  ${money(
                    debt.totalPaid
                  )}
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
                تعديل
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

  function bindCustomerActions() {

    document
      .querySelectorAll(
        "[data-customer-profile]"
      )
      .forEach(button => {

        button.onclick = () =>
          showCustomerProfile(
            button.dataset
              .customerProfile
          );
      });

    document
      .querySelectorAll(
        "[data-customer-edit]"
      )
      .forEach(button => {

        button.onclick = () =>
          showCustomerForm(
            button.dataset
              .customerEdit
          );
      });

    document
      .querySelectorAll(
        "[data-customer-delete]"
      )
      .forEach(button => {

        button.onclick = () =>
          deleteCustomer(
            button.dataset
              .customerDelete
          );
      });
  }

  function searchCustomers(event) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    const filtered =
      getCustomers().filter(
        customer =>
          String(
            customer.name || ""
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
        renderCustomers(
          filtered
        );
    }

    bindCustomerActions();
  }

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
                  placeholder="اسم الزبون"
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
                          customer.phone ||
                          ""
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
                          customer.notes ||
                          ""
                        )
                      : ""
                  }"
                  placeholder="اختياري"
                >

              </div>

            </div>


            <button
              class="primary-button"
              type="submit"
              style="margin-top:18px"
            >
              ${
                editing
                  ? "✓ حفظ التعديلات"
                  : "＋ حفظ الزبون"
              }
            </button>


            ${
              editing
                ? `
                  <button
                    class="danger-button"
                    type="button"
                    id="deleteCustomerForm"
                    style="margin-top:10px"
                  >
                    حذف الزبون
                  </button>
                `
                : ""
            }

          </form>

        </section>

      </div>

      ${createBottomNavigation("more")}
    `;

    document
      .getElementById(
        "backCustomerForm"
      )
      ?.addEventListener(
        "click",
        showCustomers
      );

    document
      .getElementById(
        "customerForm"
      )
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
        "deleteCustomerForm"
      )
      ?.addEventListener(
        "click",
        () =>
          deleteCustomer(
            customerId
          )
      );

    setupNavigation();
  }

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

      alert(
        "اكتب اسم الزبون."
      );

      return;
    }

    const customers =
      getCustomers();

    const duplicate =
      customers.some(
        customer =>
          customer.name
            .trim()
            .toLowerCase() ===
            name.toLowerCase() &&
          String(customer.id) !==
            String(customerId)
      );

    if (duplicate) {

      alert(
        "يوجد زبون بهذا الاسم مسبقًا."
      );

      return;
    }

    if (customerId === null) {

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
      saveCustomers(
        customers
      )
    ) {

      alert(
        customerId === null
          ? "تم حفظ الزبون."
          : "تم حفظ التعديلات."
      );

      showCustomers();
    }
  }

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

    if (!customer) return;

    const debt =
      getCustomerDebt(
        customerId
      );

    if (
      debt.remaining > 0
    ) {

      alert(
        "لا يمكن حذف زبون عليه دين. سجّل الدفعة أولًا."
      );

      return;
    }

    if (
      !confirm(
        `هل تريد حذف "${customer.name}"؟`
      )
    ) {
      return;
    }

    const filtered =
      customers.filter(
        item =>
          String(item.id) !==
          String(customerId)
      );

    if (
      saveCustomers(
        filtered
      )
    ) {

      alert(
        "تم حذف الزبون."
      );

      showCustomers();
    }
  }

  /* =====================================================
     ملف الزبون
     ===================================================== */

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
      getSales().filter(
        sale =>
          String(
            sale.customerId
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
                  : "لا يوجد هاتف"
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
              ${money(
                debt.totalPaid
              )}
            </strong>
            <small>ل.س</small>
          </div>

          <div class="stat">
            <span>المتبقي</span>
            <strong>
              ${money(
                debt.remaining
              )}
            </strong>
            <small>ل.س</small>
          </div>

        </section>


        <section class="section">

          <div class="quickgrid">

            <button
              class="quick-card"
              id="editCustomerProfile"
            >
              <span class="quick-icon">
                ✎
              </span>

              <strong>
                تعديل البيانات
              </strong>

              <small>
                اسم وهاتف وملاحظات
              </small>
            </button>


            <button
              class="quick-card"
              id="customerPayment"
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
              مشتريات الزبون
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
                      createSaleCard
                    )
                    .join("")
                : `
                  <div class="empty-state">
                    <span>🧾</span>
                    <strong>
                      لا توجد مشتريات
                    </strong>
                    <small>
                      لم يشترِ هذا الزبون بعد.
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
        "editCustomerProfile"
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
        "customerPayment"
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

  function addCustomerPayment(
    customerId
  ) {

    const customer =
      getCustomers().find(
        item =>
          String(item.id) ===
          String(customerId)
      );

    if (!customer) return;

    const debt =
      getCustomerDebt(
        customerId
      );

    if (
      debt.remaining <= 0
    ) {

      alert(
        "لا يوجد دين متبقي على هذا الزبون."
      );

      return;
    }

    const value =
      prompt(
        `المتبقي: ${money(
          debt.remaining
        )}\n\nأدخل المبلغ المدفوع:`,
        String(
          debt.remaining
        )
      );

    if (value === null) return;

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

    if (
      amount > debt.remaining
    ) {

      alert(
        "المبلغ أكبر من المتبقي."
      );

      return;
    }

    const payments =
      getPayments();

    payments.push({
      id:
        generateId("PAY"),
      customerId:
        customer.id,
      customerName:
        customer.name,
      amount,
      createdAt:
        new Date().toISOString()
    });

    if (
      savePayments(
        payments
      )
    ) {

      alert(
        "تم تسجيل الدفعة."
      );

      showCustomerProfile(
        customerId
      );
    }
  }

  /* =====================================================
     صفحة الديون
     ===================================================== */

  function showDebts() {
    const app = getApp();

    if (!app) return;

    const customers =
      getCustomers();

    const rows =
      customers
        .map(customer => {

          const debt =
            getCustomerDebt(
              customer.id
            );

          return {
            customer,
            debt
          };
        })
        .filter(
          row =>
            row.debt.remaining > 0
        );

    const total =
      rows.reduce(
        (sum, row) =>
          sum +
          row.debt.remaining,
        0
      );

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backDebts"
          >
            ←
          </button>

          <div>
            <h1>
              ديون الزبائن
            </h1>
          </div>

        </div>


        <section class="hero">

          <div>

            <span class="hero-label">
              مجموع الديون
            </span>

            <h2>
              ${money(total)}
            </h2>

            <p>
              على ${rows.length} زبون
            </p>

          </div>

          <div class="seal">
            EB
          </div>

        </section>


        <section class="stats">

          <div class="stat">
            <span>إجمالي الديون</span>
            <strong>
              ${money(total)}
            </strong>
            <small>ل.س</small>
          </div>

          <div class="stat">
            <span>الزبائن المدينون</span>
            <strong>
              ${rows.length}
            </strong>
            <small>زبون</small>
          </div>

        </section>


        <section class="section">

          <div class="section-heading">
            <h3>
              الحسابات المستحقة
            </h3>
          </div>

          <div class="activity-list">

            ${
              rows.length
                ? rows
                    .sort(
                      (
                        a,
                        b
                      ) =>
                        b.debt.remaining -
                        a.debt.remaining
                    )
                    .map(
                      row => `
                        <div class="customer-card">

                          <div
                            style="
                              display:flex;
                              justify-content:space-between;
                              gap:12px;
                            "
                          >

                            <div>

                              <strong>
                                ${escapeHtml(
                                  row.customer.name
                                )}
                              </strong>

                              <small>
                                إجمالي الدين:
                                ${money(
                                  row.debt.totalDebt
                                )}
                              </small>

                              <small>
                                المدفوع:
                                ${money(
                                  row.debt.totalPaid
                                )}
                              </small>

                            </div>

                            <div
                              style="
                                text-align:left;
                              "
                            >

                              <strong>
                                ${money(
                                  row.debt.remaining
                                )}
                              </strong>

                              <small>
                                المتبقي
                              </small>

                            </div>

                          </div>


                          <div
                            style="
                              display:grid;
                              grid-template-columns:
                                1fr 1fr;
                              gap:8px;
                              margin-top:12px;
                            "
                          >

                            <button
                              class="primary-button"
                              data-debt-customer="${
                                row.customer.id
                              }"
                            >
                              تسجيل دفعة
                            </button>

                            <button
                              class="secondary-button"
                              data-debt-profile="${
                                row.customer.id
                              }"
                            >
                              ملف الزبون
                            </button>

                          </div>

                        </div>
                      `
                    )
                    .join("")
                : `
                  <div class="empty-state">
                    <span>✓</span>
                    <strong>
                      لا توجد ديون
                    </strong>
                    <small>
                      جميع الحسابات مسددة.
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
        "backDebts"
      )
      ?.addEventListener(
        "click",
        showMore
      );

    document
      .querySelectorAll(
        "[data-debt-customer]"
      )
      .forEach(button => {

        button.onclick = () =>
          addCustomerPayment(
            button.dataset
              .debtCustomer
          );
      });

    document
      .querySelectorAll(
        "[data-debt-profile]"
      )
      .forEach(button => {

        button.onclick = () =>
          showCustomerProfile(
            button.dataset
              .debtProfile
          );
      });

    setupNavigation();
  }

  /* =====================================================
     المزيد
     ===================================================== */

  function showMore() {
    const app = getApp();

    if (!app) return;

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <div>
            <span class="kicker">
              ${APP_NAME}
            </span>

            <h1>
              المزيد
            </h1>
          </div>

        </div>


        <section class="section">

          <div class="quickgrid">

            <button
              class="quick-card"
              id="customersPage"
            >
              <span class="quick-icon">
                ♙
              </span>

              <strong>
                الزبائن
              </strong>

              <small>
                إدارة الزبائن وحساباتهم
              </small>
            </button>


            <button
              class="quick-card"
              id="debtsPage"
            >
              <span class="quick-icon">
                ₪
              </span>

              <strong>
                ديون الزبائن
              </strong>

              <small>
                ${money(
                  getTotalDebts()
                )}
              </small>
            </button>


            <button
              class="quick-card"
              id="inventoryPage"
            >
              <span class="quick-icon">
                □
              </span>

              <strong>
                المخزون
              </strong>

              <small>
                إدارة الكميات
              </small>
            </button>


            <button
              class="quick-card"
              id="resetDaily"
            >
              <span class="quick-icon">
                ↻
              </span>

              <strong>
                تصفير اليوم
              </strong>

              <small>
                بدء حساب يوم جديد
              </small>
            </button>

          </div>

        </section>


        <section class="section">

          <div class="form-card">

            <strong>
              معلومات النظام
            </strong>

            <p>
              ${APP_NAME}
            </p>

            <small>
              البيانات محفوظة محليًا في المتصفح.
            </small>

          </div>

        </section>

      </div>

      ${createBottomNavigation("more")}
    `;

    document
      .getElementById(
        "customersPage"
      )
      ?.addEventListener(
        "click",
        showCustomers
      );

    document
      .getElementById(
        "debtsPage"
      )
      ?.addEventListener(
        "click",
        showDebts
      );

    document
      .getElementById(
        "inventoryPage"
      )
      ?.addEventListener(
        "click",
        showProducts
      );

    document
      .getElementById(
        "resetDaily"
      )
      ?.addEventListener(
        "click",
        resetDaily
      );

    setupNavigation();
  }

  /* =====================================================
     تصفير الحسابات اليومية
     ===================================================== */

  function resetDaily() {

    const sales =
      getSales();

    const today =
      todayKey();

    const todaySales =
      sales.filter(
        sale =>
          todayKey(
            sale.createdAt
          ) === today
      );

    if (!todaySales.length) {

      alert(
        "لا توجد مبيعات اليوم لتصفيتها."
      );

      return;
    }

    const total =
      todaySales.reduce(
        (sum, sale) =>
          sum + number(sale.total),
        0
      );

    const confirmed =
      confirm(
        `مبيعات اليوم: ${money(total)}\nعدد الفواتير: ${todaySales.length}\n\nهل تريد بدء يوم جديد؟\n\nلن يتم حذف الفواتير، وسيبقى سجل المبيعات محفوظًا.`
      );

    if (!confirmed) return;

    localStorage.setItem(
      "alburj_daily_reset",
      JSON.stringify({
        date: today,
        resetAt:
          new Date().toISOString()
      })
    );

    alert(
      "تم تصفير حسابات اليوم. سجل المبيعات لم يُحذف."
    );

    showDashboard();
  }

  /* =====================================================
     تشغيل التطبيق
     ===================================================== */

  function init() {

    getProducts();
    getSales();
    getCustomers();
    getDebts();
    getPayments();

    showDashboard();
  }

  init();
});
