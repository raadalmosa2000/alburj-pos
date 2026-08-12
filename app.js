const STORAGE = {
  sales: "alburj_sales",
  products: "alburj_products",
  customers: "alburj_customers"
};


const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "مياه البرج",
    price: 1500,
    cost: 1000,
    stock: 50
  },
  {
    id: 2,
    name: "عصير برتقال",
    price: 5000,
    cost: 3500,
    stock: 30
  },
  {
    id: 3,
    name: "خبز",
    price: 2000,
    cost: 1200,
    stock: 40
  },
  {
    id: 4,
    name: "حليب",
    price: 7000,
    cost: 5000,
    stock: 25
  }
];


let cart = [];


document.addEventListener("DOMContentLoaded", function () {

  initializeStorage();

  bindNavigation();

  updateDashboard();

});


function initializeStorage() {

  if (!localStorage.getItem(STORAGE.products)) {

    localStorage.setItem(
      STORAGE.products,
      JSON.stringify(DEFAULT_PRODUCTS)
    );

  }

}


function getSales() {

  try {

    const value =
      localStorage.getItem(STORAGE.sales);

    return value
      ? JSON.parse(value)
      : [];

  } catch {

    return [];

  }

}


function saveSales(sales) {

  localStorage.setItem(
    STORAGE.sales,
    JSON.stringify(sales)
  );

}


function getProducts() {

  try {

    return JSON.parse(
      localStorage.getItem(STORAGE.products) || "[]"
    );

  } catch {

    return [];

  }

}


function saveProducts(products) {

  localStorage.setItem(
    STORAGE.products,
    JSON.stringify(products)
  );

}


function money(value) {

  return Number(value || 0).toLocaleString("ar-SY");

}


function todayString() {

  const d = new Date();

  return d.toLocaleDateString("ar-SY");

}


/* =========================
   التنقل
========================= */

function bindNavigation() {

  document
    .getElementById("newSaleButton")
    .onclick = showSales;

  document
    .getElementById("sellNav")
    .onclick = showSales;

  document
    .getElementById("salesNav")
    .onclick = showSalesHistory;

  document
    .getElementById("viewAllSales")
    .onclick = showSalesHistory;

  document
    .getElementById("productsNav")
    .onclick = showProducts;

  document
    .getElementById("newProductButton")
    .onclick = showAddProduct;

  document
    .getElementById("inventoryButton")
    .onclick = showProducts;

  document
    .getElementById("newCustomerButton")
    .onclick = showCustomers;

  document
    .getElementById("homeNav")
    .onclick = function () {
      location.reload();
    };

  document
    .getElementById("moreNav")
    .onclick = function () {
      alert("المزيد من إعدادات النظام ستضاف لاحقًا.");
    };

}


/* =========================
   لوحة التحكم
========================= */

function updateDashboard() {

  const sales = getSales();

  const today = todayString();

  const todaySales =
    sales.filter(sale => sale.date === today);

  const total =
    todaySales.reduce(
      (sum, sale) => sum + Number(sale.total || 0),
      0
    );

  const profit =
    todaySales.reduce(
      (sum, sale) => sum + Number(sale.profit || 0),
      0
    );

  const products = getProducts();

  document.getElementById("todaySales").textContent =
    money(total);

  document.getElementById("todayInvoices").textContent =
    money(todaySales.length);

  document.getElementById("todayProfit").textContent =
    money(profit);

  document.getElementById("stockCount").textContent =
    money(products.length);

  renderRecentSales(todaySales);

}


function renderRecentSales(sales) {

  const box =
    document.getElementById("recentActivity");


  if (!sales.length) {

    box.innerHTML = `
      <div class="empty-state">
        <span>🧾</span>
        <strong>لا توجد عمليات بعد</strong>
        <small>
          ستظهر المبيعات هنا بعد إنشاء أول فاتورة.
        </small>
      </div>
    `;

    return;

  }


  box.innerHTML =
    sales
      .slice()
      .reverse()
      .slice(0, 5)
      .map(sale => `

        <div class="sale-card">

          <div>
            <strong>
              ${sale.invoiceNumber}
            </strong>

            <small>
              ${sale.time} · ${sale.payment}
            </small>
          </div>

          <div class="sale-total">
            ${money(sale.total)} ل.س
          </div>

        </div>

      `)
      .join("");

}


/* =========================
   شاشة البيع
========================= */

