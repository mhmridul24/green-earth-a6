
// API base
const API = "https://openapi.programming-hero.com/api";



function getField(obj, keys) {
  for (const k of keys) {
    if (obj == null) break;
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined && obj[k] !== null) {
      return obj[k];
    }
  }
  return undefined;
}

/** Format number  */
function formatMoney(n) {
  const v = Number(n) || 0;
  return `৳${v.toFixed(0)}`;
}


// DOM shortcuts 

const $ = (sel) => document.querySelector(sel);
const catContainer = $("#category-list");
const catSpinner = $("#cat-spinner");
const cardSpinner = $("#card-spinner");
const cardGrid = $("#card-grid");
const cartList = $("#cart-list");
const cartTotalEl = $("#cart-total");

// cart
let cart = [];

// Clear element children 
function clear(el) {
  if (!el) return;
  while (el.firstChild) el.removeChild(el.firstChild);
}

// Load Categories

function loadCategories() {
  // show spinner
  if (catSpinner) {
    catSpinner.classList.remove("hidden");
  }

  // fetch categories from API
  fetch(API + "/categories")
    .then(function (res) {
      return res.json(); 
    })
    .then(function (json) {
      // Try multiple possible places 
      let categories = json.categories || json.data || (json.data && json.data.categories) || json;

      
      if (!Array.isArray(categories)) {
        let values = Object.values(json);
        let foundArray = values.find(function (v) {
          return Array.isArray(v);
        });
        categories = foundArray || [];
      }

      // showing categories
      if (Array.isArray(categories)) {
        renderCategories(categories);
      } else {
        renderCategories([]);
      }
    })
    .catch(function (err) {
      console.error("Failed to load categories:", err);
      catContainer.innerHTML =
        '<p class="text-red-600">Failed to load categories.</p>';
    })
    .finally(function () {
      // hide spinner
      if (catSpinner) {
        catSpinner.classList.add("hidden");
      }
    });
}



// showing Categories buttons

function renderCategories(categories) {
  clear(catContainer);

  // Create All Trees button first
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.textContent = "All Trees";
  allBtn.dataset.id = "all";
  allBtn.className = "px-3 py-2 rounded-lg border-none text-sm hover:bg-green-100 transition text-left w-full";
  allBtn.addEventListener("click", () => {
    setActiveCategory(allBtn);
    loadPlants("all");
  });
  catContainer.appendChild(allBtn);

  // Create a button for each category
  categories.forEach((cat) => {
    // Possible id fields
    const id = getField(cat, ["id", "category_id", "_id", "categoryId", "cat_id"]) || "";
    // Possible name fields
    const name = getField(cat, ["category", "name", "category_name", "categoryName"]) || "Unnamed";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = name;
    btn.dataset.id = String(id);
    
    btn.className = "px-3 py-2 rounded-lg border-none text-sm hover:bg-green-100 transition text-left w-full";

    btn.addEventListener("click", () => {
      setActiveCategory(btn);
      loadPlants(id);
    });

    catContainer.appendChild(btn);
  });

  // Auto-click All Trees to load initial plants
  allBtn.click();
}


function setActiveCategory(button) {
  // Remove active classes from all buttons 
  catContainer.querySelectorAll("button").forEach((b) => {
    b.classList.remove("bg-green-600", "text-white");
  });
  // Add active classes to the clicked button
  if (button) {
    button.classList.add("bg-green-600", "text-white");
  }
}


// Load Plants 

function loadPlants(categoryId) {
  try {
    if (cardSpinner) cardSpinner.classList.remove("hidden");
    clear(cardGrid);

    let url;
    if (!categoryId || categoryId === "all") {
      url = `${API}/plants`;
    } else {
      url = `${API}/category/${categoryId}`;
    }

    fetch(url)
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        // possible places 
        
        let plants = json.plants || json.data || (json.data && json.data.plants) || (json.data && json.data.data) || [];

       
        if (!Array.isArray(plants)) {
          let values = Object.values(json);
          let foundArray = values.find(function (v) {
            return Array.isArray(v);
          });
          plants = foundArray || [];
        }

        renderPlantCards(Array.isArray(plants) ? plants : []);
      })
      .catch(function (err) {
        console.error("Failed to load plants:", err);
        cardGrid.innerHTML = `<p class="text-red-600">Failed to load plants.</p>`;
      })
      .finally(function () {
        if (cardSpinner) cardSpinner.classList.add("hidden");
      });
  } catch (err) {
    console.error("Unexpected error:", err);
    cardGrid.innerHTML = `<p class="text-red-600">Unexpected error occurred.</p>`;
    if (cardSpinner) cardSpinner.classList.add("hidden");
  }
}


// showing Plant Cards

