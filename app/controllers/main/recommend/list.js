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
    count: 10,
    //load data
    errorMsg: null,
    //data list
    dataList: [],
    //recommend category
    categorys: Ember.computed('model', function () {
      return this.get('model').Data;
    }),
    isFixedTime: '0',
    //active item
    activeItem: {},
    url: Ember.computed('isFixedTime', function () {
      if (this.get('isFixedTime') * 1) {
        return {
          search: '/recommend/fixedTime',
          delete: '/recommend/fixedTime',
          detail: '/recommend/fixedTime/Detail'
        };
      }
      return {
        search: '/recommend/user',
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
        Ember.RSVP.all(promises)
          .then(function (values) {
            that.set('isLoading', false);
            values[0].Data && values[0].Data.forEach(function (item) {
              that.get('categorys').some(function (cate) {
                if (cate.ID === item.CID) {
                  item.CategoryName = cate.Name;
                  return true;
                }
                return false;
              });
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
  .reopen({
    actions: {
      toggleDeleteDialog(isShow, item){
        if (this.get('isDeleting')) {
          return that.get('messager').alert('请等待上一个删除处理完成');
        }
        this.set('toggleDeleteDialog', isShow);
        this.set('itemToDelete', item);
      },
      detail(item){
        let url = this.get('url').detail,
          that = this;
        that.set('toggleDetailDialog', true);
        that.set('dataDetail', null);

        if (that.get('dataDetailRequest')) {
          that.get('dataDetailRequest').abort();
        }
        Ember.run.later(function () {
          that.set('detailLoading', true);
          let promise = that.get('http').request({
            url: `${url}?cid=${item.CID}&id=${item.ID}`
          });
          that.set('dataDetailRequest', promise.request);
          promise.then(function (res) {
              that.set('dataDetail', res.Data);
            })
            .catch(function (error) {
              if (!error.abort) {
                that.get('messager').alert(error.msg);
              }
            })
            .finally(()=> that.set('detailLoading', false));
        });
      },
      delete(){
        let url = this.get('url').delete,
          that = this,
          item = that.get('itemToDelete');
        if (this.get('isDeleting')) {
          return;
        }
        this.set('isDeleting', true);
        this.get('http').request({
            type: 'delete',
            url: `${url}?cid=${item.CID}&id=${item.ID}`
          })
          .then(function () {
            that.set('toggleDeleteDialog', false);
            that.load();
          })
          .catch(function (error) {
            that.get('messager').alert(error.msg);
          })
          .finally(()=>that.set('isDeleting', false));
      }
    }
  });
