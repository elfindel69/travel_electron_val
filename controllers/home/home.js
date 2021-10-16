const {ipcRenderer} = require("electron");
const cardBox =  document.querySelector("#card-box");
function generateDataCard(travels) {

    //elements added
    travels.forEach(item=> {
        let divCard =document.createElement("div");
        divCard.classList.add("row",'g-0');
        divCard.id = "card-"+item.id;
        let divImg =document.createElement("div");
        divImg.classList.add("col-md-4","mx-auto");
        let image = document.createElement("img");
        image.id = "image-"+item.id;
        image.src = item.image;
        image.style.width ="400px";

        divImg.appendChild(image);
        divCard.appendChild(divImg);

        let divColBody = document.createElement("div");
        divColBody.classList.add("col-md-6");

        let divBody = document.createElement("div");
        divBody.classList.add("card-body");

        let header = document.createElement("h5");
        header.classList.add("card-title");
        header.id = "header-"+item.id;
        header.innerText = item.title;
        divBody.appendChild(header);

        let pDestination = document.createElement("p");
        pDestination.classList.add("card-text");
        pDestination.innerText = item.destination;
        pDestination.id = "destination-"+item.id;
        divBody.appendChild(pDestination);

        let pDesc = document.createElement("p");
        pDesc.classList.add("card-text");
        pDesc.innerText = item.shortDesc;
        pDesc.id = "desc-"+item.id;
        divBody.appendChild(pDesc);

        let pPerks = document.createElement("p");
        pPerks.classList.add("card-text");
        pPerks.innerText = item.perks;
        pPerks.id = "perks-"+item.id;
        divBody.appendChild(pPerks);

        let pPrice = document.createElement("p");
        pPrice.classList.add("card-text");
        pPrice.innerText = item.price+" €";
        pPrice.id = "price-"+item.id;
        divBody.appendChild(pPrice);

        let btnDetails = document.createElement("button");
        btnDetails.innerText = 'Details';
        btnDetails.classList.add('btn','btn-primary','mx-2');
        btnDetails.addEventListener("click",()=>{
            console.log('click');
            ipcRenderer.send('open-details-item-window',{
                id: item.id
            });
        });
        divBody.appendChild(btnDetails);

        divColBody.appendChild(divBody);
        divCard.appendChild(divColBody);
        divCard.style.border = "1px solid navy";
        divCard.style.borderRadius = "5px";
        cardBox.appendChild(divCard);

    });

}

//initialization
ipcRenderer.on("init-data",(e,travels)=>{

    generateDataCard(travels);
   

})

let btnAdd = document.querySelector("#btn-add");
function onClickAddNewItem(){
    ipcRenderer.send("open-new-item-window", null);
}
btnAdd.addEventListener("click",onClickAddNewItem);

//adds an element to the view
ipcRenderer.on("new-item-added",(e,data)=>{
        generateDataCard(data.item);
    }
)

//delete an element
ipcRenderer.on("delete-item",(e,data)=>{
        const elem = cardBox.querySelector("#card-"+data.id)
        cardBox.removeChild(elem);
})

//edition callback
cbEditedItem = (e,data)=>{
    const elem = cardBox.querySelector("#card-"+data.item.id)
    const header = elem.querySelector("#header-"+data.item.id)
    header.innerText = data.item.title;
    const pDestination =  elem.querySelector("#destination-"+data.item.id)
    pDestination.innerText = data.item.destination;
    const pDescription = elem.querySelector("#desc-"+data.item.id)
    pDescription.innerText = data.item.shortDesc;
    const pPerks = elem.querySelector("#perks-"+data.item.id)
    pPerks.innerText = data.item.perks;
    const pPrice = elem.querySelector("#price-"+data.item.id)
    pPrice.innerText = data.item.price;
    const image = elem.querySelector("#image-"+data.item.id)
    image.src = data.item.image;

};
ipcRenderer.on("edited-item",cbEditedItem);