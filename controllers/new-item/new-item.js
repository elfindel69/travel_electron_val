const {ipcRenderer} = require('electron');

const newItemForm = document.querySelector("#new-item-form");
const newItemTitleInput = newItemForm.querySelector("#item-title");
const newItemDestinationInput = newItemForm.querySelector("#item-destination");
const newItemShortDescInput = newItemForm.querySelector("#item-short-desc");
const newItemLongDescInput = newItemForm.querySelector("#item-long-desc");
const newItemPerksInput = newItemForm.querySelector("#item-perks");
const newItemPriceInput = newItemForm.querySelector("#item-price");
const newItemImageInput = newItemForm.querySelector("#item-image");

//form submitted
function onSubmitNewItemForm(e){
    e.preventDefault();

    const newItem = {
        title : newItemTitleInput.value,
        destination: newItemDestinationInput.value,
        shortDesc: newItemShortDescInput.value,
        longDesc: newItemLongDescInput.value,
        perks: newItemPerksInput.value,
        price: newItemPriceInput.value,
        image: newItemImageInput.value
    };

    ipcRenderer.invoke("new-item",newItem)
        .then(resp =>{
            const msgDiv = document.querySelector("#response-message");
            msgDiv.innerText = resp;
            msgDiv.hidden = false;
            setTimeout(()=>{
                msgDiv.innerText = '';
                msgDiv.hidden = true;

            },1500);

            e.target.reset();
        } )
}

newItemForm.addEventListener("submit",onSubmitNewItemForm)