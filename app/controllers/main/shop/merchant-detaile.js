/**
 * Created by whj on 2016/9/1.
 */
import Ember from 'ember';
import config from '../../../config/environment';
import formData from '../../../mixins/form-data'
export default Ember.Controller.extend(formData,{
    http: Ember.inject.service(),
    queryParams: ['ID', 'type'],
    isAdd: Ember.computed('type', function () {
        if (this.get('type') === 'add') {
            return true;
        }
        return false;
    }),
    rules:[{name:'Name', type:'exist'}, {name:'Phone',type:'exist',rule:[10,11]}],
    merchantCheckInit(rules,values){
        rules.forEach((item)=>{
            this.get('addObj')(values[item.name],item)
        })
    },
    checkValue(rules,values){
        let result = this.get('getListResult');
        console.log(result)
    },
    load(){
        console.log(this)
        let id = this.get('ID');
        if(this.get('pageRequest')){
            this.get('pageRequest').request.abort()
        }
        let that = this;
        if(this.get('isAdd')){
         this.set('merchantInfo',{})
        }else {
            this.set('isLoading',true)
            this.get('http').request(`/Mall2/Shop?id=${id}`)
                .then(function(res){
                    let merchantInfo = res.Data;
                    that.set('merchantInfo',merchantInfo);
                    that.set('isLoading',false);
                })
                .catch(function(error) {
                    console.log(error)
                    if (!error.abort) {
                        that.get('messager').alert(error.msg);
                    }
                })
        }
    },
    actions:{
        showFullImage(src){
            window.open(src.replace(/&quality.+/g, ''));
        },
        toggleMerchantPicUploadDialog(value){
            this.set('isShowImg',value)
        },
        merchantPicUploaded(value){
            this.set('merchantInfo.Image',value)
        },
        goBack(){
            window.history.go(-1);
        },
        submit(){
            let that = this;
            this.set('isSubmiting',true);
            let id = this.get('ID');
            let merchant = this.get('merchantInfo');
            let url = `/Mall2/Shop?id=${id}`;
            if(this.get('isAdd')){
                url = `/Mall2/Shop`
            }
            this.get('http').request(url,{
                type: that.get('isAdd') ? 'post' : 'put',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(merchant)
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
        initChecked(){
            let rules = this.get('rules');

        },
        reset(){
            this.set('merchantInfo', {})
        }
    }

})