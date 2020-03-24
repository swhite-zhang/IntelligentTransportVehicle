//index.js
//获取应用实例
const app = getApp();

var amapFile = require("../amap/amap-wx");
var qqmap = require("../qqmap/qqmap-wx-jssdk");
var qqmapsdk;

Page({
  data: {
    ifGetStart:false,
    welcomeBackground: "",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    avatarUrl: "./user-unlogin.png",
    logged: false,
    takeSession: false,
    requestResult: "",
    // getName: false,
    // getNum: false,
    // openid: "",
    // person_name: "",
    // person_num: 0,
    // iflogin: false,
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
        title: "校本部",
        iconPath: "../images/markers1.png",
        width: 50,
        height: 50,
        callout: {
          content: "校本部",
          color: "#1B4F72",
          bgColor: "#D0D3D4",
          fontSize: "16",
          borderRadius: "5",
          padding: "6",
          textAlign: "center"
        }
      },
      {
        id: 2,
        latitude: 40.15,
        longitude: 116.28,
        title: "沙河校区",
        iconPath: "../images/markers1.png",
        width: 50,
        height: 50,
        callout: {
          content: "沙河校区",
          color: "#1B4F72",
          bgColor: "#D0D3D4",
          fontSize: "16",
          borderRadius: "5",
          padding: "6",
          textAlign: "center"
        }
      }
    ],
    // controls:[{
    //   id:1,
    //   iconpath:'../images/back.jpg',
    //   position:{
    //     right:20,
    //     top:20,
    //     width:10,
    //     height:10
    //   }
    // }],
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
  getStart: function(){
    this.setData({
      ifGetStart: true
    })
  },
  //事件处理函数
  onLoad: function() {
    // 实例化API核心类
    qqmapsdk = new qqmap({
      key: "QMKBZ-POKC4-WO2UP-XOXZA-35V5Q-4LBHU"
    });
    var that = this;
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
      console.log("getUserInfo");
      console.log(app.globalData.userInfo);
    } else if (that.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      console.log(res.userInfo);
      };
      console.log("getUserInfo");
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo;
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       });
    //     },
    //     fail: err => {
    //       wx.showModal({
    //         title: "警告",
    //         content:
    //           "您点击了拒绝授权，将无法正常使用小程序的功能体验。请10分钟后再次点击授权，或者删除小程序重新进入。",
    //         success: function(res) {
    //           if (res.confirm) {
    //             console.log("用户点击确定");
    //           }
    //         }
    //       });
    //     }
    //   });
    //   console.log("getUserInfo");
    }

    if (!wx.cloud) {
      wx.redirectTo({
        url: "../chooseLib/chooseLib"
      });
      return;
    }

    that.get_openid();


    console.log(that.data.openid);

    const db = wx.cloud.database();

    db.collection("user_info")
      .where({
        _openid: this.data.openid
      })
      .get({
        success: function(res) {
          that.setData({
            // person_name: res.data[0].name,
            // person_num: res.data[0].number,
            iflogin: res.data[0].iflogin,
            ifGetStart: res.data[0].ifGetStart,
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

  onShow: function() {
    
    // wx.getLocation({
    //   success: res => {
    //     that.setData({
    //       latitude: res.latitude,
    //       longitude: res.longitude
    //     });
    //   },
    //   fail: err => {
    //     wx.showModal({
    //       title: "警告",
    //       content:
    //         "您禁用了位置信息，是否打开？（禁用位置权限将会影响小程序的使用）",
    //       success: function(res) {
    //         if (res.confirm) {
    //           wx.openSetting({
    //             success: res => {
    //               var status = res.authSetting;
    //               status["scope.userLocation"] = true;
    //               wx.showToast({
    //                 title: "授权成功",
    //                 icon: "success"
    //               });
    //               console.log(status["scope.userLocation"]);
    //               wx.getLocation({
    //                 success: res => {
    //                   that.setData({
    //                     latitude: res.latitude,
    //                     longitude: res.longitude
    //                   });
    //                   console.log(this.latitude, this.longtitude);
    //                 },
    //                 fail: err => {
    //                   console.log("failed to get location");
    //                 }
    //               });
    //             }
    //           });
    //         } else if (res.cancel) {
    //           wx.showToast({
    //             title: "授权失败",
    //             icon: 'none'
    //           });
    //         }
    //       }
    //     });
    //   }
    // });
  },


  getUserInfo: function(e) {
    console.log(e.detail.userInfo);
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      logged: true,
      avatarUrl: e.detail.userInfo.avatarUrl,
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
    const db = wx.cloud.database();
    db.collection("user_info").add({
      data: {
        _id: this.data.openid,
        description: "name and number",
        name: this.data.person_name,
        number: this.data.person_num,
        iflogin: true,
        ifGetStart:true,
      },
      success: function(res) {
        console.log(res);
      }
    });
  },
  
  //注册

  // inputName: function(name) {
  //   this.setData({
  //     person_name: name.detail.value
  //   });
  //   if (this.data.person_name) {
  //     this.setData({ getName: true });
  //   } else {
  //     this.setData({ getName: false });
  //   }
  // },

  // inputNum: function(num) {
  //   this.setData({
  //     person_num: num.detail.value
  //   });
  //   if (this.data.person_num) {
  //     this.setData({ getNum: true });
  //   } else {
  //     this.setData({ getNum: false });
  //   }
  // },

  // next: function() {
  //   const db = wx.cloud.database();
  //   db.collection("user_info").add({
  //     data: {
  //       _id: this.data.openid,
  //       description: "name and number",
  //       name: this.data.person_name,
  //       number: this.data.person_num,
  //       iflogin: true,
  //       ifGetStart:true,
  //     },
  //     success: function(res) {
  //       console.log(res);
  //     }
  //   });
  //   wx.showToast({
  //     title: "登录成功",
  //     icon: "success",
  //     duration: 3000
  //   });
  //   // wx.navigateTo({
  //   //   url: "../homepage/homepage?openid" + this.data.openid
  //   // });
  //   this.onLoad();
  // },

  // open_confirm: function() {
  //   if (!this.data.getName || !this.data.getNum) {
  //     var cont = "";
  //     if (this.data.getName) {
  //       cont = "请输入学号";
  //     } else if (this.data.getNum) {
  //       cont = "请输入姓名";
  //     } else {
  //       cont = "请输入姓名和学号";
  //     }
  //     wx.showModal({
  //       title: "提示",
  //       content: cont,
  //       //confirmText: "主操作",
  //       //cancelText: "辅助操作",
  //       showCancel: false,
  //       success: function(res) {
  //         console.log(res);
  //         if (res.confirm) {
  //           console.log("用户点击主操作");
  //         } else {
  //           console.log("用户点击辅助操作");
  //         }
  //       }
  //     });
  //   }
  //   this.onLoad();
  // },

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
    var that = this;
    this.setData({
      home: false
    });
    wx.getLocation({
      success: res => {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: () => {
        wx.showModal({
          title: "警告",
          content:
            "您禁用了位置信息，是否打开？（禁用位置权限将会影响小程序的使用）",
          success: function(res) {
            if (res.confirm) {
              wx.openSetting({
                success: res => {
                  var status = res.authSetting;
                  status["scope.userLocation"] = true;
                  wx.showToast({
                    title: "授权成功",
                    icon: "success"
                  });
                  console.log(status["scope.userLocation"]);
                  wx.getLocation({
                    success: res => {
                      that.setData({
                        latitude: res.latitude,
                        longitude: res.longitude
                      });
                      console.log(this.latitude, this.longtitude);
                    },
                    fail: () => {
                      console.log("failed to get location");
                    }
                  });
                }
              });
            } else if (res.cancel) {
              wx.showToast({
                title: "授权失败，您将不能获得相关服务",
                icon: "none"
              });
            }
          }
        });
      }
    });
  },

  map2home: function() {
    this.setData({
      home: true
    });
  },

  back_self: function() {
    var that=this;
    console.log("get location");
    wx.getLocation({
      success: res => {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: () => {
        wx.showModal({
          title: "警告",
          content:
            "您禁用了位置信息，是否打开？（禁用位置权限将会影响小程序的使用）",
          success: function(res) {
            if(res.confirm){
              wx.openSetting({
              success: res => {
                var status = res.authSetting;
                status["scope.userLocation"] = true;
                wx.showToast({
                  title: "授权成功",
                  icon: "success"
                });
                console.log(status["scope.userLocation"]);
                wx.getLocation({
                  success: res => {
                    that.setData({
                      latitude: res.latitude,
                      longitude: res.longitude
                    });
                    console.log(this.latitude, this.longtitude)
                  },
                  fail: () => {
                    console.log('failed to get location')
                  }
                });
              }
            });
            }
            else if (res.cancel) {
              wx.showToast({
                title: '授权失败，您将不能获得相关服务',
                icon:'none'
              })
            }
          }
          
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
    console.log(e.detail.value);
    that.setData({
      inputVal: e.detail.value
    });
    console.log(that.inputVal);
    qqmapsdk.search({
      keyword: e.detail.value,
      success: function(res) {
        console.log(res);
        if (res && res.data) {
          that.setData({
            tips: res.data
          });
        }
      },
      fail: function(res) {
        console.log(res);
      },
      complete: function(res) {
        console.log(res);
      }
    });
    // myAmapFun.getInputtips({
    //   keywords: keywords,
    //   location: "",
    //   success: function(data) {
    //     if (data && data.tips) {
    //       that.setData({
    //         tips: data.tips
    //       });
    //       console.log(data.tips);
    //     }
    //   }
    // });
  },

  bindSearch: function(e) {
    var keywords = e.currentTarget.dataset.keywords;
    console.log(e);
    var that = this;
    var search_marker = {
      id: 3,
      latitude: 0,
      longitude: 0,
      title: "",
      iconPath: "../images/markers2.png",
      width: 50,
      height: 50,
      callout: {
        content: "",
        color: "#E59866",
        bgColor: "#FEF5E7",
        fontSize: "16",
        borderRadius: "5",
        padding: "6",
        textAlign: "center"
      }
    };

    search_marker.latitude = keywords.location.lat;
    search_marker.longitude = keywords.location.lng;
    search_marker.title = keywords.title;
    search_marker.callout.content =
      keywords.category + "\n" + keywords.address + "\n" + keywords.title;
    var markers = that.data.markers;
    markers.push(search_marker);
    that.setData({
      inputShowed: false,
      latitude: search_marker.latitude,
      longitude: search_marker.longitude,
      markers: markers,
      scale: 18
    });
    // wx.redirectTo({
    //   url: url
    // })
    that.onLoad();
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

  scan: function() {
    wx.scanCode({
      success: function(res) {
        console.log(res);
      }
    });
  }
});
