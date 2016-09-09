/**
 * Created by whj on 2016/8/9.
 */
import Ember from 'ember';
import pagingDataMixin from '../../../mixins/paging-data';

export default Ember.Controller.extend(pagingDataMixin, {
    http: Ember.inject.service(),
    cacheFactory: Ember.inject.service(),
    queryParams: ['goodsTemplateID', 'type','categoryID','categoryName','isExistGoods'],
    goodsTemplateController:Ember.inject.controller('main.shop.goodstemplate'),
    type: null,
    isAdd:Ember.computed('type',function(){
        if(this.get('type')=='add'){
            return true
        }else {
            return false
        }
    }),
    goodsTemplate:{
        PurchaseAttribute:[{AttributeName:'1'}],
        SpecialAttribute:[{AttributeName:'1'}]
    },
    enum: Ember.inject.service(),
    addKey(list){
        let array = [];
        if(list){
            array = list.map(function(item,index){
                let temp = Ember.Object.create(item);
                temp.set('key',index);
                return temp
            })
        }
        return array
    },
    saveCache(){
        let  data = this.get('goodsTemplate');
        this.get('cacheFactory').addOrUpdate('newTemplateCache', data);
        this.set('autoSavedInfoShow', true);
        Ember.run.later(()=>this.set('autoSavedInfoShow', false), 3000);
    },
    load(cache){
        if (this.get('pageRequest')) {
            this.get('pageRequest').request.abort();
        }
        let that = this;
        let tid = this.get('goodsTemplateID');
        if (this.get('isAdd')) {
            that.set('isLoading',false);
            this.set('goodsTemplate',{
                PurchaseAttribute:[],
                SpecialAttribute:[]
            })
        }else {
            Ember.run.later(function(){
                that.set('isLoading',true);
                let promises = [
                    that.get('http')
                    .request(`/Mall2/GoodsTemplate/Detail?tid=${tid}`,
                        {type:'get'}),
                    ];
                Ember.RSVP.all(promises)
                    .then(function(res){
                        that.set('isLoading',false);
                        let Data = res[0].Data;
                        Data.SpecialAttribute = that.get('addKey')(Data.SpecialAttribute);
                        Data.PurchaseAttribute = that.get('addKey')(Data.PurchaseAttribute);
                        that.set('goodsTemplate',Data);
                    })
                    .catch(function(error){
                        console.log(error)
                        if (!error.abort) {
                            that.get('messager').alert(error.msg);
                        }
                    })
            })
        }
    },
    actions:{
        goBack(){
            window.history.go(-1);
        }
    }
    
}).reopen({//SpecialAttribute option
    attributeType:Ember.computed('model',function(){
        let model = this.get('model');
        return model.Data
    }),
    specialListKey:Ember.computed('goodsTemplate.SpecialAttribute.@each.AttributeName',
        'goodsTemplate.SpecialAttribute.@each.Constraint',function(){
        return this.get('goodsTemplate').SpecialAttribute
    }),
    isNum(s){
        if(s!=null){
            var reg = new RegExp("^[0-9]*$");
            return reg.test(s)
        } 
    },
    actions:{
        onchange(e){
            let value = e.target.value;
            let strings = '';
            if(!this.get('isNum')(value)){
                let arrays = value.toString().split('');
                arrays.pop();
                strings = arrays.join('');
                e.target.value = strings;
            }else {

            }
        },
        specialTypeChange(key,e){
            let value = e.target.value;
            let goodsTemplate = Ember.Object.create(this.get('goodsTemplate'));
            let specialList = goodsTemplate.SpecialAttribute;
            specialList[key].AttributeTypeID = value;
            goodsTemplate.set('SpecialAttribute',specialList);
            this.set('goodsTemplate',goodsTemplate)
        },
        SIsNecessaryChange(key,e){
            let value = e.target.value;
            let goodsTemplate = Ember.Object.create(this.get('goodsTemplate'));
            let specialList = goodsTemplate.SpecialAttribute;
            specialList[key].IsNecessary = value;
            goodsTemplate.set('SpecialAttribute',specialList);
            this.set('goodsTemplate',goodsTemplate)

        },
        specialAdd(){
            let goodsTemplate = this.get('goodsTemplate');
            let specialList = [];
            if(goodsTemplate.SpecialAttribute){
                specialList = goodsTemplate.SpecialAttribute;
            }
            let newObj = Ember.Object.create({
                IsNecessary:false,
                IsNew:true,
            });
            specialList.pushObject(newObj);
            goodsTemplate.SpecialAttribute = this.get('addKey')(specialList);
            this.set('goodsTemplate',goodsTemplate);

        },
        specialDelete(index){
            let Temp = Ember.Object.extend()
            let goodsTemplate = this.get('goodsTemplate');
            console.log(specialList)
            let specialList = goodsTemplate.SpecialAttribute;
            let newList = [];
            specialList&&specialList.map(function(item,i){
                if(i!=index){
                    newList.pushObject(item)
                }
            });
            newList = this.get('addKey')(newList)
            let newGoodsTemplate = Temp.create(goodsTemplate);
            newGoodsTemplate.set('SpecialAttribute',newList);
            this.set('goodsTemplate',newGoodsTemplate)
        }
    }
}).reopen({
    purchaseList:[],
    purchaseListKey:Ember.computed('goodsTemplate.PurchaseAttribute.@each.AttributeName',
        'goodsTemplate.PurchaseAttribute.@each.Constraint',
        function(){
            return this.get('goodsTemplate').PurchaseAttribute
        }),
    actions:{
        purchaseTypeChange(key,e){
            let value = e.target.value;
            let goodsTemplate = Ember.Object.create(this.get('goodsTemplate'));
            let purchaseList = goodsTemplate.PurchaseAttribute;
            purchaseList[key].AttributeTypeID = value;
            goodsTemplate.set('PurchaseAttribute',purchaseList);
            this.set('goodsTemplate',goodsTemplate)
        },
        PIsNecessaryChange(key,e){
            let value = e.target.value;
            let goodsTemplate = Ember.Object.create(this.get('goodsTemplate'));
            let purchaseList = goodsTemplate.PurchaseAttribute;
            purchaseList[key].IsNecessary = value;
            goodsTemplate.set('PurchaseAttribute',purchaseList);
            this.set('goodsTemplate',goodsTemplate)

        },
        purchaseAdd(){
            let newObj = {
                IsNecessary:false,
                IsNew:true
            }
            let goodsTemplate = this.get('goodsTemplate');
            let purchaseList = [];
            if(goodsTemplate.PurchaseAttribute){
                purchaseList = goodsTemplate.PurchaseAttribute;
            }
            purchaseList.pushObject(newObj);
            goodsTemplate.PurchaseAttribute = this.get('addKey')(purchaseList);
            this.set('goodsTemplate',goodsTemplate)
        },
        purchaseDelete(index){
            let Temp = Ember.Object.extend()
            let goodsTemplate = this.get('goodsTemplate');
            let purchaseList = goodsTemplate.PurchaseAttribute;
            let newList = [];
            console.log(purchaseList)
            purchaseList.map(function(item,i){
                if(i!=index){
                    newList.pushObject(item)
                }
            });
            let newGoodsTemplate = Temp.create(goodsTemplate);
            newList = this.get('addKey')(newList)
            newGoodsTemplate.set('PurchaseAttribute',newList);
            this.set('goodsTemplate',newGoodsTemplate)
        }
    }
}).reopen({
    isSubmiting:false,
    actions:{
        submit(){
            let categoryID = this.get('categoryID');
            let categoryName = this.get('categoryName');
            let goodsTemplate = this.get('goodsTemplate');
            let specialListKey = this.get('specialListKey')
            let specialList=specialListKey.map(function(item){
                return item.getProperties(['AttributeName','AttributeTypeID',
                    'AttributeType','Constraint','IsNecessary']);

            });
            let purchaseListKey = this.get('purchaseListKey')
            let purchaseList= purchaseListKey.map(function(item){
                return item.getProperties(['AttributeName','AttributeTypeID',
                    'AttributeType','Constraint','IsNecessary']);
            });
            let data = {
                ID:goodsTemplate.ID,
                CategoryID:categoryID,
                CategoryName:categoryName,
                SpecialAttribute:specialList,
                PurchaseAttribute:purchaseList
            };
            let type = 'put'
            if(this.get('isAdd')){
                delete data.ID;
                type = 'post'
            }

            let that = this;
            this.get('http').request({
                type:type,
                url :'/Mall2/GoodsTemplate',
                data:data
            }).then(function(res){
                that.get('messager').alert('发布成功');
                })
                .catch(function(err){
                    console.log(err)
                })
        }
    }

})