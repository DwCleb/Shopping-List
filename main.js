const electron = require('electron')
const url = require('url')
const path = require('path')

const { app, BrowserWindow, Menu, ipcMain } = electron

// Set ENV
process.env.NODE_ENV = 'production'

let mainWindow
let addWindow

// Listen for app to be ready
app.on('ready', () => {
  // Create new window
  mainWindow = new BrowserWindow( { } )
  // Load html into window
  mainWindow.loadURL(url.format( {
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true,
  }))
  // Quit app when close
  mainWindow.on('closed', () => {
    app.quit()
  })

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
  // Insert Menu
  Menu.setApplicationMenu(mainMenu)
})

// Handle create add window
function createAddWindow() {
   // Create new window
   addWindow = new BrowserWindow( { 
     width: 300,
     height: 200,
     title: 'Add Shopping List Item',
    } )
   // Load html into window
   addWindow.loadURL(url.format( {
     pathname: path.join(__dirname, 'addWindow.html'),
     protocol: 'file:',
     slashes: true,
   }))
   // Gargabe collection handle
   addWindow.on('close', () => {
     addWindow = null
   })
}

// cath item:add
ipcMain.on('item:add', (e, item) => {
  console.log(item)
  mainWindow.webContents.send('item:add', item)
  addWindow.close()
})

// Create menu template
const mainMenuTemplate = [
  {},
  {
    label: 'file',
    submenu: [
      {
        label:'Add Item',
        click(){
          createAddWindow()
        }
      },
      {
        label:'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear')
        }
      },
      {
        label:'Quit',
        accelerator: process.plataform == 'darwin' ? 'Command + Q' : 'Ctrl + Q',
        click(){
          app.quit()
        }
      },
    ]
  }
]

// If mac, add empty object to menu
if (process.platform == 'darwin'){
  mainMenuTemplate.unshift({})
}

// Add developer tools item id not in production
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        label: 'Toggle DevTools',
        accelerator: process.plataform == 'darwin' ? 'Command + I' : 'Ctrl + I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools()
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}