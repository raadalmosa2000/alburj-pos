document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const text = button.innerText.trim();

      if (text.includes("بيع جديد") || text.includes("بيع")) {
        alert("شاشة البيع الجديدة ستكون هنا");
      } else if (text.includes("منتج جديد")) {
        alert("شاشة إضافة منتج ستكون هنا");
      } else if (text.includes("عميل جديد")) {
        alert("شاشة إضافة عميل ستكون هنا");
      } else if (text.includes("جرد المخزون")) {
        alert("شاشة جرد المخزون ستكون هنا");
      } else if (text.includes("المبيعات")) {
        alert("قسم المبيعات");
      } else if (text.includes("المنتجات")) {
        alert("قسم المنتجات");
      } else if (text.includes("المزيد")) {
        alert("المزيد من الخيارات");
      }
    });
  });
});
