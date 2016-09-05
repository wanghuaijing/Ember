/**
 * Created by whj on 2016/8/9.
 */
import pagingDataMixin from '../../../mixins/paging-data';
import Ember from 'ember';
export default Ember.Controller.extend(pagingDataMixin,{
    currentId:[],
    keyword:'',
    clickedId:'',
    info:'',
    http: Ember.inject.service(),
    isWatchingAddLoading:false,
    showWatchingAddDialog:false,
    template:Ember.Object.create(),
    load(page){
        if (this.get('pageRequest')) {
            this.get('pageRequest')[0].request.abort();
            this.get('pageRequest')[1].request.abort();
        }
        let that = this;
        Ember.run.later(function () {
            that.loadPageBegin(page);
            let url = '/Mall2/GoodsCategory/Bottom';
            let id = that.get('currentId');
            let length = id.length;
            let cid = id[length-1];
            if(id[length-1]==0){
                cid=null
            }
            let params = {
                cid: cid,
                q:that.get('keyword')
            };
            let promises= [];
            if(cid==null){
                promises = [that.get('http')
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
            }else {
                promises = [that.get('http')
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
            }

            that.set('pageRequest', promises);
            Ember.RSVP.all(promises)
                .then(function (values) {
                    that.loadPageComplete(values[1].Count, values[0].Data);
                })
                .catch(function (error) {
                    if (!error.abort) {
                        console.log(error);
                        that.get('messager').alert(error.msg);
                    }
                })
                .finally(()=>that.set('isLoading', false));
        });
    },
    actions:{
        onchange(value){
            this.set('currentId',value)
        },
        add(id){
            this.set('template',Ember.Object.create());
            this.set('info','');
            this.set('clickedId',id);
            this.set('showWatchingAddDialog',true)
        },
        confirm(cb){
            let clickedId=this.get('clickedId');
            let template = this.get('template');
            let data = {
                    ParentID:clickedId,
                    Name:template.Name,
                    Brief:template.Brief
                },
                url='/Mall2/GoodsCategory';
            let that = this;
            this.get('http')
                .request({
                    type:'post',
                    url: url,
                    data: data
                })
                .then(function (res) {
                    that.set('info','修改成功');
                    cb();
                    that.load()
                })
                .catch(function(res){
                    that.set('info',res.msg)
                })

        },
        deleteTemplate(id){
            let that = this;
            this.get('http').request({
                type:'delete',
                url :`/Mall2/GoodsTemplate?tids=${id}`
            }).then(function(res){
                    that.get('messager').alert('删除成功');
                })
                .catch(function(err){
                    console.log(err)
                })
        }
    }
})