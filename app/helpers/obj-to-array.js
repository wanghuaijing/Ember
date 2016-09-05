import Ember from 'ember';

export function objToArray(params/*, hash*/) {
  let result = [];
  for(var key in params[0]){
    result.push(params[0][key])
  };
  return result;
}

export default Ember.Helper.helper(objToArray);
