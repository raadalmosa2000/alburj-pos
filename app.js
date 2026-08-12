document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll("button").forEach(function (button) {

    button.addEventListener("click", function () {

      var text = button.innerText.trim();

      if (
        text.indexOf("بيع جديد") !== -1 ||
        text.indexOf("بيع") !== -1
      ) {
        showSales();
      }

      else if (text.indexOf("المبيعات") !== -1) {
        showSales();
      }

      else if (text.indexOf("منتج جديد") !== -1) {
        alert("قسم المنتجات قيد التطوير");
      }

      else if (text.indexOf("عميل جديد") !== -1) {
        alert("قسم العملاء قيد التطوير");
      }

      else if (text.indexOf("جرد المخزون") !== -1) {
        alert("قسم المخزون قيد التطوير");
      }

    });

  });

});


function showSales() {

  var app = document.querySelector(".app");

  app.innerHTML = `
    <div style="padding:20px;">

      <h1>بيع جديد</h1>

      <input
        id="search"
        placeholder="ابحث عن منتج..."
        style="
          width:100%;
          padding:14px;
          box-sizing:border-box;
          margin:15px 0;
          border-radius:10px;
          border:1px solid #ddd;
          font-size:16px;
        "
      >

      <div id="products">

        <button
          class="product"
          data-name="مياه البرج"
          data-price="1500"
          style="
            display:block;
            width:100%;
            padding:15px;
            margin-bottom:10px;
            border:1px solid #ddd;
            border-radius:12px;
            font-size:16px;
          "
        >
          مياه البرج - 1,500 ل.س
        </button>

        <button
          class="product"
          data-name="عصير برتقال"
          data-price="5000"
          style="
            display:block;
            width:100%;
            padding:15px;
            margin-bottom:10px;
            border:1px solid #ddd;
            border-radius:12px;
            font-size:16px;
          "
        >
          عصير برتقال - 5,000 ل.س
        </button>

        <button
          class="product"
          data-name="خبز"
          data-price="2000"
          style="
            display:block;
            width:100%;
            padding:15px;
            margin-bottom:10px;
            border:1px solid #ddd;
            border-radius:12px;
            font-size:16px;
          "
        >
          خبز - 2,000 ل.س
        </button>

        <button
          class="product"
          data-name="حليب"
          data-price="7000"
          style="
            display:block;
            width:100%;
            padding:15px;
            margin-bottom:10px;
            border:1px solid #ddd;
            border-radius:12px;
            font-size:16px;
          "
        >
          حليب - 7,000 ل.س
        </button>

      </div>


      <h2>السلة</h2>

      <div id="cart">
        السلة فارغة
      </div>


      <h2 style="margin-top:20px;">
        الإجمالي:
        <span id="total">0</span>
        ل.س
      </h2>


      <button
        id="complete"
        style="
          width:100%;
          padding:16px;
          margin-top:15px;
          border:0;
          border-radius:12px;
          font-size:17px;
          font-weight:bold;
        "
      >
        إتمام البيع
      </button>


      <button
        id="back"
        style="
          width:100%;
          padding:15px;
          margin-top:10px;
          border:0;
          border-radius:12px;
          font-size:16px;
        "
      >
        العودة
      </button>

    </div>
  `;


  var cart = [];


  document.querySelectorAll(".product").forEach(function (product) {

    product.addEventListener("click", function () {

      var name =
        product.getAttribute("data-name");

      var price =
        Number(product.getAttribute("data-price"));


      var found =
        cart.find(function (item) {
          return item.name === name;
        });


      if (found) {
        found.qty++;
      }

      else {
        cart.push({
          name: name,
          price: price,
          qty: 1
        });
      }


      drawCart();

    });

  });


  function drawCart() {

    var cartBox =
      document.getElementById("cart");


    if (cart.length === 0) {

      cartBox.innerHTML =
        "السلة فارغة";

      document.getElementById("total").innerText =
        "0";

      return;
    }


    var total = 0;


    cartBox.innerHTML =
      cart.map(function (item) {

        var itemTotal =
          item.price * item.qty;

        total += itemTotal;


        return `
          <div
            style="
              padding:12px 5px;
              border-bottom:1px solid #ddd;
            "
          >

            <strong>
              ${item.name}
            </strong>

            <br>

            ${item.qty}
            ×
            ${formatMoney(item.price)}
            ل.س

            =

            <strong>
              ${formatMoney(itemTotal)}
              ل.س
            </strong>

          </div>
        `;

      }).join("");


    document.getElementById("total").innerText =
      formatMoney(total);

  }


  document
    .getElementById("complete")
    .addEventListener("click", function () {

      if (cart.length === 0) {

        alert("أضف منتجًا أولًا");

        return;
      }


      showInvoice(cart);

    });


  document
    .getElementById("back")
    .addEventListener("click", function () {

      location.reload();

    });


  document
    .getElementById("search")
    .addEventListener("input", function () {

      var value =
        this.value
          .toLowerCase()
          .trim();


      document
        .querySelectorAll(".product")
        .forEach(function (product) {

          var name =
            product
              .getAttribute("data-name")
              .toLowerCase();


          product.style.display =
            name.indexOf(value) !== -1
              ? "block"
              : "none";

        });

    });

}


