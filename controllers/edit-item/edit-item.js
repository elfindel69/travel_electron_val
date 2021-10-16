const {ipcRenderer} = require('electron');

const editItemForm = document.querySelector("#edit-item-form");
const editItemTitleInput = editItemForm.querySelector("#item-title");
const editItemDestinationInput = editItemForm.querySelector("#item-destination");
const editItemShortDescInput = editItemForm.querySelector("#item-short-desc");
const editItemLongDescInput = editItemForm.querySelector("#item-long-desc");
const editItemPerksInput = editItemForm.querySelector("#item-perks");
const editItemPriceInput = editItemForm.querySelector("#item-price");
const editItemImageInput = editItemForm.querySelector("#item-image");

//initialisation de la vue
ipcRenderer.on('init-data', (e,data)=>{
    editItemTitleInput.value = data.item.title;
    editItemDestinationInput.value = data.item.destination;
    editItemShortDescInput.value = data.item.shortDesc;
    editItemLongDescInput.value = data.item.longDesc;
    editItemPerksInput.value = data.item.perks;
    editItemPriceInput.value = data.item.price;
    editItemImageInput.value = data.item.image;
})

//form submitted
function onSubmitEditItemForm(e){
    e.preventDefault();

    const editItem = {
        title : editItemTitleInput.value,
        destination: editItemDestinationInput.value,
        shortDesc: editItemShortDescInput.value,
        longDesc: editItemLongDescInput.value,
        perks: editItemPerksInput.value,
        price: editItemPriceInput.value,
        image: editItemImageInput.value
    };

    ipcRenderer.invoke("edit-item",editItem)
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

editItemForm.addEventListener("submit",onSubmitEditItemForm)