/**
 * Created by whj on 2016/9/6.
 */
import Ember from 'ember';
import pagingDataMixin from '../../../mixins/paging-data';
export default Ember.Controller.extend(pagingDataMixin,{
    http: Ember.inject.service(),
    enum: Ember.inject.service(),
    load(page){
        let count = this.get('count');
        if (this.get('pageRequest')) {
            this.get('pageRequest')[0].request.abort();
            this.get('pageRequest')[1].request.abort();
        }

        let that = this;
        Ember.run.later(function () {
            that.loadPageBegin(page);
            let url = '/Mall2/Banner/Admin';
            let params = {
                type: that.get('bannerType')
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
                    console.log(values[0].Data)
                })
                .catch(function (error) {
                    if (!error.abort) {
                        that.get('messager').alert(error.msg);
                        console.log(error)
                    }
                })
                .finally(()=>that.set('isLoading', false));
        });
    },
    bannerTypes:Ember.computed('enum.bannerType',function(){
        return this.get('enum').bannerType
    }),
    bannerType:null,
    actions: {
        deleteClick(id){
            let that = this;
            that.get('http')
                .request(`/Mall2/Banner?ids=${id}`, {
                    type: 'delete'
                })
                .then(function () {
                    that.load();
                })
                .catch(function (error) {
                    if (!error.abort) {
                        that.get('messager').alert(error.msg);
                    }
                })
        },
        showFullImage(src){
            window.open(src.replace(/&quality.+/g, ''));
        },
        bannerTypeChange(value){
            this.set('bannerType',value);
        },
    }
})
