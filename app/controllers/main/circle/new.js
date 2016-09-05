import Ember from 'ember';

export default Ember.Controller.extend({
  http: Ember.inject.service(),
  listController: Ember.inject.controller('main.circle.list'),
  showUploadDialog: false,
  isSubmitting: false,
  files: [],
  formData: {
    Title: '',
    CID: '',
    Content: '',
    IsAnonymous: false,
    EmojiContent: ''
  },
  reset(){
    let that = this;
    this.set('formData', {
      Title: '',
      CID: that.get('model').Data[0].ID,
      Content: '',
      EmojiContent: '',
      IsAnonymous: false
    });
    this.set('files', []);
    this.get('emojiText') && this.get('emojiText').clear();
  },
  actions: {
    categoryChange(cid){
      this.set('formData.CID', cid * 1);
    },
    isAnonymousChange(isAnonymous){
      this.set('formData.IsAnonymous', isAnonymous);
    },
    toggleUploadDialog(){
      this.set('showUploadDialog', true);
    },
    fileChoose(file){
      let that = this, max = 4;
      this.set('showUploadDialog', false);
      if (file.files.length + this.get('files').length > 4) {
        return that.get('messager').alert('图片总数超出了限制:4张');
      }
      for (let i = 0, l = file.files.length; i < l; i++) {
        //that.get('files').pushObject(file.files[i]);
        let reader = new FileReader();
        that.get('files').pushObject({
          file: file.files[i]
        });
        reader.onload = function (e) {
          that.get('files').some(function (item, index) {
            if (item.file === file.files[i]) {
              that.set(`files.${index}.src`, e.target.result);
              that.set(`files.${index}.style`, new Ember.Handlebars.SafeString(`background-image:url(${e.target.result})`));
              return true;
            }
          });
        };
        reader.readAsDataURL(file.files[i]);
      }
    },
    deleteFile(file){
      this.get('files').removeObject(file);
    },
    emojiTextCreate(o){
      this.set('emojiText', o);
    },
    emojiTextChange(val){
      this.set('formData.EmojiContent', val);
    },
    submit(){
      if (this.get('isSubmitting')) {
        return;
      }
      if (!this.get('formData.Title').trim() && !this.get('formData.EmojiContent').trim()) {
        return this.get('messager').alert('标题和内容不能全为空');
      }
      this.set('isSubmitting', true);
      let http = this.get('http'), that = this;
      let data = $.extend({}, this.get('formData'));
      data.Content = data.EmojiContent.replace(/\n/gi, '\r\n');
      delete data.EmojiContent;
      http.uploadFormData({
          files: that.get('files').map((one)=>one.file),
          form: {
            Data: JSON.stringify(data)
          }
        }, '/Thread', 'addThread')
        .done(function () {
          that.get('messager').alert('发帖成功');
          that.get('listController').set('hasPostNew', true);
          that.reset();
        })
        .fail(function (err) {
          that.get('messager').alert(err.msg);
        })
        .always(()=>that.set('isSubmitting', false));
    },
    resetForm(){
      this.reset();
    }
  }
});
