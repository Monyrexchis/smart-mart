const STORAGE_PRODUCTS = "easy-shop-products-v4";
const STORAGE_SETTINGS = "easy-shop-settings-v1";
const USD_TO_KHR = 4100;

const i18n = {
  en: {
    appTitle: "Easy Shop Billing",
    subtitle: "Save item photo + price once. Next time upload photo to auto add in bill.",
    languageLabel: "Language",
    currencyLabel: "Currency",
    saveSectionTitle: "1) Save Product",
    saveHint: "Tip: Save same item name again with a different photo angle to improve matching.",
    productNameLabel: "Product Name",
    priceLabel: "Price",
    photoLabel: "Photo",
    saveProductBtn: "Save Product",
    quickPhotoSectionTitle: "2) Quick Add to Bill by Photo",
    uploadPhotoLabel: "Upload Photo",
    findAddBtn: "Find Product & Add",
    checkBillBtn: "Check in Bill",
    quickNameSectionTitle: "3) Quick Add to Bill by Name",
    searchNameLabel: "Search Product Name",
    findNameAddBtn: "Find Name & Add",
    checkNameBtn: "Check in Bill by Name",
    productsSectionTitle: "Products",
    productsHint: "You can still add manually or update price any time.",
    exportBtn: "Export Products Backup",
    importBtn: "Import Products Backup",
    clearProductsBtn: "Clear All Products",
    billSectionTitle: "Bill",
    billEmpty: "No items yet.",
    billTotalLabel: "Total:",
    clearBillBtn: "Clear Bill",
    updatePriceBtn: "Update Price",
    addToBillBtn: "+ Add to Bill",
  },
  km: {
    appTitle: "កម្មវិធីគិតលុយហាងងាយស្រួល",
    subtitle: "រក្សាទុករូបភាព + តម្លៃម្ដង បន្ទាប់មកអាប់ឡូតរូបដើម្បីបន្ថែមក្នុងវិក្កយបត្រដោយស្វ័យប្រវត្តិ។",
    languageLabel: "ភាសា",
    currencyLabel: "រូបិយប័ណ្ណ",
    saveSectionTitle: "1) រក្សាទុកទំនិញ",
    saveHint: "គន្លឹះ៖ រក្សាទុកឈ្មោះទំនិញដដែលដោយរូបខុសៗគ្នា ដើម្បីស្វែងរកឲ្យត្រឹមត្រូវជាងមុន។",
    productNameLabel: "ឈ្មោះទំនិញ",
    priceLabel: "តម្លៃ",
    photoLabel: "រូបភាព",
    saveProductBtn: "រក្សាទុកទំនិញ",
    quickPhotoSectionTitle: "2) បន្ថែមក្នុងវិក្កយបត្រដោយរូប",
    uploadPhotoLabel: "អាប់ឡូតរូប",
    findAddBtn: "ស្វែងរកទំនិញ និងបន្ថែម",
    checkBillBtn: "ពិនិត្យក្នុងវិក្កយបត្រ",
    quickNameSectionTitle: "3) បន្ថែមក្នុងវិក្កយបត្រដោយឈ្មោះ",
    searchNameLabel: "ស្វែងរកឈ្មោះទំនិញ",
    findNameAddBtn: "ស្វែងរកឈ្មោះ និងបន្ថែម",
    checkNameBtn: "ពិនិត្យក្នុងវិក្កយបត្រតាមឈ្មោះ",
    productsSectionTitle: "បញ្ជីទំនិញ",
    productsHint: "អ្នកអាចបន្ថែមដៃ ឬកែតម្លៃបានគ្រប់ពេល។",
    exportBtn: "នាំចេញបម្រុងទុកទំនិញ",
    importBtn: "នាំចូលបម្រុងទុកទំនិញ",
    clearProductsBtn: "លុបទំនិញទាំងអស់",
    billSectionTitle: "វិក្កយបត្រ",
    billEmpty: "មិនទាន់មានទំនិញ។",
    billTotalLabel: "សរុប:",
    clearBillBtn: "សម្អាតវិក្កយបត្រ",
    updatePriceBtn: "កែតម្លៃ",
    addToBillBtn: "+ បន្ថែមក្នុងវិក្កយបត្រ",
  },
};

