if (!customElements.get('featured-card')) {
    class FeaturedCard extends HTMLElement {
        constructor() {
            super();
    
            this.handleBtnClick = this.handleBtnClick.bind(this);
            this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
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

                const config = fetchConfig('javascript');
                config.headers['X-Requested-With'] = 'XMLHttpRequest';
                delete config.headers['Content-Type'];


                if (this.cart) {
                    formData.append('sections', this.cart.getSectionsToRender().map((section) => section.id));
                    formData.append('sections_url', window.location.pathname);
                    this.cart.setActiveElement(document.activeElement);
                }
                config.body = formData;

                fetch(urlAdd, config)
                .then(res => res.json()).then(addData => {
                    publish(PUB_SUB_EVENTS.cartUpdate, {source: 'featured-card', productVariantId: addData.variant_id})
                    this.cart.renderContents(addData);
                    setTimeout(() => this.remove(), 500);
                });
            }
        }
    }
    
    customElements.define("featured-card", FeaturedCard);
}