function showSales() {

  cart = [];

  const products =
    getProducts();

  const app =
    document.getElementById("app");


  app.innerHTML = `

    <main class="page">

      <div class="page-header">

        <button
          class="back-button"
          id="back"
        >
          → 
        </button>

        <h1>
          بيع جديد
        </h1>

      </div>


      <input
        class="search-input"
        id="productSearch"
        placeholder="ابحث عن منتج..."
      >


      <div
        class="products-grid"
        id="productsGrid"
        style="margin-top:15px"
      >

        ${products.map(product => `

          <button
            class="product-button"
            data-id="${product.id}"
          >

            <strong>
              ${product.name}
            </strong>

            <small>
              ${money(product.price)} ل.س
            </small>

          </button>

        `).join("")}

      </div>


      <div class="cart">

        <div class="section-heading">
          <h3>السلة</h3>
          <span id="cartCount">0 منتجات</span>
        </div>

        <div
          class="form-card"
          id="cartItems"
        >
          السلة فارغة
        </div>

        <div class="total-box">

          <span>
            الإجمالي
          </span>

          <strong>
            <span id="cartTotal">0</span>
            ل.س
          </strong>

        </div>


        <button
          class="primary-button"
          id="completeSale"
          style="margin-top:15px"
        >
          إتمام البيع
        </button>

      </div>

    </main>

  `;


  document
    .getElementById("back")
    .onclick = function () {
      location.reload();
    };


  document
    .querySelectorAll(".product-button")
    .forEach(button => {

      button.onclick = function () {

        const id =
          Number(this.dataset.id);

        addToCart(id);

      };

    });


  document
    .getElementById("productSearch")
    .oninput = function () {

      const value =
        this.value.toLowerCase();

      document
        .querySelectorAll(".product-button")
        .forEach(button => {

          const product =
            products.find(
              p => p.id === Number(button.dataset.id)
            );

          button.style.display =
            product.name
              .toLowerCase()
              .includes(value)
              ? ""
              : "none";

        });

    };


  document
    .getElementById("completeSale")
    .onclick = function () {

      if (!cart.length) {

        alert("أضف منتجًا إلى السلة أولًا.");

        return;

      }

      showInvoice();

    };

}


function addToCart(id) {

  const product =
    getProducts().find(
      p => p.id === id
    );


  if (!product) return;


  const existing =
    cart.find(
      item => item.id === id
    );


  if (existing) {

    if (existing.qty >= product.stock) {

      alert("الكمية المطلوبة غير متوفرة في المخزون.");

      return;

    }

    existing.qty++;

  } else {

    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      cost: product.cost,
      qty: 1
    });

  }


  renderCart();

}


function renderCart() {

  const box =
    document.getElementById("cartItems");


  if (!cart.length) {

    box.innerHTML =
      "السلة فارغة";

    document.getElementById("cartTotal").textContent =
      "0";

    return;

  }


  let total = 0;


  box.innerHTML =
    cart.map((item, index) => {

      const itemTotal =
        item.price * item.qty;

      total += itemTotal;


      return `

        <div class="cart-item">

          <div>

            <strong>
              ${item.name}
            </strong>

            <small>
              ${item.qty} × ${money(item.price)} ل.س
            </small>

          </div>

          <strong>
            ${money(itemTotal)} ل.س
          </strong>

        </div>

      `;

    }).join("");


  document.getElementById("cartTotal").textContent =
    money(total);

  document.getElementById("cartCount").textContent =
    `${cart.length} منتجات`;

}


/* =========================
   الفاتورة
========================= */

