let isMobile = window.innerWidth < 719
let alternateMobileLayout = false
let alternateDesktopLayout = false

const productsGrid = document.getElementById("products-grid")
const layoutToggle = document.getElementById("layout-toggle")
const productCountElement = document.getElementById("product-count")


const fetchProducts = async () => {
    try {
      const response = await fetch("https://desafio.xlow.com.br/search");
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      const data = await response.json();
      if(data) {
        const detailedProducts = await Promise.all(
          data.map(async (product) => {
            const response = await fetch(`https://desafio.xlow.com.br/search/${product.productId}`);
            if (!response?.ok) {
              throw new Error(`Erro na requisição: ${response.status}`);
            }
            const detailedProduct = await response.json();
            return detailedProduct;
          })
        )
        return detailedProducts;
      }
    } 
    catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    }
};

console.log(fetchProducts())

const formatPrice = (price) => {
  return price?.toFixed(2).replace(".", ",")
}

const createProductCard = (product) => {
    const hasDiscount = product?.items[0]?.sellers[0].commertialOffer.PriceWithoutDiscount !== product?.items[0]?.sellers[0].commertialOffer.Price
    console.log('Price', product?.items[0]?.sellers[0])

    const card = document.createElement("div")
    card.className = "product-card"

    card.innerHTML = `
      <div class="product-image-container">
        <img src="${product?.items[0]?.images[0].imageUrl}" 
             alt="${product?.productName}" 
             class="product-image" 
             id="main-image-${product.productId}">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product?.productName}</h3>
        <div class="product-variations" id="variations-${product?.productId}">
          ${product?.items[0]?.images?.map((variation) => `
            <div class="variation-item" 
                 data-product-id="${product.productId}" 
                 data-variation-src="${variation.imageUrl}">
              <img src="${variation.imageUrl}" alt="${variation.imageText}">
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="product-price">
          ${hasDiscount ? `<div class="price-original">R$ ${formatPrice(product?.items[0]?.sellers[0].commertialOffer.PriceWithoutDiscount)}</div>` : ""}
          <div class="price-current ${hasDiscount ? "price-discounted" : ""}">
            R$ ${formatPrice(product?.items[0]?.sellers[0].commertialOffer.Price)}
          </div>
        </div>
        <button class="buy-button">COMPRAR</button>
      </div>
    `
  
    const variationsContainer = card.querySelector(`#variations-${product?.productId}`)
    const variationItems = variationsContainer.querySelectorAll(".variation-item")
  
    variationItems.forEach((item) => {
      item.addEventListener("click", () => {
        const productId = item.getAttribute("data-product-id")
        const mainImage = document.getElementById(`main-image-${productId}`)
        const variationSrc = item.getAttribute("data-variation-src")
    
        mainImage.src = variationSrc
      })
    })
  
    return card
}

const renderProducts = async () => {
  try {
    productsGrid.innerHTML = "Carregando produtos..."
    const products = await fetchProducts()
    productsGrid.innerHTML = ""

    productCountElement.textContent = products.length

    products.forEach((product) => {
      const productCard = createProductCard(product[0])
      productsGrid.appendChild(productCard)
    })
  } catch (error) {
    console.error("Erro ao carregar produtos:", error)
    productsGrid.innerHTML = '<p class="error-message">Erro ao carregar produtos. Por favor, tente novamente.</p>'
  }
}

const toggleLayout = () => {
  const gridIcon = document.querySelector(".grid-icon");

  gridIcon.innerHTML = "";

  if (isMobile) {
    alternateMobileLayout = !alternateMobileLayout;

    const cols = alternateMobileLayout ? 1 : 2;
    const rows = 2; 

    gridIcon.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridIcon.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    for (let i = 0; i < cols * rows; i++) {
      const gridSquare = document.createElement("div");
      gridSquare.classList.add("grid-square");
      gridIcon.appendChild(gridSquare);
    }

    productsGrid.classList.toggle("grid-2", alternateMobileLayout);
  } else {
    alternateDesktopLayout = !alternateDesktopLayout;

    const cols = alternateDesktopLayout ? 4 : 5;
    const rows = 2;

    gridIcon.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridIcon.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    for (let i = 0; i < cols * rows; i++) {
      const gridSquare = document.createElement("div");
      gridSquare.classList.add("grid-square");
      gridIcon.appendChild(gridSquare);
    }

    productsGrid.classList.toggle("grid-2", alternateDesktopLayout);
  }
};

const checkMobile = () => {
  const wasMobile = isMobile
  isMobile = window.innerWidth < 992

  if (wasMobile !== isMobile) {
    productsGrid.classList.toggle("grid-2", isMobile ? alternateMobileLayout : alternateDesktopLayout)
  }
}

layoutToggle.addEventListener("click", toggleLayout)
window.addEventListener("resize", checkMobile)

window.addEventListener("DOMContentLoaded", () => {
  renderProducts()
  checkMobile()
})