const currencyInfo = {
  USD: { symbol: "$", decimals: 2 },
  KHR: { symbol: "៛", decimals: 0 },
};

const productForm = document.querySelector("#product-form");
const scanForm = document.querySelector("#scan-form");
const searchForm = document.querySelector("#search-form");
const scanResult = document.querySelector("#scan-result");
const productsContainer = document.querySelector("#products");
const productTemplate = document.querySelector("#product-template");
const billList = document.querySelector("#bill-list");
const billEmpty = document.querySelector("#bill-empty");
const totalEl = document.querySelector("#total");
const clearBillBtn = document.querySelector("#clear-bill");
const exportBtn = document.querySelector("#export-products");
const importInput = document.querySelector("#import-products");
const clearProductsBtn = document.querySelector("#clear-products");
const checkBillByPhotoBtn = document.querySelector("#check-bill-by-photo");
const checkBillByNameBtn = document.querySelector("#check-bill-by-name");
const languageSelect = document.querySelector("#language-select");
const currencySelect = document.querySelector("#currency-select");

let products = loadProducts();
let bill = {};
let settings = loadSettings();

languageSelect.value = settings.language;
currencySelect.value = settings.currency;
applyTranslations();

languageSelect.addEventListener("change", () => {
  settings.language = languageSelect.value;
  persistSettings();
  applyTranslations();
  renderProducts();
  renderBill();
});

currencySelect.addEventListener("change", () => {
  settings.currency = currencySelect.value;
  persistSettings();
  renderProducts();
  renderBill();
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.querySelector("#name").value.trim();
  const normalizedName = normalizeName(name);
  const priceInput = Number(document.querySelector("#price").value);
  const file = document.querySelector("#photo").files[0];

  if (!name || Number.isNaN(priceInput) || priceInput < 0 || !file) return;

  const priceUsd = toUsd(priceInput);
  const photo = await toDataUrl(file);
  const photoHash = await createImageHashFromDataUrl(photo);

  const existing = products.find((item) => normalizeName(item.name) === normalizedName);

  if (existing) {
    existing.priceUsd = priceUsd;
    existing.photo = photo;
    existing.photoHashes = existing.photoHashes || [];
    if (!existing.photoHashes.includes(photoHash)) {
      existing.photoHashes.push(photoHash);
    }
    showMessage(`Updated ${existing.name}. Added ${existing.photoHashes.length} reference photo(s).`, `បានកែប្រែ ${existing.name} និងបន្ថែមរូបយោង ${existing.photoHashes.length}។`);
  } else {
    products.push({
      id: crypto.randomUUID(),
      name,
      priceUsd,
      photo,
      photoHashes: [photoHash],
    });
    showMessage(`Saved ${name}.`, `បានរក្សាទុក ${name}។`);
  }

  persistProducts();
  renderProducts();
  productForm.reset();
});

scanForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!products.length) return showMessage("No products saved yet.", "មិនទាន់មានទំនិញបានរក្សាទុក។");

  const file = document.querySelector("#scan-photo").files[0];
  if (!file) return;

  const queryDataUrl = await toDataUrl(file);
  const queryHash = await createImageHashFromDataUrl(queryDataUrl);
  const match = findBestProductMatch(queryHash);

  if (!match) return showMessage("No matching product found.", "រកមិនឃើញទំនិញដែលត្រូវគ្នា។");

  addProductToBill(match.product);
  showMessage(`Added: ${match.product.name} (${formatMoney(match.product.priceUsd)}).`, `បានបន្ថែម: ${match.product.name} (${formatMoney(match.product.priceUsd)})។`);
  scanForm.reset();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const product = findProductByName(document.querySelector("#search-name").value);
  if (!product) return showMessage("Name not found.", "រកមិនឃើញឈ្មោះទំនិញ។");
  addProductToBill(product);
  showMessage(`Added by name: ${product.name} (${formatMoney(product.priceUsd)}).`, `បានបន្ថែមតាមឈ្មោះ: ${product.name} (${formatMoney(product.priceUsd)})។`);
});

