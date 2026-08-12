document.addEventListener("DOMContentLoaded", () => {
  // =====================================================
  // إعدادات النظام
  // =====================================================

  const CURRENCY = "ل.س";
  const SALES_KEY = "alburj_sales";
  const PRODUCTS_KEY = "alburj_products";

  let cart = [];

  // =====================================================
  // المنتجات الافتراضية
  // =====================================================

  const defaultProducts = [
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
      stock: 50,
      minStock: 10
    },
    {
      id: 3,
      name: "بيبسي",
      price: 4000,
      stock: 30,
      minStock: 5
    },
    {
      id: 4,
      name: "شيبس",
      price: 3500,
      stock: 25,
      minStock: 5
    },
    {
      id: 5,
      name: "بسكويت",
      price: 3000,
      stock: 25,
      minStock: 5
    },
    {
      id: 6,
      name: "حليب",
      price: 6000,
      stock: 15,
      minStock: 5
    }
  ];

  // =====================================================
  // أدوات التخزين
  // =====================================================

  function getSales() {
    try {
      return JSON.parse(localStorage.getItem(SALES_KEY)) || [];
    } catch (error) {
      console.error("خطأ في قراءة المبيعات:", error);
      return [];
    }
  }

  function saveSales(sales) {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }

  function getProducts() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(PRODUCTS_KEY)
      );

      if (Array.isArray(saved)) {
        return saved;
      }

      localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(defaultProducts)
      );

      return defaultProducts;
    } catch (error) {
      localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(defaultProducts)
      );

      return defaultProducts;
    }
  }

  function saveProducts(products) {
    localStorage.setItem(
      PRODUCTS_KEY,
      JSON.stringify(products)
    );
  }

  // =====================================================
  // أدوات عامة
  // =====================================================

  function formatMoney(value) {
    return (
      Number(value || 0).toLocaleString("ar-SY") +
      " " +
      CURRENCY
    );
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("ar-SY");
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

  function generateInvoiceNumber() {
    return (
      "INV-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 1000)
    );
  }

  function generateProductId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  // =====================================================
  // لوحة التحكم
  // =====================================================

  function showDashboard() {
    const app = document.querySelector(".app");

    if (!app) return;

    const sales = getSales();
    const products = getProducts();

    const today = new Date();

    const todaySales = sales.filter((sale) => {
      const date = new Date(sale.createdAt);

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    });

    const totalToday = todaySales.reduce(
      (sum, sale) => sum + Number(sale.total || 0),
      0
    );

    const totalSales = sales.reduce(
      (sum, sale) => sum + Number(sale.total || 0),
      0
    );

    const lowStock = products.filter(
      (product) =>
        Number(product.stock) <= Number(product.minStock)
    );

    app.innerHTML = `
      <div class="page">

        <div class="topbar">
          <div>
            <span class="kicker">نظام نقاط البيع</span>
            <h1>سوبر ماركت البرج</h1>
          </div>

          <button class="icon-button" id="refreshDashboard">
            ↻
          </button>
        </div>

        <div class="hero">
          <div>
            <span class="hero-label">
              إجمالي مبيعات اليوم
            </span>

            <h2>
              ${formatMoney(totalToday)}
            </h2>

            <p>
              ${formatNumber(todaySales.length)}
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
            <span>مبيعات اليوم</span>
            <strong>${formatMoney(totalToday)}</strong>
            <small>الليرة السورية</small>
          </div>

          <div class="stat">
            <span>الفواتير</span>
            <strong>${formatNumber(sales.length)}</strong>
            <small>فاتورة</small>
          </div>

          <div class="stat">
            <span>المنتجات</span>
            <strong>${formatNumber(products.length)}</strong>
            <small>منتج</small>
          </div>

          <div class="stat">
            <span>إجمالي المبيعات</span>
            <strong>${formatMoney(totalSales)}</strong>
            <small>${CURRENCY}</small>
          </div>

        </div>

        <div class="section">

          <div class="section-heading">
            <h3>العمليات السريعة</h3>
          </div>

          <div class="quickgrid">

            <button class="quick-card" id="newSaleButton">
              <div class="quick-icon">🛒</div>
              <strong>بيع جديد</strong>
              <small>إنشاء فاتورة</small>
            </button>

            <button class="quick-card" id="salesHistoryButton">
              <div class="quick-icon">📋</div>
              <strong>سجل المبيعات</strong>
              <small>عرض الفواتير</small>
            </button>

            <button class="quick-card" id="productsButton">
              <div class="quick-icon">📦</div>
              <strong>المنتجات والمخزون</strong>
              <small>إدارة المنتجات</small>
            </button>

          </div>

        </div>

        ${
          lowStock.length
            ? `
              <div class="section">

                <div class="section-heading">
                  <h3>⚠️ مخزون منخفض</h3>
                  <span>${lowStock.length} منتج</span>
                </div>

                <div class="activity-list">

                  ${lowStock
                    .map(
                      (product) => `
                        <div class="sale-card">

                          <div>
                            <strong>
                              ${product.name}
                            </strong>

                            <small>
                              الحد الأدنى:
                              ${formatNumber(product.minStock)}
                            </small>
                          </div>

                          <div class="sale-total">
                            ${formatNumber(product.stock)}
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
                      ستظهر الفواتير هنا بعد إتمام البيع.
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

      </div>

      ${createBottomNavigation("home")}
    `;

    document
      .getElementById("newSaleButton")
      ?.addEventListener("click", showSalesScreen);

    document
      .getElementById("salesHistoryButton")
      ?.addEventListener("click", showSalesHistory);

    document
      .getElementById("productsButton")
      ?.addEventListener("click", showProducts);

    document
      .getElementById("viewAllSales")
      ?.addEventListener("click", showSalesHistory);

    document
      .getElementById("refreshDashboard")
      ?.addEventListener("click", showDashboard);

    setupNavigation();
  }

  // =====================================================
  // بطاقة البيع
  // =====================================================

  function createSaleCard(sale) {
    return `
      <button
        class="sale-card"
        data-open-invoice="${sale.invoiceNumber}"
        style="
          width:100%;
          border:1px solid var(--border);
          text-align:right;
        "
      >

        <div>

          <strong>
            ${sale.invoiceNumber}
          </strong>

          <small>
            ${formatDate(sale.createdAt)}
            -
            ${formatTime(sale.createdAt)}
          </small>

          <small>
            ${sale.paymentMethod || "نقدي"}
          </small>

        </div>

        <div class="sale-total">
          ${formatMoney(sale.total)}
        </div>

      </button>
    `;
  }

  // =====================================================
  // شاشة البيع
  // =====================================================

  function showSalesScreen() {
    const app = document.querySelector(".app");

    if (!app) return;

    cart = [];

    const products = getProducts();

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
            <span>${products.length} منتج</span>
          </div>

          <div class="products-grid">

            ${products
              .map(
                (product) => `
                  <button
                    class="product-button"
                    data-id="${product.id}"
                    data-name="${product.name}"
                    ${
                      Number(product.stock) <= 0
                        ? "disabled"
                        : ""
                    }
                  >

                    <strong>
                      ${product.name}
                    </strong>

                    <small>
                      ${formatMoney(product.price)}
                    </small>

                    <small>
                      المخزون:
                      ${formatNumber(product.stock)}
                    </small>

                  </button>
                `
              )
              .join("")}

          </div>

        </div>

        <div class="section">

          <div class="section-heading">
            <h3>السلة</h3>
            <span id="cartCount">0 منتج</span>
          </div>

          <div class="form-card" id="cartContainer">

            <div class="empty-state">
              <span>🛒</span>
              <strong>السلة فارغة</strong>
              <small>
                اضغط على منتج لإضافته.
              </small>
            </div>

          </div>

          <div class="total-box">

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
      ?.addEventListener("click", showDashboard);

    document
      .querySelectorAll(".product-button")
      .forEach((button) => {
        button.addEventListener("click", () => {

          const id = Number(button.dataset.id);

          const product = getProducts().find(
            (item) => Number(item.id) === id
          );

          if (product) {
            addToCart(product);
          }

        });
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

  // =====================================================
  // إضافة للسلة
  // =====================================================

  function addToCart(product) {
    const currentStock = Number(product.stock || 0);

    const existing = cart.find(
      (item) =>
        Number(item.id) === Number(product.id)
    );

    const currentQty = existing
      ? Number(existing.qty)
      : 0;

    if (currentQty >= currentStock) {
      alert("لا توجد كمية كافية في المخزون.");
      return;
    }

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        qty: 1
      });
    }

    renderCart();
  }

  // =====================================================
  // عرض السلة
  // =====================================================

  function renderCart() {
    const container =
      document.getElementById("cartContainer");

    const totalElement =
      document.getElementById("totalElement");

    const cartCount =
      document.getElementById("cartCount");

    if (!container) return;

    const total = cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.qty),
      0
    );

    const count = cart.reduce(
      (sum, item) =>
        sum + Number(item.qty),
      0
    );

    if (cartCount) {
      cartCount.textContent =
        `${formatNumber(count)} منتج`;
    }

    if (totalElement) {
      totalElement.textContent =
        formatMoney(total);
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

    container.innerHTML = cart
      .map(
        (item, index) => `
          <div class="cart-item">

            <div>

              <strong>
                ${item.name}
              </strong>

              <small>
                ${formatMoney(item.price)}
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
                style="
                  width:38px;
                  min-height:38px;
                  padding:5px;
                "
                data-action="increase"
                data-index="${index}"
              >
                +
              </button>

              <strong>
                ${item.qty}
              </strong>

              <button
                class="secondary-button"
                style="
                  width:38px;
                  min-height:38px;
                  padding:5px;
                "
                data-action="decrease"
                data-index="${index}"
              >
                −
              </button>

              <button
                class="danger-button"
                style="
                  width:38px;
                  min-height:38px;
                  padding:5px;
                "
                data-action="remove"
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
      .querySelectorAll("[data-action]")
      .forEach((button) => {

        button.addEventListener("click", () => {

          const index =
            Number(button.dataset.index);

          const action =
            button.dataset.action;

          const product =
            getProducts().find(
              (item) =>
                Number(item.id) ===
                Number(cart[index]?.id)
            );

          if (!cart[index]) return;

          if (action === "increase") {

            if (
              product &&
              Number(cart[index].qty) >=
                Number(product.stock)
            ) {
              alert(
                "لا توجد كمية إضافية في المخزون."
              );
              return;
            }

            cart[index].qty += 1;
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
        });

      });
  }

  // =====================================================
  // البحث عن المنتجات أثناء البيع
  // =====================================================

  function filterProducts(event) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    document
      .querySelectorAll(".product-button")
      .forEach((button) => {

        const name =
          button.dataset.name.toLowerCase();

        button.style.display =
          name.includes(search)
            ? ""
            : "none";
      });
  }

  // =====================================================
  // إتمام البيع
  // =====================================================

  function completeSale() {
    if (!cart.length) {
      alert("أضف منتجًا إلى السلة أولًا.");
      return;
    }

    const products = getProducts();

    // التحقق من المخزون مرة أخيرة قبل الحفظ
    for (const item of cart) {

      const product = products.find(
        (p) => Number(p.id) === Number(item.id)
      );

      if (!product) {
        alert(
          `المنتج ${item.name} غير موجود.`
        );
        return;
      }

      if (
        Number(item.qty) >
        Number(product.stock)
      ) {
        alert(
          `الكمية المطلوبة من ${item.name} أكبر من المخزون المتوفر.`
        );
        return;
      }
    }

    const total = cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.qty),
      0
    );

    const paymentInput = prompt(
      "طريقة الدفع:\n\nاكتب نقدي أو بطاقة",
      "نقدي"
    );

    if (paymentInput === null) {
      return;
    }

    const payment =
      paymentInput.trim() === "بطاقة"
        ? "بطاقة"
        : "نقدي";

    const sale = {
      invoiceNumber: generateInvoiceNumber(),

      createdAt:
        new Date().toISOString(),

      total: total,

      paymentMethod:
        payment,

      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        qty: Number(item.qty),
        price: Number(item.price),
        subtotal:
          Number(item.qty) *
          Number(item.price)
      }))
    };

    // خصم المخزون
    cart.forEach((item) => {

      const product = products.find(
        (p) =>
          Number(p.id) ===
          Number(item.id)
      );

      if (product) {
        product.stock =
          Number(product.stock) -
          Number(item.qty);
      }

    });

    saveProducts(products);

    const sales = getSales();

    sales.push(sale);

    saveSales(sales);

    cart = [];

    alert(
      "تم حفظ الفاتورة بنجاح.\n" +
      "رقم الفاتورة: " +
      sale.invoiceNumber
    );

    showInvoice(sale);
  }

  // =====================================================
  // الفاتورة
  // =====================================================

  function showInvoice(sale) {
    const app =
      document.querySelector(".app");

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
              <strong>رقم الفاتورة:</strong>
              ${sale.invoiceNumber}
            </div>

            <div>
              <strong>التاريخ:</strong>
              ${formatDate(sale.createdAt)}
            </div>

            <div>
              <strong>الوقت:</strong>
              ${formatTime(sale.createdAt)}
            </div>

            <div>
              <strong>طريقة الدفع:</strong>
              ${sale.paymentMethod}
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

                      <td>${item.name}</td>

                      <td>${formatNumber(item.qty)}</td>

                      <td>
                        ${formatMoney(item.price)}
                      </td>

                      <td>
                        ${formatMoney(item.subtotal)}
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
              ${formatMoney(sale.total)}
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
      .getElementById("newSaleAfterInvoice")
      ?.addEventListener(
        "click",
        showSalesScreen
      );

    document
      .getElementById("backHomeAfterInvoice")
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
      document.querySelector(".app");

    if (!app) return;

    const sales = getSales();

    const totalSales =
      sales.reduce(
        (sum, sale) =>
          sum +
          Number(sale.total || 0),
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
            <h1>سجل المبيعات</h1>
          </div>

        </div>

        <div class="form-card">

          <input
            id="salesSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث برقم الفاتورة أو المنتج..."
          >

        </div>

        <div class="stats">

          <div class="stat">
            <span>عدد الفواتير</span>
            <strong>${formatNumber(sales.length)}</strong>
          </div>

          <div class="stat">
            <span>إجمالي المبيعات</span>
            <strong>${formatMoney(totalSales)}</strong>
          </div>

        </div>

        <div class="section">

          <div class="section-heading">

            <h3>الفواتير</h3>

            <span id="salesResultCount">
              ${formatNumber(sales.length)} فاتورة
            </span>

          </div>

          <div
            class="activity-list"
            id="salesList"
          >
            ${renderSalesList(sales)}
          </div>

        </div>

      </div>

      ${createBottomNavigation("sales")}
    `;

    document
      .getElementById("backFromSales")
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

    setupInvoiceButtons();

    setupNavigation();
  }

  function renderSalesList(sales) {
    if (!sales.length) {
      return `
        <div class="empty-state">
          <span>🧾</span>
          <strong>لا توجد فواتير</strong>
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
        (sale) => `
          <button
            class="sale-card"
            data-open-invoice="${sale.invoiceNumber}"
            style="
              width:100%;
              border:1px solid var(--border);
              text-align:right;
            "
          >

            <div>

              <strong>
                ${sale.invoiceNumber}
              </strong>

              <small>
                ${formatDate(sale.createdAt)}
                -
                ${formatTime(sale.createdAt)}
              </small>

              <small>
                ${sale.items.length} منتج
                -
                ${sale.paymentMethod}
              </small>

            </div>

            <div class="sale-total">
              ${formatMoney(sale.total)}
            </div>

          </button>
        `
      )
      .join("");
  }

  function setupInvoiceButtons() {
    document
      .querySelectorAll("[data-open-invoice]")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            const invoice =
              button.dataset.openInvoice;

            const sale =
              getSales().find(
                (item) =>
                  item.invoiceNumber === invoice
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

    const sales = getSales();

    const filtered = sales.filter(
      (sale) => {

        const invoice =
          String(
            sale.invoiceNumber
          ).toLowerCase();

        const payment =
          String(
            sale.paymentMethod
          ).toLowerCase();

        const products =
          sale.items
            .map(
              (item) =>
                String(item.name)
            )
            .join(" ")
            .toLowerCase();

        return (
          invoice.includes(search) ||
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
        renderSalesList(filtered);
    }

    const counter =
      document.getElementById(
        "salesResultCount"
      );

    if (counter) {
      counter.textContent =
        `${formatNumber(filtered.length)} فاتورة`;
    }

    setupInvoiceButtons();
  }

  // =====================================================
  // قسم المنتجات والمخزون
  // =====================================================

  function showProducts() {
    const app =
      document.querySelector(".app");

    if (!app) return;

    const products = getProducts();

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
            <h1>المنتجات والمخزون</h1>
          </div>

        </div>

        <div class="form-card">

          <input
            id="productsSearch"
            class="search-input"
            type="search"
            placeholder="🔎 ابحث عن منتج..."
          >

        </div>

        <div class="stats">

          <div class="stat">
            <span>عدد المنتجات</span>
            <strong>
              ${formatNumber(products.length)}
            </strong>
          </div>

          <div class="stat">
            <span>قيمة المخزون</span>
            <strong>
              ${formatMoney(
                products.reduce(
                  (sum, product) =>
                    sum +
                    Number(product.price) *
                      Number(product.stock),
                  0
                )
              )}
            </strong>
          </div>

        </div>

        <div class="section">

          <button
            class="primary-button"
            id="addProductButton"
          >
            ＋ إضافة منتج جديد
          </button>

        </div>

        <div class="section">

          <div class="section-heading">
            <h3>قائمة المنتجات</h3>
          </div>

          <div
            class="activity-list"
            id="productsList"
          >
            ${renderProductsList(products)}
          </div>

        </div>

      </div>

      ${createBottomNavigation("products")}
    `;

    document
      .getElementById("backFromProducts")
      ?.addEventListener(
        "click",
        showDashboard
      );

    document
      .getElementById("addProductButton")
      ?.addEventListener(
        "click",
        showAddProductForm
      );

    document
      .getElementById("productsSearch")
      ?.addEventListener(
        "input",
        searchProducts
      );

    setupProductButtons();
    setupNavigation();
  }

  function renderProductsList(products) {
    if (!products.length) {
      return `
        <div class="empty-state">
          <span>📦</span>
          <strong>لا توجد منتجات</strong>
          <small>
            أضف أول منتج إلى النظام.
          </small>
        </div>
      `;
    }

    return products
      .map(
        (product) => {

          const stock =
            Number(product.stock || 0);

          const minStock =
            Number(product.minStock || 0);

          const low =
            stock <= minStock;

          return `
            <div class="sale-card product-management-card">

              <div>

                <strong>
                  ${product.name}
                </strong>

                <small>
                  السعر:
                  ${formatMoney(product.price)}
                </small>

                <small>
                  المخزون:
                  ${formatNumber(stock)}
                  ${low ? " ⚠️ منخفض" : ""}
                </small>

                <small>
                  الحد الأدنى:
                  ${formatNumber(minStock)}
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
                  data-product-action="edit"
                  data-product-id="${product.id}"
                  style="width:auto;padding:8px 12px;"
                >
                  ✏️ تعديل
                </button>

                <button
                  class="danger-button"
                  data-product-action="delete"
                  data-product-id="${product.id}"
                  style="width:auto;padding:8px 12px;"
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

  // =====================================================
  // إضافة منتج
  // =====================================================

  function showAddProductForm() {
    const app =
      document.querySelector(".app");

    if (!app) return;

    app.innerHTML = `
      <div class="page">

        <div class="page-header">

          <button
            class="back-button"
            id="backFromAddProduct"
          >
            ←
          </button>

          <div>
            <h1>إضافة منتج</h1>
          </div>

        </div>

        <div class="form-card">

          <label>اسم المنتج</label>

          <input
            id="newProductName"
            class="search-input"
            type="text"
            placeholder="مثال: شوكولاتة"
          >

          <label style="display:block;margin-top:15px;">
            السعر
          </label>

          <input
            id="newProductPrice"
            class="search-input"
            type="number"
            min="0"
            placeholder="السعر بالليرة السورية"
          >

          <label style="display:block;margin-top:15px;">
            كمية المخزون
          </label>

          <input
            id="newProductStock"
            class="search-input"
            type="number"
            min="0"
            value="0"
          >

          <label style="display:block;margin-top:15px;">
            حد التنبيه
          </label>

          <input
            id="newProductMinStock"
            class="search-input"
            type="number"
            min="0"
            value="5"
          >

          <button
            class="primary-button"
            id="saveNewProduct"
            style="margin-top:18px;"
          >
            💾 حفظ المنتج
          </button>

        </div>

      </div>

      ${createBottomNavigation("products")}
    `;

    document
      .getElementById("backFromAddProduct")
      ?.addEventListener(
        "click",
        showProducts
      );

    document
      .getElementById("saveNewProduct")
      ?.addEventListener(
        "click",
        saveNewProduct
      );

    setupNavigation();
  }

  function saveNewProduct() {
    const name =
      document
        .getElementById("newProductName")
        ?.value.trim();

    const price =
      Number(
        document
          .getElementById("newProductPrice")
          ?.value
      );

    const stock =
      Number(
        document
          .getElementById("newProductStock")
          ?.value
      );

    const minStock =
      Number(
        document
          .getElementById("newProductMinStock")
          ?.value
      );

    if (!name) {
      alert("اكتب اسم المنتج.");
      return;
    }

    if (price < 0 || Number.isNaN(price)) {
      alert("أدخل سعرًا صحيحًا.");
      return;
    }

    if (stock < 0 || Number.isNaN(stock)) {
      alert("أدخل كمية مخزون صحيحة.");
      return;
    }

    const products = getProducts();

    products.push({
      id: generateProductId(),
      name: name,
      price: price,
      stock: stock,
      minStock:
        minStock >= 0
          ? minStock
          : 5
    });

    saveProducts(products);

    alert("تم حفظ المنتج بنجاح.");

    showProducts();
  }

  // =====================================================
  // تعديل المنتج
  // =====================================================

  function editProduct(productId) {
    const products = getProducts();

    const product = products.find(
      (item) =>
        Number(item.id) ===
        Number(productId)
    );

    if (!product) {
      alert("لم يتم العثور على المنتج.");
      return;
    }

    const name = prompt(
      "اسم المنتج:",
      product.name
    );

    if (name === null) return;

    const priceInput = prompt(
      "السعر بالليرة السورية:",
      product.price
    );

    if (priceInput === null) return;

    const stockInput = prompt(
      "كمية المخزون:",
      product.stock
    );

    if (stockInput === null) return;

    const minStockInput = prompt(
      "حد التنبيه:",
      product.minStock
    );

    if (minStockInput === null) return;

    const price = Number(priceInput);
    const stock = Number(stockInput);
    const minStock = Number(minStockInput);

    if (!name.trim()) {
      alert("اسم المنتج مطلوب.");
      return;
    }

    if (
      Number.isNaN(price) ||
      price < 0
    ) {
      alert("السعر غير صحيح.");
      return;
    }

    if (
      Number.isNaN(stock) ||
      stock < 0
    ) {
      alert("المخزون غير صحيح.");
      return;
    }

    if (
      Number.isNaN(minStock) ||
      minStock < 0
    ) {
      alert("حد التنبيه غير صحيح.");
      return;
    }

    product.name = name.trim();
    product.price = price;
    product.stock = stock;
    product.minStock = minStock;

    saveProducts(products);

    alert("تم تعديل المنتج.");

    showProducts();
  }

  // =====================================================
  // حذف المنتج
  // =====================================================

  function deleteProduct(productId) {
    const products = getProducts();

    const product = products.find(
      (item) =>
        Number(item.id) ===
        Number(productId)
    );

    if (!product) return;

    const confirmed = confirm(
      `هل تريد حذف المنتج "${product.name}"؟`
    );

    if (!confirmed) return;

    const filtered =
      products.filter(
        (item) =>
          Number(item.id) !==
          Number(productId)
      );

    saveProducts(filtered);

    alert("تم حذف المنتج.");

    showProducts();
  }

  function setupProductButtons() {
    document
      .querySelectorAll("[data-product-action]")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            const id =
              Number(
                button.dataset.productId
              );

            const action =
              button.dataset.productAction;

            if (action === "edit") {
              editProduct(id);
            }

            if (action === "delete") {
              deleteProduct(id);
            }

          }
        );

      });
  }

  // =====================================================
  // البحث عن المنتجات في الإدارة
  // =====================================================

  function searchProducts(event) {
    const search =
      event.target.value
        .trim()
        .toLowerCase();

    const products =
      getProducts();

    const filtered =
      products.filter(
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
        renderProductsList(
          filtered
        );
    }

    setupProductButtons();
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
          class="nav-item"
          data-nav="home"
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

        button.addEventListener(
          "click",
          () => {

            const page =
              button.dataset.nav;

            if (page === "home") {
              showDashboard();
            }

            else if (page === "sales") {
              showSalesHistory();
            }

            else if (page === "sale") {
              showSalesScreen();
            }

            else if (page === "products") {
              showProducts();
            }

          }
        );

      });
  }

  // =====================================================
  // تشغيل النظام
  // =====================================================

  showDashboard();
});
