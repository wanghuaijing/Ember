import Ember from 'ember';

export default Ember.Controller.extend({
    serverBannerList: [],
    //for route setup
    initialServerBannerList(model){
      let that = this;
      model.Data.forEach(function (item) {
        let src = that.get('http').host + '/File?quality=4&pid=' + item.BannerPic;
        item.BannerImageStyle = new Ember.Handlebars.SafeString(`background-image:url(${src})`);
      });
      this.set('serverBannerList', model.Data);
    }
  })
  .reopen({
    http: Ember.inject.service(),
    //loading state
    isLoading: false,
    //current page
    currentPage: 1,
    //total page
    totalPage: null,
    //each page's count
    count: 10,
    //load data
    errorMsg: null,
    //data list
    dataList: [],
    isFixedTime: '0',
    url: Ember.computed('isFixedTime', function () {
      if (this.get('isFixedTime') * 1) {
        return {
          search: '/recommend/fixedTime',
          delete: '/recommend/fixedTime',
          detail: '/recommend/fixedTime/Detail'
        };
      }
      return {
        search: '/recommend/Category?cid=9',
        delete: '/recommend',
        detail: '/recommend'
      };
    }),
    load(){
      this.set('hasPostNew', false);
      if (this.get('pageRequest')) {
        this.get('pageRequest')[0].request.abort();
        this.get('pageRequest')[1].request.abort();
      }

      this.setProperties({
        errorMsg: null,
        dataList: []
      });

      let that = this;
      Ember.run.later(function () {
        that.set('isLoading', true);
        let url = that.get('url').search;
        let promises = [that.get('http')
          .request(url, {
            data: {
              skip: (that.get('currentPage') - 1) * that.get('count'),
              count: that.get('count')
            }
          }),
          that.get('http')
            .request(url, {
              data: {
                count: 0
              }
            })
        ];

        that.set('pageRequest', promises);
        let banners = that.get('serverBannerList');
        Ember.RSVP.all(promises)
          .then(function (values) {
            that.set('isLoading', false);
            values[0].Data && values[0].Data.forEach((item)=> {
              banners.find((b)=> {
                if (b.ID === item.ID) {
                  item.IsBanner = true;
                }
              })
            });
            that.setProperties({
              dataList: values[0].Data,
              totalPage: Math.ceil(values[1].Count / that.get('count'))
            });
          })
          .catch(function (error) {
            if (!error.abort) {
              that.get('messager').alert(error.msg);
            }
          })
          .finally(()=>that.set('isLoading', false));
      });
    },
    actions: {
      search(){
        this.setProperties({
          currentPage: 1,
          totalPage: null
        });
        this.load();
      },
      pageChange(page){
        this.set('currentPage', page);
        this.load();
      },
      typeChange(val){
        this.set('isFixedTime', val);
      }
    }
  })

  //add stickie thread
  .reopen({
    addMode: false,
    itemToAdd: null,
    //is requesting
    addStickieRequesting: false,
    replaceStickieRequesting: false,
    showListDialog: false,
    bannerImgID: null,
    replaceState: false,
    showReplaceButton: Ember.computed('replaceState', 'replaceStickieRequesting', function () {
      return this.get('replaceState') && this.get('replaceStickieRequesting');
    }),
    bannerImgStyle: Ember.computed('bannerImgID', function () {
      let src = this.get('http').host + '/File?quality=4&pid=' + this.get('bannerImgID');
      return new Ember.Handlebars.SafeString(`background-image:url(${src})`);
    }),
    resetAddContext(){
      this.setProperties({
        bannerImgID: null,
        itemToAdd: null
      });
    },
    resetReplaceContext(){
      this.setProperties({
        replaceState: false
      });
    },
    actions: {
      enterAddMode(){
        this.setProperties({
          addMode: true,
          editMode: false
        });
        this.clearEditState();
      },
      toggleListDialog(isShow){
        this.set('showListDialog', isShow);
        this.load();
      },
      exitAddMode(){
        if (this.get('addStickieRequesting') || this.get('replaceStickieRequesting')) {
          return this.get('messager').alert('请等待添加操作处理完成');
        }
        this.set('addMode', false);
        this.resetAddContext();
        this.resetReplaceContext();
      },
      addStickie(one){
        if (this.get('serverBannerList').find((item)=>one.ID === item.ID)) {
          return this.get('messager').alert('此推荐已经在banner中');
        }
        if (one.ListShowPic && this.get('itemToAdd') != one) {
          let src = this.get('http').host + '/File?quality=4&pid=' + one.ListShowPic;
          one.ThumbStyle = new Ember.Handlebars.SafeString(`background-image:url(${src})`);
        }
        this.set('showListDialog', false);
        this.set('itemToAdd', one);
      },
      beginReplaceState(){
        this.get('messager').alert('请点击一个banner进行替换');
        this.set('replaceState', true);
      },
      cancelReplaceState(){
        this.resetReplaceContext();
      },
      uploadBannerPic(file){
        var that = this;
        if (!file.files || !file.files.length)return;
        that.set('bannerImgID', '');
        this.get('http').uploadFormData({files: file.files})
          .done(function (res) {
            that.set('bannerImgID', res.Data);
            that.set('uploadPercent', 0);
            that.set('showBannerUploadDialog', false);
          })
          .fail(function (err) {
            that.set('uploadPercent', 0);
            that.get('messager').alert(err.msg);
          })
          .progress(function (percent) {
            that.set('uploadPercent', percent);
          })
      },
      toggleBannerUploadModal(isShow){
        this.set('showBannerUploadDialog', isShow);
      },
      submitReplaceRequest(old){
        if (this.get('replaceStickieRequesting'))return;
        this.set('replaceStickieRequesting', true);
        this.resetReplaceContext();
        let that = this;
        this.get('http').request({
            type: 'post',
            url: `/Recommend/Rank?id=${this.get('itemToAdd').ID}`,
            data: {
              pos: old.HotOrder,
              banner: this.get('bannerImgID')
            }
          })
          .then(function (res) {
            that.get('messager').alert('替换成功');
            that.setProperties({
              'addStickieRequesting': false,
              'itemToAdd.BannerPic': that.get('bannerImgID'),
              'itemToAdd.BannerImageStyle': that.get('bannerImgStyle')
            });
            let bannerList = that.get('serverBannerList');
            that.set('itemToAdd.HotOrder', old.HotOrder);
            bannerList.replace(bannerList.indexOf(old), 1, [that.get('itemToAdd')]);
            that.load();
            that.resetAddContext();
          })
          .catch(function (error) {
            that.get('messager').alert(error.msg);
          })
          .finally(()=>that.set('replaceStickieRequesting', false));
      },
      postAddStickieRequest(){
        if (this.get('addStickieRequesting'))return;
        this.set('addStickieRequesting', true);
        let that = this;
        let last = that.get('serverBannerList').get('lastObject');
        let order = last ? ++last.HotOrder : 1;
        this.get('http').request({
            type: 'post',
            url: `/Recommend/Rank?id=${this.get('itemToAdd').ID}`,
            data: {
              pos: order,
              banner: this.get('bannerImgID')
            }
          })
          .then(function (res) {
            that.get('messager').alert('添加成功');
            that.setProperties({
              'addStickieRequesting': false,
              'itemToAdd.BannerPic': that.get('bannerImgID'),
              'itemToAdd.BannerImageStyle': that.get('bannerImgStyle')
            });
            that.set('itemToAdd.HotOrder', order);
            that.get('serverBannerList').pushObject(that.get('itemToAdd'));
            that.load();
            that.resetAddContext();
          })
          .catch(function (error) {
            that.get('messager').alert(error.msg);
          })
          .finally(()=>that.set('addStickieRequesting', false));
      }
    }
  })

  //exchange position
  .reopen({
    editMode: false,
    exchangeItems: [],
    ableToExChange: Ember.computed('exchangeItems.[]', function () {
      return this.get('exchangeItems').get('length') === 2;
    }),
    showDeleteButton: Ember.computed('exchangeItems.[]', function () {
      return this.get('exchangeItems').get('length') === 1;
    }),
    clearEditState(){
      this.set('editMode', false);
      this.get('exchangeItems').setEach('Active', false);
      this.set('exchangeItems', []);
    },
    actions: {
      addExChangeItem(item){
        if (!item.Active && (this.get('exchangeItems').get('length') === 2)) {
          return this.get('messager').alert('只能同时选择2个进行替换');
        }
        if (this.get('editMode')) {
          if (item.Active) {
            this.get('exchangeItems').removeObject(item);
          }
          else {
            this.get('exchangeItems').pushObject(item);
          }
          Ember.set(item, 'Active', !item.Active);
        }
      },
      enterEditMode(){
        this.set('editMode', true);
        this.set('addMode', false);
        this.resetAddContext();
        this.resetReplaceContext();
      },
      exitEditMode(){
        if (this.get('exchangeRequesting') || this.get('deleteRequesting')) {
          return this.get('messager').alert('请等待替换操作处理完成');
        }
        this.clearEditState();
      },
      submitDelete(){
        let exchangeItems = this.get('exchangeItems');
        let that = this;
        that.set('deleteRequesting', true);
        this.get('http').request({
            type: 'post',
            url: `/Recommend/Rank?id=${exchangeItems.get(0).ID}`,
            data: {
              pos: -1
            }
          })
          .then(function () {
            let bannerList = that.get('serverBannerList');
            bannerList.removeObject(exchangeItems.get(0));
            if(bannerList.get('length') === 0){
              that.clearEditState();
            }
            that.get('exchangeItems').setEach('Active', false);
            that.set('exchangeItems', []);
          })
          .catch(function (error) {
            that.get('messager').alert(error.msg);
          })
          .finally(()=>that.set('deleteRequesting', false));
      },
      submitExchange(){
        let exchangeItems = this.get('exchangeItems');
        let that = this;
        that.set('exchangeRequesting', true);
        this.get('http').request({
            type: 'post',
            url: `/Recommend/Rank?id=${exchangeItems.get(0).ID}`,
            data: {
              pos: exchangeItems.get(1).HotOrder
            }
          })
          .then(function () {
            let bannerList = that.get('serverBannerList');
            let pos1 = bannerList.indexOf(exchangeItems.get(0));
            let pos2 = bannerList.indexOf(exchangeItems.get(1));
            bannerList.replace(pos1, 1, [exchangeItems.get(1)]);
            bannerList.replace(pos2, 1, [exchangeItems.get(0)]);
            that.get('exchangeItems').setEach('Active', false);
            that.set('exchangeItems', []);
          })
          .catch(function (error) {
            that.get('messager').alert(error.msg);
          })
          .finally(()=>that.set('exchangeRequesting', false));
      }
    }
  })
