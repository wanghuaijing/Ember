import Ember from 'ember';
import pagingDataMixin from '../../../mixins/paging-data';

export default Ember.Controller.extend(pagingDataMixin, {
    http: Ember.inject.service(),
    load(page){
        page || (page = this.get('currentPage'));
        if (this.get('pageRequest')) {
            this.get('pageRequest')[0].request.abort();
            this.get('pageRequest')[1].request.abort();
        }

        let that = this;
        Ember.run.later(function () {
            that.loadPageBegin(page);
            let url = '/Mall2/Goods';
            let params = {
                q: that.get('keyword'),
                beginTime:that.get('validDate')[0],
                endTime:that.get('validDate')[1]
            };
            let promises = [that.get('http')
                .request(url, {
                    data: Ember.$.extend({}, {
                        skip: (page - 1) * that.get('count'),
                        count: that.get('count')
                    }, params)
                }),
                that.get('http')
                    .request(url, {
                        data: Ember.$.extend({}, {
                            count: 0
                        }, params)
                    })
            ];

            that.set('pageRequest', promises);
            Ember.RSVP.all(promises)
                .then(function (values) {
                    values[0].Data&&values[0].Data.map(function(item){
                        item.isEdit = false;
                        return item
                    });
                    that.loadPageComplete(values[1].Count, values[0].Data);
                })
                .catch(function (error) {
                    if (!error.abort) {
                        that.get('messager').alert(error.msg);
                    }
                })
                .finally(()=>that.set('isLoading', false));
        });
    },
    actions: {}
}).reopen({
    deletingGoods: null,
    showDeleteGoodsDialog: false,
    isGoodsDeleting: false,
    isEdit:false,
    validDate:[],
    openDeleteGoodsDialog(item){
        this.set('deletingGoods', item);
        this.set('showDeleteGoodsDialog', true);
    },
    actions: {
        toggleDeleteGoodsDialog(val, item){
            if (val) {
                this.openDeleteGoodsDialog(item);
            }
            this.set('showDeleteGoodsDialog', val);
        },
        deleteGoods(){
            let that = this;
            if (that.get('isGoodsDeleting')) {
                return;
            }

            that.set('isGoodsDeleting', true);
            that.get('http')
                .request(`/Mall2/Goods?ids=${that.get('deletingGoods').ID}`, {
                    type: 'delete'
                })
                .then(function () {
                    that.set('showDeleteGoodsDialog', false);
                    that.load();
                })
                .catch(function (error) {
                    if (!error.abort) {
                        that.get('messager').alert(error.msg);
                    }
                })
                .finally(()=>that.set('isGoodsDeleting', false));
        },
        hotOrderChange(data,key,e){
            let id = data.ID,
                value = e.target.value;
            let that = this;
            if(value){
                if(value>0&&value<256){
                    this.get('http')
                        .request(`/Mall2/Goods/SetHot?id=${id}&hot=${value}`,
                            {type:'put'})
                        .then(()=>{
                            this.set('isEdit',false)
                        })
                        .catch(()=>{
                            if (!error.abort) {
                                that.get('messager').alert(error.msg);
                            }
                        })
                }else {
                    that.get('messager').alert('修改失败，请输入0-255,的数字');
                    this.set('isEdit',false)
                }
            }else {
                this.get('http')
                    .request(`/Mall2/Goods/SetHot?id=${id}&hot=${value}`,
                        {type:'put'})
                    .then(()=>{
                        this.set('isEdit',false)
                    })
                    .catch(()=>{
                        if (!error.abort) {
                            that.get('messager').alert(error.msg);
                        }
                    })
            }
        },
        isEditChange(){
            this.set('isEdit',true)
        }
    }
});
