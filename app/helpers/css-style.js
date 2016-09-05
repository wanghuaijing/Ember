import Ember from 'ember';

export function cssStyle(params/*, hash*/) {
  let style = '';
  for(let i = 0,length = params.length;i<length;i++){
    style = style + params[i]
  }
  return new Ember.String.htmlSafe(style);
}

export default Ember.Helper.helper(cssStyle);
