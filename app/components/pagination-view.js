import Ember from 'ember';

function computePage(current, total, show) {
  let arr = [];
  if (total <= show) {
    for (let i = 1; i <= total; i++) {
      arr.push({
        view: i,
        val: i
      });
    }
  }
  else {
    if (current >= total - show / 2) {
      arr.push({
        view: 1,
        val: 1
      });

      let first = total - show + 1;
      for (let i = first; i <= total; i++) {
        arr.push({
          view: i === first ? '...' : i,
          val: i
        });
      }
    }

    else if (current <= parseInt(show / 2)) {
      for (let i = 1; i <= show - 1; i++) {
        arr.push({
          view: i,
          val: i
        });
      }
      arr.push({
        view: '...',
        val: show
      });
      arr.push({
        view: total,
        val: total
      });
    }

    else {
      let off = parseInt(show / 2) - 1;
      arr.push({
        view: 1,
        val: 1
      });
      arr.push({
        view: '...',
        val: current - off - 1
      });
      for (let i = -off; i <= off; i++) {
        arr.push({
          view: current + i,
          val: current + i
        });
      }
      arr.push({
        view: '...',
        val: current + off + 1
      });
      arr.push({
        view: total,
        val: total
      });
    }
  }

  return arr;
}

export default Ember.Component.extend({
  classNameBindings: ['classes'],
  classes: 'pagination',
  items: Ember.computed('current', 'total', function () {
    const current = this.get('current');
    const total = this.get('total');
    const show = 5;
    let result = computePage(current, total, show);

    result.forEach(function (item) {
      if (item.val === current) {
        item.isActive = true;
      }
    });
    return result;
  }),
  actions: {
    pageChange(p){
      this.get('onChange')(p);
    }
  }
});
