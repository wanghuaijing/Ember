import Ember from 'ember';

export default Ember.Controller.extend({
  http: Ember.inject.service(),
  cacheFactory: Ember.inject.service(),
  pwdData: {
    OPassword: '',
    RepeatPassword: '',
    NPassword: ''
  },
  errMsg: '请输入旧密码',
  resetController(){
    if (this.get('submiting'))return;
    this.set('pwdData', {
      OPassword: '',
      RepeatPassword: '',
      NPassword: ''
    });
    this.set('errMsg', '请输入旧密码');
  },
  checkPassWord: Ember.observer('pwdData.OPassword', 'pwdData.NPassword', 'pwdData.RepeatPassword', function () {
    if (this.get('pwdData.NPassword').length < 6) {
      this.set('errMsg', '密码长度不能小于6位');
    }
    else if (this.get('pwdData.RepeatPassword') != this.get('pwdData.NPassword')) {
      this.set('errMsg', '两次密码输入不一致');
    }
    else {
      this.set('errMsg', null);
    }
  }),
  actions: {
    submit(){
      let that = this;
      if (this.get('errMsg')) {
        return that.get('messager').alert('请确认无误后再提交');
      }
      if (this.get('submiting')) {
        return;
      }
      this.set('submiting', true);
      this.get('http').request({
          type: 'post',
          url: '/SetNewPassword',
          data: that.get('pwdData')
        }, 'setNewPassword')
        .then(function () {
          that.get('messager').alert('修改密码成功,请重新登录!');
          that.get('cacheFactory').removeAll();
          that.transitionToRoute('login');
        })
        .catch((err)=>that.get('messager').alert(err.msg))
        .finally(()=>that.set('submiting', false));
    }
  }
});
