import Ember from 'ember';

export default Ember.Controller.extend({
  http: Ember.inject.service(),
  cacheFactory: Ember.inject.service(),
  avatarUrl: Ember.computed('userInfoData.PhotoUrl', function () {
    return `${this.get('http').get('host')}/UserAvatar?pid=${this.get('userInfoData.ID')}&${this.get('userInfoData.PhotoUrl')}`;
  }),
  leftWordsCount: Ember.computed('userInfoData.Sign', function () {
    if (this.get('userInfoData.Sign')) {
      return 50 - this.get('userInfoData.Sign').length;
    }
    return 50;
  }),
  actions: {
    submit(){
      let data = this.get('userInfoData'), that = this;
      if (this.get('submiting')) {
        return;
      }
      this.set('submiting', true);
      this.get('http').request({
          type: 'post',
          url: '/UserInfo',
          data: data
        })
        .then(function (res) {
          that.get('messager').alert('修改成功');
          that.get('cacheFactory').addOrUpdate('userInfo', Ember.$.extend({}, data));
        })
        .catch((err)=>that.get('messager').alert(err.msg))
        .finally(()=>that.set('submiting', false));
    },
    upload(file){
      let that = this;
      if (!file || !file.files || file.files.length === 0)return;
      this.get('http').uploadFormData({files: file.files}, '/UserAvatar')
        .done(function (res) {
          that.set('uploadPercent', 0);
          that.set('showUploadDialog', false);
          that.set('userInfoData.PhotoUrl', res.Data);
          that.set('cacheFactory._store.userInfo.PhotoUrl', res.Data);
        })
        .fail(function (err) {
          that.set('uploadPercent', 0);
          that.get('messager').alert(err.msg);
        })
        .progress(function (percent) {
          that.set('uploadPercent', percent);
        })
    },
    toggleUploadDialog(val){
      this.set('showUploadDialog', val);
    }
  }
});
