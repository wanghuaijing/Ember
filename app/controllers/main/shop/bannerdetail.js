/**
 * Created by whj on 2016/9/6.
 */
import Ember from 'ember';
import config from '../../../config/environment';
export default Ember.Controller.extend({
    http: Ember.inject.service(),
    queryParams: ['ID', 'type'],
    enum: Ember.inject.service(),
    isAdd: Ember.computed('type', function () {
        if (this.get('type') === 'add') {
            return true;
        }
        return false;
    }),
    bannerTypes:Ember.computed('enum.bannerType',function(){
        return this.get('enum').bannerType
    }),
    bannerInfo:{},
    searchString:'',
    load(){
        let id = this.get('ID');
        if(this.get('pageRequest')){
            this.get('pageRequest').request.abort()
        }
        let that = this;
        if(this.get('isAdd')){
            this.set('bannerInfo',{})
        }else {
            this.set('isLoading',true);
            this.get('http').request(`/Mall2/Banner/Admin?id=${id}`)
                .then(function(res){
                    let bannerInfo = res.Data[0];
                    console.log(bannerInfo);
                    that.set('bannerInfo',bannerInfo);
                    if(bannerInfo.Type=="商品"){
                        that.get('http')
                            .request(`/Mall2/Goods/Detail?id=${bannerInfo.Link}`)
                            .then(function(res){
                                that.set('searchString',res.Data.Name)
                            })
                            .catch(function(error) {
                                if (!error.abort) {
                                    that.get('messager').alert(error.msg);
                                }
                            })
                    }
                    that.set('isLoading',false)
                })
                .catch(function(error) {
                    if (!error.abort) {
                        that.get('messager').alert(error.msg);
                    }
                })
        }
    },
    actions:{
        bannerTypeChange(value){
            this.set('bannerInfo.Type',value);
        },
        showFullImage(src){
            window.open(src.replace(/&quality.+/g, ''));
        },
        fuzzySearch(){
            let searchString = this.get('searchString');
            let that = this;
          if(searchString.length>2){
              this.get('http').request(`/Mall2/Goods/Names?subName=${searchString}`)
                  .then(function(res){
                      let list = res.Data;
                      let result = [];
                      if(list){
                          result=list.map(function(item){
                              let obj = {};
                              obj.value=item.ID;
                              obj.name = item.Name;
                              return obj
                          });
                      }
                      console.log(result)
                      that.set('goodsList',result)
                  })
                  .catch(function(error){
                      console.log(error)
                  })
          }
        },
        goodsChange(value){
            let name = '';
            this.get('goodsList').some(function(item){
                if(item.value==value){
                    name = item.name;
                    return true
                }
            });
            this.set('searchString',name);
            this.set('bannerInfo.Link',value)
        },
        toggleMerchantPicUploadDialog(value){
            this.set('isShowImg',value)
        },
        merchantPicUploaded(value){
            this.set('bannerInfo.Image',value)
        },
        goBack(){
            window.history.go(-1);
        },
        submit(){
            let that = this;
            this.set('isSubmiting',true);
            let id = this.get('ID');
            let banner = this.get('bannerInfo');
            let url = `/Mall2/Banner?id=${id}`;
            if(this.get('isAdd')){
                url = `/Mall2/Banner`
            }
            this.get('http').request(url,{
                type: that.get('isAdd') ? 'post' : 'put',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(banner)
            }).then(function(res){
                that.get('messager').alert('操作成功');
                if (that.get('isAdd')) {
                    window.history.go(-1);
                }
            }).catch(function(error){
                if (!error.abort) {
                    that.get('messager').alert(error.msg);
                }
            }).finally(()=>{
                this.set('isSubmiting',false)
            });
        },
        reset(){
            this.set('bannerInfo', {})
        }
    }

})