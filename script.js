/* ========= MOBILE MENU TOGGLE ========= */
(function() {
  const menuIcon = document.getElementById("menuIcon");
  const navLinks = document.getElementById("navLinks");
  if (menuIcon && navLinks) {
    menuIcon.addEventListener("click", function () {
      if (navLinks.style.right === "0px") {
        navLinks.style.right = "-100%";
      } else {
        navLinks.style.right = "0px";
      }
    });

    // if clicking outside menu on mobile, close it
    document.addEventListener("click", function (e) {
      const target = e.target;
      if (!navLinks.contains(target) && target !== menuIcon && window.innerWidth <= 792) {
        navLinks.style.right = "-100%";
      }
    });
  }
})();


/* ========= SHOP — CATEGORY FILTER + LOCAL SEARCH ========= */
(function() {
  const categoryButtons = Array.from(document.querySelectorAll(".category-btn"));
  const productCards = Array.from(document.querySelectorAll(".product-card"));
  const productSearchInput = document.getElementById("productSearch");

  // helper to show/hide based on active category + search
  function applyFilters() {
    const activeBtn = document.querySelector(".category-btn.active");
    const activeCategory = activeBtn ? activeBtn.textContent.trim().toLowerCase() : "all";
    const query = productSearchInput ? productSearchInput.value.trim().toLowerCase() : "";

    productCards.forEach(card => {
      const cardCat = (card.dataset.category || "").toLowerCase();
      const name = (card.querySelector("h3") ? card.querySelector("h3").textContent : "").toLowerCase();

      const matchCategory = (activeCategory === "all") || (cardCat === activeCategory);
      const matchSearch = query === "" || name.includes(query);

      if (matchCategory && matchSearch) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  // category button clicks
  if (categoryButtons.length > 0) {
    categoryButtons.forEach(btn => {
      btn.addEventListener("click", function () {
        categoryButtons.forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        // clear page search box (optional) — comment out to keep text
        if (productSearchInput) {
          productSearchInput.value = "";
        }
        applyFilters();
      });
    });
  }

  // local product search input (on shop page)
  if (productSearchInput) {
    productSearchInput.addEventListener("input", function () {
      applyFilters();
    });
  }

  // initial run: ensure All shows some items
  if (productCards.length > 0) applyFilters();
})();

/* ========= NAVBAR SEARCH (site-wide) ========= */
(function() {
  // try to select desktop or mobile nav search inputs
  const navSearchDesktop = document.getElementById("navSearchDesktop");
  const navSearchMobile = document.getElementById("navSearch");
  const navSearchBtn = document.getElementById("navSearchBtn");

  // return the input element whichever exists (desktop prefer)
  function getNavInput() {
    return navSearchDesktop || navSearchMobile || null;
  }

  function performSearchOnShop(query) {
    // If on shop page, use existing product elements
    const onShop = window.location.pathname.includes("shop.html") || window.location.pathname === "/" || document.title.toLowerCase().includes("shop");
    if (onShop) {
      // set shop page's productSearch input if it exists
      const productSearchInput = document.getElementById("productSearch");
      if (productSearchInput) {
        productSearchInput.value = query;
        // trigger input event to apply filters
        productSearchInput.dispatchEvent(new Event('input'));
        // scroll to products
        const products = document.getElementById("shopProducts");
        if (products) products.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // If not on shop page or productSearch not found, redirect to shop with query param
    if (query && query.trim() !== "") {
      const target = `shop.html?search=${encodeURIComponent(query.trim())}`;
      window.location.href = target;
    }
  }

  if (navSearchBtn) {
    navSearchBtn.addEventListener("click", function () {
      const input = getNavInput();
      if (!input) return;
      const q = input.value.trim().toLowerCase();
      performSearchOnShop(q);
    });

    // allow Enter key on desktop input
    const input = getNavInput();
    if (input) {
      input.addEventListener("keyup", function (e) {
        if (e.key === "Enter") navSearchBtn.click();
      });
    }
  } else {
    // if there's no search button (rare), add Enter listener to input
    const input = getNavInput();
    if (input) {
      input.addEventListener("keyup", function (e) {
        if (e.key === "Enter") performSearchOnShop(input.value.trim().toLowerCase());
      });
    }
  }

  // On shop page: if URL has ?search=..., populate the search box
  (function loadSearchFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("search");
    if (!q) return;
    // fill navbar input if present
    const input = getNavInput();
    if (input) input.value = q;
    // fill shop page search input and apply
    const productSearchInput = document.getElementById("productSearch");
    if (productSearchInput) {
      productSearchInput.value = q;
      productSearchInput.dispatchEvent(new Event('input'));
      // ensure "All" is active so search across all categories
      const allBtn = Array.from(document.querySelectorAll(".category-btn")).find(b => b.textContent.trim().toLowerCase() === "all");
      if (allBtn) {
        document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
        allBtn.classList.add("active");
      }
    }
  })();

})();

// // /* ========= CONTACT FORM (simple) ========= */

//-------------------------------------------
// Product Database
//-------------------------------------------
const products = {
  "Vegetables": {
    "Potato": 30,
    "Cabbage": 35,
    "Carrot": 60,
    "Broccoli": 90,
    "Onion": 45,
    "Spinach": 40,
    "Cauliflower": 70,
    "Pumpkin": 45
  },
  "Fruits": {
    "Banana": 60,
    "Apple": 120,
    "Mango": 150,
    "Oranges": 70,
    "Cardamom": 60000,
    "Peach": 120,
    "Pear": 90,
    "Gurva": 80

  },
  "Grains": {
    "Oilseeds": 85,
    "Wheat": 55,
    "Barley": 60,
    "Buckwheat": 70,
    "Rice": 60,
    "Corn": 45,
    "Kodo Millet": 80
  },
  "Livestock": {
    "Cattle (general)": 20000,
    "Goat": 12000,
    "Jersey Cow": 30000,
    "Sheep": 10000,
    "Chicken": 500,
    "Local Ox": 40000,
    "Pig": 12000
  },
  "Others": {
    "Local Honey": 550,
    "Organic Eggs": 300,
    "Almond (Badam)": 850
  }
};

//-------------------------------------------
// DOM Elements
//-------------------------------------------
const categorySelect = document.getElementById("categorySelect");
const itemSelect = document.getElementById("itemSelect");
const priceField = document.getElementById("price");
const quantityField = document.getElementById("quantity");
const totalField = document.getElementById("total");

//-------------------------------------------
// Load Items When Category Changes
//-------------------------------------------
categorySelect.addEventListener("change", () => {
  const category = categorySelect.value;

  itemSelect.innerHTML = `<option value="">-- Select Item --</option>`;

  if (products[category]) {
    Object.keys(products[category]).forEach(item => {
      itemSelect.innerHTML += `<option value="${item}">${item}</option>`;
    });
  }

  priceField.value = "";
  totalField.value = "";
});

//-------------------------------------------
// Auto Fill Price When Item Selected
//-------------------------------------------
itemSelect.addEventListener("change", () => {
  const category = categorySelect.value;
  const item = itemSelect.value;

  if (products[category][item]) {
    priceField.value = products[category][item];
  }

  calculateTotal();
});

//-------------------------------------------
// Calculate Total Price
//-------------------------------------------
quantityField.addEventListener("input", calculateTotal);

function calculateTotal() {
  const price = Number(priceField.value);
  const qty = Number(quantityField.value);

  if (price > 0 && qty > 0) {
    totalField.value = price * qty;
  }
}

//-------------------------------------------
// Submit to Google Sheet
//-------------------------------------------
document.getElementById("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  const apiURL = "https://script.google.com/macros/s/AKfycbw6j9ZZKTIX8I8dfIXwuIW2-FvzT6Oq9iHFGwjqZV_IWl3__Ndm7bdnGxhweWAhgaw4/exec";

  const res = await fetch(apiURL, {
    method: "POST",
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (result.status === "success") {
    document.getElementById("successPopup").style.display = "block";

    setTimeout(() => {
      document.getElementById("successPopup").style.display = "none";
    }, 2500);

    e.target.reset();
    itemSelect.innerHTML = `<option value="">-- Select Item --</option>`;
  }
});





