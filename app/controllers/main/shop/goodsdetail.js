import Ember from 'ember';
import config from '../../../config/environment';
export default Ember.Controller.extend({
    http: Ember.inject.service(),
    enum: Ember.inject.service(),
    cacheFactory: Ember.inject.service(),
    queryParams: ['goodsID', 'type','CategoryID'],
    goodsController: Ember.inject.controller('main.shop.goods'),
    type: null,
    isAdd: Ember.computed('type', function () {
      if (this.get('type') === 'add') {
        return true;
      }
      return false;
    }),

    //for route setup
    initialServerBannerList(model){
        let that = this;
        model.Data.forEach(function (item) {
          let src = that.get('http').host + '/File?quality=4&pid=' + item.BannerPic;
          item.BannerImageStyle = new Ember.Handlebars.SafeString(`background-image:url(${src})`);
        });
        this.set('serverBannerList', model.Data);
      },
    saveCache(){
      let editor = this.get('editor'), data = this.get('goodsData');
      if (!editor)return;
      this.set('goodsData.Content', editor.html());
      this.get('cacheFactory').addOrUpdate('newGoodsCache', data);
      this.set('autoSavedInfoShow', true);
      Ember.run.later(()=>this.set('autoSavedInfoShow', false), 3000);
    },
    load(cache){
      let goodsID = this.get('goodsID');
      if (this.get('pageRequest')) {
        this.get('pageRequest')[0].request.abort();
        this.get('pageRequest')[1].request.abort();
      }
      let that = this;

      if (this.get('isAdd')) {
        if (!cache) {
          that.set('goodsData', {
            Shop: {ID: config.SelfShopID},
            CustoService:{
              CustomerServicePhone:''
            }
          });
          that.set('picsArr', []);
          that.set('goodsDataSource', JSON.stringify({}));
        }
        else {
          that.set('goodsData', $.extend({},cache, {
            Shop: {ID: config.SelfShopID},
          }));
          that.set('picsArr', cache.Pics ? cache.Pics.split('|') : []);
        }
        return;
      }else{
        let CategoryID = this.get('CategoryID');
        let goodsID = this.get('goodsID');
        that.set('isLoading', true);
        this.get('http').request(`/Mall2/GoodsCategory/Detail?id=${CategoryID}`)
            .then(function(res){
              let detailData = res.Data;
              Ember.run.later(function(){
                let promises = [that.get('http').request(`/Mall2/GoodsTemplate/Detail?tid=${detailData.TemplateID}`),
                  that.get('http').request(`/Mall2/Goods/Detail?id=${goodsID}`)];
                that.set('pageRequest', promises);
                Ember.RSVP.all(promises)
                    .then(function(res){
                      let goodsData = res[1].Data;
                      let addTemplateData = res[0].Data;
                      addTemplateData.PurchaseAttribute.map(function(item){
                        if(goodsData.PurchAttriDetail){
                          item.checked = goodsData.PurchAttriDetail.some(function(i,index,array){
                            if(i.AttributeName==item.AttributeName){
                              item.AttributeValue = i.AttributeValue
                            }
                            return i.AttributeName==item.AttributeName
                          });
                        }
                        return item
                      });
                      addTemplateData.SpecialAttribute.map(function(item){
                        if(goodsData.SpeciAttriDetail){
                          item.checked = goodsData.SpeciAttriDetail.some(function(i,index,array){
                            if(i.AttributeName==item.AttributeName){
                              item.AttributeValue = i.AttributeValue
                            }
                            return i.AttributeName==item.AttributeName
                          });
                        }
                        return item
                      });
                      goodsData.IsEntity = detailData.IsEntity;
                      that.set('addTemplateData',addTemplateData);
                      that.set('goodsData',goodsData);
                      that.set('stocks',goodsData.StockPriceConfig);
                      that.set('tableData',goodsData.StockPriceConfig);
                      that.set('isLoading',false)
                      /*                    let resData = res.Data
                       resData.SpecialAttribute =res.Data.SpecialAttribute.map(function(item,index){
                       item.checked = false;
                       return item*/
                    })
                    .catch(function(res){
                  console.log(res)
                })
              })
            })
            .catch(function(res){
              console.log(res)
            })
      }
/*

      Ember.run.later(function () {
        that.set('isLoading', true);
        let promise = that.get('http')
          .request('/Mall2/Goods/Detail', {
            data: {
              id: that.get('goodsID')
            }
          });

        that.set('pageRequest', promise);

        promise.then(function (value) {
            that.set('goodsData', value.Data);
            that.set('picsArr', value.Data.Pics.split('|'));
            that.set('goodsDataSource', JSON.stringify(value.Data));
          })
          .catch(function (error) {
            if (!error.abort) {
              that.get('messager').alert(error.msg);
            }
          })
          .finally(()=>that.set('isLoading', false));
      });*/
    },
    actions: {
      //show full image
      showFullImage(src){
        window.open(src.replace(/&quality.+/g, ''));
      },
      goBack(){
        window.history.go(-1);
      },
      reset(){
        if (this.get('isAdd')) {
          this.get('cacheFactory').addOrUpdate('newGoodsCache', {});
          this.get('editor').html('');
          this.set('goodsData', $.extend({}, {
            Shop: {ID: config.SelfShopID},
          }));
          this.set('picsArr', []);
        }
        else {
          let goodsSource = JSON.parse(this.get('goodsDataSource'));
          this.set('goodsData', goodsSource);
          this.get('editor').html(goodsSource.Content);
          this.set('picsArr', goodsSource.Pics.split('|'));
        }
      },
      toggleBigPhotoUploadDialog(val){
        this.set('showBigPhotoUploadDialog', val);
      },
      bigPhotoUploaded(val){
        this.set('goodsData.Photo', val);
      },
      togglePicsUploadDialog(val){
        this.set('showPicsUploadDialog', val);
      },
      beforePicsUpload(files){
        if (files.length + this.get('picsArr').length > 5) {
          this.get('messager').alert('商品图片上限为5张,请重新选择');
          return false;
        }
      },
      picsUploaded(val){
        this.get('picsArr').pushObjects(val.split('|'));
        this.set('goodsData.Pics', this.get('picsArr').join('|'))
      },
      deletePics(index){
        this.get('picsArr').removeAt(index);
        this.set('goodsData.Pics', this.get('picsArr').join('|'))
      }
    }
  })
  .reopen({
    checkValues(){
      let data = this.get('goodsData');
      let StockPriceConfig =this.get('stocks');
      if(StockPriceConfig.length==0){
        StockPriceConfig = this.get('StockPriceConfig')
      }
      if (!data.Name || !data.Name.trim()
        || !data.No || !data.No.trim()
        || !data.Pics || !data.Pics.trim()) {
        this.get('messager').alert('商品信息不能为空');
        return false;
      }
      else if (!StockPriceConfig[0].OrigiPrice
        || !StockPriceConfig[0].SellPrice
        || !StockPriceConfig[0].Stock) {
        this.get('messager').alert('商品价格和库存不能为空');
        return false;
      }
      else if (!data.BeginTime
        || !data.EndTime
        || (new Date(data.BeginTime) >= new Date(data.EndTime))) {
        this.get('messager').alert('有效期不能为空，且必须为合法的区间');
        return false;
      }
      else if (!this.get('editor').html().trim()) {
        this.get('messager').alert('商品详情不能为空');
        return false;
      }
      else {
        return true;
      }
    },
    actions: {
      editorLoaded(editor){
        this.set('editor', editor);
      },
      submit(){
        if (this.get('isSubmiting')) {
          return;
        }
        if (!this.checkValues()) {
          return;
        }
        this.set('isSubmiting', true);
        let that = this;

        let StockPriceConfig =this.get('stocks');
        if(StockPriceConfig.length==0){
          StockPriceConfig = this.get('StockPriceConfig')
        }
        let CategoryID = this.get('currentID');
        let SpeciAttriDetail = this.get('specialAttributesChecked').map(function(item){
          let obj ={}
          if(item){
            obj = {
              AttributeName:item.AttributeName,
              AttributeValue:item.AttributeValue,
              WebStyle:item.AttributeType.WebStyle
            }
          }
          return obj;
        });
        let PurchAttriDetail = this.get('purchaseAttributesChecked').map(function(item){
          let obj ={}
          if(item){
            let listValue = item.AttributeValue.map(function(i){
              if(i.value){
                return i.value
              }else {
                return i
              }
            })
            obj = {
              AttributeName:item.AttributeName,
              AttributeValue:listValue,
              WebStyle:item.AttributeType.WebStyle
            }
          }
          return obj;
        });
        this.set('goodsData.StockPriceConfig',StockPriceConfig);
        this.set('goodsData.CategoryID',CategoryID);
        this.set('goodsData.SpeciAttriDetail',SpeciAttriDetail);
        this.set('goodsData.PurchAttriDetail',PurchAttriDetail);
        let goodsData = this.get('goodsData');
        this.set('goodsData',goodsData)
        that.set('goodsData.Content', this.get('editor').html());
        that.set('goodsData.Brief', this.get('editor').text().replace(/<(img|embed)[^<]*\/>/g, '').trim());
        let url = '/Mall2/Goods?id=' + that.get('goodsID');
        if(that.get('goodsID')<0){
          url = '/Mall2/Goods'
        }
        that.get('http')
          .request(url, {
            type: that.get('isAdd') ? 'post' : 'put',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(that.get('goodsData'))
          })
          .then(function () {
            that.get('messager').alert('操作成功');
            that.get('goodsController').load();
            that.get('cacheFactory').addOrUpdate('newGoodsCache', {});
            if (that.get('isAdd')) {
              window.history.go(-1);
            }
          })
          .catch(function (error) {
            if (!error.abort) {
              that.get('messager').alert(error.msg);
            }
          })
          .finally(()=>that.set('isSubmiting', false));
      }
    }
  })
  .reopen({
    showInsertContentPicDialog: false,
    actions: {
      toggleContentPicUploadDialog(value){
        this.set('showInsertContentPicDialog', value);
      },
      contentPicUploaded(val){
        let imgSrc = this.get('http').get('host') + '/file?pid=' + val;
        this.get('editor').insertHtml(`<img data-tag="img" src="${imgSrc}" />`);
      }
    }
  })
  .reopen({
    showAddressPicUploadDialog: false,
    actions: {
      toggleAddressPicUploadDialog(value){
        this.set('showAddressPicUploadDialog', value);
      },
      addressPicUploaded(val){
        this.set('goodsData.Banner', val);
      }
    }
  })
    .reopen({//工具
      currentID:Ember.computed('CategoryID',function(){
        let CategoryID = this.get('CategoryID');
        return CategoryID
      }),
      buyTypeValue:'',
      actions:{
        selectCategory(id,data,value){
          let that = this;
          if(data.length==0){
            this.set('currentID',value);
            this.get('http').request(`/Mall2/GoodsCategory/Detail?id=${value}`)
                .then(function(res){
                  let detailData = res.Data;
                  let goodsData = that.get('goodsData');
                  goodsData.IsEntity = detailData.IsEntity;
                  that.set('goodsData',goodsData);
                  that.get('http').request(`/Mall2/GoodsTemplate/Detail?tid=${detailData.TemplateID}`)
                      .then(function(res){
                        let resData = res.Data
                        resData.SpecialAttribute =res.Data.SpecialAttribute.map(function(item,index){
                          item.checked = false;
                          return item
                        });
                        that.set('addTemplateData',resData)
                      })
                      .catch(function(res){
                        console.log(res)
                      })
                })
                .catch(function(res){
                  console.log(res)
                })
          }
        },
        buyTypeChange(value){
          if(value==0){
            this.set('goodsData.IsTuan',true)
          }else {
            this.set('goodsData.IsTuan',false)
          }
        }
      }
    })
    .reopen({
      //商品特殊属性
      addTemplateData:{},
      specialAttributes:Ember.computed('addTemplateData.SpecialAttribute.[]',function(){
        let addTemplateData = this.get('addTemplateData');
        return addTemplateData.SpecialAttribute;
      }),
      specialAttributesChecked:Ember.computed('specialAttributes.@each.checked',function(){
        let specialAttributes = this.get('specialAttributes');
        let dataList = [];
        if(specialAttributes){
          specialAttributes.map(function(item){
            if(item.checked){
              dataList.pushObject(item)
            }})}
        return dataList
      }),
      imgAttributeShow:false,
      currentSpecialValue:'',
      actions:{
        toggleImgAttribute(value,name){
          this.set('imgAttributeShow',value);
          this.set('currentSpecialValue',name);
        },
        specialImgUpload(value){
          let name = this.get('currentSpecialValue');
          let specialAttributes = this.get('specialAttributes');
          let list = specialAttributes.map(function(item){
            if(item.AttributeName==name){
              item.AttributeValue = value;
            }
            return item
          });
          this.set('specialAttributes',list)
        }
      }
    })
    .reopen({
      //商品购买属性
      purchaseAttributes:Ember.computed("addTemplateData.PurchaseAttribute.[]",function(){
        let addTemplateData = this.get('addTemplateData');
        return addTemplateData.PurchaseAttribute;
      }),
      purchaseAttributesChecked:Ember.computed('purchaseAttributes.@each.checked','purchaseAttributes.[].AttributeValue.[]',
          function(){
        let purchaseAttributes = this.get('purchaseAttributes');
        let dataList = [];
        if(purchaseAttributes){
          purchaseAttributes.map(function(item){
            if(item.checked){
              dataList.pushObject(item)
            }})};
        return dataList
      }),
      stocks:[],
      StockPriceConfig:[{OrigiPrice:'',SellPrice:'',Stock:'',AttributesContent:{}}],
      imgAttributeShowPur:false,
      currentPurchaseValuePur:'',
      tableHead:Ember.computed('stocks.[]',function(){
        let stocks = this.get('stocks')[0];
        let tableHead = [];
        for(var key in stocks.AttributesContent){
          tableHead.push(key);
        }
        tableHead.push('库存','卖价','市场价');
        return tableHead;
      }),
      seTableData(data){
        let list = [];
        data.map(function(item){
          let obj = {
            Stock:1,
            OrigiPrice:0.01,
            SellPrice:0.01,
            AttributesContent:{}
          };
          item.map(function(i){
            obj.AttributesContent[i.name] = i.value
          });
          list.push(obj);
        });
        return list;
      },
      actions:{
        toggleImgAttributePur(value,name){
          this.set('imgAttributeShowPur',value);
          this.set('currentPurchaseValuePur',name);
        },
        purchaseImgUpload(value){
          let name = this.get('currentPurchaseValuePur');
          let purchaseAttributes = this.get('purchaseAttributes');
          let list = purchaseAttributes.map(function(item){
            if(item.AttributeName == name){
              let pic = value.split('|');
              item.AttributeValue = pic;
            }
            return item
          });
          this.set('purchaseAttributes',list)
        },
        addAttribute(name){
          let purchaseAttributes = this.get('purchaseAttributes');
          let list = purchaseAttributes.map(function(item,){
            if(item.AttributeName==name){
              if(item.AttributeValue){
                item.AttributeValue.pushObject({value:''})
              }else {
                item.AttributeValue=[{value:''}]
              }
            }
            return item
          });
          this.set('purchaseAttributes',list)
        },
        deleteAttributePics(index ,name){
          let purchaseAttributes = this.get('purchaseAttributes');
          let list = purchaseAttributes.map(function(item){
            if(item.AttributeName==name){
              delete item.AttributeValue[index];
            }
            return item
          });
          this.set('purchaseAttributes',list)
        },
        getTableData(){
          let purchaseAttributesChecked = this.get('purchaseAttributesChecked');
          let num = 1;
          let stackTemp = [];
          purchaseAttributesChecked.map(function(item){
            if(item.AttributeValue){
              let list = [];
              let temp =[] ;
              item.AttributeValue.map(function(j){
                temp.push(j);
              })
              for(var i = 0,length = temp.length;i<length;i++){
                let obj = temp.pop();
                if(obj&&obj!='') {
                  let resultObj = {
                    name:item.AttributeName,
                    value:obj.value||obj
                  };
                  list.pushObject(resultObj);
                }
              }
              if(list.length>0)
              {
                stackTemp.push(list);
              }
            }
          });
          stackTemp.map(function(item){
            if(item.length>0){
              num = num*item.length
            }
          });
          function addChild(array1,array2){
            let result = [];
            for(var i=0,length1 = array1.length;i<length1;i++ ){
              for(var j =0,length2 = array2.length;j<length2;j++){
                if(array2[j] instanceof Array){
                  let temp = [];
                  array2[j].map(function(item){
                    temp.push(item)
                  });
                  temp.push(array1[i]);
                  result.pushObject(temp);
                }else {
                  result.push([array1[i],array2[j]])
                }
              }
            }
            return result
          }
          while(stackTemp.length>1){
            let obj1 = stackTemp.pop();
            let obj2 = stackTemp.pop();
            let temp = addChild(obj2,obj1);
            stackTemp.push(temp);
          }
          let stocks = this.get('seTableData')(stackTemp[0]);
          this.set('stocks',stocks);
          this.set('tableData',stackTemp[0])
        }
      }
    })


