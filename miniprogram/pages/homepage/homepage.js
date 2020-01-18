// miniprogram/pages/homepage/homepage.js

/*(1)markers属性 标记点用于在地图上显示标记的位置
  id  标记点id marker点击事件回调会返回此id。建议为每个marker设置上Number类型id，保证更新marker时有更好的性能。
  latitude  纬度  浮点数，范围 -90 ~ 90
  longitude   经度  浮点数，范围 -180 ~ 180
  title   标注点名 
  zIndex  显示层级 
  iconPath  显示的图标   项目目录下的图片路径，支持相对路径写法，以'/'开头则表示相对小程序根目录；也支持临时路径和网络图片（2.3.0）
  rotate  旋转角度    顺时针旋转的角度，范围 0 ~ 360，默认为 0
  alpha   标注的透明度  默认1，无透明，范围 0 ~ 1
  width   标注图标宽度    默认为图片实际宽度，单位px（2.4.0起支持rpx）
  height  标注图标高度    默认为图片实际高度，单位px（2.4.0起支持rpx）
  callout   自定义标记点上方的气泡窗口   支持的属性见下表，可识别换行符。 
  label   为标记点旁边增加标签  支持的属性见下表，可识别换行符。 
  anchor  经纬度在标注图标的锚点，默认底边中点  {x, y}，x表示横向(0-1)，y表示竖向(0-1)。{x: .5, y: 1} 表示底边中点   
  aria-label  无障碍访问，（属性）元素的额外描述
*/

/*(2)marker 上的气泡 callout
  content   文本  
  color   文本颜色  
  fontSize  文字大小  
  borderRadius  边框圆角  
  borderWidth   边框宽度 
  borderColor   边框颜色  
  bgColor   背景色    
  padding   文本边缘留白 
  display   'BYCLICK':点击显示; 'ALWAYS':常显    
  textAlign   文本对齐方式。有效值: left, right, center  
*/

Page({
  /**
   * 页面的初始数据
   */
  data: {
    home: true,
    latitude: "",
    longitude: "",
    scale: 16,
    location: "获取位置",
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
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(e) {
    this.mapCtx = wx.createMapContext("myMap");
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},

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
          latitude:res.latitude,
          longitude:res.longitude
        })
      }
    })
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
  scaleClick: function() {
    this.setData({
      scale: 10
    });
  },
  // 移动位置
  moveToLocation: function() {
    this.mapCtx.moveToLocation();
  },
  // 移动标注
  translateMarker: function() {
    this.mapCtx.translateMarker({
      markerId: 1,
      autoRotate: true,
      duration: 1000,
      destination: {
        latitude: 23.10229,
        longitude: 113.3345211
      },
      animationEnd() {
        console.log("动画结束");
      }
    });
  },
  //缩放视野展示所有经纬度
  includePoints: function() {
    this.mapCtx.includePoints({
      padding: [10],
      points: [
        {
          latitude: 23.10229,
          longitude: 113.3345211
        },
        {
          latitude: 23.00229,
          longitude: 113.3345211
        }
      ]
    });
  }
});
