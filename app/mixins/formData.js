/**
 * Created by whj on 2016/9/20.
 */
import Ember from 'ember';
export default Ember.Mixin.create({
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
                    
            }
        }
    }
})