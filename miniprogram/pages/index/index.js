//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: "./user-unlogin.png",
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: "",
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    getNum: false,
    getName: false,
    loading: false
  },

  onLoad: function() {
    // if (!wx.cloud) {
    //   wx.redirectTo({
    //     url: "../chooseLib/chooseLib"
    //   });
    //   return;
    // }

    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting["scope.userInfo"]) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           this.setData({
    //             avatarUrl: res.userInfo.avatarUrl,
    //             userInfo: res.userInfo
    //           });
    //         }
    //       });
    //     }
    //   }
    // });
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      };
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
    }
  },

  // onGetUserInfo: function(e) {
  //   if (!this.data.logged && e.detail.userInfo) {
  //     this.setData({
  //       logged: true,
  //       avatarUrl: e.detail.userInfo.avatarUrl,
  //       userInfo: e.detail.userInfo
  //     });
  //   }
  // },
//函数得到用户信息
  getUserInfo: function(e) {
    console.log(e);
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
  },

  inputName: function(name) {
    this.setData({
      personName: name.detail.value
    });
    if (this.data.personName) {
      this.setData({ getName: true });
    } else {
      this.setData({ getName: false });
    }
    this.onLoad();
  },

  inputNum: function(num) {
    this.setData({
      personNum: num.detail.value
    });
    if (this.data.personNum) {
      this.setData({ getNum: true });
    } else {
      this.setData({ getNum: false });
    }
    this.onLoad();
  },

  next: function() {
    this.setData({ loading: true });
    wx.navigateTo({
      url:
        "../homepage/homepage" 
        // ?name=+
        // this.data.personName +
        // "&num=" +
        // this.data.personNum
    });
    this.onLoad();
  },
  
  openConfirm: function() {
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
        title: "弹窗标题",
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