function renderPlantCards(plants) {
  clear(cardGrid);

  if (!plants.length) {
    cardGrid.innerHTML = `<p class="col-span-full text-center">No plants found for this category.</p>`;
    return;
  }

  plants.forEach((p) => {
   
    const id = getField(p, ["id", "plantId", "_id"]) || "";
    const name = getField(p, ["name", "plant_name", "title"]) || "No name";
    const image = getField(p, ["image", "image_url", "img"]) || "";
    const description = getField(p, ["description", "details", "about"]) || "";
    const category = getField(p, ["category", "category_name"]) || "";
    
    const priceRaw = getField(p, ["price", "Price", "sell_price"]) || 0;
    const price = Number(priceRaw) || 0;

    // Create card
    const card = document.createElement("div");
    card.className = "border-none rounded-xl p-3 flex flex-col shadow hover:shadow-lg transition bg-white";

    card.innerHTML = `
      <div class="h-44 w-full overflow-hidden rounded-md mb-3 bg-gray-100 flex items-center justify-center">
        <img src="${image}" alt="${name}" class="object-cover w-full h-full" onerror="this.style.objectFit='contain';this.src="/>
      </div>
      <h3 class="font-semibold text-lg cursor-pointer text-green-800 hover:underline name-link">${name}</h3>
      <p class="text-sm text-gray-600 mb-2">${(description || "").slice(0, 90)}${(description || "").length > 90 ? "..." : ""}</p>
      <div class="flex items-center gap-2 mt-auto">
        <span class="badge badge-outline">${category || "Tree"}</span>
        <span class="ml-auto font-semibold">${formatMoney(price)}</span>
      </div>
      <div class="mt-3">
        <button class="add-btn w-full btn btn-sm bg-green-600 text-white border-none hover:bg-green-700">Add to Cart</button>
      </div>
    `;

    // Name click
    const nameLink = card.querySelector(".name-link");
    if (nameLink) {
      nameLink.addEventListener("click", () => showPlantDetails(id));
    }

    // Add to cart
    const addBtn = card.querySelector(".add-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        addToCart({ id, name, price });
      });
    }

    cardGrid.appendChild(card);
  });
}


// Show Plant Details

function showPlantDetails(id) {
  if (!id) return alert("No ID for this plant.");

  fetch(`${API}/plant/${id}`)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      
      var plant = json.plant || json.data || json || {};
      var name = getField(plant, ["name", "plant_name", "title"]) || "No name";
      var description = getField(plant, ["description", "details", "about"]) || "No description";
      var image = getField(plant, ["image", "image_url", "img"]) || "";
      var category = getField(plant, ["category", "category_name"]) || "";
      var price = Number(getField(plant, ["price", "Price", "sell_price"]) || 0);

      
      var modal = document.getElementById("detail-modal");
      if (modal) {
        var mTitle = modal.querySelector("#m-title");
        var mImg = modal.querySelector("#m-img");
        var mDesc = modal.querySelector("#m-desc");
        var mCat = modal.querySelector("#m-cat");
        var mPrice = modal.querySelector("#m-price");

        if (mTitle) mTitle.textContent = name;
        if (mImg) {
          mImg.src = image || "";
          mImg.alt = name;
        }
        if (mDesc) mDesc.textContent = description;
        if (mCat) mCat.textContent = category;
        if (mPrice) mPrice.textContent = formatMoney(price);

        // Show the native dialog
        if (typeof modal.showModal === "function") {
          modal.showModal();
        } else {
          modal.classList.remove("hidden");
        }
      } else {
        //  alert 
        alert(
          "🌳 " +
            name +
            "\n\n" +
            description +
            "\n\nCategory: " +
            category +
            "\nPrice: " +
            formatMoney(price)
        );
      }
    })
    .catch(function (err) {
      console.error("Failed to load plant details:", err);
      alert("Failed to load plant details.");
    });
}



// Cart functions

function addToCart(item) {
  
  cart.push(item);
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  clear(cartList);

  if (!cart.length) {
    cartList.innerHTML = `<li class="text-sm text-gray-500">Cart is empty.</li>`;
    cartTotalEl.textContent = formatMoney(0);
    return;
  }

  let total = 0;
  cart.forEach((it, idx) => {
    total += Number(it.price || 0);

    const li = document.createElement("li");
    li.className = "flex items-center justify-between bg-gray-100 p-2 rounded";

    li.innerHTML = `
      <span class="text-sm">${it.name}</span>
      <div class="flex items-center gap-3">
        <span class="font-semibold">${formatMoney(it.price)}</span>
        <button class="text-red-500 remove-btn" title="Remove">✖</button>
      </div>
    `;

    
    li.querySelector(".remove-btn").addEventListener("click", () => removeFromCart(idx));
    cartList.appendChild(li);
  });

  cartTotalEl.textContent = formatMoney(total);
}


loadCategories();
