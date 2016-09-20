import Ember from 'ember';
import pagingDataMixin from '../mixins/paging-data';
export default Ember.Component.extend({
    http: Ember.inject.service(),
    classNames:['form-control','form-inline'],
    listData:[],
    currentId:[],
    placeholder:Ember.computed('selectplaceholder',function(){
        return this.get('selectplaceholder')
    }),
    load(value,index){
        let that = this;
        let listData = that.get('listData');
        let id = this.get('currentId');
        let length = listData.length;
        let num = index+1;
        if(value!=0&&value){
            this.get('http')
                .request(`/Mall2/GoodsCategory?cid=${value}`, {
                    type: 'get'
                })
                .then(function (res) {
                    if(length>index+1){
                        listData.removeAt(num,length-num);
                        id.removeAt(index,length-index)
                    }
                    let obj={data:res.Data,index:num};
                    if(res.Data.length>0){
                        listData.pushObject(obj);
                    }
                    id.pushObject(value)
                    that.set('listData',listData);
                    that.get('onchange')(id,res.Data,value)
                })
                .catch(function (error) {
                    if (!error.abort) {
                        console.log(error)
                    }
                })
        }else {
            id.removeAt(index,length-index)
            that.set('currentId',id);
            if(length>num){
                listData.removeAt(num,length-num);
            }
        }
    },
    init(){
        this._super(...arguments);
        this.set('listData',[])
        let that = this;
        this.get('http')
            .request(`/Mall2/GoodsCategory`, {
                type: 'get'
            })
            .then(function (res) {
                let listData = that.get('listData');
                let id = that.get('currentId');
                let obj={data:res.Data,index:0}
                listData.pushObject(obj);
                that.set('currentId',id)
                that.set('listData',listData)
            })
            .catch(function (error) {
                if (!error.abort) {
                    console.log(error)
                }
            })
    },
    actions:{
        listChange(index){
            let value =arguments[1].target.value;
            console.log(index)
            this.load(value,index*1)
        }
/*        twoChange(value){
            let id = this.get('currentId');
            id[1] = value;
            this.get('onchange')(value)
            this.set('currentId',id).set('listDataThree',[]);
            let cb = 'listDataThree'
            this.load(value,cb)
        },
        threeChange(value){
            let id = this.get('currentId');
            this.get('onchange')(value)
            id[2] = value;
            this.set('currentId',id)
        }*/
    }

});