function showInvoice() {

  const products =
    getProducts();

  const now =
    new Date();

  const invoiceNumber =
    "INV-" + Date.now();

  const date =
    now.toLocaleDateString("ar-SY");

  const time =
    now.toLocaleTimeString(
      "ar-SY",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );


  const total =
    cart.reduce(
      (sum, item) =>
        sum + item.price * item.qty,
      0
    );


  const profit =
    cart.reduce(
      (sum, item) =>
        sum +
        ((item.price - item.cost) * item.qty),
      0
    );


  const app =
    document.getElementById("app");


  app.innerHTML = `

    <main class="page">

      <div class="page-header no-print">

        <button
          class="back-button"
          id="invoiceBack"
        >
          →
        </button>

        <h1>
          الفاتورة
        </h1>

      </div>


      <div class="invoice">

        <div class="invoice-header">

          <h1>
            سوبر ماركت البرج
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
            رقم الفاتورة:
            <strong>
              ${invoiceNumber}
            </strong>
          </div>

          <div>
            التاريخ:
            ${date}
          </div>

          <div>
            الوقت:
            ${time}
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

            ${cart.map(item => `

              <tr>

                <td>
                  ${item.name}
                </td>

                <td>
                  ${item.qty}
                </td>

                <td>
                  ${money(item.price)}
                </td>

                <td>
                  ${money(item.price * item.qty)}
                </td>

              </tr>

            `).join("")}

          </tbody>

        </table>


        <div class="invoice-total">

          <strong>
            الإجمالي
          </strong>

          <h2>
            ${money(total)} ل.س
          </h2>

        </div>


        <div class="field no-print" style="margin-top:18px">

          <label>
            طريقة الدفع
          </label>

          <select id="paymentMethod">

            <option value="نقدي">
              نقدي
            </option>

            <option value="بطاقة">
              بطاقة
            </option>

          </select>

        </div>


        <button
          class="primary-button no-print"
          id="saveInvoice"
        >
          حفظ الفاتورة
        </button>


        <button
          class="secondary-button no-print"
          id="printInvoice"
          style="margin-top:10px"
        >
          طباعة الفاتورة
        </button>


        <button
          class="secondary-button no-print"
          id="newSale"
          style="margin-top:10px"
        >
          بيع جديد
        </button>

      </div>

    </main>

  `;


  document
    .getElementById("invoiceBack")
    .onclick = showSales;


  document
    .getElementById("printInvoice")
    .onclick = function () {

      window.print();

    };


  document
    .getElementById("newSale")
    .onclick = showSales;


  document
    .getElementById("saveInvoice")
    .onclick = function () {

      const payment =
        document.getElementById("paymentMethod").value;


      const sales =
        getSales();


      const sale = {

        invoiceNumber,

        date,

        time,

        items: cart.map(item => ({
          ...item
        })),

        total,

        profit,

        payment

      };


      sales.push(sale);

      saveSales(sales);


      updateStockAfterSale();


      this.textContent =
        "تم حفظ الفاتورة ✓";

      this.disabled = true;

      this.classList.remove(
        "primary-button"
      );

      this.classList.add(
        "secondary-button"
      );


      alert("تم حفظ الفاتورة بنجاح.");

    };

}


function updateStockAfterSale() {

  const products =
    getProducts();


  cart.forEach(item => {

    const product =
      products.find(
        p => p.id === item.id
      );


    if (product) {

      product.stock =
        Math.max(
          0,
          product.stock - item.qty
        );

    }

  });


  saveProducts(products);

}


/* =========================
   المبيعات
========================= */

function showSalesHistory() {

  const sales =
    getSales();


  const app =
    document.getElementById("app");


  const total =
    sales.reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    );


  app.innerHTML = `

    <main class="page">

      <div class="page-header">

        <button
          class="back-button"
          id="back"
        >
          →
        </button>

        <h1>
          المبيعات
        </h1>

      </div>


      <div class="stats">

        <div class="stat">

          <span>
            عدد الفواتير
          </span>

          <strong>
            ${money(sales.length)}
          </strong>

          <small>
            فاتورة
          </small>

        </div>


        <div class="stat">

          <span>
            إجمالي المبيعات
          </span>

          <strong>
            ${money(total)}
          </strong>

          <small>
            ل.س
          </small>

        </div>

      </div>


      <section class="section">

        <div class="section-heading">
          <h3>سجل الفواتير</h3>
        </div>


        <div class="activity-list">

          ${
            sales.length
            ? sales.slice().reverse().map(sale => `

              <div class="sale-card">

                <div>

                  <strong>
                    ${sale.invoiceNumber}
                  </strong>

                  <small>
                    ${sale.date} · ${sale.time}
                  </small>

                  <small>
                    ${sale.payment}
                  </small>

                </div>

                <div class="sale-total">
                  ${money(sale.total)} ل.س
                </div>

              </div>

            `).join("")
            : `
              <div class="empty-state">

                <span>🧾</span>

                <strong>
                  لا توجد مبيعات
                </strong>

                <small>
                  أنشئ أول فاتورة لتظهر هنا.
                </small>

              </div>
            `
          }

        </div>

      </section>

    </main>

  `;


  document
    .getElementById("back")
    .onclick = function () {

      location.reload();

    };

}


