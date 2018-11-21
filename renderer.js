const {ipcRenderer, shell} = require('electron')
const {BrowserWindow} = require('electron').remote
const path = require('path')

let coutryMap = {};
let isNotice = true
let isSound = true
let version = 3.02

window.onload = function(){
    var iframe = document.getElementById("mainFrame")
    var iframeDoc = iframe.contentDocument
    var noticeBtn = iframeDoc.getElementById('inotic'); 
    noticeBtn.onclick = function(){
        isNotice = !isNotice
    }

    var soundBtn = iframeDoc.getElementById('isound');
    soundBtn.onclick = function() {
        isSound = !isSound
    }

    var okBtn = iframeDoc.getElementById('setMakeSubmit');
    okBtn.onclick = function() {
        var effect = iframeDoc.getElementById('selectPro');
        var dts = effect.getElementsByTagName('dd');
        var ef = '';
        for(var i = 0;i < dts.length; i++)
        {
            var dd = dts[i];
            if (dd.getAttribute('class') == 'on')
                ef += '1,';
            else
                ef += '0,';
        }                
        var important = iframeDoc.getElementById('selectImp');
        var dts = important.getElementsByTagName('dd');
        var imp = '';
        for(var i = 0;i < dts.length; i++)
        {
            var dd = dts[i];
            if (dd.getAttribute('class') == 'on')
                imp += '1,';
            else
                imp += '0,';
        }
        // interactObj.okBtnClicked(ef, imp);
        alert("ok btn clicked")
    }
    var f = window.frames[0]
    f.sendPcData = receiveData
    // 初始化国旗
	coutryMap["澳大利亚"] = "adly";
	coutryMap["比利时"] = "bls";
	coutryMap["德国"] = "dg";
	coutryMap["法国"] = "fg";
	coutryMap["韩国"] = "hg";
	coutryMap["加拿大"] = "jnd";
	coutryMap["美国"] = "mg";
	coutryMap["欧元区"] = "oyq";
	coutryMap["日本"] = "rb";
	coutryMap["瑞典"] = "rd";
	coutryMap["瑞士"] = "rs";
	coutryMap["西班牙"] = "xby";
	coutryMap["香港"] = "xg";
	coutryMap["新加坡"] = "xjp";
	coutryMap["意大利"] = "ydl";
	coutryMap["英国"] = "yg";
    coutryMap["中国"] = "zg";
    
    // 请求版本信息
    $.getJSON("http://live.108tec.com/index/other/yiniu_desktop",{},function(msg){ 
        if (msg.error == 0) {
            var data = msg.data
            var newVersion = parseFloat(data.yiniu_desktop_version)
            var url = data.yiniu_desktop_package
            var description = data.yiniu_desktop_description
            if (version < newVersion) {
                ipcRenderer.send("window-update", description)
            }
            ipcRenderer.on('update-dialog-selection', (event, index) => {
                // yes
                if (index === 0){
                    shell.openExternal(url)
                }
            })
        }
    })
}

// 初始化按钮事件
var msgBtn = document.getElementById('msgBtn')
msgBtn.addEventListener('click', (event) => {
    if ( document.getElementById('mainFrame').style.display == "none"){
        document.getElementById('mainFrame').style.display = "block"
        document.getElementById('otherFrame').style.display = "none"
    }
})

document.getElementById('newsBtn').addEventListener('click', otherClick)
document.getElementById('dianpingBtn').addEventListener('click', otherClick)
document.getElementById('quotesBtn').addEventListener('click', otherClick)
document.getElementById('riliBtn').addEventListener('click', otherClick)
document.getElementById('dataBtn').addEventListener('click', otherClick)
document.getElementById('videoBtn').addEventListener('click', otherClick)
function otherClick() {
    if ( document.getElementById('otherFrame').style.display == "none"){
        document.getElementById('otherFrame').style.display = "block"
        document.getElementById('mainFrame').style.display = "none"
    }
}

function playSound() {
    if (isSound) {
        // 播放声音
        let audio = new Audio()
        audio.src = "assets/sound/sound.wav"
        audio.play();
    }
}

function receiveData(data) {
    console.log(data)
    if (!isNotice) return
    var obj = $.parseJSON(data)
    var content = obj.content
    var timeStr = new Date().Format("yyyy-MM-dd HH:mm")
    var notice = {}
    if (obj.code === "CJRL" || obj.code === "KUAIXUN") {
        if (obj.code === "CJRL"){
            notice.title = content.state + content.title
            notice.body = timeStr + "\r\n" + "前值:" + content.before + " 预测:" + content.forecast + " 公布:" + content.reality
            var gq = coutryMap[content.state]
            notice.icon = path.join(__dirname, 'assets/images/country/'+gq+'.png')
            playSound()
            const myNotification = new window.Notification(notice.title, notice)
            myNotification.onclick = function() {
                ipcRenderer.send('window-show')
            }
        }else if (obj.code === "KUAIXUN") {
            if (content.importance === "高") {
                notice.title = timeStr
                notice.body = obj.content.title
                playSound()
                const myNotification = new window.Notification(notice.title, notice)
                myNotification.onclick = function() {
                    ipcRenderer.send('window-show')
                }
            }
        }
    }else if (obj.code == "ADV"){
        shell.openExternal(content.url)
    }
}

// iframe自适应窗体大小
function changeFrameHeight(){
    var ifm = document.getElementById("mainFrame");
    ifm.height = document.documentElement.clientHeight-96;
    var ifm2 = document.getElementById("otherFrame");
    ifm2.height = document.documentElement.clientHeight-96;
}
window.onresize=function(){ changeFrameHeight(); }
changeFrameHeight();

// 最大最小化关闭按钮
let minBtn = document.getElementById("minBtn");
let maxBtn = document.getElementById("maxBtn");
let closeBtn = document.getElementById("closeBtn");
minBtn.addEventListener('click', (event) => {
    ipcRenderer.send('window-min');
})
maxBtn.addEventListener('click', (event) => {
    ipcRenderer.send('window-max');
})
closeBtn.addEventListener('click', (event) => {
    ipcRenderer.send('window-hide');
})

// 初始化通知窗口
let nWidth = 200
let nHeight = 100
let notice = new BrowserWindow({ frame: false,width:nWidth, height:nHeight})
notice.setSkipTaskbar(true)
notice.hide()
notice.on('close', () => { notice = null })

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "H+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


// 通知
const notification = {
    title: '16:00',
    body: '欧洲央行行长德拉吉：劳动力市场已经显示出收紧迹象。 薪资增长对物价的传达仍相对有限。'
}
const notificationImg = {
    title: 'Notification with image',
    body: 'Short message plus a custom image',
    icon: path.join(__dirname, 'assets/images/1.png')
}

// const noticeBtn = document.getElementById('notice')
// noticeBtn.addEventListener('click', (event) => {
//     receiveData('{"id":"323374","code":"KUAIXUN","content":{"autoid":"4990331066","importance":"高","noticeapp":0,"time":"2018-11-14 12:31:06","title":"日本9月第三产业活动指数环比 -1.1%，预期 -0.4%，前值 0.5%。"},"socre":"1542169866899"}')
//     return
// })
ipcRenderer.on('quit',function() {
    notice.close()
})
