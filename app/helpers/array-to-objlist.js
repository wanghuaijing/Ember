import Ember from 'ember';

export function arrayToObjlist(params/*, hash*/) {
  let array = params[0];
  let result = array.map(function (item) {
    if(item.constructor!= Object){
      item = {
        value:item
      };
    }
    return item;
  });
  return result

}

export default Ember.Helper.helper(arrayToObjlist);
