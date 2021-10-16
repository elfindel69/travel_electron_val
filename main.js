const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const Store = require('electron-store');

let homeWindow;
let newItemWindow;
let detailsItemWindow;
let editItemWindow;

let travels = null;

const store = new Store();
//init travel array from storage
if(store.has("travels")){
    travels = store.get("travels");
}else {
    travels = [
        {
            id: 1,
            title: "Henri IV rive gauche ***",
            destination: "Paris, France",
            shortDesc: "The Henri IV Hotel invites you on a journey through literary and artistic Paris in the heart of the historic district of the city of lights.",
            longDesc: "The Henri IV Hotel invites you on a journey through literary and artistic Paris in the heart of the historic district of the city of lights.\n" +
                "\n" +
                "The Henri IV Hotel offers you a warm welcome and encourages you to explore the banks of the Seine bordered by the Hôtel de la Monnaie, the French Institute, Notre Dame de Paris and all the places mentioned by Hemingway in \"A Moveable Feast.”\n" +
                "\n" +
                "You will stay in a 17th century house offering modern comfort, the charm of authentic and refined decor with a warm and attentive welcome ready to meet your expectations for an unforgettable stay.",
            perks: "TV, WIFI, minibar",
            price: 1500,
            image: "https://henri-paris-hotel.com/_novaimg/4208916-1321123_0_365_4106_2581_650_408.jpg"
        },
        {
            id: 2,
            title: "Regent hotel *****",
            destination: "Warsaw, Poland",
            shortDesc: "At the Regent Warsaw, we are proud to welcome you with warm Polish hospitality and exceptional service. .",
            longDesc: "At the Regent Warsaw, we are proud to welcome you with warm Polish hospitality and exceptional service. Our luxury hotel in Warsaw offers 246 spacious, comfortable rooms and a range of amenities, including our Venti-tre restaurant serving Polish and Italian cuisine, the Łazienki Lounge lobby bar,  a SPA centre, complete with gym and indoor pool, and a comprehensive range of event rooms.",
            perks: "Gym and SPA, restaurant, lounge bar",
            price: 2000,
            image: "https://www.regent-warsaw.com/uploads/9/8/2/4/98249840/regent-warsaw-hotel-entrance_10.jpg"
        }
    ];
    store.set("travels", travels);
}

    /**
     * window creation function
     * @param viewName window title
     * @param dataToSend data to send
     * @param width window width (px)
     * @param height window height (px)
     * @returns {Electron.CrossProcessExports.BrowserWindow} created window
     */
    function createWindow(viewName,dataToSend,width=1800,height=1080) {
        //window creation
        const win = new BrowserWindow({
            width, height,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname, 'preload.js')
            }
        });
        //opening of HTML file
        win.loadFile(path.join(__dirname, "views", viewName, viewName+".html")).then(() => {
            if(dataToSend){
                console.log("init view",dataToSend)
                win.send('init-data', dataToSend);
            }
        });
        //opening of web tools window
        //win.webContents.openDevTools();
        //function return
        return win;
    }

//window creation
    app.whenReady().then(()=>{
        homeWindow = createWindow("home",travels)
    });

//application shutdown
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

//window activation
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            console.log(app.getPath('userData'));

            homeWindow = createWindow("home",travels)
        }
    });

const openNewItemWindowCb = ()=>{
    //if there is a window, we focus it
    if(newItemWindow){
        newItemWindow.focus();
        return;
    }
    //window creation
    newItemWindow = createWindow("new-item",null,1000,1000);
    //new-item channel return
    ipcMain.handle('new-item',(e,newItem)=>{
        //item added
        let id = 1;
        if(travels.length > 0){
            id = travels[travels.length - 1].id +1;
        }
        newItem.id = id;
        travels.push(newItem);
        store.set("travels",travels);
        //data sent to main view
        homeWindow.send('new-item-added',{
            item: [newItem]
        });

        //return message
        return 'Item added successfully';
    });

    //channel suppression
    newItemWindow.on('closed',()=>{
        newItemWindow = null;
        ipcMain.removeHandler('new-item');
    });
};

ipcMain.on('open-new-item-window',openNewItemWindowCb);

const openDetailsItemWindowCb = (e,data)=> {
    if(detailsItemWindow){
        detailsItemWindow.close();
    }

    for(let item of travels){
        if(item.id === data.id){
            //window creation
            console.log("main",item);
            detailsItemWindow = createWindow("details", {item},1000,1000);


            break;
        }
    }
    detailsItemWindow.on('closed',()=>{
        detailsItemWindow = null;
        ipcMain.removeHandler('open-details-item-window');
    });
}

ipcMain.on('open-details-item-window',openDetailsItemWindowCb);


function showConfirmDeleteItemCb(e,data) {
    //confimration popup
    const choice = dialog.showMessageBoxSync({
        type: 'warning',
        buttons: ['No', 'Yes'],
        title: 'Suppression confirmation',
        message: 'Are you sure you want to delete this item?'
    })

    //if suppression confirmed
    if (choice) {

        for (let [index, item] of travels.entries()) {
            if (item.id === data.id) {

                travels.splice(index, 1);
                store.set("travels", travels);
                //delete item in home view
                homeWindow.send("delete-item", {id: item.id});
                break;
            }
        }
    }
    detailsItemWindow.on('closed',()=>{
        detailsItemWindow = null;
        ipcMain.removeHandler('delete-item');
    });
    return 'item successfully deleted';
}

ipcMain.handle('show-confirm-delete-item',showConfirmDeleteItemCb);

function editItemOpenWindowCb(e,elem) {
    if(editItemWindow){
        editItemWindow.close;
    }

    for(let [index,item] of travels.entries()) {
        if (item.id === elem.id) {
            //window creation
            editItemWindow = createWindow("edit-item", {item}, 1000, 1000);

            //item edition
            ipcMain.handle('edit-item', (e, data) => {
                travels[index].title = data.title;
                travels[index].destination = data.destination;
                travels[index].shortDesc = data.shortDesc;
                travels[index].longDesc = data.longDesc;
                travels[index].perks= data.perks;
                travels[index].price= data.price;
                travels[index].image= data.image;

                store.set("travels", travels);
                //home view update
                homeWindow.send('edited-item', {item: travels[index]});
                detailsItemWindow.send('edited-item-details',
                    {message:'item edited successfully', item: travels[index]})
                //return message
                return 'item edited successfully';
            });

            //suppression des channels
            editItemWindow.on('closed', () => {
                editItemWindow = null;
                ipcMain.removeHandler('edit-item');
            });
            break;
        }
    }
}

ipcMain.on('edit-item-details-view',editItemOpenWindowCb);