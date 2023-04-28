if (!customElements.get('featured-card')) {
    class FeaturedCard extends HTMLElement {
        constructor() {
            super();
    
            this.handleBtnClick = this.handleBtnClick.bind(this);
        }
    
        connectedCallback() {
            this.addEventListener("click", this.handleBtnClick);
        }
    
        disconnectedCallback() {
            this.removeEventListener("click", this.handleBtnClick);
        }
    
        handleBtnClick(event) {
            const target = event.target.closest("[data-js]");
            if (target.dataset.js == "add-to-cart-btn") {
                event.preventDefault();
                event.stopPropagation();
                const formData = new FormData();
                const variantId = +target.dataset.varId;
                const urlGet = window.Shopify.routes.root + "cart.js";
                const urlAdd = window.Shopify.routes.root + "cart/add.js";
                formData.set("id", variantId);
                formData.set("quantity", 1);
                this.style.opacity = 0.5;
                this.style.pointerEvents = "none";
                fetch(urlAdd, {
                    method: "POST",
                    body: formData
                }).then(res => res.json()).then(addData => {
                    fetch(urlGet).then(res => res.json()).then(getData => {
                    // const headerCartQty = document.querySelector("#cart-icon-bubble .cart-count-bubble");
                    // if (headerCartQty) {
                    //     headerCartQty.textContent = getData.item_count;
                    // } else {
                    //     let iconWrapper = document.querySelector("#cart-icon-bubble");
                    //     let iconCount = document.createElement("div");
                    //     iconCount.classList.add("cart-count-bubble");
                    //     iconCount.textContent = getData.item_count;
            
                    //     iconWrapper.appendChild(iconCount);
                    // }
                    publish(PUB_SUB_EVENTS.cartUpdate, getData);
                    });
                    setTimeout(() => this.remove(), 1000);
                });
            }
        }
    }
    
    customElements.define("featured-card", FeaturedCard);
}