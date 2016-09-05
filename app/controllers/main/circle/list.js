import Ember from 'ember';

export default Ember.Controller.extend({
    http: Ember.inject.service(),
    //loading state
    isLoading: false,
    //current page
    currentPage: 1,
    //total page
    totalPage: null,
    //each page's count
    count: 20,
    //load data
    errorMsg: null,
    //data list
    topicList: [],
    categoryID: null,
    searchParams: {},
    url: {
      search: '/Thread/Manage?cid='
      //search: '/Thread/Category?id='
    },
    //topic category
    categorys: Ember.computed('model', function () {
      return this.get('model').Data;
    }),
    load(){
      this.set('hasPostNew', false);
      if (this.get('pageRequest')) {
        this.get('pageRequest')[0].request.abort();
        this.get('pageRequest')[1].request.abort();
      }

      this.setProperties({
        errorMsg: null,
        dataList: [],
        totalCount: 0
      });

      let that = this;
      Ember.run.later(function () {
        that.set('isLoading', true);
        let url = that.get('url').search + (that.get('categoryID') || that.get('model').Data[0].ID);
        let promises = [that.get('http')
          .request(url, {
            data: {
              skip: (that.get('currentPage') - 1) * that.get('count'),
              count: that.get('count'),
              nick: that.get('searchParams').nick,
              q: that.get('searchParams').q
            }
          }),
          that.get('http')
            .request(url, {
              data: {
                count: 0,
                nick: that.get('searchParams').nick,
                q: that.get('searchParams').q
              }
            })
        ];

        that.set('pageRequest', promises);
        Ember.RSVP.all(promises)
          .then(function (values) {
            values[0].Data && values[0].Data.forEach(function (item) {
              that.get('categorys').some(function (cate) {
                if (cate.ID === item.CID) {
                  item.CategoryName = cate.Name;
                  return true;
                }
                return false;
              });

              item.MediaContent = item.Content.replace(/\[e\((.{4,6})\)e\]/g, '<img src="images/emoji/$1.gif" onerror="javascript:this.src=\"images/emoji/$1.png\";">');
            });
            that.setProperties({
              dataList: values[0].Data,
              totalCount: values[1].Count,
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
      categoryChange(cid){
        this.set('categoryID', cid * 1);
      },
      search(){
        this.set('currentPage', 1);
        this.set('totalPage', null);
        this.load();
      },
      pageChange(page){
        this.set('currentPage', page);
        this.load();
      }
    }
  })

  //get thread detail
  .reopen({
    showThreadDetailDialog: false,
    isThreadDetailLoading: false,
    threadDetailImages: Ember.computed('threadDetailData', function () {
      if (this.get('threadDetailData.Pics')) {
        let that = this;
        let pics = this.get('threadDetailData').Pics.split('|');
        return pics.map(function (item) {
          return `${that.get('http').get('host')}/file?pid=${item}&quality=6`;
        });
      }
      return null;
    }),
    actions: {
      //show full image
      showFullImage(src){
        window.open(src.replace(/&quality.+/g, ''));
      },
      toggleThreadDetailDialog(isShow, item){
        this.set('showThreadDetailDialog', true);
        this.set('threadDetailData', null);
        if (this.get('showThreadDetailRequest')) {
          this.get('showThreadDetailRequest').abort();
        }
        if (isShow) {
          let that = this;
          Ember.run.later(function () {
            that.set('isThreadDetailLoading', true);
            let http = that.get('http');
            let promise = http.request(`/thread/manage/detail?id=${item.ID}&cid=${item.CID}`);
            that.set('showThreadDetailRequest', promise.request);
            promise.then(function (res) {
                res.Data.MediaContent = res.Data.Content.replace(/\[e\((.{4,6})\)e\]/g, '<img height="25" width="25" src="images/emoji/$1.gif" onerror="javascript:this.onerror=null;this.src=\'images/emoji/$1.png\';">');
                that.set('threadDetailData', res.Data);
                that.set('isThreadDetailLoading', false)
              })
              .catch(function (err) {
                if (!err.abort) {
                  that.get('messager').alert(err.msg);
                }
              })
              .finally(()=>that.set('isThreadDetailLoading', false));
          });
        }
      }
    }
  })

  //delete process
  .reopen({
    isThreadDeleting: false,
    actions: {
      toggleThreadDeleteDialog(isShow, item){
        if (this.get('isThreadDeleting') && isShow) {
          return that.get('messager').alert('请等待另一个帖子删除完成');
        }
        this.set('showThreadDeleteDialog', isShow);
        if (isShow) {
          this.set('threadToDelete', item);
          this.set('deleteReason', '');
        }
      },
      setDeleteReason(reason){
        this.set('deleteReason', reason);
      },
      deleteThread(){
        if (this.get('isThreadDeleting'))return;
        this.set('isThreadDeleting', true);

        let http = this.get('http'), that = this;

        let deleteThread = this.get('threadToDelete');
        http.request({
            type: 'delete',
            url: `/Thread?id=${deleteThread.ID}&cid=${deleteThread.CID}&reason=${this.get('deleteReason')}`
          })
          .then(function () {
            that.load();
            that.set('deleteReason', '');
            that.set('showThreadDeleteDialog', false);
          })
          .catch(err=>this.get('messager').alert(err.msg))
          .finally(()=>this.set('isThreadDeleting'), false);
      }
    }
  })

  //user info process
  .reopen({
    isWatchingUserInfoLoading: false,
    watchingUserInfo: null,
    watchingUserAvatarUrl: Ember.computed('watchingUserInfo', function () {
      if (!this.get('watchingUserInfo') || !this.get('watchingUserInfo').PhotoUrl) {
        return null;
      }
      return `${this.get('http').get('host')}/UserAvatar?pid=${this.get('watchingUserInfo.ID')}&${this.get('watchingUserInfo.ID.PhotoUrl')}`;
    }),
    actions: {
      toggleWatchingUserInfoDialog(isShow, item){
        this.set('showWatchingUserInfoDialog', true);
        this.set('watchingUserInfo', null);
        if (this.get('watchingUserInfoRequest')) {
          this.get('watchingUserInfoRequest').abort();
        }
        if (isShow) {
          let that = this;
          Ember.run.later(function () {
            that.set('isWatchingUserInfoLoading', true);
            let http = that.get('http');
            let promise = http.request(`/UserInfoByID?id=${item.UID}`);
            that.set('watchingUserInfoRequest', promise.request);
            promise.then(function (res) {
                that.set('watchingUserInfo', res.Data);
              })
              .catch(function (err) {
                if (!err.abort) {
                  that.get('messager').alert(err.msg);
                }
              })
              .finally(()=>that.set('isWatchingUserInfoLoading', false));
          });
        }
      }
    }
  })
