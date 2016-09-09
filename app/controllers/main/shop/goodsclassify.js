/**
 * Created by whj on 2016/8/1.
 */
import pagingDataMixin from '../../../mixins/paging-data';
import Ember from 'ember';
const ListData = Ember.Object.extend({
    list:[],
    add(id,array){
        let list = this.get('list');
        if(list.length>0){
            let parentPosition = this.get('traverse').call(this,id);
            if(parentPosition&&!this.get('isExist').call(this,array)){
                list[parentPosition[0]][parentPosition[1]].childposition= list.length ;
                list.pushObject(array);
            }
        }else {
            list.pushObject(array);
        }
        this.set('list',list)
    },
    setItem(position,item,cb){
        let list = this.get('list');
/*        if(Array.isArray(item)){
            list[position[0]]=item;
        }else if(typeof item=="object"){
            list[position[0]][position[1]]=item;
        }else {

        }*/
        if(cb){
            list= cb(position,list);
        }
        this.set('list',list)
    },
    traverse(id,cb){
        let list = this.get('list');
        let position = [];
        list.forEach(function(items,index){
            items.forEach(function(item,i){
                if(cb){
                    cb(item)
                }
                if(item.ID==id){
                    position= [index,i];
                }
            },items)
        },list);
        if(position.length>0)
        {
            return position
        }else {
            return false
        }
    },
/*    isExist(array){
        let list = this.get('list');
        let result= false;
        list.forEach(function(item,index){
            if(item[0].ID==array[0].ID){
                result = true
            }
        },list)
        return result
    },*/
    isExist(id){
        let exist=false
        this.get('traverse').call(this,id,(item)=>{
            if(item.ID==id&&item.childposition){
                exist=true
            }
        });
        return exist
    },
    getAll(cb){
        let newList=[];
        let list = this.get('list');
        function getArray(list,index,depth){
            depth = depth + 20;
            list[index].forEach((items,index)=>{
                if(cb){
                    items=cb(items);
                }
                let classItems = Ember.Object.create(items);
                classItems.set('depth',depth);
                newList.push(classItems);
                if(items.childposition&&items.show){
                    getArray.call(this,list,items.childposition,depth)
                }
            },list[index])
        }
        getArray(list,0,-20);
        return newList
    },
    reset(){
        this.set('list',[])
    }

});
export default Ember.Controller.extend(pagingDataMixin,{
    currentId:[],
    keyword:'',
    logicData:ListData.create(),
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
        let logicData = this.get('logicData');
        Ember.run.later(function () {
            that.loadPageBegin(page);
            let url = '/Mall2/GoodsCategory/List';
            let urlDetail='/Mall2/GoodsCategory/Detail';
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
                        }),
                    that.get('http')
                        .request(urlDetail,{
                            data:{id:cid}
                        })
                ];
            }

            that.set('pageRequest', promises);
            Ember.RSVP.all(promises)
                .then(function (values) {
                    logicData.reset();
                    if(values[2]){
                        logicData.add(0,[values[2].Data]);
                        logicData.add(values[2].Data.ID,values[0].Data);
                        let data = logicData.getAll((item)=>{
                            item.show = true;
                            return item
                        });
                        that.set('count',values[1].Count);
                        that.loadPageComplete(values[1].Count, data);
                    }else {
                        logicData.add(0,values[0].Data);
                        let data = logicData.getAll((item=>{
                            item.show = true;
                            item.isExpend = false;
                            return item
                        }));
                        that.set('count',values[1].Count);
                        that.loadPageComplete(values[1].Count, data);
                    }
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
            console.log(value)
            this.set('currentId',value)
        },
        addNew(){
            this.set('template',Ember.Object.create());
            this.set('showWatchingNewDialog',true)
        },
        addNewConfirm(){
            let template = this.get('template');
            template.ParentID = 0;
            let that = this;
            let data = {
                    ParentID:template.ParentID,
                    Name:template.Name,
                    Brief:template.Brief,
                    IsEntity:template.IsEntity
                },
                url='/Mall2/GoodsCategory';
            this.get('http')
                .request({
                    type:'post',
                    url: url,
                    data: data
                })
                .then(function (res) {
                    that.set('newInfo','修改成功');
                    cb();
                    that.load()
                })
                .catch(function(res){
                    that.set('newInfo',res.msg)
                })

        },
        typeChange(value){
            if(value==0){
                this.set('template.IsEntity',false)
            }else {
                this.set('template.IsEntity',true)
            }
        },
        add(id){
            this.set('template',Ember.Object.create());
            console.log(this.get('templates'))
            this.set('info','');
            this.set('clickedId',id);
            this.set('showWatchingAddDialog',true)
        },
        confirm(cb){
            let clickedId = this.get('clickedId');

            let template = this.get('template');
            let data = {
                ParentID:clickedId,
                Name:template.Name,
                Brief:template.Brief
            },
                url='/Mall2/GoodsCategory';
            if(!this.get('clickedId')){
                data.ParentID = 0;
                data.IsEntiy = true
            }

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

        }
    }
}).reopen({
    isWatchingEditLoading:false,
    showWatchingEditDialog:false,
    templateEdit:Ember.Object.create(),
    listIsShow:Ember.computed('pageDataList,@each.show',function(){
        var list = this.get('pageDataList');
        return list.filterBy('show',true)
    }),
    actions:{
        confirmEdit(cb){
            let clickedId=this.get('clickedId');
            let template = this.get('templateEdit');
            let data = template,
                url='/Mall2/GoodsCategory';
            /*data.ParentID = this.get('parentID')||0;*/
            data.ParentID = 12;
            let that = this;
            this.get('http')
                .request({
                    type:'put',
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
        edit(id,pid){
            let that = this;
            this.set('clickedId',id);
            this.set('parentID',pid);
            console.log(pid)
            this.set('info','')
            this.set('isWatchingEditLoading',true)
            this.get('http')
                .request(`/Mall2/GoodsCategory/Detail?id=${id}`,
                    {type:'get'})
                .then(function(res){
                    that.set('isWatchingEditLoading',false)
                    that.set('templateEdit',res.Data);
                })
                .catch(function(res){
                    that.set('info','获取数据失败')
                })
                .finally(function(){
                    that.set('showWatchingEditDialog',true)
                });
            this.set('templateEdit',Ember.Object.create());
            this.set('info','');
        }
    }
})
.reopen({
    isWatchingDeleteLoading:false,
    showWatchingDeleteDialog:false,

    actions:{
        deleteClick(id){
            this.set('clickedId',id);
            this.set('info','');
            this.set('showWatchingDeleteDialog',true)
        },
        confirmDelete(cb){
            let that = this;
            let id = this.get('clickedId');
            that.set('isWatchingDeleteLoading',true);
            this.get('http')
                .request(`/Mall2/GoodsCategory?cids=${id}`,
            {type:'delete'})
                .then(function(res){
                    cb()
                })
                .catch(function(res){
                    that.set('info',res.msg)
                })
                .finally(function(){
                    that.set('isWatchingDeleteLoading',false);
                })
        }

    }
}).reopen({
        addLoad(data){
            let id = data.ID;
            let that = this;
            let logicData=this.get('logicData');
            let dataList = [];
            let positionCurrent = logicData.traverse(id);
            logicData.setItem(positionCurrent,null,(position,list)=>{
                let classObj = Ember.Object.create(list[position[0]][position[1]]);
                let isExpend = classObj.get('isExpend');
                classObj.set('isExpend',!isExpend);
                list[position[0]][position[1]] = classObj;
                return list
            });
            if(data.IsParent&&!logicData.isExist(id)){
                this.get('http')
                    .request(`/Mall2/GoodsCategory/List?cid=${id}`,{type:'get'})
                    .then(function(res){

                        if(res.Data.length>0){
                            logicData.add(id,
                                res.Data.map(function(item){
                                    item.show = true;
                                    item.isExpend = false;
                                    return item
                            }));
                        }
                        let count = that.get('count');
                        dataList = logicData.getAll();
                        that.loadPageComplete(count,dataList);
                    })
                    .catch(function(res){
                        console.log(res)
                    })
            }
            else {
                function setHide(id){
                    let EItem = Ember.Object.extend();
                    let position = logicData.traverse(id);
                    logicData.setItem(position,null,(position,list)=>{
                        let childposition = [];
                        if(list[position[0]][position[1]].childposition)
                        {
                            childposition = list[position[0]][position[1]].childposition;
                            list[childposition] = list[childposition].map(function(item,index){
                                if(item.childposition){
                                    setHide(item.ID);
                                }
                                var eItem = EItem.create(item)
                                eItem.set('show',!item.show);
                                return eItem

                            },list[childposition]);
                        }
                        return list
                    });
                }

                setHide(id);
                let count = that.get('count');
                dataList = logicData.getAll();
                that.loadPageComplete(count,dataList);
            }
        },
        
        actions:{
            addList(data){
                this.addLoad(data)
            }
        }
})