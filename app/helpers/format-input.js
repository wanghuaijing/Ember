import Ember from 'ember';

export function formatInput(params) {
  function IsNum(s)
  {
    if(s!=null){
      var reg = new RegExp("^[0-9]*$");
      console.log(reg.test(s))
      return reg.test(s)
    }
  }
  switch (params[1]){
    case 'num':
          if(!IsNum(params[0])){
            let arrays = params[0].toString().split('');
            arrays.pop();
            console.log(arrays)
            let strings = arrays.join('');
            return strings
          }else {
            return params[0]
          }
          break;

  }
}

export default Ember.Helper.helper(formatInput);
