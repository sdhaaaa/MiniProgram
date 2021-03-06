import {
  Base
} from '../../utils/base.js';
import {
  Config
} from '../../utils/config.js';

class Infrared extends Base {
  constructor() {
    super();
  }

  //获取设备最新数据
  getlatestData(deviceId, callback) {
    var param = {
      url: `deviceaccess/data/alllatestdata/${deviceId}`,
      sCallback: function (data) {
        callback && callback(data);
      }
    };
    this.request(param)
  }


  /**==================控制设备============= */
  /**
   * 获取设备（开关）服务--获取控制面板
   */

  getService(triad) {
    var that = this;
    var p = new Promise(function (resolve, reject) {
      var manufacture = triad.manufacture;
      var deviceType = triad.deviceType;
      var model = triad.model;
      var param = {
        url: `servicemanagement/ability/${manufacture}/${deviceType}/${model}`,
        sCallback: function (res) {
          resolve && resolve(res);
        },
        fCallback: function (err) {
          reject && reject(err);
        }
      }

      that.request(param);
    })

    return p;

  }

  /**
   * 获取设备属性，得到endpoint和shortaddress
   */
  getDeviceAttr(deviceId) {
    var that = this;
    var p = new Promise(function (resolve, reject) {
      var param = {
        url: `deviceaccess/allattributes/${deviceId}`,
        sCallback: function (res) {
          resolve && resolve(res);
        },
        fCallback: function (err) {
          reject && reject(err);
        }
      }
      that.request(param);
    })

    return p;
  }

  /**
   * 调用控制接口，控制开关
   * sendControl
   */
  sendControl(deviceId, requestId, body) {
    console.log(body);
    //body可以是对象
    var that = this;
    var p = new Promise(function (resolve, reject) {
      var param = {
        url: 'deviceaccess/rpc/' + deviceId + '/' + requestId,
        method: 'POST',
        data: body,
        sCallback: function (res) {
          resolve && resolve(res);
        },
        fCallback: function (err) {
          reject && reject(err);
        }
      };

      that.request(param);
    })

    return p;
  }

  /**对外只暴露这一个控制方法，在内部链式调用其他需要的方法 */
  applyControl(data, sCallback, fCallback) {
    //根据键值查设备属性值
    var getAttrVal = function (key, list) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].key == key)
          return list[i].value;
      }
      return undefined;
    }

    var that = this;
    var _data = {};
    var serviceName = data.serviceName;
    var methodName = data.methodName;
    this.getDeviceAttr(data.deviceId) //获取设备属性，得到endpoint和shortaddress
      //获取设备属性
      .then(function (res) {
        if (res) {
          _data.attr = res;
          return that.getService(data.triad); //获取设备（开关）服务
        } else {
          wx.showToast({
            title: '应用失败',
            image: '../../imgs/icon/pay@error.png',
            duration: 1000,
            // mask: true
          });
        }
      })
      //获取设备服务
      .then(function (res) {
        if (res) {
          var abilityDes = null;
          for (let i = 0; i < res.length; i++) {
            let _abilityDes = JSON.parse(res[i].abilityDes);
            let _serviceName = _abilityDes.serviceName;
            let _methodName = _abilityDes.serviceBody.methodName;
            if (_methodName === methodName) {
              abilityDes = _abilityDes;
              break;
            }
          }
          _data.service = abilityDes;
          var serviceBody = abilityDes.serviceBody;
          var params = serviceBody.params;

          var body = {
            serviceName: abilityDes.serviceName,
            methodName: serviceBody.methodName
          }
          params.forEach(function (e) {
            body[e.key] = getAttrVal(e.key, _data.attr);
          });
          for (let key in body) {
            if (body[key] === undefined) {
              body[key] = data.value[key];
            }
          }
          console.log(body);
          return that.sendControl(data.deviceId, data.requestId, body);
        } else {
          wx.showToast({
            title: '应用失败',
            image: '../../imgs/icon/pay@error.png',
            duration: 1000,
            // mask: true
          });
        }
      })
      .then((res) => {
        sCallback && sCallback(res);
      })
      .catch((err) => {
        fCallback && fCallback(err);
      });
  }

  /**=================END======================= */

  //获取面板详细信息
  getPanelInfo(id, callback) {
    var param = {
      url: `infrared/keys/get/${id}`,
      sCallback: function (data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }

  //获取面板详细信息
  getPanelName(deviceId, panelId, callback) {
    var param = {
      url: `infrared/panel/get/${deviceId}/${panelId}`,
      sCallback: function (data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }


  //获取面板详细信息
  deleteButton(panelId, keyId, callback) {
    var param = {
      url: `infrared/key/del/${panelId}/${keyId}`,
      method: "DELETE",
      sCallback: function (data) {
        callback && callback(data);
      }
    };
    console.log(param)
    this.request(param);
  }

  //获取空调按键key
  getKey(data, callback) {
    var param = {
      url: `infrared/key/get?mode=` + data.mode + '&power=' + data.power + '&windLevel=' + data.windLevel + '&windDirection=' + data.windDirection + '&tem=' + data.tem,
      method: "GET",
      sCallback: function (data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }




  /**=================END======================= */

};

export {
  Infrared
};