/* =========================
   المنتجات
========================= */

function showProducts() {

  const products =
    getProducts();


  const app =
    document.getElementById("app");


  app.innerHTML = `

    <main class="page">

      <div class="page-header">

        <button
          class="back-button"
          onclick="location.reload()"
        >
          →
        </button>

        <h1>
          المنتجات والمخزون
        </h1>

      </div>


      <button
        class="primary-button"
        id="addProduct"
      >
        ＋ إضافة منتج
      </button>


      <div
        class="activity-list"
        style="margin-top:15px"
      >

        ${
          products.map(product => `

            <div class="product-card">

              <strong>
                ${product.name}
              </strong>

              <p>
                سعر البيع:
                ${money(product.price)} ل.س
              </p>

              <p>
                المخزون:
                ${money(product.stock)}
              </p>

            </div>

          `).join("")
        }

      </div>

    </main>

  `;


  document
    .getElementById("addProduct")
    .onclick = showAddProduct;

}


/* =========================
   إضافة منتج
========================= */

function showAddProduct() {

  const app =
    document.getElementById("app");


  app.innerHTML = `

    <main class="page">

      <div class="page-header">

        <button
          class="back-button"
          onclick="showProducts()"
        >
          →
        </button>

        <h1>
          منتج جديد
        </h1>

      </div>


      <div class="form-card">

        <div class="field">

          <label>
            اسم المنتج
          </label>

          <input
            id="productName"
            placeholder="مثال: مياه"
          >

        </div>


        <div class="field">

          <label>
            سعر البيع
          </label>

          <input
            id="productPrice"
            type="number"
            placeholder="0"
          >

        </div>


        <div class="field">

          <label>
            سعر التكلفة
          </label>

          <input
            id="productCost"
            type="number"
            placeholder="0"
          >

        </div>


        <div class="field">

          <label>
            الكمية
          </label>

          <input
            id="productStock"
            type="number"
            placeholder="0"
          >

        </div>


        <button
          class="primary-button"
          id="saveProduct"
        >
          حفظ المنتج
        </button>

      </div>

    </main>

  `;


  document
    .getElementById("saveProduct")
    .onclick = function () {

      const name =
        document.getElementById("productName").value.trim();

      const price =
        Number(
          document.getElementById("productPrice").value
        );

      const cost =
        Number(
          document.getElementById("productCost").value
        );

      const stock =
        Number(
          document.getElementById("productStock").value
        );


      if (!name || !price) {

        alert("أدخل اسم المنتج وسعر البيع.");

        return;

      }


      const products =
        getProducts();


      products.push({

        id: Date.now(),

        name,

        price,

        cost,

        stock

      });


      saveProducts(products);


      alert("تم حفظ المنتج.");

      showProducts();

    };

}


/* =========================
   العملاء
========================= */

function showCustomers() {

  const app =
    document.getElementById("app");


  app.innerHTML = `

    <main class="page">

      <div class="page-header">

        <button
          class="back-button"
          onclick="location.reload()"
        >
          →
        </button>

        <h1>
          العملاء
        </h1>

      </div>


      <div class="form-card">

        <div class="field">

          <label>
            اسم العميل
          </label>

          <input
            id="customerName"
            placeholder="اسم العميل"
          >

        </div>


        <div class="field">

          <label>
            رقم الهاتف
          </label>

          <input
            id="customerPhone"
            type="tel"
            placeholder="رقم الهاتف"
          >

        </div>


        <button
          class="primary-button"
          id="saveCustomer"
        >
          حفظ العميل
        </button>

      </div>

    </main>

  `;


  document
    .getElementById("saveCustomer")
    .onclick = function () {

      const name =
        document
          .getElementById("customerName")
          .value
          .trim();


      const phone =
        document
          .getElementById("customerPhone")
          .value
          .trim();


      if (!name) {

        alert("أدخل اسم العميل.");

        return;

      }


      let customers = [];


      try {

        customers =
          JSON.parse(
            localStorage.getItem(
              STORAGE.customers
            ) || "[]"
          );

      } catch {

        customers = [];

      }


      customers.push({

        id: Date.now(),

        name,

        phone

      });


      localStorage.setItem(
        STORAGE.customers,
        JSON.stringify(customers)
      );


      alert("تم حفظ العميل.");

      location.reload();

    };

    }
