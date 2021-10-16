const {ipcRenderer} = require('electron');

let id = 0;
let title = document.querySelector('#title');
let destination= document.querySelector('#destination');
let long_desc= document.querySelector('#long_desc');
let perks= document.querySelector('#perks');
let price= document.querySelector('#price');
let img= document.querySelector('#img');
let btnEdit= document.querySelector('#btn-edit');
let btnDelete= document.querySelector('#btn-delete');

function fillView(data) {
    title.innerHTML = data.item.title;
    destination.innerHTML = data.item.destination;
    long_desc.innerHTML = data.item.longDesc;
    perks.innerHTML = data.item.perks;
    price.innerHTML = data.item.price+" €";
    img.src = data.item.image;
}

//initialisation de la vue
ipcRenderer.on('init-data', (e,data)=>{
    console.log(data);
    fillView(data);
    id = data.item.id;
    btnDelete.addEventListener("click",()=>{

        ipcRenderer.invoke("show-confirm-delete-item",{id})
            .then(resp =>{
                const msgDiv = document.querySelector("#response-message");
                msgDiv.innerText = resp;
                msgDiv.hidden = false;
                msgDiv.classList.add("alert-danger");
                setTimeout(()=>{
                    msgDiv.innerText = '';
                    msgDiv.hidden = true;

                },1500);

            } )

    })
    btnEdit.addEventListener("click",()=>{
        ipcRenderer.send("edit-item-details-view",{id})
        ipcRenderer.on("edited-item-details",(e,data) =>{
                console.log('resp',data)
                fillView(data);
                const msgDiv = document.querySelector("#response-message");
                msgDiv.innerText = data.message;
                msgDiv.hidden = false;
                msgDiv.classList.add("alert-warning");
                setTimeout(()=>{
                    msgDiv.innerText = '';
                    msgDiv.hidden = true;

                },1500);

            } )
    } )
})

