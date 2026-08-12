document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const text = button.innerText.trim();

      if (text.includes("بيع جديد") || text.includes("بيع")) {
        showSalesScreen();
      } else if (text.includes("منتج جديد")) {
        alert("سنضيف شاشة المنتجات هنا");
      } else if (text.includes("عميل جديد")) {
        alert("سنضيف شاشة العملاء هنا");
      } else if (text.includes("جرد المخزون")) {
        alert("سنضيف شاشة المخزون هنا");
      } else if (text.includes("المبيعات")) {
        showSalesScreen();
      } else if (text.includes("المنتجات")) {
        alert("قسم المنتجات");
      } else if (text.includes("المزيد")) {
        alert("المزيد من خيارات النظام");
      }
    });
  });
});

function showSalesScreen() {
  document.querySelector(".app").innerHTML = `
    <header class="topbar">
      <div>
        <span class="kicker">نظام البرج</span>
        <h1>بيع جديد</h1>
      </div>
      <button onclick="location.reload()">×</button>
    </header>

    <section class="sales-screen">
      <div class="title">
        <h3>المنتجات</h3>
        <span>الفاتورة الجديدة</span>
      </div>

      <input
        id="productSearch"
        type="text"
        placeholder="ابحث عن منتج..."
        style="width:100%;box-sizing:border-box;padding:14px;border-radius:12px;border:1px solid #ddd;margin-bottom:15px;font-size:16px;"
      >

      <div id="products">
        <button class="product" data-name="مياه البرج" data-price="1.50">
          مياه البرج - 1.50 ريال
        </button>

        <button class="product" data-name="عصير برتقال" data-price="3.00">
          عصير برتقال - 3.00 ريال
        </button>

        <button class="product" data-name="خبز" data-price="2.00">
          خبز - 2.00 ريال
        </button>

        <button class="product" data-name="حليب" data-price="5.50">
          حليب - 5.50 ريال
        </button>
      </div>

      <section style="margin-top:20px;">
        <div class="title">
          <h3>السلة</h3>
        </div>

        <div id="cart">
          <div class="empty">السلة فارغة</div>
        </div>

        <div style="margin-top:20px;padding:18px;border-radius:16px;background:#f5f5f5;">
          <div style="display:flex;justify-content:space-between;font-size:20px;font-weight:bold;">
            <span>الإجمالي</span>
            <span><span id="total">0.00</span> ريال</span>
          </div>

          <button
            id="completeSale"
            style="width:100%;margin-top:15px;padding:15px;border:0;border-radius:12px;font-size:17px;font-weight:bold;"
          >
            إتمام البيع
          </button>
        </div>
      </section>
    </section>
  `;

  const cart = [];
  const cartElement = document.getElementById("cart");
  const totalElement = document.getElementById("total");

  document.querySelectorAll(".product").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.name;
      const price = Number(button.dataset.price);

      const existing = cart.find((item) => item.name === name);

      if (existing) {
        existing.qty++;
      } else {
        cart.push({ name, price, qty: 1 });
      }

      renderCart();
    });
  });

  function renderCart() {
    if (cart.length === 0) {
      cartElement.innerHTML = `<div class="empty">السلة فارغة</div>`;
      totalElement.textContent = "0.00";
      return;
    }

    cartElement.innerHTML = cart.map((item) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #ddd;">
        <div>
          <strong>${item.name}</strong>
          <div>${item.qty} × ${item.price.toFixed(2)} ريال</div>
        </div>
        <strong>${(item.qty * item.price).toFixed(2)} ريال</strong>
      </div>
    `).join("");

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    totalElement.textContent = total.toFixed(2);
  }

  document.getElementById("completeSale").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("أضف منتجًا إلى السلة أولًا");
    return;
  }

  const invoiceNumber = "INV-" + Date.now();
  const now = new Date();

  const date = now.toLocaleDateString("ar-SA");
  const time = now.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const total = totalElement.textContent;

  const invoiceItems = cart.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.price.toFixed(2)}</td>
      <td>${(item.qty * item.price).toFixed(2)}</td>
    </tr>
  `).join("");

  document.querySelector(".app").innerHTML = `
    <div style="padding:20px;max-width:600px;margin:auto;background:#fff;min-height:100vh;">
      
      <div style="text-align:center;">
        <h1>سوبر ماركت البرج</h1>
        <p>فاتورة بيع</p>
      </div>

      <hr>

      <p><strong>رقم الفاتورة:</strong> ${invoiceNumber}</p>
      <p><strong>التاريخ:</strong> ${date}</p>
      <p><strong>الوقت:</strong> ${time}</p>

      <table style="width:100%;border-collapse:collapse;text-align:right;">
        <thead>
          <tr>
            <th style="padding:8px;border-bottom:1px solid #ccc;">المنتج</th>
            <th style="padding:8px;border-bottom:1px solid #ccc;">الكمية</th>
            <th style="padding:8px;border-bottom:1px solid #ccc;">السعر</th>
            <th style="padding:8px;border-bottom:1px solid #ccc;">المجموع</th>
          </tr>
        </thead>

        <tbody>
          ${invoiceItems}
        </tbody>
      </table>

      <hr>

      <h2 style="text-align:center;">
        الإجمالي: ${total} ريال
      </h2>

      <label style="display:block;margin:15px 0 8px;">
        طريقة الدفع
      </label>

      <select id="paymentMethod"
        style="width:100%;padding:14px;border-radius:10px;font-size:16px;">
        <option value="نقدي">نقدي</option>
        <option value="بطاقة">بطاقة</option>
      </select>

      <button id="printInvoice"
        style="width:100%;padding:15px;margin-top:15px;border:0;border-radius:12px;font-size:17px;">
        طباعة الفاتورة
      </button>

      <button onclick="location.reload()"
        style="width:100%;padding:15px;margin-top:10px;border:0;border-radius:12px;font-size:17px;">
        بيع جديد
      </button>

    </div>
  `;

  document.getElementById("printInvoice").addEventListener("click", () => {
    window.print();
  });
});
    if (cart.length === 0) {
      alert("أضف منتجًا إلى السلة أولًا");
      return;
    }

    alert(
      "تم تجهيز الفاتورة بقيمة " +
      totalElement.textContent +
      " ريال"
    );
  });

  document.getElementById("productSearch").addEventListener("input", (event) => {
    const search = event.target.value.trim().toLowerCase();

    document.querySelectorAll(".product").forEach((button) => {
      const name = button.dataset.name.toLowerCase();
      button.style.display = name.includes(search) ? "block" : "none";
    });
  });
}
