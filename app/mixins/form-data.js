/**
 * Created by whj on 2016/9/20.
 */
import Ember from 'ember';
export default Ember.Mixin.create({
    //验证属性对象的数组
    formDataList :[],
    //验证规则
    enumRule:{
        EXIST:function(value){
            let result = false;
            switch (true){
                case value instanceof Object:
                    for(var i in value){
                        result = !0;
                    }
                    break;
                case !(value instanceof Object):
                    value&&(result=true);
                    break;
            }
            return result
        },
        LENGTH:function(value,rule){
            let result = false;
            switch (true){
                case value instanceof Array:
                    if(value.length<rule[1]&&value.length>rule[0]){
                        result = true;
                    }
                    break;
                case value instanceof String:
                    var string = value.split('|');
                    if(string.length>1){
                        if(string.length<rule[1]&&string.length>rule[0]){
                            result = true;
                        }
                    }else {
                        if(value.length<rule[1]&&value.length>rule[0]){
                            result = true;
                        }
                    };
                    break;
                case typeof value == 'number':
                    var stringN = value.toString(10);
                    if(stringN.length<rule[1]&&stringN.length>rule[0]){
                        result = true;
                    }
            }
            return result;
        }
    },
    /*createFakeData(obj){
        for(var i in obj){
            if(obj[i].type=='exist'){
                obj[i].result = this.get('enumRule').EXIST(obj[i].value);
            }else if(obj[i].type=="length"){
                obj.result = this.get('enumRule').LENGTH(obj[i],value,obj[i].rule)
            }else {
                obj.result = true;
            }
            if(obj[i].value instanceof Object){
                if(!(obj[i].value instanceof Array)){
                    createFakeData.call(this,obj[i].value)
                }else {

                }
            }
        }

    },*/
    //查找对应的数组
    getValue(name){
        let fakeData= this.get('formDataList')
        let stringName = String(name);
        if(fakeData){
            return fakeData.findBy('name',stringName)
        }
        return 0
    },
    //创建查找的对象
    createData(name,val,type,rule){
        let getResult = null;
        if(type=='exist'){
            getResult = function(that){
                that.get('enumRule').EXIST(that.value)
            };
            //getResult=this.get('enumRule').EXIST;
        }else if(type=='length'){
            getResult = function(that){
                that.get('enumRule').LENGTH(that,value,that.rule)
            }
            //getResult = this.get('enumRule').LENGTH;
        }
        let o = Ember.Object.create({
            name:name,
            type:getResult,
            rule:rule,
            value:val
        });
        return o;
    },
    //添加入验证数组
    addObj(name,val,type,rule){
        let obj = this.get('createData')(name,val,type,rule)
        let formDataList = this.get('formDataList');
        formDataList.push(obj);
        this.set('formDataList',formDataList);
    },
    //获得单个验证结果
    getResult(name){
        let formDataList = this.get('formDataList');
        let nameString = String(name);
        let obj = formDataList.findBy('name',nameString);
        let result = obj.get('type')(this);
        return result
    },
    //验证整个列表
    getListResult(){
        let formDataList = this.get('formDataList');
        let resultList = [];
        let that= this;
        formDataList.filter(function(item){
            let result =item.get('type')(that);
            let o = {
                name:item.get('name'),
                result: result
            };
            resultList.push(o);
        });
        return resultList;
    }
    
})