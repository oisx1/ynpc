// Modules to control application life and create native browser window
const {app, Menu, Tray, BrowserWindow, dialog} = require('electron')
const ipcMain = require('electron').ipcMain
const path = require('path')
// var fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let appIcon
let realClose = false
function createWindow () {
  // 如果已经打开软件，从最小化还原
  const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
      //若最小化则还原
      if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
      }
  });
  if(shouldQuit) {
      app.quit();
  }
  // 隐藏工具菜单
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({width: 1060, height: 727, frame: false, webPreferences: {webSecurity: false}})
  mainWindow.setMinimumSize(702, 500)
  mainWindow.loadFile('index.html')
  // mainWindow.webContents.openDevTools()
 
  mainWindow.on('close', event=> {
    if (realClose) {
      mainWindow.webContents.send('quit', '');
    }
    else{
      mainWindow.hide();
      event.preventDefault();
    }
  })
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  // 处理最大最小化
  //登录窗口最小化
  ipcMain.on('window-hide',function(){
    mainWindow.hide();
  })
  ipcMain.on('window-min',function(){
    mainWindow.minimize();
  })
  ipcMain.on('window-show',function(){
    mainWindow.show();
    mainWindow.focus();
  })
  //登录窗口最大化
  ipcMain.on('window-max',function(){
    if(mainWindow.isMaximized()){
        mainWindow.restore();  
    }else{
        mainWindow.maximize(); 
    }
  })
  ipcMain.on('window-update', function(e, description) {
    // 提示升级
    const options = {
      type: 'info',
      title: '升级提示',
      message: "有可用的新版本，更新内容如下，是否下载?\r\n" + description,
      buttons: ['是', '取消']
    }
    dialog.showMessageBox(options, (index) => {
        e.sender.send('update-dialog-selection', index)
    })
  })

  // 托盘
  const iconName = 'assets/images/logo.png';
  const iconPath = path.join(__dirname, iconName)
  appIcon = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([{
    label: '退出',
    click: () => {
      realClose = true
      app.quit()
    }
  }])
  appIcon.setToolTip('一牛财经')
  appIcon.setContextMenu(contextMenu)
  appIcon.on('click', ()=>{ //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })

  app.on('window-all-closed', () => {
    if (appIcon) appIcon.destroy()
  })

  // 执行js
  // var filePath = path.join(__dirname, 'bind.js')
  // fs.readFile(filePath ,'utf8',function(err, data){
  //   // console.log(data)
  //   mainWindow.webContents.executeJavaScript(data)
  // });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
app.on('browser-window-created', function (e, w) {
  console.log(w.getTitle())
})