import Ember from 'ember';

export default Ember.Controller.extend({
  http: Ember.inject.service(),
  cacheFactory: Ember.inject.service(),
  formData: {
    Usr: '',
    Pwd: '',
    ClientID: 3,
    PwsMode: 0,
    Role: 128
  },
  isLoading: false,
  errorMsg: null,
  actions: {
    login(){
      let that = this;
      if (that.get('isLoading')) {
        return;
      }
      let formData = this.get('formData');
      that.set('loading', true);
      that.set('errorMsg', '');
      this.get('http').request({
          type: 'post',
          url: '/token?v=2&misc=UserInfo',
          data: formData
        }, 'login')
        .then(function (res) {
          that.get('cacheFactory').addOrUpdate('userInfo', res.Data.Extra.UserInfo);
          that.get('cacheFactory').addOrUpdate('tokens', {
            Token: res.Data.Token,
            FileToken: res.Data.FileToken
          });
          that.transitionToRoute('main');
        })
        .catch(function (err) {
          that.set('errorMsg', err.msg);
        })
        .finally(function () {
          that.set('loading', false);
        });
    }
  }
});
