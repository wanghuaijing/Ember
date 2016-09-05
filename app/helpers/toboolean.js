import Ember from 'ember';

export function toboolean(params/*, hash*/) {
  if(params[0]=='true'){
    return true
  }else{
    return false
  }
}

export default Ember.Helper.helper(toboolean);
