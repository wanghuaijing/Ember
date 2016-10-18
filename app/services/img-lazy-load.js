import Ember from 'ember';

export default Ember.Service.extend({
    loadImage(val,cb){
        var img = new Image();
        var $img = Ember.$(img)
        $img.on('load',function () {
            cb&&cb();
            $img.off('error load');
            $img = null;
            img = null;
        });
        $img.one('error',function(){
            img.src = val;
        });
        img.src=val
    }
});
