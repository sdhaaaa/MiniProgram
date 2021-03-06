import {
  Base
} from '../../utils/base.js';
import {
  Config
} from '../../utils/config.js';

class Device extends Base {
  constructor() {
    super();
  }
  getDeviceInfo(id, callback) {
    var param = {
      url: `deviceaccess/device/${id}`,
      sCallback: function(data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }

  //获取所有子设备
  getAllSonDevices(parentdeviceId, callback) {
    var param = {
      url: `deviceaccess/parentdevices/${parentdeviceId}?limit=1000`,
      sCallback: function(data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }

  saveDevice(param, callback) {
    var params = {
      url: 'deviceaccess/device',
      method: 'POST',
      data: param,
      sCallback: function(data) {
        callback && callback(data);
      }
    };
    this.request(params);
  }

  //获取设备最新数据
  getlatestData(deviceId, callback) {
    var param = {
      url: `deviceaccess/data/alllatestdata/${deviceId}`,
      sCallback: function(data) {
        callback && callback(data);
      }
    };
    this.request(param)
  }

  //封装规则json体
  addRule(data, sCallback, fCallback) {
    var that = this;
    var transforms = [];
    if (data.transforms != undefined) {
      transforms.push(data.transforms)
    }
    console.log(data);
    var transform = {};
    var deviceArr = data.deviceArr;
    console.log(deviceArr);
    delete data['deviceArr'];
    delete data['transforms'];
    deviceArr.forEach(function (element, index) {
      var _data = {};
      var serviceName = '';
      if (element.deviceType === "curtain") {
        serviceName = "control curtain";
      } else if (element.deviceType === "dimmableLight") {
        serviceName = "control dimmableLight";
      } else if (element.deviceType === "switch" || element.deviceType === "outlet") {
        serviceName = "control switch";
      } else if (element.deviceType === "SoundLightAlarm") {
        serviceName = "control SoundLightAlarm";
      };
      that.getDeviceAttr(element.id)
        //获取设备属性
        .then(function (res) {
          if (res) {
            _data.attr = res;
            var triad = {
              manufacture: element.manufacture,
              model: element.model,
              deviceType: element.deviceType,
            };
            return that.getService(triad);
          } else {
            wx.showToast({
              title: '添加失败',
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
              if (_serviceName === serviceName) {
                abilityDes = _abilityDes;
                break;
              }
            }
            _data.service = abilityDes;
            var serviceBody = abilityDes.serviceBody;
            var params = serviceBody.params;
            //根据键值查设备属性值
            var getAttrVal = function (key, list) {
              for (let i = 0; i < list.length; i++) {
                if (list[i].key == key)
                  return list[i].value;
              }
              return undefined;
            }
            var body = {
              serviceName: abilityDes.serviceName,
              methodName: serviceBody.methodName
            };
            params.forEach(function (e) {
              body[e.key] = getAttrVal(e.key, _data.attr);
            });
            for (var p in body) {
              var status = '';
              if (body[p] === undefined) {
                if (element.deviceType === "curtain") {
                  if (element.status) {
                    status = 1;
                  } else {
                    status = 0;
                  }
                } else if (element.deviceType === "switch" || element.deviceType === "outlet") {
                  if (element.status) {
                    status = true;
                  } else {
                    status = false;
                  }
                } else if (element.deviceType === "dimmableLight") {
                    status = element.status;
                } else if (element.deviceType === "SoundLightAlarm") {
                  if (element.status) {
                    status = '01';
                  } else {
                    status = '00';
                  }
                };
                body[p] = status;
              }
            };
            var transform = {
              "name": "RestfulPlugin",
              "url": "http://restfulplugin:8600/api/v1/restfulplugin/sendRequest",
              "method": "POST",
              "requestBody": {
                "method": "POST",
                "url": `http://deviceaccess:8100/api/v1/deviceaccess/rpc/${element.id}/76`,
              }
            };
            transform.requestBody.body = body;
            console.log(transform);
            transforms.push(transform);
            if (index === deviceArr.length - 1) {
                data.transforms = transforms;
                return that.createRule(data);
            }else {
              return "gantch";
            }
          } else {
            wx.showToast({
              title: '添加失败',
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
          console.log(err);
          fCallback && fCallback(err);
        });
    })
  }


  newAddRule(res, k, data) {
    var that = this;
    var transform = {};
    var deviceArr = data.deviceArr;
    var element = deviceArr[k];

      var _data = {};
      var serviceName = '';
      if (element.deviceType === "curtain") {
        serviceName = "control curtain";
      } else if (element.deviceType === "dimmableLight") {
        serviceName = "control switch";
      } else if (element.deviceType === "switch" || element.deviceType === "outlet") {
        serviceName = "control switch";
      } else if (element.deviceType === "SoundLightAlarm") {
        serviceName = "control SoundLightAlarm";
      };
      that.getDeviceAttr(element.id)
        //获取设备属性
        .then(function (res) {
          if (res) {
            _data.attr = res;
            var triad = {
              manufacture: element.manufacture,
              model: element.model,
              deviceType: element.deviceType,
            };
            return that.getService(triad);
          } else {
            return;
          }
        })
        //获取设备服务
        .then(function (res) {
          if (res) {
            var abilityDes = null;
            for (let i = 0; i < res.length; i++) {
              let _abilityDes = JSON.parse(res[i].abilityDes);
              let _serviceName = _abilityDes.serviceName;
              if (_serviceName === serviceName) {
                abilityDes = _abilityDes;
                break;
              }
            }
            _data.service = abilityDes;
            var serviceBody = abilityDes.serviceBody;
            var params = serviceBody.params;
            //根据键值查设备属性值
            var getAttrVal = function (key, list) {
              for (let i = 0; i < list.length; i++) {
                if (list[i].key == key)
                  return list[i].value;
              }
              return undefined;
            }
            var body = {
              serviceName: abilityDes.serviceName,
              methodName: serviceBody.methodName
            };
            params.forEach(function (e) {
              body[e.key] = getAttrVal(e.key, _data.attr);
            });
            for (var p in body) {
              var status = '';
              if (body[p] === undefined) {
                if (element.deviceType === "curtain") {
                  if (element.status) {
                    status = 1;
                  } else {
                    status = 0;
                  }
                } else if (element.deviceType === "switch" || element.deviceType === "outlet") {
                  if (element.status) {
                    status = true;
                  } else {
                    status = false;
                  }
                } else if (element.deviceType === "dimmableLight") {
                  if (element.status === true) {
                    status = true;
                  } else {
                    status = false;
                  }
                } else if (element.deviceType === "SoundLightAlarm") {
                  if (element.status) {
                    status = '01';
                  } else {
                    status = '00';
                  }
                };
                body[p] = status;
              }
            };
            var transform = {
              "name": "RestfulPlugin",
              "url": "http://restfulplugin:8600/api/v1/restfulplugin/sendRequest",
              "method": "POST",
              "requestBody": {
                "method": "POST",
                "url": `http://deviceaccess:8100/api/v1/deviceaccess/rpc/${element.id}/76`,
              }
            };
            transform.requestBody.body = body;
            res.push(transform);
            if (++k < deviceArr.length) {
              
             that.newAddRule(res,k,data);
            } else {
              console.log(res);
              return res;
            }
          } else {
           return;
          }
        })
  }


  //创建规则接口
  createRule(param, callback) {
    console.log(param);
    var that = this;
    var p = new Promise(function(resolve, reject) {
      var params = {
        url: `smartruler/add`,
        data: param,
        method: 'POST',
        sCallback: function(res) {
          resolve && resolve(res);
        },
        fCallback: function(err) {
          reject && reject(err);
        }
      }
      that.request(params);
    })
    return p;
  }

  //创建规则接口
  createRule1(param, callback) {
    console.log(param);
    var params = {
      url: `smartruler/add`,
      data: param,
      method: 'POST',
      sCallback: function(data) {
        callback && callback(data);
      }
    }
    this.request(params);
  }

  //通过网关ID获得规则接口
  getRulesByGatewayId(gatewayId, callback) {
    var param = {
      url: `smartruler/ruleByGateway/${gatewayId}`,
      sCallback: function(data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }

  //判断网关下的报警规则是否处于布防状态
  getAlarmActiveRule(gatewayId, callback) {
    var param = {
      url: `smartruler/alarmActiveRule/${gatewayId}`,
      sCallback: function(data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }

  //布防
  activateAlarmRule(gatewayId, callback) {
    var param = {
      url: `smartruler/alarmRule/activate/${gatewayId}`,
      sCallback: function(data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }

  //撤防
  suspendAlarmRule(gatewayId, callback) {
    var param = {
      url: `smartruler/alarmRule/suspend/${gatewayId}`,
      sCallback: function(data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }

  //判断是否关注公众号
  judgeFollow(param, callback) {
    var params = {
      url: `wechatPost/follow`,
      data: param,
      method: 'POST',
      sCallback: function(data) {
        callback && callback(data);
      }
    };
    this.request(params);
  }

//获取设备信息
  get_Device_Info(deviceId) {
    var that = this;
    var p = new Promise(function (resolve, reject) {
      var param = {
        url: `deviceaccess/device/${deviceId}`,
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

  /**==================控制设备============= */
  /**
   * 获取设备（开关）服务--获取控制面板
   */

  getService(triad) {
    var that = this;
    var p = new Promise(function(resolve, reject) {
      var manufacture = triad.manufacture;
      var deviceType = triad.deviceType;
      var model = triad.model;
      var param = {
        url: `servicemanagement/ability/${manufacture}/${deviceType}/${model}`,
        sCallback: function(res) {
          resolve && resolve(res);
        },
        fCallback: function(err) {
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
    var p = new Promise(function(resolve, reject) {
      var param = {
        url: `deviceaccess/allattributes/${deviceId}`,
        sCallback: function(res) {
          resolve && resolve(res);
        },
        fCallback: function(err) {
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
    //body可以是对象
    var that = this;
    var p = new Promise(function(resolve, reject) {
      var param = {
        url: 'deviceaccess/rpc/' + deviceId + '/' + requestId,
        method: 'POST',
        data: body,
        sCallback: function(res) {
          resolve && resolve(res);
        },
        fCallback: function(err) {
          reject && reject(err);
        }
      };

      that.request(param);
    })

    return p;
  }

  // /**对外只暴露这一个控制方法，在内部链式调用其他需要的方法 */
  applyControl(data, sCallback, fCallback) {
    var that = this;
    var _data = {};
    var serviceName = data.serviceName;
    this.getDeviceAttr(data.deviceId)
      //获取设备属性
      .then(function(res) {
        console.log(res);
        if (res) {
          _data.attr = res;
          return that.getService(data.triad);
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
      .then(function(res) {
        console.log(res);
        if (res) {
          var abilityDes = null;
          for (let i = 0; i < res.length; i++) {
            let _abilityDes = JSON.parse(res[i].abilityDes);
            let _serviceName = _abilityDes.serviceName;
            if (_serviceName === serviceName) {
              abilityDes = _abilityDes;
              break;
            }

          }
          _data.service = abilityDes;
          var serviceBody = abilityDes.serviceBody;
          var params = serviceBody.params;

          //根据键值查设备属性值
          var getAttrVal = function(key, list) {
            for (let i = 0; i < list.length; i++) {
              if (list[i].key == key)
                return list[i].value;
            }
            return undefined;
          }
          var body = {
            serviceName: abilityDes.serviceName,
            methodName: serviceBody.methodName
          }
          params.forEach(function(e) {
            body[e.key] = getAttrVal(e.key, _data.attr);
          });
          for (let key in body) {
            if (data.npassword != undefined) {
              if (key === 'status') {
                body[key] = data.value;
              }
              if (key === 'password') {
                body[key] = data.npassword;
              }
            } else if (body[key] === undefined) {
              body[key] = data.value;
              break;
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

  // /**=================END======================= */

  /**对外只暴露这一个控制方法，在内部链式调用其他需要的方法 */
  applyControler(data, sCallback, fCallback) {
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
        console.log(res);
        if (res) {
          _data.attr = res;
          return that.getService(data.triad); //获取设备（开关）服务
        } else {
          // wx.showToast({
          //   title: '应用失败',
          //   image: '../../imgs/icon/pay@error.png',
          //   duration: 1000,
          //   // mask: true
          // });
        }
      })
      //获取设备服务
      .then(function (res) {
        console.log(res);
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
              console.log(data.value[key]);
            }
          }
          console.log(body);
          return that.sendControl(data.deviceId, data.requestId, body);
        } else {
          // wx.showToast({
          //   title: '应用失败',
          //   image: '../../imgs/icon/pay@error.png',
          //   duration: 1000,
          //   // mask: true
          // });
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


//=======创建新的学习面板===========
  
  createNewLearn(param, callback) {
    var params = {
      url: `deviceaccess/device/${id}`,
      method: 'POST',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      }
    };
    this.request(params);
  }

  //========根据红外包id获取创建的自定义学习=====

//获取所有学习面板
  getAllLearn(id, callback) {
    var params = {
      url: `infrared/panels/get/${id}`,
      sCallback: function (data) {
        callback && callback(data);
      }
    };
    this.request(params);
  }

//新建面板
  addNewLearn(id,param, callback) {
    var params = {
      url: `infrared/panel/add/${id}`,
      method:"POST",
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      }
    };
    this.request(params);
  }

  //删除面板
  deletePanel(deviceId, panelId,callback) {
    var params = {
      url: `infrared/panel/del/${deviceId}/${panelId}`,
      method:"DELETE",
      sCallback: function (data) {
        callback && callback(data);
      }
    };
    this.request(params);
  }

};

export {
  Device
};