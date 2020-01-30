//homepage.js
const app = getApp();

var amapFile = require("../amap/amap-wx");

var markersData = [];

Page({
  data: {
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    hasUserInfo: false,
    userInfo: {},
    avatarUrl: "./user-unlogin.png",
    logged: false,
    takeSession: false,
    requestResult: "",
    getName: false,
    loading: false,
    openid: "",
    person_name: "",
    person_num: 0,
    home: true,
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

  onReady: function(e) {
    this.mapCtx = wx.createMapContext("myMap");
  },

  onLoad: function() {
    var that = this;

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

    // wx.getUserInfo({
    //   //     // if (res.authSetting["scope.userInfo"]) {
    //   success: res => {
    //     console.log(res);
    //     that.setData({
    //       userInfo: res.userInfo,
    //       avatarUrl: res.userInfo.avatarUrl,
    //       hasUserInfo: true
    //     });
    //   },
    //   fail: console.log("fail to get")
    // });

    // wx.getSetting({
    //   success: res => {
    //     // if (res.authSetting["scope.userInfo"]) {
    //     // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //     wx.getUserInfo({
    //       success: res => {
    //         this.setData({
    //           avatarUrl: res.userInfo.avatarUrl,
    //           userInfo: res.userInfo
    //         });
    //       }
    //     });
    //   }
    // });

    db.collection("userInfo")
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

    var myAmapFun = new amapFile.AMapWX({
      key: "2e4ef5d3b34b3a3167eb9e72ff12e90d"
    });
    myAmapFun.getPoiAround({
      success: function(res) {
        console.log(res);
      }
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
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
    }
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
    db.collection("userInfo").add({
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
    this.setData({ loading: true });
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

  //以下无关

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: "login",
      data: {},
      success: res => {
        console.log("[云函数] [login] user openid: ", res.result.openid);
        app.globalData.openid = res.result.openid;
        wx.navigateTo({
          url: "../userConsole/userConsole"
        });
      },
      fail: err => {
        console.error("[云函数] [login] 调用失败", err);
        wx.navigateTo({
          url: "../deployFunctions/deployFunctions"
        });
      }
    });
  },

  // 上传图片
  doUpload: function() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: function(res) {
        wx.showLoading({
          title: "上传中"
        });

        const filePath = res.tempFilePaths[0];

        // 上传图片
        const cloudPath = "my-image" + filePath.match(/\.[^.]+?$/)[0];
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log("[上传文件] 成功：", res);

            app.globalData.fileID = res.fileID;
            app.globalData.cloudPath = cloudPath;
            app.globalData.imagePath = filePath;

            wx.navigateTo({
              url: "../storageConsole/storageConsole"
            });
          },
          fail: e => {
            console.error("[上传文件] 失败：", e);
            wx.showToast({
              icon: "none",
              title: "上传失败"
            });
          },
          complete: () => {
            wx.hideLoading();
          }
        });
      },
      fail: e => {
        console.error(e);
      }
    });
  }
});
