import Ember from 'ember';
import pagingDataMixin from '../../../mixins/paging-data';

export default Ember.Controller.extend(pagingDataMixin, {
    http: Ember.inject.service(),
    load(page){
        page || (page = this.get('currentPage'));
        let count = this.get('count');
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
                dataType: 3
            };
            let promises = [that.get('http')
                .request(url, {
                    data: Ember.$.extend({}, {
                        skip: (page - 1) * count,
                        count: count
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
        }
    }
});