function showInvoice(cart) {
var sales = JSON.parse(
  localStorage.getItem("alburj_sales") || "[]"
);

var total = cart.reduce(function (sum, item) {
  return sum + (item.price * item.qty);
}, 0);

var sale = {
  invoiceNumber: "INV-" + Date.now(),
  date: new Date().toISOString(),
  items: cart,
  total: total
};

sales.push(sale);

localStorage.setItem(
  "alburj_sales",
  JSON.stringify(sales)
);
  var invoiceNumber =
    "INV-" + Date.now();


  var now =
    new Date();


  var date =
    now.toLocaleDateString("ar-SY");


  var time =
    now.toLocaleTimeString(
      "ar-SY",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );


  var total = 0;


  var rows =
    cart.map(function (item) {

      var sum =
        item.price * item.qty;


      total += sum;


      return `
        <tr>

          <td
            style="
              padding:8px;
              border-bottom:1px solid #ddd;
            "
          >
            ${item.name}
          </td>


          <td
            style="
              padding:8px;
              border-bottom:1px solid #ddd;
            "
          >
            ${item.qty}
          </td>


          <td
            style="
              padding:8px;
              border-bottom:1px solid #ddd;
            "
          >
            ${formatMoney(item.price)}
          </td>


          <td
            style="
              padding:8px;
              border-bottom:1px solid #ddd;
            "
          >
            ${formatMoney(sum)}
          </td>

        </tr>
      `;

    }).join("");


  document.querySelector(".app").innerHTML = `

    <div
      style="
        padding:20px;
        max-width:600px;
        margin:auto;
        background:white;
        min-height:100vh;
      "
    >

      <div
        style="
          text-align:center;
        "
      >

        <h1>
          سوبر ماركت البرج
        </h1>

        <h2>
          فاتورة بيع
        </h2>

        <p>
          الليرة السورية
        </p>

      </div>


      <hr>


      <p>
        <strong>
          رقم الفاتورة:
        </strong>

        ${invoiceNumber}
      </p>


      <p>
        <strong>
          التاريخ:
        </strong>

        ${date}
      </p>


      <p>
        <strong>
          الوقت:
        </strong>

        ${time}
      </p>


      <table
        style="
          width:100%;
          border-collapse:collapse;
          text-align:right;
        "
      >

        <thead>

          <tr>

            <th style="padding:8px;">
              المنتج
            </th>

            <th style="padding:8px;">
              الكمية
            </th>

            <th style="padding:8px;">
              السعر
            </th>

            <th style="padding:8px;">
              المجموع
            </th>

          </tr>

        </thead>


        <tbody>

          ${rows}

        </tbody>

      </table>


      <hr>


      <h2
        style="
          text-align:center;
          margin:20px 0;
        "
      >

        الإجمالي:

        ${formatMoney(total)}

        ل.س

      </h2>


      <label>
        طريقة الدفع
      </label>


      <select
        id="payment"
        style="
          width:100%;
          padding:14px;
          margin-top:10px;
          border-radius:10px;
          font-size:16px;
        "
      >

        <option value="نقدي">
          نقدي
        </option>

        <option value="بطاقة">
          بطاقة
        </option>

      </select>


      <button
        id="print"
        style="
          width:100%;
          padding:16px;
          margin-top:20px;
          border:0;
          border-radius:12px;
          font-size:17px;
        "
      >
        طباعة الفاتورة
      </button>


      <button
        id="new"
        style="
          width:100%;
          padding:16px;
          margin-top:10px;
          border:0;
          border-radius:12px;
          font-size:17px;
        "
      >
        بيع جديد
      </button>

    </div>

  `;


  document
    .getElementById("print")
    .addEventListener("click", function () {

      window.print();

    });


  document
    .getElementById("new")
    .addEventListener("click", function () {

      location.reload();

    });

}


function formatMoney(number) {

  return Number(number).toLocaleString("ar-SY");

}
