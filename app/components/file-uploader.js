import Ember from 'ember';

export default Ember.Component.extend({
  http: Ember.inject.service(),
  messager: Ember.inject.service(),
  actions: {
    upload(file){
      var that = this;
      if (!file.files || !file.files.length)return;
      if (that.get('beforeUpload') && that.get('beforeUpload')(file.files) === false) {
        return;
      }
      this.get('http').uploadFormData({files: file.files})
        .done(function (res) {
          that.get('onUploaded') && that.get('onUploaded')(res.Data);
          that.set('uploadPercent', 0);
          that.set('show', false);
        })
        .fail(function (err) {
          that.set('uploadPercent', 0);
          that.get('messager').alert(err.msg);
        })
        .progress(function (percent) {
          that.set('uploadPercent', percent);
        })
    }
  }
});
