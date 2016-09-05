import Ember from 'ember';

var controller = Ember.Controller.extend({
  http: Ember.inject.service(),
  cacheFactory: Ember.inject.service(),
  listController: Ember.inject.controller('main.recommend.list'),
  IMAGE_TYPE: {
    LIST_SHOW: 0,
    INSERT: 1
  },
  data: null,
  setCache(cache){
    if (!cache) {
      this.set('data', {CID: this.get('model').Data[0].ID});
      return;
    }
    this.set('data', {
      CID: cache.CID,
      ListShowPic: cache.ListShowPic,
      Title: cache.Title,
      _MediaContent: cache.MediaContent
    });
  },
  saveCache(){
    let editor = this.get('editor'), data = this.get('data');
    if (!editor)return;
    this.get('cacheFactory').addOrUpdate('newRecommendCache', {
      Title: data.Title,
      CID: data.CID,
      ListShowPic: data.ListShowPic,
      MediaContent: editor.html()
    });
    this.set('autoSavedInfoShow', true);
    Ember.run.later(()=>this.set('autoSavedInfoShow', false), 3000);
  },
  reset(){
    this.set('data', {CID: this.get('model').Data[0].ID});
    this.set('isFixedTime', false);
    this.get('editor') && this.get('editor').html('');
    this.set('listShowImgStyle', null);
  },
  actions: {
    categoryChange(val){
      this.set('data.CID', val * 1);
    },

    fixedTimeChange(value){
      this.set('isFixedTime', !!(value * 1));
    },

    editorLoaded(editor){
      this.set('editor', editor);
    },
    resetForm(){
      this.reset();
      this.saveCache();
    },
    //submit to backend
    submit(){
      var editor = this.get('editor');

      let contentImgHref = editor.text().match(new RegExp('' + this.get('http').get('host') + '\\/file\\?pid=\\d+' + '', 'gi'));
      let pics = [];

      let that = this;
      contentImgHref && (contentImgHref.map(function (o) {
        pics.push(o.replace(that.get('http').get('host') + '/file?pid=', ''));
      }));

      let data = this.get('data');

      if (!pics.length && !data.ListShowPic) {
        return that.get('messager').alert('封面图片和内容至少存在一张上传的图片');
      }

      let baseData = {
        Title: data.Title,
        CID: data.CID,
        ListShowPic: data.ListShowPic,
        MediaContent: editor.html(),
        Content: editor.text().replace(/<(img|embed)[^<]*\/>/g, '').trim().substr(0, 140),
        Pics: pics.join('|')
      }

      if (!baseData.Title
        || !baseData.Content
        || !baseData.CID) {
        return that.get('messager').alert('请填写合法的标题,正文,分类.');
      }
      this.set('uploading', true);

      if (this.get('isFixedTime')) {
        var url = '/recommend/FixedTime';
        baseData.Time = data.Time;
      }
      else {
        url = '/recommend';
      }
      this.get('http').request({
          type: 'post',
          url: url,
          data: baseData
        })
        .then(function (res) {
          that.get('messager').alert('发布成功');
          that.reset();
          that.saveCache();
          //tell list there has new one
          that.get('listController').set('hasPostNew', true);
        })
        .catch(err=>that.get('messager').alert(err.msg))
        .finally(()=>this.set('uploading', false))
    },

    //preview
    preview(){
      let editor = this.get('editor'), data = this.get('data');
      this.set('togglePreviewDialog', true);
      this.set('previewData', {
        MediaContent: editor.html(),
        Title: data.Title
      })
    }
  }
});

controller.reopen({
  imgSrc: Ember.computed('imgID', function () {
    if (!this.get('imgID'))return null;
    return this.get('http').get('host') + '/file?pid=' + this.get('imgID');
  }),
  actions: {
    addImage(){
      var imgType = this.get('IMAGE_TYPE');
      if (this.get('uploadImgType') == imgType.INSERT) {
        this.get('editor').insertHtml(`<img data-tag="img" src="${this.get('imgSrc')}" />`);
      }
      else {
        this.set('listShowImgStyle', new Ember.Handlebars.SafeString(`background-image:url('${this.get('imgSrc')}')`));
        this.set('data.ListShowPic', this.get('imgID'));
      }
    },
    clearListShowImg(){
      this.set('data.ListShowPic', null);
      this.set('listShowImgStyle', null);
    },
    toggleUploadDialog(state, type){
      this.set('toggleUploadDialog', state);
      this.set('uploadImgType', type);
    },
    upload(file){
      var that = this;
      if (!file.files || !file.files.length)return;
      that.set('imgID', '');
      this.get('http').uploadFormData({files: file.files})
        .done(function (res) {
          that.set('imgID', res.Data);
          that.set('uploadPercent', 0);
        })
        .fail(function (err) {
          that.set('uploadPercent', 0);
          that.get('messager').alert(err.msg);
        })
        .progress(function (percent) {
          that.set('uploadPercent', percent);
        })
    },
    deleteUploadedImage(){
      this.set('imgID', '');
    }
  }
});

export default controller;
