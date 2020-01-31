//index.js
//获取应用实例
const app = getApp();

var amapFile = require("../amap/amap-wx");

var markersData = [];

Page({
  data: {
    welcomeBackground:"",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    avatarUrl: "./user-unlogin.png",
    logged: false,
    takeSession: false,
    requestResult: "",
    getName: false,
    getNum:false,
    openid: "",
    person_name: "",
    person_num: 0,
    iflogin:false,
    home: true,
    latitude: "",
    longitude: "",
    scale: 16,
    location: "获取位置",
    user_background: "",
    markers: [
      {
        id: 1,
        latitude: 39.96,
        longitude: 116.35,
        title: "校本部"
      },
      {
        id: 2,
        latitude: 40.15,
        longitude: 116.28,
        title: "沙河校区"
        // callout: {
        //   content: "自定义点",
        //   color: "#AD1212",
        //   bgColor: "#00AD00",
        //   fontSize: "20",
        //   borderRadius: "5"
        // }
      }
    ],
    // search_marker: {
    //   latitude: 0,
    //   longitude: 0,
    //   title: "",
    //   color: "#0xffa500",
    //   label: ""
    // },
    inputShowed: false,
    inputVal: "",
    tips: {}
  },
  //事件处理函数
  onLoad: function() {
    var that = this;
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
      console.log("getUserInfo");
    } else if (that.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      };
      console.log("getUserInfo");
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        }
      });
      console.log("getUserInfo");
    }

    if (!wx.cloud) {
      wx.redirectTo({
        url: "../chooseLib/chooseLib"
      });
      return;
    }

    that.get_openid();

    var openid = that.data.openid;

    console.log(that.data.openid);

    const db = wx.cloud.database();

    db.collection("user_info")
      .where({
        _openid: this.data.openid
      })
      .get({
        success: function(res) {
          that.setData({
            person_name: res.data[0].name,
            person_num: res.data[0].number,
            iflogin: res.data[0].iflogin
          });
          console.log(res.data);
        }
      });

    wx.cloud.downloadFile({
      fileID:
        "cloud://chuyan-1-co5tb.6368-chuyan-1-co5tb-1301134763/homepage_user_background.jpg", // 文件 ID
      success: res => {
        // 返回临时文件路径
        console.log(res.tempFilePath);
        that.setData({
          user_background: res.tempFilePath
        });
      },
      fail: console.error
    });
    wx.cloud.downloadFile({
      fileID:
        "cloud://chuyan-1-co5tb.6368-chuyan-1-co5tb-1301134763/welcomebackground.jpg", // 文件 ID
      success: res => {
        // 返回临时文件路径
        console.log(res.tempFilePath);
        that.setData({
          welcomeBackground: res.tempFilePath
        });
      },
      fail: console.error
    });

    var myAmapFun = new amapFile.AMapWX({
      key: "2e4ef5d3b34b3a3167eb9e72ff12e90d"
    });
    myAmapFun.getPoiAround({
      success: function(res) {
        console.log(res);
      }
    });
  },

  getUserInfo: function(e) {
    console.log(e);
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
  },
  onShow: function() {
    var that = this;
    wx.getLocation({
      success: function(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      }
    });
  },

  getUserInfo: function(e) {
    console.log(e);
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      logged: true,
      avatarUrl: e.detail.userInfo.avatarUrl,
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
  },
  //函数得到用户信息
  // getUserInfo: function(e) {
  //   console.log(e);
  //   app.globalData.userInfo = e.detail.userInfo;
  //   this.setData({
  //     userInfo: e.detail.userInfo,
  //     hasUserInfo: true
  //   });
  // },

  inputName: function(name) {
    this.setData({
      person_name: name.detail.value
    });
    if (this.data.person_name) {
      this.setData({ getName: true });
    } else {
      this.setData({ getName: false });
    }
    this.onLoad();
  },

  inputNum: function(num) {
    this.setData({
      person_num: num.detail.value
    });
    if (this.data.person_num) {
      this.setData({ getNum: true });
    } else {
      this.setData({ getNum: false });
    }
    this.onLoad();
  },

  next: function() {
    const db = wx.cloud.database();
    db.collection("user_info").add({
      data: {
        _id: this.data.openid,
        description: "name and number",
        name: this.data.person_name,
        number: this.data.person_num,
        iflogin: true
      },
      success: function(res) {
        console.log(res);
      }
    });
    wx.showToast({
      title: "登录成功",
      icon: "success",
      duration: 3000
    });
    // wx.navigateTo({
    //   url: "../homepage/homepage?openid" + this.data.openid
    // });
    this.onLoad();
  },

  open_confirm: function() {
    if (!this.data.getName || !this.data.getNum) {
      var cont = "";
      if (this.data.getName) {
        cont = "请输入学号";
      } else if (this.data.getNum) {
        cont = "请输入姓名";
      } else {
        cont = "请输入姓名和学号";
      }
      wx.showModal({
        title: "提示",
        content: cont,
        //confirmText: "主操作",
        //cancelText: "辅助操作",
        showCancel: false,
        success: function(res) {
          console.log(res);
          if (res.confirm) {
            console.log("用户点击主操作");
          } else {
            console.log("用户点击辅助操作");
          }
        }
      });
    }
    this.onLoad();
  },

  get_openid: function() {
    let that = this; //获取openid不需要授权
    var appid = "wx02976232a5f3e695";
    var secret = "e35c18d248e228818a136f179b6e2dbb";
    wx.login({
      success: function(loginCode) {
        //请求自己后台获取用户openid
        wx.request({
          url:
            "https://api.weixin.qq.com/sns/jscode2session?appid=" +
            appid +
            "&secret=" +
            secret +
            "&grant_type=authorization_code&js_code=" +
            loginCode.code,
          header: {
            "content-type": "application/json"
          },
          success: function(res) {
            console.log(res.data.openid); //获取openid
            that.setData({
              openid: res.data.openid
            });
          }
        });
      }
    });
  },

  home2map: function() {
    this.setData({
      home: false
    });
  },

  map2home: function() {
    this.setData({
      home: true
    });
  },

  back_self: function() {
    console.log('get location');
    wx.getLocation({
      success: res => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      }
    });
  },

  getCenterLocation: function() {
    var that = this;
    that.mapCtx.getCenterLocation({
      success: function(res) {
        console.log("经度", res.longitude);
        console.log("纬度", res.latitude);
        that.setData({
          location: "经度:" + res.longitude + "纬度:" + res.latitude
        });
      }
    });
  },

  showInput: function() {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function() {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function() {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function(e) {
    var that = this;
    that.setData({
      inputVal: e.detail.value
    });

    var keywords = e.detail.value;
    //var key = config.Config.key;
    var myAmapFun = new amapFile.AMapWX({
      key: "2e4ef5d3b34b3a3167eb9e72ff12e90d"
    });
    myAmapFun.getInputtips({
      keywords: keywords,
      location: "",
      success: function(data) {
        if (data && data.tips) {
          that.setData({
            tips: data.tips
          });
          console.log(data.tips);
        }
      }
    });
  },

  bindSearch: function(e) {
    var keywords = e.currentTarget.dataset.keywords;
    console.log(keywords.location);
    var that = this;
    var search_marker = {
      latitude: "",
      longitude: "",
      title: "",
      color: "#0xffa500",
      label: ""
    };
    var i = 0;
    while (keywords.location[i] != "," && i < 100) {
      search_marker.longitude += keywords.location[i];
      i++;
    }
    i++;
    while (i < keywords.location.length) {
      search_marker.latitude += keywords.location[i];
      i++;
    }
    search_marker.title = keywords.sname;
    search_marker.label = keywords.name;
    this.data.markers.push(search_marker);
    that.setData({
      inputShowed: false,
      latitude: search_marker.latitude,
      longitude: search_marker.longitude
    });
    // wx.redirectTo({
    //   url: url
    // })
  },

  showMarkerInfo: function(data, i) {
    var that = this;
    that.setData({
      textData: {
        name: data[i].name,
        desc: data[i].address
      }
    });
  },
  changeMarkerColor: function(data, i) {
    var that = this;
    var markers = [];
    for (var j = 0; j < data.length; j++) {
      if (j == i) {
        data[j].iconPath = "选中 marker 图标的相对路径"; //如：..­/..­/img/marker_checked.png
      } else {
        data[j].iconPath = "未选中 marker 图标的相对路径"; //如：..­/..­/img/marker.png
      }
      markers.push(data[j]);
    }
    that.setData({
      markers: markers
    });
  },

  scan: function (){
    wx.scanCode({
      success: function (res){
        console.log(res)
      }
    })
  }

});
