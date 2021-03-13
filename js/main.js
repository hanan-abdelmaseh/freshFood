//1-set the variables :
// for the navbar 
const cartBtn = document.querySelector(".cart-btn");
const cartItems = document.querySelector(".cart-items");
// cart overlay 
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const CartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const cartOverlay = document.querySelector(".cart-overlay");
const cartDom = document.querySelector(".cart");
// to display the products 
const productsDom = document.querySelector(".products-center");


//2- make array for the cart to add or remove item from cart 
let cart = [];
let buttonsDom = [];





// classes
// to get data from json file  
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            // to convert it to json data 
            let data = await result.json();
            // this is complicated array we need to construct it 
            let products = data.items;
            // map to itrate for each item
            products = products.map(item => {
                    let { title, price } = item.fields;
                    let { id } = item.sys;
                    let image = item.fields.image.fields.file.url;
                    return { title, id, price, image };
                })
                // this is the  real simple array 
            return products;
        } catch (error) {
            console.log(error);

        }
    }
};

// to display data 
class Ui {
    // products is the array of products
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result += `
             <div class="product">
               <div class="img-container">
                 <img src=${product.image} alt="product-img" class="product-img">
                 <button class="bag-btn" data-id=${product.id}>
                   <i class="fas fa-shopping-cart"></i>add in cart 
                 </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
               </div>
            `
        });
        productsDom.innerHTML = result;
    };
    // end of display products
    //get the button on the img 
    getBagButtons() {
        // to convert it to array  instead of nodlist 
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDom = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "in cart"
                button.disabled = true;
            }
            button.addEventListener("click", event => {
                //1- to change the dom of the buuton in the photo
                event.target.innerText = "in cart";
                event.target.disabled = true;
                //2- get product from products array from storage 
                let cartItem = {...storage.getProduct(id), amount: 1 };
                console.log(cartItem);
                //3- add to cart array
                cart = [...cart, cartItem];
                console.log(cart);
                //4- save cart array in the storage 
                storage.saveCart(cart);
                //5- set cart values
                this.setCartValues(cart);
                //6- display cart value
                this.addCartItem(cartItem);
                //7-show the cart 
                this.showCart();


            });


        });

    };
    //5- set the cart value and change the item number in the navbar 
    setCartValues(cart) {
            let itemsTotal = 0;
            let totalPrice = 0;
            cart.map(item => {
                // to control the qnty 
                itemsTotal += item.amount;
                // to control the total price 
                totalPrice += item.price * item.amount;
            });
            // here i change item num in the nav 
            cartItems.innerText = itemsTotal;
            // here i change the total 
            CartTotal.innerText = parseFloat(totalPrice.toFixed(2));
            console.log(cartItems, CartTotal)


        }
        //6- add cart item 
    addCartItem(item) {
            const div = document.createElement("div");
            div.classList.add("cart-item");
            div.innerHTML = ` 
             <img src=${item.image} alt="img-cart">
               <div>
                  <h4>${item.title}</h4>
                   <h5>$${item.price}</h5>
                    <span class="remove-item" data-id=${item.id}> remove</span>
                 </div>
                  <div>
                 <i class="fas fa-chevron-up"  data-id=${item.id}></i>
                  <p class="item-amount" >${item.amount}</p>
                  <i class="fas fa-chevron-down"  data-id=${item.id}></i>
                  </div>
                  `;
            cartContent.appendChild(div);


        }
        //7- show the cart 
    showCart() {
            cartOverlay.classList.add("transparentBcg");
            cartDom.classList.add('showCart');
        }
        // hide the cart
    hideCart() {

            cartOverlay.classList.remove("transparentBcg");
            cartDom.classList.remove('showCart');

        }
        // set the app 
        // at first to get the datat from local storage if client add item
    setUpApp() {
        // 1- get the cart array from the storage 
        cart = storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);


    }

    populateCart(cart) {
            cart.forEach(item => this.addCartItem(item));
        }
        // cart logic to delete the cart 
    cartLogic() {
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();

        });
        // remove the item on click on remove 
        cartContent.addEventListener("click", event => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;

                let id = removeItem.dataset.id;
                // to clear it from dom
                cartContent.removeChild(removeItem.parentElement.parentElement);

                this.removeItem(id);
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;

                let id = addAmount.dataset.id;

                // to find this item in the cart 
                let itemsTotal = cart.find(item => item.id === id);
                // then increase the amount by 1 
                itemsTotal.amount = itemsTotal.amount + 1;
                // save the cart in the storage after update
                storage.saveCart(cart);
                //update the values
                this.setCartValues(cart);
                //update the item amount  nextElementSibling to change the next elemnt to it 
                addAmount.nextElementSibling.innerText = itemsTotal.amount;


            } else if (event.target.classList.contains('fa-chevron-down')) {
                let decreaseAmount = event.target;

                let id = decreaseAmount.dataset.id;
                let itemsTotal = cart.find(item => item.id === id);
                itemsTotal.amount = itemsTotal.amount - 1;
                if (itemsTotal.amount > 0) {
                    // update the storage 
                    storage.saveCart(cart);
                    // update the values 
                    this.setCartValues(cart);
                    //update the amount
                    decreaseAmount.previousElementSibling.innerText = itemsTotal.amount;

                } else {
                    //to clear the item from the dom
                    cartContent.removeChild(decreaseAmount.parentElement.parentElement);
                    this.removeItem(id);
                }


            }

        });

    };
    // to clear cart 
    clearCart() {
        // get the all id in the cart 
        let cartItems = cart.map(item => item.id);
        //to loop all the item in the cart 
        cartItems.forEach(id => this.removeItem(id));
        // now i need to update the cart and remove the dom 
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
            console.log(cartContent);
        }
    };
    removeItem(id) {
        // remove or return all the item not = to this id in the cart 
        cart = cart.filter(item => item.id !== id);

        // then update the values of the cart
        this.setCartValues(cart);
        // then save the cart in the storage
        storage.saveCart(cart);
        /* now i need to change the button in the photo return it to normal 
         make it clickeable and return text to before
         */
        let button = this.getSingleButton(id);
        //make it enable
        button.disabled = false;
        // change the inner text
        button.innerHTML = ` <i class="fas fa-shopping-cart">
        </i>add in cart `;



    }
    getSingleButton(id) {
        // return the button from array of btns  that aleary added to the cart 
        return buttonsDom.find(button => button.dataset.id === id);
    }

};

/* save the item to local storage so that when call to the button on the 
    image it get the data from local storage then deal with it    */
class storage {
    // static as i will use it in other classes 
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    };
    // from storage i need to get the item i clicked on 
    static getProduct(id) {
            let products = JSON.parse(localStorage.getItem('products'));
            return products.find(product => product.id === id);
            // then i will use it in get bag function when button clickec
        }
        // save the cart in the storage 
    static saveCart(cart) {
            // i save it as string
            localStorage.setItem("cart", JSON.stringify(cart));
        }
        // get the cart 
    static getCart() {
        // go to loacal storage if you find cart convert it to array else  return empty array 
        return localStorage.getItem("cart") ?
            JSON.parse(localStorage.getItem("cart")) : [];
    }

};




// on load the page 
document.addEventListener("DOMContentLoaded", function() {
    const ui = new Ui();
    const products = new Products();
    //set up the app 
    ui.setUpApp();
    //to dispaly data from json in the console after simple it 
    products.getProducts().then(products => console.log(products));
    // this  to display products when loaded 
    products.getProducts().then(products => {
        ui.displayProducts(products)
        storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });



});