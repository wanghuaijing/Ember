import Ember from 'ember';
import config from '../config/environment';

let ERROR_CODE = {
  'login': {
    '-4': '用户名或者密码错误',
    '-3': '没有找到此用户',
    '-5': '请输入合法的用户名或者密码'
  },
  'setNewPassword': {
    '-4': '您输入的旧密码不正确',
    '-5': '请输入合法的密码'
  },
  'addThread': {
    '-20': '你的账号在黑名单内,无法发帖'
  },
  'default': {
    '-5': '参数不正确',
    '-7': '你没有执行此操作的权限',
    '-14': '服务器返回了一个IO错误',
    '401': '你没有执行此操作的权限,请确定你是否是管理员,或者重新登录试试',
    '500': '服务器返回了一个错误',
    '-255': '服务器返回了一个错误',
    '-15': '你的账号已经在别处登录,请重新登录',
    '0': '请求失败,请检查网络'
  }
};

Ember.$.support.cors = true;

export default Ember.Service.extend({
  cacheFactory: Ember.inject.service(),
  host: config.APP.APIHOST,
  headers: Ember.computed('cacheFactory._store.tokens', {
    get() {
      let headers = {};
      const authToken = this.get('cacheFactory._store.tokens');
      if (authToken) {
        headers['Authorization'] = 'CAuth ' + authToken.Token;
      }
      return headers;
    }
  }),
  getErrorMsg(code, type){
    code = code.toString();
    if (!type || !ERROR_CODE[type]) {
      return ERROR_CODE['default'][code] || `未知错误:${code}`;
    }
    if (ERROR_CODE[type][code]) {
      return ERROR_CODE[type][code];
    }
    else {
      return ERROR_CODE['default'][code] || `未知错误:${code}`;
    }
  },
  request(url, config, type){
    let that = this;
    type = type || 'default';
    if (typeof url === 'string') {
      if (typeof config === 'string') {
        type = config;
        config = {
          url: url
        };
      }
      else if (typeof config === 'object') {
        config.url = url;
      }
      else {
        config = {
          url: url
        };
      }
    }
    else {
      type = config;
      config = url;
    }
    config.headers = Ember.$.extend(config.headers || {}, this.get('headers'));
    config.url = this.get('host') + config.url;
    config.timeout = 30000;
    var deferred = new Ember.RSVP.defer();

    deferred.promise.request = Ember.$.ajax(config)
      .done(function (res) {
        if (res.State >= 0) {
          deferred.resolve(res);
        }
        else {
          deferred.reject({
            code: res.State,
            msg: that.get('getErrorMsg')(res.State, type)
          });
        }
      })
      .fail(function (error) {
        console.log(error);
        if (error.statusText === 'abort') {
          deferred.reject({
            code: error.status,
            abort: true
          });
        }
        else {
          deferred.reject({
            code: error.status,
            msg: that.get('getErrorMsg')(error.status, type)
          });
        }
      });

    return deferred.promise;
  },

  //upload file
  uploadFormData(data, url, type){
    var deferred = Ember.$.Deferred(), that = this;
    type = type || 'file';
    let form = new FormData();
    if (data.files) {
      for (let i = 0, l = data.files.length; i < l; i++) {
        form.append(`file[${i}]`, data.files[i]);
      }
    }
    if (data.form) {
      for (let key in data.form) {
        form.append(key, data.form[key]);
      }
    }
    let xhr = new XMLHttpRequest();
    let headers = this.get('headers');
    xhr.open('post', this.get('host') + (url || '/File'));
    for (let key in headers) {
      xhr.setRequestHeader(key, headers[key]);
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let res = JSON.parse(xhr.responseText);
          if (res.State >= 0) {
            deferred.resolve(res);
          }
          else {
            deferred.reject({
              code: res.State,
              msg: that.get('getErrorMsg')(res.State, type)
            })
          }
        }
        else {
          deferred.reject({
            code: xhr.status,
            msg: that.get('getErrorMsg')(xhr.status, type)
          })
        }
      }
    };
    xhr.upload.onprogress = function (e) {
      if (e.loaded && e.total) {
        deferred.notify(((e.loaded / e.total) * 100).toFixed(1) + '%');
      }
    };
    xhr.send(form);
    return deferred.promise();
  }
});
