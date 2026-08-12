document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =========================================================
     إكسبريس البرج
     نظام مبيعات + منتجات + مخزون + عملاء + ديون
  ========================================================= */

  const CURRENCY = "ل.س";

  const KEYS = {
    products: "burj_express_products_v3",
    sales: "burj_express_sales_v3",
    customers: "burj_express_customers_v3",
    debts: "burj_express_debts_v3",
    daily: "burj_express_daily_v3"
  };

  let cart = [];

  /* =========================================================
     منتجات افتراضية
  ========================================================= */

  const defaultProducts = [
    {
      id: createId(),
      name: "عصير برتقال",
      price: 5000,
      stock: 50
    },
    {
      id: createId(),
      name: "مياه معدنية",
      price: 2000,
      stock: 100
    },
    {
      id: createId(),
      name: "بيبسي",
      price: 4000,
      stock: 60
    },
    {
      id: createId(),
      name: "شيبس",
      price: 3500,
      stock: 70
    },
    {
      id: createId(),
      name: "بسكويت",
      price: 3000,
      stock: 80
    },
    {
      id: createId(),
      name: "حليب",
      price: 6000,
      stock: 40
    }
  ];

  /* =========================================================
     أدوات عامة
  ========================================================= */

  function createId() {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 9)
    );
  }

  function getApp() {
    return document.getElementById("app");
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
      console.error("Storage error:", error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Save error:", error);
      alert("تعذر حفظ البيانات في المتصفح.");
      return false;
    }
  }

  function getProducts() {
    const saved = readStorage(KEYS.products, null);

    if (Array.isArray(saved)) {
      return saved;
    }

    writeStorage(KEYS.products, defaultProducts);

    return defaultProducts;
  }

  function saveProducts(products) {
    return writeStorage(KEYS.products, products);
  }

  function getSales() {
    const sales = readStorage(KEYS.sales, []);

    return Array.isArray(sales) ? sales : [];
  }

  function saveSales(sales) {
    return writeStorage(KEYS.sales, sales);
  }

  function getCustomers() {
    const customers = readStorage(KEYS.customers, []);

    return Array.isArray(customers) ? customers : [];
  }

  function saveCustomers(customers) {
    return writeStorage(KEYS.customers, customers);
  }

  function getDebts() {
    const debts = readStorage(KEYS.debts, []);

    return Array.isArray(debts) ? debts : [];
  }

  function saveDebts(debts) {
    return writeStorage(KEYS.debts, debts);
  }

  function money(value) {
    const number = Number(value || 0);

    return (
      number.toLocaleString("ar-SY") +
      " " +
      CURRENCY
    );
  }

  function number(value) {
    return Number(value || 0);
  }

  function dateText(value) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "ar-SY"
    );
  }

  function timeText(value) {
    if (!value) return "-";

    return new Date(value).toLocaleTimeString(
      "ar-SY",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  function dateTimeText(value) {
    return (
      dateText(value) +
      " - " +
      timeText(value)
    );
  }

  function todayKey() {
    const now = new Date();

    return (
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0")
    );
  }

  function monthKey(date = new Date()) {
    const d = new Date(date);

    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0")
    );
  }

  function generateInvoiceNumber() {
    const now = new Date();

    return (
      "INV-" +
      now.getFullTime?.() ||
      "INV-" +
      Date.now()
    );
  }

  /*
    تصحيح توليد رقم الفاتورة
  */
  function invoiceNumber() {
    const now = new Date();

    const date =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    const time =
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");

    return (
      "EB-" +
      date +
      "-" +
      time +
      "-" +
      Math.floor(Math.random() * 100)
    );
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* =========================================================
     العملاء
  ========================================================= */

  function customerDebt(customerId) {
    return getDebts()
      .filter(
        (debt) =>
          String(debt.customerId) ===
          String(customerId)
      )
      .reduce(
        (sum, debt) =>
          sum +
          number(debt.amount) -
          number(debt.paid),
        0
      );
  }

  function customerPurchasesThisMonth(customerId) {
    const currentMonth = monthKey();

    return getSales()
      .filter(
        (sale) =>
          String(sale.customerId) ===
            String(customerId) &&
          monthKey(sale.createdAt) ===
            currentMonth
      )
      .reduce(
        (sum, sale) =>
          sum + number(sale.total),
        0
      );
  }

  function customerPaidThisMonth(customerId) {
    const currentMonth = monthKey();

    return getDebts()
      .filter(
        (debt) =>
          String(debt.customerId) ===
            String(customerId) &&
          monthKey(debt.createdAt) ===
            currentMonth
      )
      .reduce(
        (sum, debt) =>
          sum + number(debt.paid),
        0
      );
  }

  function getOrCreateCustomer(name) {
    const cleanName = String(name || "").trim();

    if (!cleanName) {
      return null;
    }

    const customers = getCustomers();

    let customer = customers.find(
      (item) =>
        item.name.trim().toLowerCase() ===
        cleanName.toLowerCase()
    );

    if (customer) {
      return customer;
    }

    customer = {
      id: createId(),
      name: cleanName,
      phone: "",
      notes: "",
      createdAt: new Date().toISOString()
    };

    customers.push(customer);

    saveCustomers(customers);

    return customer;
  }

  /* =========================================================
     التنقل
  ========================================================= */

  function navigation(active = "home") {
    return `
      <nav class="bottom-nav">

        <button
          class="nav-item ${
            active === "home" ? "active" : ""
          }"
          data-nav="home"
        >
          <span>⌂</span>
          <small>الرئيسية</small>
        </button>

        <button
          class="nav-item ${
            active === "sales" ? "active" : ""
          }"
          data-nav="sales"
        >
          <span>▣</span>
          <small>المبيعات</small>
        </button>

        <button
          class="nav-item main-sale ${
            active === "sale" ? "active" : ""
          }"
          data-nav="sale"
        >
          <span>＋</span>
          <small>بيع</small>
        </button>

        <button
          class="nav-item ${
            active === "products" ? "active" : ""
          }"
          data-nav="products"
        >
          <span>□</span>
          <small>المنتجات</small>
        </button>

        <button
          class="nav-item ${
            active === "more" ? "active" : ""
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
      .forEach((button) => {
        button.addEventListener("click", () => {
          const page = button.dataset.nav;

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
        });
      });
  }

  /* =========================================================
     لوحة التحكم
  ========================================================= */

  function showDashboard() {
    const app = getApp();

    if (!app) return;

    const sales = getSales();
    const products = getProducts();

    const today = todayKey();

    const todaySales = sales.filter(
      (sale) =>
        todayKey(new Date(sale.createdAt)) ===
        today
    );

    const todayTotal = todaySales.reduce(
      (sum, sale) =>
        sum + number(sale.total),
      0
    );

    const stockCount = products.reduce(
      (sum, product) =>
        sum + number(product.stock),
      0
    );

    const totalSales = sales.reduce(
      (sum, sale) =>
        sum + number(sale.total),
      0
    );

    const debts = getDebts();

    const totalDebt = debts.reduce(
      (sum, debt) =>
        sum +
        number(debt.amount) -
        number(debt.paid),
      0
    );

    app.innerHTML = `
      <div class="page">

        <div class="topbar">

          <div class="brand">

            <div class="brand-logo">
              EB
            </div>

            <div class="brand-text">
              <small>نظام إدارة المبيعات</small>
              <strong>إكسبريس البرج</strong>
            </div>

          </div>

          <button
            class="icon-button"
            id="refreshDashboard"
            title="تحديث"
          >
            ↻
          </button>

        </div>

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
            <strong>${money(todayTotal)}</strong>
            <small>ل.س</small>
          </div>

          <div class="stat">
            <span>فواتير اليوم</span>
            <strong>${todaySales.length}</strong>
            <small>فاتورة</small>
          </div>

          <div class="stat">
            <span>المخزون</span>
            <strong>${stockCount}</strong>
            <small>قطعة</small>
          </div>

          <div class="stat">
            <span>ديون الزبائن</span>
            <strong>${money(totalDebt)}</strong>
            <small>متبقي</small>
          </div>

        </section>

        <section class="section">

          <div class="section-heading">
            <h3>اختصارات العمل</h3>
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
              id="newProductButton"
            >
              <span class="quick-icon">📦</span>
              <strong>منتج جديد</strong>
              <small>إضافة للمخزون</small>
            </button>

            <button
              class="quick-card"
              id="customersButton"
            >
              <span class="quick-icon">👤</span>
              <strong>الزبائن</strong>
              <small>حسابات العملاء</small>
            </button>

            <button
              class="quick-card"
              id="debtsButton"
            >
              <span class="quick-icon">💳</span>
              <strong>ديون الزبائن</strong>
              <small>إضافة ومتابعة الديون</small>
            </button>

            <button
              class="quick-card"
              id="inventoryButton"
            >
              <span class="quick-icon">▥</span>
              <strong>المخزون</strong>
              <small>إدارة المنتجات والكميات</small>
            </button>

            <button
              class="quick-card"
              id="salesButton"
            >
              <span class="quick-icon">🧾</span>
              <strong>سجل المبيعات</strong>
              <small>البحث عن الفواتير</small>
            </button>

            <button
              class="quick-card"
              id="resetDayButton"
            >
              <span class="quick-icon">↻</span>
              <strong>تصفير اليوم</strong>
              <small>بدء حساب يوم جديد</small>
            </button>

            <button
              class="quick-card"
              id="moreButton"
            >
              <span class="quick-icon">☰</span>
              <strong>المزيد</strong>
              <small>خيارات النظام</small>
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
              sales.length === 0
                ? `
                  <div class="empty-state">
                    <span>🧾</span>
                    <strong>لا توجد مبيعات بعد</strong>
                    <small>
                      عند إنشاء أول فاتورة ستظهر هنا.
                    </small>
                  </div>
                `
                : sales
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map(saleCard)
                    .join("")
            }

          </div>

        </section>

        <section class="section">

          <div class="section-heading">
            <h3>ملخص النظام</h3>
          </div>

          <div class="stats">

            <div class="stat">
              <span>إجمالي المبيعات</span>
              <strong>${money(totalSales)}</strong>
              <small>منذ البداية</small>
            </div>

            <div class="stat">
              <span>عدد المنتجات</span>
              <strong>${products.length}</strong>
              <small>منتج</small>
            </div>

            <div class="stat">
              <span>عدد الزبائن</span>
              <strong>${getCustomers().length}</strong>
              <small>زبون</small>
            </div>

            <div class="stat">
              <span>عدد الديون</span>
              <strong>${debts.length}</strong>
              <small>عملية دين</small>
            </div>

          </div>

        </section>

      </div>

      ${navigation("home")}
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
        showProducts
      );

    document
      .getElementById("salesButton")
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    document
      .getElementById("viewAllSales")
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    document
      .getElementById("resetDayButton")
      ?.addEventListener(
        "click",
        resetDailyAccount
      );

    document
      .getElementById("moreButton")
      ?.addEventListener(
        "click",
        showMore
      );

    setupNavigation();
  }

  function saleCard(sale) {
    return `
      <button
        class="sale-card"
        data-invoice-open="${escapeHTML(
          sale.invoiceNumber
        )}"
      >

        <div>
          <strong>
            ${escapeHTML(sale.invoiceNumber)}
          </strong>

          <small>
            ${dateTimeText(sale.createdAt)}
          </small>

          <small>
            ${sale.items.length} منتج
            -
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
     شاشة البيع
  ========================================================= */

  function showSalesScreen() {
    const app = getApp();

    if (!app) return;

    cart = [];

    const products = getProducts();

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backButton"
          >
            →
          </button>

          <div>
            <h1>بيع جديد</h1>
          </div>

        </div>

        <div class="form-card">

          <input
            id="productSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن المنتج..."
          >

        </div>

        <section class="section">

          <div class="section-heading">
            <h3>المنتجات</h3>
            <span>${products.length} منتج</span>
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
                    data-product-id="${product.id}"
                  >

                    <strong>
                      ${escapeHTML(product.name)}
                    </strong>

                    <small>
                      ${money(product.price)}
                    </small>

                    <small>
                      المخزون:
                      ${number(product.stock)}
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

          <div class="total-box">

            <span>الإجمالي</span>

            <strong id="totalElement">
              ${money(0)}
            </strong>

          </div>

          <div
            style="
              margin-top:15px;
              display:grid;
              gap:10px;
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

      ${navigation("sale")}
    `;

    document
      .getElementById("backButton")
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .querySelectorAll("[data-product-id]")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const id =
              button.dataset.productId;

            const product =
              getProducts().find(
                (item) =>
                  String(item.id) ===
                  String(id)
              );

            if (product) {
              addToCart(product);
            }
          }
        );
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

  function addToCart(product) {
    if (number(product.stock) <= 0) {
      alert("هذا المنتج غير متوفر في المخزون.");
      return;
    }

    const existing = cart.find(
      (item) =>
        String(item.id) ===
        String(product.id)
    );

    if (existing) {
      if (
        existing.qty >=
        number(product.stock)
      ) {
        alert("لا توجد كمية كافية في المخزون.");
        return;
      }

      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: number(product.price),
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

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span>🛒</span>
          <strong>السلة فارغة</strong>
          <small>
            اختر منتجًا لإضافته.
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
                style="width:38px;padding:5px"
                data-cart-action="increase"
                data-cart-index="${index}"
              >
                +
              </button>

              <strong>
                ${item.qty}
              </strong>

              <button
                class="secondary-button"
                style="width:38px;padding:5px"
                data-cart-action="decrease"
                data-cart-index="${index}"
              >
                −
              </button>

              <button
                class="danger-button"
                style="width:38px;padding:5px"
                data-cart-action="remove"
                data-cart-index="${index}"
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
        button.addEventListener(
          "click",
          () => {
            const index =
              Number(
                button.dataset.cartIndex
              );

            const action =
              button.dataset.cartAction;

            if (!cart[index]) return;

            if (action === "increase") {
              const product =
                getProducts().find(
                  (item) =>
                    String(item.id) ===
                    String(cart[index].id)
                );

              if (
                product &&
                cart[index].qty <
                  number(product.stock)
              ) {
                cart[index].qty += 1;
              } else {
                alert(
                  "لا توجد كمية إضافية في المخزون."
                );
              }
            }

            if (action === "decrease") {
              cart[index].qty -= 1;

              if (cart[index].qty <= 0) {
                cart.splice(index, 1);
              }
            }

            if (action === "remove") {
              cart.splice(index, 1);
            }

            renderCart();
          }
        );
      });
  }

  function filterProducts(event) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    document
      .querySelectorAll(
        "[data-product-id]"
      )
      .forEach((button) => {
        const productId =
          button.dataset.productId;

        const product =
          getProducts().find(
            (item) =>
              String(item.id) ===
              String(productId)
          );

        const name =
          product?.name
            ?.toLowerCase() || "";

        button.style.display =
          name.includes(search)
            ? ""
            : "none";
      });
  }

  /* =========================================================
     إتمام البيع
  ========================================================= */

  function completeSale() {
    if (cart.length === 0) {
      alert("أضف منتجًا إلى السلة أولًا.");
      return;
    }

    const total = cart.reduce(
      (sum, item) =>
        sum +
        number(item.price) *
          number(item.qty),
      0
    );

    const customerName = prompt(
      "اسم الزبون:\n\nاتركه فارغًا إذا كان البيع نقديًا بدون حساب عميل.",
      ""
    );

    let customer = null;

    if (
      customerName &&
      customerName.trim()
    ) {
      customer =
        getOrCreateCustomer(
          customerName
        );
    }

    const paymentChoice = prompt(
      "طريقة الدفع:\n\n1 = نقدي\n2 = بطاقة\n3 = دين",
      customer ? "3" : "1"
    );

    if (paymentChoice === null) {
      return;
    }

    let paymentMethod = "نقدي";

    if (
      paymentChoice.trim() === "2"
    ) {
      paymentMethod = "بطاقة";
    }

    if (
      paymentChoice.trim() === "3"
    ) {
      paymentMethod = "دين";
    }

    if (
      paymentMethod === "دين" &&
      !customer
    ) {
      alert(
        "يجب إدخال اسم الزبون عند البيع بالدين."
      );
      return;
    }

    const products = getProducts();

    for (const item of cart) {
      const product =
        products.find(
          (product) =>
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
          `الكمية غير كافية من المنتج: ${product.name}`
        );
        return;
      }
    }

    const createdAt =
      new Date().toISOString();

    const sale = {
      id: createId(),

      invoiceNumber:
        invoiceNumber(),

      createdAt,

      customerId:
        customer?.id || null,

      customerName:
        customer?.name || "",

      paymentMethod,

      total,

      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        qty: number(item.qty),
        price: number(item.price),
        subtotal:
          number(item.qty) *
          number(item.price)
      }))
    };

    for (const item of cart) {
      const product =
        products.find(
          (product) =>
            String(product.id) ===
            String(item.id)
        );

      product.stock =
        number(product.stock) -
        number(item.qty);
    }

    if (!saveProducts(products)) {
      return;
    }

    const sales = getSales();

    sales.push(sale);

    if (!saveSales(sales)) {
      return;
    }

    if (paymentMethod === "دين") {
      const debts = getDebts();

      debts.push({
        id: createId(),

        customerId:
          customer.id,

        customerName:
          customer.name,

        saleId:
          sale.id,

        invoiceNumber:
          sale.invoiceNumber,

        productNames:
          sale.items
            .map(
              (item) =>
                `${item.name} × ${item.qty}`
            )
            .join("، "),

        amount:
          total,

        paid: 0,

        note:
          "دين ناتج عن فاتورة بيع",

        createdAt
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
    const app = getApp();

    if (!app) return;

    app.innerHTML = `
      <div class="page">

        <div class="invoice">

          <div class="invoice-header">

            <h1>
              إكسبريس البرج
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
              <strong>رقم الفاتورة:</strong>
              ${escapeHTML(
                sale.invoiceNumber
              )}
            </div>

            <div>
              <strong>التاريخ:</strong>
              ${dateText(
                sale.createdAt
              )}
            </div>

            <div>
              <strong>الوقت:</strong>
              ${timeText(
                sale.createdAt
              )}
            </div>

            <div>
              <strong>الزبون:</strong>
              ${
                sale.customerName
                  ? escapeHTML(
                      sale.customerName
                    )
                  : "زبون نقدي"
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

            <span>
              الإجمالي
            </span>

            <h2>
              ${money(sale.total)}
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
      .getElementById("printInvoice")
      ?.addEventListener(
        "click",
        () => window.print()
      );

    document
      .getElementById("invoiceSales")
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    document
      .getElementById("invoiceNewSale")
      ?.addEventListener(
        "click",
        showSalesScreen
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
    const app = getApp();

    if (!app) return;

    const sales = getSales();

    const total = sales.reduce(
      (sum, sale) =>
        sum + number(sale.total),
      0
    );

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="salesBack"
          >
            →
          </button>

          <h1>سجل المبيعات</h1>

        </div>

        <div class="form-card">

          <input
            id="salesSearch"
            class="search-input"
            type="search"
            placeholder="🔎 رقم الفاتورة أو اسم الزبون أو المنتج..."
          >

        </div>

        <div class="stats">

          <div class="stat">
            <span>عدد الفواتير</span>
            <strong>${sales.length}</strong>
            <small>فاتورة</small>
          </div>

          <div class="stat">
            <span>إجمالي المبيعات</span>
            <strong>${money(total)}</strong>
            <small>ل.س</small>
          </div>

        </div>

        <section class="section">

          <div class="section-heading">
            <h3>الفواتير</h3>
            <span id="salesCounter">
              ${sales.length} فاتورة
            </span>
          </div>

          <div
            class="activity-list"
            id="salesList"
          >
            ${renderSalesList(sales)}
          </div>

        </section>

      </div>

      ${navigation("sales")}
    `;

    document
      .getElementById("salesBack")
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById("salesSearch")
      ?.addEventListener(
        "input",
        searchSales
      );

    attachInvoiceButtons();

    setupNavigation();
  }

  function renderSalesList(sales) {
    if (!sales.length) {
      return `
        <div class="empty-state">
          <span>🧾</span>
          <strong>لا توجد نتائج</strong>
          <small>
            لم يتم العثور على فواتير.
          </small>
        </div>
      `;
    }

    return sales
      .slice()
      .reverse()
      .map(saleCard)
      .join("");
  }

  function attachInvoiceButtons() {
    document
      .querySelectorAll(
        "[data-invoice-open]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const invoice =
              button.dataset
                .invoiceOpen;

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

  function searchSales(event) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    const filtered =
      getSales().filter((sale) => {
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
              (item) =>
                item.name
            )
            .join(" ")
            .toLowerCase();

        return (
          invoice.includes(search) ||
          customer.includes(search) ||
          payment.includes(search) ||
          products.includes(search)
        );
      });

    const list =
      document.getElementById(
        "salesList"
      );

    if (list) {
      list.innerHTML =
        renderSalesList(filtered);
    }

    const counter =
      document.getElementById(
        "salesCounter"
      );

    if (counter) {
      counter.textContent =
        filtered.length +
        " فاتورة";
    }

    attachInvoiceButtons();
  }

  /* =========================================================
     المنتجات والمخزون
  ========================================================= */

  function showProducts() {
    const app = getApp();

    if (!app) return;

    const products = getProducts();

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="productsBack"
          >
            →
          </button>

          <h1>المنتجات والمخزون</h1>

        </div>

        <div class="form-card">

          <input
            id="productsSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن منتج..."
          >

        </div>

        <div
          class="section"
          style="margin-top:20px"
        >

          <div class="section-heading">

            <h3>قائمة المنتجات</h3>

            <button
              class="primary-button"
              id="addProduct"
              style="
                min-height:42px;
                padding:8px 14px;
              "
            >
              ＋ إضافة منتج
            </button>

          </div>

          <div
            id="productsList"
            class="activity-list"
          >
            ${renderProducts(products)}
          </div>

        </div>

      </div>

      ${navigation("products")}
    `;

    document
      .getElementById("productsBack")
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById("addProduct")
      ?.addEventListener(
        "click",
        () => showProductForm()
      );

    document
      .getElementById("productsSearch")
      ?.addEventListener(
        "input",
        searchProducts
      );

    attachProductActions();

    setupNavigation();
  }

  function renderProducts(products) {
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
            class="customer-card"
            data-product-row="${product.id}"
          >

            <div class="customer-info">

              <strong>
                ${escapeHTML(
                  product.name
                )}
              </strong>

              <small>
                السعر:
                ${money(product.price)}
              </small>

              <small>
                المخزون:
                ${number(product.stock)}
              </small>

            </div>

            <div
              style="
                display:flex;
                gap:6px;
                flex-wrap:wrap;
                justify-content:flex-end;
              "
            >

              <button
                class="secondary-button"
                style="
                  min-height:40px;
                  padding:7px 10px;
                "
                data-product-edit="${product.id}"
              >
                ✏️ تعديل
              </button>

              <button
                class="danger-button"
                style="
                  min-height:40px;
                  padding:7px 10px;
                "
                data-product-delete="${product.id}"
              >
                🗑️ حذف
              </button>

            </div>

          </div>
        `
      )
      .join("");
  }

  function attachProductActions() {
    document
      .querySelectorAll(
        "[data-product-edit]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const id =
              button.dataset
                .productEdit;

            showProductForm(id);
          }
        );
      });

    document
      .querySelectorAll(
        "[data-product-delete]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            deleteProduct(
              button.dataset
                .productDelete
            );
          }
        );
      });
  }

  function searchProducts(event) {
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
        "productsList"
      );

    if (list) {
      list.innerHTML =
        renderProducts(filtered);

      attachProductActions();
    }
  }

  function showProductForm(productId = null) {
    const app = getApp();

    if (!app) return;

    const products = getProducts();

    const product = productId
      ? products.find(
          (item) =>
            String(item.id) ===
            String(productId)
        )
      : null;

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="productFormBack"
          >
            →
          </button>

          <h1>
            ${
              product
                ? "تعديل المنتج"
                : "إضافة منتج"
            }
          </h1>

        </div>

        <div class="form-card">

          <form id="productForm">

            <div class="form-grid">

              <div class="form-group full">
                <label>
                  اسم المنتج
                </label>

                <input
                  id="productName"
                  class="form-input"
                  required
                  value="${
                    product
                      ? escapeHTML(
                          product.name
                        )
                      : ""
                  }"
                  placeholder="مثال: مياه معدنية"
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
                    product
                      ? number(
                          product.price
                        )
                      : ""
                  }"
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
                    product
                      ? number(
                          product.stock
                        )
                      : ""
                  }"
                >

              </div>

              <div class="form-group full">

                <button
                  class="primary-button"
                  type="submit"
                >
                  ${
                    product
                      ? "✓ حفظ التعديلات"
                      : "＋ حفظ المنتج"
                  }
                </button>

              </div>

            </div>

          </form>

        </div>

      </div>

      ${navigation("products")}
    `;

    document
      .getElementById("productFormBack")
      ?.addEventListener(
        "click",
        showProducts
      );

    document
      .getElementById("productForm")
      ?.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          const name =
            document
              .getElementById(
                "productName"
              )
              .value.trim();

          const price =
            number(
              document
                .getElementById(
                  "productPrice"
                )
                .value
            );

          const stock =
            number(
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

          if (price < 0) {
            alert(
              "السعر غير صحيح."
            );
            return;
          }

          if (stock < 0) {
            alert(
              "الكمية غير صحيحة."
            );
            return;
          }

          const allProducts =
            getProducts();

          if (product) {
            product.name = name;
            product.price = price;
            product.stock = stock;
          } else {
            allProducts.push({
              id: createId(),
              name,
              price,
              stock
            });
          }

          if (
            saveProducts(
              allProducts
            )
          ) {
            alert(
              product
                ? "تم تعديل المنتج بنجاح."
                : "تمت إضافة المنتج بنجاح."
            );

            showProducts();
          }
        }
      );

    setupNavigation();
  }

  function deleteProduct(productId) {
    const products = getProducts();

    const product =
      products.find(
        (item) =>
          String(item.id) ===
          String(productId)
      );

    if (!product) return;

    const confirmed =
      confirm(
        `هل تريد حذف المنتج "${product.name}"؟`
      );

    if (!confirmed) return;

    const newProducts =
      products.filter(
        (item) =>
          String(item.id) !==
          String(productId)
      );

    saveProducts(newProducts);

    showProducts();
  }

  /* =========================================================
     العملاء
  ========================================================= */

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
            id="customersBack"
          >
            →
          </button>

          <h1>الزبائن</h1>

        </div>

        <div class="form-card">

          <input
            id="customerSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن اسم الزبون..."
          >

        </div>

        <div
          class="section"
          style="margin-top:20px"
        >

          <div class="section-heading">

            <h3>قائمة الزبائن</h3>

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

          <div
            id="customersList"
            class="activity-list"
          >
            ${renderCustomers(
              customers
            )}
          </div>

        </div>

      </div>

      ${navigation("more")}
    `;

    document
      .getElementById("customersBack")
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById("addCustomer")
      ?.addEventListener(
        "click",
        showCustomerForm
      );

    document
      .getElementById("customerSearch")
      ?.addEventListener(
        "input",
        searchCustomers
      );

    attachCustomerActions();

    setupNavigation();
  }

  function renderCustomers(customers) {
    if (!customers.length) {
      return `
        <div class="empty-state">
          <span>👤</span>
          <strong>لا يوجد زبائن</strong>
          <small>
            أضف أول زبون.
          </small>
        </div>
      `;
    }

    return customers
      .map((customer) => {
        const debt =
          customerDebt(
            customer.id
          );

        const monthly =
          customerPurchasesThisMonth(
            customer.id
          );

        const paid =
          customerPaidThisMonth(
            customer.id
          );

        return `
          <div class="customer-card">

            <div class="customer-info">

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
                المدفوع هذا الشهر:
                ${money(paid)}
              </small>

              <small>
                المتبقي:
                ${money(debt)}
              </small>

            </div>

            <div
              style="
                display:flex;
                gap:6px;
                flex-wrap:wrap;
                justify-content:flex-end;
              "
            >

              <button
                class="secondary-button"
                style="
                  min-height:40px;
                  padding:7px 10px;
                "
                data-customer-view="${customer.id}"
              >
                👁️ الحساب
              </button>

              <button
                class="secondary-button"
                style="
                  min-height:40px;
                  padding:7px 10px;
                "
                data-customer-edit="${customer.id}"
              >
                ✏️ تعديل
              </button>

            </div>

          </div>
        `;
      })
      .join("");
  }

  function attachCustomerActions() {
    document
      .querySelectorAll(
        "[data-customer-view]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            showCustomerAccount(
              button.dataset
                .customerView
            );
          }
        );
      });

    document
      .querySelectorAll(
        "[data-customer-edit]"
      )
      .forEach((button) => {
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
  }

  function searchCustomers(event) {
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

      attachCustomerActions();
    }
  }

  function showCustomerForm(
    customerId = null
  ) {
    const app = getApp();

    if (!app) return;

    const customers =
      getCustomers();

    const customer = customerId
      ? customers.find(
          (item) =>
            String(item.id) ===
            String(customerId)
        )
      : null;

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="customerFormBack"
          >
            →
          </button>

          <h1>
            ${
              customer
                ? "تعديل الزبون"
                : "إضافة زبون"
            }
          </h1>

        </div>

        <div class="form-card">

          <form id="customerForm">

            <div class="form-grid">

              <div class="form-group full">

                <label>
                  اسم الزبون
                </label>

                <input
                  id="customerName"
                  class="form-input"
                  required
                  value="${
                    customer
                      ? escapeHTML(
                          customer.name
                        )
                      : ""
                  }"
                  placeholder="مثال: أحمد"
                >

              </div>

              <div class="form-group">

                <label>
                  رقم الهاتف
                </label>

                <input
                  id="customerPhone"
                  class="form-input"
                  value="${
                    customer
                      ? escapeHTML(
                          customer.phone
                        )
                      : ""
                  }"
                  placeholder="اختياري"
                >

              </div>

              <div class="form-group">

                <label>
                  ملاحظات
                </label>

                <input
                  id="customerNotes"
                  class="form-input"
                  value="${
                    customer
                      ? escapeHTML(
                          customer.notes
                        )
                      : ""
                  }"
                  placeholder="اختياري"
                >

              </div>

              <div class="form-group full">

                <button
                  class="primary-button"
                  type="submit"
                >
                  ${
                    customer
                      ? "✓ حفظ التعديلات"
                      : "＋ حفظ الزبون"
                  }
                </button>

              </div>

            </div>

          </form>

        </div>

      </div>

      ${navigation("more")}
    `;

    document
      .getElementById(
        "customerFormBack"
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
        (event) => {
          event.preventDefault();

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

          const notes =
            document
              .getElementById(
                "customerNotes"
              )
              .value.trim();

          if (!name) {
            alert(
              "اكتب اسم الزبون."
            );
            return;
          }

          const allCustomers =
            getCustomers();

          if (customer) {
            customer.name = name;
            customer.phone = phone;
            customer.notes = notes;
          } else {
            allCustomers.push({
              id: createId(),
              name,
              phone,
              notes,
              createdAt:
                new Date().toISOString()
            });
          }

          saveCustomers(
            allCustomers
          );

          alert(
            customer
              ? "تم تعديل الزبون."
              : "تمت إضافة الزبون."
          );

          showCustomers();
        }
      );

    setupNavigation();
  }

  /* =========================================================
     حساب الزبون
  ========================================================= */

  function showCustomerAccount(
    customerId
  ) {
    const app = getApp();

    if (!app) return;

    const customer =
      getCustomers().find(
        (item) =>
          String(item.id) ===
          String(customerId)
      );

    if (!customer) {
      showCustomers();
      return;
    }

    const debts =
      getDebts().filter(
        (debt) =>
          String(debt.customerId) ===
          String(customer.id)
      );

    const sales =
      getSales().filter(
        (sale) =>
          String(sale.customerId) ===
          String(customer.id)
      );

    const totalDebt =
      customerDebt(customer.id);

    const monthlyPurchases =
      customerPurchasesThisMonth(
        customer.id
      );

    const totalPaid =
      debts.reduce(
        (sum, debt) =>
          sum + number(debt.paid),
        0
      );

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="customerAccountBack"
          >
            →
          </button>

          <h1>
            حساب ${escapeHTML(
              customer.name
            )}
          </h1>

        </div>

        <div class="stats">

          <div class="stat">
            <span>عليه الآن</span>
            <strong>
              ${money(totalDebt)}
            </strong>
            <small>متبقي</small>
          </div>

          <div class="stat">
            <span>مشتريات الشهر</span>
            <strong>
              ${money(monthlyPurchases)}
            </strong>
            <small>هذا الشهر</small>
          </div>

          <div class="stat">
            <span>إجمالي المدفوع</span>
            <strong>
              ${money(totalPaid)}
            </strong>
            <small>منذ البداية</small>
          </div>

          <div class="stat">
            <span>الفواتير</span>
            <strong>
              ${sales.length}
            </strong>
            <small>فاتورة</small>
          </div>

        </div>

        <section class="section">

          <div class="section-heading">
            <h3>عمليات الدين</h3>

            <button
              class="primary-button"
              id="addCustomerDebt"
              style="
                min-height:42px;
                padding:8px 14px;
              "
            >
              ＋ إضافة دين
            </button>
          </div>

          <div class="activity-list">

            ${
              debts.length
                ? debts
                    .slice()
                    .reverse()
                    .map(
                      (debt) => `
                        <div class="customer-card">

                          <div class="customer-info">

                            <strong>
                              ${money(
                                debt.amount
                              )}
                            </strong>

                            <small>
                              ${dateTimeText(
                                debt.createdAt
                              )}
                            </small>

                            <small>
                              المنتج:
                              ${escapeHTML(
                                debt.productNames ||
                                  "غير محدد"
                              )}
                            </small>

                            <small>
                              المدفوع:
                              ${money(
                                debt.paid
                              )}
                            </small>

                            <small>
                              الباقي:
                              ${money(
                                number(
                                  debt.amount
                                ) -
                                  number(
                                    debt.paid
                                  )
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

                            ${
                              number(
                                debt.amount
                              ) -
                                number(
                                  debt.paid
                                ) >
                              0
                                ? `
                                  <button
                                    class="secondary-button"
                                    style="
                                      min-height:40px;
                                      padding:7px 10px;
                                    "
                                    data-debt-payment="${debt.id}"
                                  >
                                    💵 دفعة
                                  </button>
                                `
                                : `
                                  <span class="badge badge-success">
                                    مكتمل
                                  </span>
                                `
                            }

                          </div>

                        </div>
                      `
                    )
                    .join("")
                : `
                  <div class="empty-state">
                    <span>💳</span>
                    <strong>
                      لا توجد ديون
                    </strong>
                    <small>
                      حساب الزبون خالٍ من الديون.
                    </small>
                  </div>
                `
            }

          </div>

        </section>

      </div>

      ${navigation("more")}
    `;

    document
      .getElementById(
        "customerAccountBack"
      )
      ?.addEventListener(
        "click",
        showCustomers
      );

    document
      .getElementById(
        "addCustomerDebt"
      )
      ?.addEventListener(
        "click",
        () =>
          showDebtForm(
            customer.id
          )
      );

    document
      .querySelectorAll(
        "[data-debt-payment]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            addDebtPayment(
              button.dataset
                .debtPayment,
              customer.id
            );
          }
        );
      });

    setupNavigation();
  }

  /* =========================================================
     صفحة الديون
  ========================================================= */

  function showDebts() {
    const app = getApp();

    if (!app) return;

    const customers =
      getCustomers();

    const debts =
      getDebts();

    const totalDebt =
      debts.reduce(
        (sum, debt) =>
          sum +
          number(debt.amount) -
          number(debt.paid),
        0
      );

    const totalOriginal =
      debts.reduce(
        (sum, debt) =>
          sum + number(debt.amount),
        0
      );

    const totalPaid =
      debts.reduce(
        (sum, debt) =>
          sum + number(debt.paid),
        0
      );

    const debtCustomers =
      customers.filter(
        (customer) =>
          customerDebt(
            customer.id
          ) > 0
      );

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="debtsBack"
          >
            →
          </button>

          <h1>ديون الزبائن</h1>

        </div>

        <div class="debt-summary">

          <div class="debt-card">
            <span>
              مجموع الديون
            </span>

            <strong>
              ${money(totalDebt)}
            </strong>
          </div>

          <div class="debt-card">
            <span>
              إجمالي ما تم تسجيله
            </span>

            <strong>
              ${money(totalOriginal)}
            </strong>
          </div>

          <div class="debt-card">
            <span>
              إجمالي المدفوع
            </span>

            <strong>
              ${money(totalPaid)}
            </strong>
          </div>

        </div>

        <div class="form-card">

          <div
            style="
              display:grid;
              gap:10px;
            "
          >

            <button
              class="primary-button"
              id="addDebtButton"
            >
              ＋ إضافة دين جديد
            </button>

            <button
              class="secondary-button"
              id="addCustomerDebtButton"
            >
              👤 إضافة زبون عليه دين
            </button>

          </div>

        </div>

        <section
          class="section"
          style="margin-top:20px"
        >

          <div class="section-heading">

            <h3>
              الزبائن الذين عليهم ديون
            </h3>

            <span>
              ${debtCustomers.length} زبون
            </span>

          </div>

          <div
            class="activity-list"
            id="debtsCustomersList"
          >

            ${
              debtCustomers.length
                ? debtCustomers
                    .map(
                      (customer) => `
                        <div class="customer-card">

                          <div class="customer-info">

                            <strong>
                              ${escapeHTML(
                                customer.name
                              )}
                            </strong>

                            <small>
                              عليه:
                              ${money(
                                customerDebt(
                                  customer.id
                                )
                              )}
                            </small>

                            <small>
                              مشترياته هذا الشهر:
                              ${money(
                                customerPurchasesThisMonth(
                                  customer.id
                                )
                              )}
                            </small>

                          </div>

                          <div
                            style="
                              display:flex;
                              gap:6px;
                              flex-wrap:wrap;
                            "
                          >

                            <button
                              class="secondary-button"
                              style="
                                min-height:40px;
                                padding:7px 10px;
                              "
                              data-debt-customer="${customer.id}"
                            >
                              👁️ الحساب
                            </button>

                            <button
                              class="primary-button"
                              style="
                                min-height:40px;
                                padding:7px 10px;
                              "
                              data-debt-add="${customer.id}"
                            >
                              ＋ دين
                            </button>

                          </div>

                        </div>
                      `
                    )
                    .join("")
                : `
                  <div class="empty-state">
                    <span>💳</span>

                    <strong>
                      لا توجد ديون مسجلة
                    </strong>

                    <small>
                      اضغط "إضافة دين جديد" لتسجيل دين على أحد الزبائن.
                    </small>
                  </div>
                `
            }

          </div>

        </section>

      </div>

      ${navigation("more")}
    `;

    document
      .getElementById("debtsBack")
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById("addDebtButton")
      ?.addEventListener(
        "click",
        () => showDebtForm()
      );

    document
      .getElementById(
        "addCustomerDebtButton"
      )
      ?.addEventListener(
        "click",
        () => showDebtForm()
      );

    document
      .querySelectorAll(
        "[data-debt-customer]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () =>
            showCustomerAccount(
              button.dataset
                .debtCustomer
            )
        );
      });

    document
      .querySelectorAll(
        "[data-debt-add]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () =>
            showDebtForm(
              button.dataset
                .debtAdd
            )
        );
      });

    setupNavigation();
  }

  /* =========================================================
     إضافة دين يدوي
  ========================================================= */

  function showDebtForm(
    customerId = null
  ) {
    const app = getApp();

    if (!app) return;

    const customers =
      getCustomers();

    const selectedCustomer =
      customerId
        ? customers.find(
            (item) =>
              String(item.id) ===
              String(customerId)
          )
        : null;

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="debtFormBack"
          >
            →
          </button>

          <h1>إضافة دين</h1>

        </div>

        <div class="form-card">

          <form id="debtForm">

            <div class="form-grid">

              <div class="form-group full">

                <label>
                  اسم الزبون
                </label>

                <input
                  id="debtCustomerName"
                  class="form-input"
                  list="customerNames"
                  required
                  value="${
                    selectedCustomer
                      ? escapeHTML(
                          selectedCustomer.name
                        )
                      : ""
                  }"
                  placeholder="اكتب اسم الزبون"
                >

                <datalist id="customerNames">

                  ${customers
                    .map(
                      (customer) =>
                        `<option value="${escapeHTML(
                          customer.name
                        )}"></option>`
                    )
                    .join("")}

                </datalist>

              </div>

              <div class="form-group">

                <label>
                  مبلغ الدين
                </label>

                <input
                  id="debtAmount"
                  class="form-input"
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="مثال: 100000"
                >

              </div>

              <div class="form-group">

                <label>
                  المدفوع الآن
                </label>

                <input
                  id="debtPaid"
                  class="form-input"
                  type="number"
                  min="0"
                  step="1"
                  value="0"
                >

              </div>

              <div class="form-group full">

                <label>
                  المنتج
                </label>

                <input
                  id="debtProduct"
                  class="form-input"
                  placeholder="مثال: كرتونة مياه"
                >

              </div>

              <div class="form-group full">

                <label>
                  ملاحظات
                </label>

                <textarea
                  id="debtNote"
                  class="form-textarea"
                  placeholder="أي ملاحظات..."
                ></textarea>

              </div>

              <div class="form-group full">

                <button
                  class="primary-button"
                  type="submit"
                >
                  ✓ حفظ الدين
                </button>

              </div>

            </div>

          </form>

        </div>

      </div>

      ${navigation("more")}
    `;

    document
      .getElementById("debtFormBack")
      ?.addEventListener(
        "click",
        showDebts
      );

    document
      .getElementById("debtForm")
      ?.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          const name =
            document
              .getElementById(
                "debtCustomerName"
              )
              .value.trim();

          const amount =
            number(
              document
                .getElementById(
                  "debtAmount"
                )
                .value
            );

          const paid =
            number(
              document
                .getElementById(
                  "debtPaid"
                )
                .value
            );

          const product =
            document
              .getElementById(
                "debtProduct"
              )
              .value.trim();

          const note =
            document
              .getElementById(
                "debtNote"
              )
              .value.trim();

          if (!name) {
            alert(
              "اكتب اسم الزبون."
            );
            return;
          }

          if (amount <= 0) {
            alert(
              "أدخل مبلغ الدين."
            );
            return;
          }

          if (paid < 0) {
            alert(
              "المبلغ المدفوع غير صحيح."
            );
            return;
          }

          if (paid > amount) {
            alert(
              "المدفوع لا يمكن أن يكون أكبر من الدين."
            );
            return;
          }

          const customer =
            getOrCreateCustomer(
              name
            );

          if (!customer) {
            alert(
              "تعذر إنشاء الزبون."
            );
            return;
          }

          const debts =
            getDebts();

          debts.push({
            id: createId(),

            customerId:
              customer.id,

            customerName:
              customer.name,

            saleId: null,

            invoiceNumber: null,

            productNames:
              product,

            amount,

            paid,

            note,

            createdAt:
              new Date().toISOString()
          });

          saveDebts(debts);

          alert(
            "تم حفظ الدين بنجاح."
          );

          showCustomerAccount(
            customer.id
          );
        }
      );

    setupNavigation();
  }

  /* =========================================================
     إضافة دفعة
  ========================================================= */

  function addDebtPayment(
    debtId,
    customerId
  ) {
    const debts =
      getDebts();

    const debt =
      debts.find(
        (item) =>
          String(item.id) ===
          String(debtId)
      );

    if (!debt) return;

    const remaining =
      number(debt.amount) -
      number(debt.paid);

    if (remaining <= 0) {
      alert(
        "هذا الدين مكتمل الدفع."
      );
      return;
    }

    const value = prompt(
      `المتبقي: ${money(
        remaining
      )}\n\nأدخل مبلغ الدفعة:`,
      remaining
    );

    if (value === null) return;

    const payment =
      number(value);

    if (
      payment <= 0 ||
      payment > remaining
    ) {
      alert(
        "قيمة الدفعة غير صحيحة."
      );
      return;
    }

    debt.paid =
      number(debt.paid) +
      payment;

    saveDebts(debts);

    alert(
      "تم تسجيل الدفعة بنجاح."
    );

    showCustomerAccount(
      customerId
    );
  }

  /* =========================================================
     تصفير الحسابات اليومية
  ========================================================= */

  function resetDailyAccount() {
    const confirmed =
      confirm(
        "هل تريد بدء يوم جديد؟\n\nلن نحذف الفواتير أو المنتجات أو الديون. سيتم فقط تسجيل أن الحساب اليومي تم تصفيره الآن."
      );

    if (!confirmed) return;

    const records =
      readStorage(
        KEYS.daily,
        []
      );

    records.push({
      id: createId(),
      resetAt:
        new Date().toISOString()
    });

    writeStorage(
      KEYS.daily,
      records
    );

    alert(
      "تم تصفير الحساب اليومي بنجاح.\nالبيانات القديمة ما زالت محفوظة في سجل المبيعات."
    );

    showDashboard();
  }

  /* =========================================================
     المزيد
  ========================================================= */

  function showMore() {
    const app = getApp();

    if (!app) return;

    const debts =
      getDebts();

    const totalDebt =
      debts.reduce(
        (sum, debt) =>
          sum +
          number(debt.amount) -
          number(debt.paid),
        0
      );

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="moreBack"
          >
            →
          </button>

          <h1>المزيد</h1>

        </div>

        <section class="section">

          <div class="quickgrid">

            <button
              class="quick-card"
              id="moreCustomers"
            >
              <span class="quick-icon">👥</span>
              <strong>الزبائن</strong>
              <small>
                إدارة حسابات العملاء
              </small>
            </button>

            <button
              class="quick-card"
              id="moreDebts"
            >
              <span class="quick-icon">💳</span>
              <strong>الديون</strong>
              <small>
                ${money(totalDebt)} متبقي
              </small>
            </button>

            <button
              class="quick-card"
              id="moreProducts"
            >
              <span class="quick-icon">📦</span>
              <strong>المخزون</strong>
              <small>
                إدارة المنتجات
              </small>
            </button>

            <button
              class="quick-card"
              id="moreSales"
            >
              <span class="quick-icon">🧾</span>
              <strong>المبيعات</strong>
              <small>
                سجل الفواتير
              </small>
            </button>

          </div>

        </section>

      </div>

      ${navigation("more")}
    `;

    document
      .getElementById("moreBack")
      ?.addEventListener(
        "click",
        showDashboard
      );

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
      .getElementById("moreProducts")
      ?.addEventListener(
        "click",
        showProducts
      );

    document
      .getElementById("moreSales")
      ?.addEventListener(
        "click",
        showSalesHistory
      );

    setupNavigation();
  }

  /* =========================================================
     تشغيل التطبيق
  ========================================================= */

  function startApp() {
    try {
      getProducts();
      getSales();
      getCustomers();
      getDebts();

      showDashboard();
    } catch (error) {
      console.error(
        "Application error:",
        error
      );

      const app = getApp();

      if (app) {
        app.innerHTML = `
          <div class="loading-screen">

            <div class="loading-logo">
              EB
            </div>

            <h1>
              إكسبريس البرج
            </h1>

            <p>
              حدث خطأ أثناء تشغيل النظام.
            </p>

            <button
              class="primary-button"
              style="margin-top:20px"
              onclick="location.reload()"
            >
              إعادة تحميل
            </button>

          </div>
        `;
      }
    }
  }

  startApp();
});
