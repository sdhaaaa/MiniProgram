// pages/loading/loading.js
import {
  Config
} from '../../utils/config.js';
import {
  Loading
} from 'loading_model.js';
var loading = new Loading();
var chinese = require("../../utils/Chinese.js")
var english = require("../../utils/English.js")
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    imgUrls: [
      '/imgs/swiper/swiper-01.jpg',
      '/imgs/swiper/swiper-02.jpg',
      // '/imgs/swiper/swiper-03.jpg'
    ],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      netStatus: app.globalData.netStatus,
      content: app.getLanuage(app.globalData.language),
    })
    // 在没有 open-type=getUserInfo 版本的兼容处理
    if (!this.data.canIUse) {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
        }
      })
    }
  },


  onShareAppMessage: function(res) {
    return {
      title: '天慧云谷',
      path: '/pages/loading/loading',
      success: function() {},
      fail: function() {}
    }
  },

  onShow: function() {
    this.setData({
      content: app.getLanuage(app.globalData.language),
      netStatus: app.globalData.netStatus
    })
  },

  goToIndex: function() {
    wx.login({
      success: function (res) {
          //发送请求获取openid
          wx.request({
            url: 'https://smart.gantch.cn/api/v1/wechatPost/getOpenId',
            data: {
              JSCODE: res.code,
            },
            method: 'POST',
            header: {
              'content-type': 'application/json' //默认值
            },
            success: function (res) {
              console.log("res:" + JSON.stringify(res))
              wx.hideLoading();
              var answer = res.data;
              if (answer == undefined || answer == "" || answer == null) {
                wx.showToast({
                  title: '请求错误',
                  icon: 'none',
                  duration: 2000,
                })
              } else {
                app.globalData.openid = answer.openid,
                  app.globalData.unionid = answer.unionid,
                  loading.findOpenid(answer.openid, (res) => {
                    console.log(res);
                    if (res.status === "success") {
                      app.globalData.customerId = res.data.id;
                      app.globalData.phoneNumber = res.data.phone;
                      wx.reLaunch({
                        url: '../index/index',
                      })
                    } else {
                      wx.reLaunch({
                        url: '../index/index',
                      })
                    }
                  })
              }
            },
            fail: function (err) {
              wx.hideLoading();
              wx.showToast({
                title: '请求错误',
                icon: 'none',
                duration: 2000,
              })
            }
          })
      }
    })
  },



  changeLanuage: function() {
    var version = app.globalData.language;
    if (version == "中文") {
      app.globalData.language = "English"
    } else {
      app.globalData.language = "中文"
    }
    this.setData({
      content: app.getLanuage(app.globalData.language)
    })
  },
})