checkBillByPhotoBtn.addEventListener("click", async () => {
  if (!products.length) return showMessage("No products saved yet.", "មិនទាន់មានទំនិញបានរក្សាទុក។");

  const file = document.querySelector("#scan-photo").files[0];
  if (!file) return showMessage("Please choose a photo first.", "សូមជ្រើសរើសរូបភាពជាមុន។");

  const queryDataUrl = await toDataUrl(file);
  const queryHash = await createImageHashFromDataUrl(queryDataUrl);
  const match = findBestProductMatch(queryHash);

  if (!match) return showMessage("No matching product found.", "រកមិនឃើញទំនិញដែលត្រូវគ្នា។");
  showBillItemStatus(match.product);
});

checkBillByNameBtn.addEventListener("click", () => {
  const product = findProductByName(document.querySelector("#search-name").value);
  if (!product) return showMessage("Name not found.", "រកមិនឃើញឈ្មោះទំនិញ។");
  showBillItemStatus(product);
});

clearBillBtn.addEventListener("click", () => {
  bill = {};
  renderBill();
});

exportBtn.addEventListener("click", () => {
  const data = { exportedAt: new Date().toISOString(), products };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `easy-shop-products-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", async () => {
  const file = importInput.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const json = JSON.parse(text);
    const importedProducts = Array.isArray(json?.products) ? json.products : [];

    products = importedProducts
      .map((item) => {
        const hashes = Array.isArray(item.photoHashes) ? item.photoHashes : item.photoHash ? [String(item.photoHash)] : [];
        const priceUsd = Number(item.priceUsd ?? item.price ?? 0);
        return {
          id: item.id || crypto.randomUUID(),
          name: String(item.name || "Unnamed"),
          priceUsd,
          photo: String(item.photo || ""),
          photoHashes: hashes,
        };
      })
      .filter((item) => item.photo && item.name && item.priceUsd >= 0 && item.photoHashes.length > 0);

    persistProducts();
    renderProducts();
    showMessage(`Imported ${products.length} products.`, `បាននាំចូលទំនិញ ${products.length}។`);
  } catch {
    showMessage("Invalid backup file.", "ឯកសារបម្រុងទុកមិនត្រឹមត្រូវ។");
  } finally {
    importInput.value = "";
  }
});

clearProductsBtn.addEventListener("click", () => {
  const sure = window.confirm(settings.language === "km" ? "លុបទំនិញទាំងអស់មែនទេ?" : "Delete all saved products?");
  if (!sure) return;
  products = [];
  bill = {};
  persistProducts();
  renderProducts();
  renderBill();
  showMessage("All products cleared.", "បានលុបទំនិញទាំងអស់។");
});

function renderProducts() {
  productsContainer.innerHTML = "";
  const symbol = currencyInfo[settings.currency].symbol;

  products.forEach((product) => {
    const node = productTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector("img").src = product.photo;
    node.querySelector("img").alt = product.name;
    node.querySelector(".product-name").textContent = `${product.name} (${product.photoHashes.length} refs)`;

    const priceInput = node.querySelector(".price-input");
    priceInput.value = fromUsd(product.priceUsd).toFixed(currencyInfo[settings.currency].decimals);
    node.querySelector(".currency-mark").textContent = symbol;

    node.querySelector(".update-btn").addEventListener("click", () => {
      const nextPrice = Number(priceInput.value);
      if (Number.isNaN(nextPrice) || nextPrice < 0) return;
      product.priceUsd = toUsd(nextPrice);
      persistProducts();
      renderBill();
      showMessage(`Updated ${product.name} price.`, `បានកែតម្លៃ ${product.name}។`);
    });

    node.querySelector(".add-btn").addEventListener("click", () => addProductToBill(product));
    productsContainer.append(node);
  });
}

function addProductToBill(product) {
  if (!bill[product.id]) {
    bill[product.id] = { id: product.id, name: product.name, priceUsd: product.priceUsd, qty: 0 };
  }
  bill[product.id].qty += 1;
  bill[product.id].priceUsd = product.priceUsd;
  renderBill();
}

function renderBill() {
  const items = Object.values(bill).filter((item) => item.qty > 0);
  billEmpty.style.display = items.length ? "none" : "block";
  billList.innerHTML = "";

  let totalUsd = 0;
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "bill-row";

    const lineUsd = item.priceUsd * item.qty;
    totalUsd += lineUsd;

    row.innerHTML = `
      <strong>${item.name}</strong>
      <span>${formatMoney(item.priceUsd)} × ${item.qty}</span>
      <span>${formatMoney(lineUsd)}</span>
      <button aria-label="Decrease" type="button">-</button>
    `;

    row.querySelector("button").addEventListener("click", () => {
      item.qty -= 1;
      if (item.qty <= 0) delete bill[item.id];
      renderBill();
    });

    billList.append(row);
  });

  totalEl.textContent = formatMoney(totalUsd);
}

function showBillItemStatus(product) {
  const billItem = bill[product.id];
  if (!billItem || billItem.qty <= 0) {
    return showMessage(`${product.name} is not in current bill yet.`, `${product.name} មិនទាន់មានក្នុងវិក្កយបត្រ។`);
  }
  const lineTotal = billItem.qty * billItem.priceUsd;
  showMessage(
    `${billItem.name}: Qty ${billItem.qty}, Line Total ${formatMoney(lineTotal)}.`,
    `${billItem.name}: ចំនួន ${billItem.qty}, សរុបបន្ទាត់ ${formatMoney(lineTotal)}។`,
  );
}

function findProductByName(rawName) {
  const query = normalizeName(rawName || "");
  if (!query) return null;

  return products.find((item) => normalizeName(item.name) === query)
    || products.find((item) => normalizeName(item.name).includes(query));
}

function findBestProductMatch(queryHash) {
  let best = null;
  const threshold = 12;

  products.forEach((product) => {
    (product.photoHashes || []).forEach((referenceHash) => {
      const distance = hammingDistance(referenceHash, queryHash);
      if (!best || distance < best.distance) best = { product, distance };
    });
  });

  return best && best.distance <= threshold ? best : null;
}

function persistProducts() {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
}

function loadProducts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_PRODUCTS)) || [];
    return parsed
      .map((item) => {
        const hashes = Array.isArray(item.photoHashes) ? item.photoHashes : item.photoHash ? [String(item.photoHash)] : [];
        return {
          ...item,
          priceUsd: Number(item.priceUsd ?? item.price ?? 0),
          photoHashes: hashes,
        };
      })
      .filter((item) => item.photo && item.name && item.photoHashes.length > 0);
  } catch {
    return [];
  }
}

function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_SETTINGS)) || {};
    return {
      language: parsed.language === "km" ? "km" : "en",
      currency: parsed.currency === "KHR" ? "KHR" : "USD",
    };
  } catch {
    return { language: "en", currency: "USD" };
  }
}

function persistSettings() {
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
}

function showMessage(enText, kmText) {
  scanResult.textContent = settings.language === "km" ? kmText : enText;
}

function applyTranslations() {
  const table = i18n[settings.language];
  document.documentElement.lang = settings.language;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (table[key]) el.textContent = table[key];
  });
}

function toUsd(amount) {
  return settings.currency === "KHR" ? amount / USD_TO_KHR : amount;
}

function fromUsd(amountUsd) {
  return settings.currency === "KHR" ? amountUsd * USD_TO_KHR : amountUsd;
}

function formatMoney(amountUsd) {
  const amount = fromUsd(amountUsd);
  const { symbol, decimals } = currencyInfo[settings.currency];
  return `${symbol}${amount.toFixed(decimals)}`;
}

function normalizeName(name) {
  return String(name).trim().toLowerCase().replace(/\s+/g, " ");
}

function hammingDistance(hashA, hashB) {
  let distance = 0;
  for (let i = 0; i < Math.min(hashA.length, hashB.length); i += 1) {
    if (hashA[i] !== hashB[i]) distance += 1;
  }
  return distance + Math.abs(hashA.length - hashB.length);
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function createImageHashFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 8;
      canvas.height = 8;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, 8, 8);

      const pixels = context.getImageData(0, 0, 8, 8).data;
      const gray = [];
      for (let i = 0; i < pixels.length; i += 4) {
        gray.push(Math.round((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3));
      }
      const avg = gray.reduce((sum, value) => sum + value, 0) / gray.length;
      resolve(gray.map((value) => (value >= avg ? "1" : "0")).join(""));
    };

    image.onerror = reject;
    image.src = dataUrl;
  });
}

renderProducts();
renderBill();
