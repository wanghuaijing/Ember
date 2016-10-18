/**
 * simple date picker
 * created by qizhang.yang at 2016/4/28
 */
import Ember from 'ember';

let copyDate = function (date) {
  if (!(typeof date === 'date')) {
    date = new Date(date);
  }
  return new Date(date.getTime());
};
let fixZero = function(num, n){
  return (Array(n).join(0) + num).slice(-n);
};
let isSameDate = function (d1, d2) {
  if (d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()) {
    return true;
  }
  return false;
};

let formatDate = function (date) {
  if (!(typeof date === 'date')) {
    date = new Date(date);
  }
  return [date.getFullYear(), (date.getMonth() + 1), date.getDate()].join('-')
      +" "+[fixZero(date.getHours(),2),fixZero(date.getMinutes(),2)].join(':')+':'
      +fixZero(date.getSeconds(),2);
};

export default Ember.Component.extend({
  classNames: ["drop-down", "date-picker"],
  value: new Date(),
  dateValue: null,
  checkDateValue(){
    let date = new Date(this.get('dateValue'));
    if (date instanceof Date && !isNaN(date.valueOf())) {
      this.set('dateValue', formatDate(date));
    }
    else {
      this.set('dateValue', '');
    }
  },
  init(){
    this._super(...arguments);
    if(this.get('dateValue') !== null){
      this.checkDateValue();
    }
  },
  didInsertElement(){
    let that = this;
    this.$('.datepicker-input').on('blur', function () {
      that.checkDateValue();
    });
  },
  willDestroyElement(){
    this.$('.datepicker-input').off('blur');
  },
  currentYear: Ember.computed('value', function () {
    if (!this.get('value')) {
      return;
    }
    return this.get('value').getFullYear();
  }),
  currentMonth: Ember.computed('value', function () {
    if (!this.get('value')) {
      return;
    }
    return this.get('value').getMonth() + 1;
  }),
  showDates: Ember.computed('value', function () {
    if (!this.get('value')) {
      return;
    }
    let now = copyDate(this.get('value'));
    let dateOfMonthEnd = new Date(new Date(now.setMonth(now.getMonth() + 1)).setDate(0));
    now = copyDate(this.get('value'));
    let dateOfLastMonthEnd = new Date(now.setDate(0));


    let dateArray = [];
    let dayOfLastMonthEnd = dateOfLastMonthEnd.getDay();
    let datOfLastMonthEnd = dateOfLastMonthEnd.getDate();
    for (let i = dayOfLastMonthEnd; i >= 0; i--) {
      dateArray.push({
        text: datOfLastMonthEnd - i,
        timeStamp: new Date(dateOfLastMonthEnd.getTime()).setDate(datOfLastMonthEnd - i)
      });
    }

    for (let i = 1, d = dateOfMonthEnd.getDate(); i <= d; i++) {
      dateArray.push({
        text: i,
        thisMonth: true,
        timeStamp: new Date(dateOfMonthEnd.getTime()).setDate(i)
      });
    }

    now = copyDate(this.get('value'));
    let dateOfNextMonth = new Date(new Date(now.setMonth(now.getMonth() + 1)).setDate(1));
    for (let i = 1, l = dateArray.length; i <= 42 - l; i++) {
      dateArray.push({
        text: i,
        timeStamp: new Date(dateOfNextMonth.getTime()).setDate(i)
      });
    }

    let arranged = [];
    let temp = [];
    for (let i = 1, l = dateArray.length; i <= l; i++) {
      if (isSameDate(new Date(dateArray[i - 1].timeStamp), new Date(this.get('dateValue')))) {
        dateArray[i - 1].active = true;
      }
      temp.push(dateArray[i - 1]);
      if (i % 7 === 0) {
        arranged.push(temp);
        temp = [];
      }
    }
    return arranged;
  }),
  currentTime:Ember.computed('value',function(){
    if(!this.get('value')){
      return;
    }
    return fixZero(this.get('value').getHours(),2)+':'+fixZero(this.get('value').getMinutes(),2)
  }),
  currentSecond:Ember.computed('value',function(){
    if(!this.get('value')){
      return;
    }
    return fixZero(this.get('value').getSeconds(),2)
  }),
  actions: {
    dateTimeChange(val, e){
      let date = new Date(val);
      this.$('td').removeClass('active');
      Ember.$(e.target).parent().addClass('active');
      this.set('dateValue', formatDate(date));
    },
    cancelPropagation(e){
      e.stopPropagation();
    },
    addYear(val){
      let date = copyDate(this.get('value'));
      this.set('value', new Date(date.setFullYear(date.getFullYear() + val)));
    },
    addMonth(val){
      let date = copyDate(this.get('value'));
      let monthValue = date.getMonth();
      let newStamp;
      if (monthValue === 0 && val === -1) {
        newStamp = date.setFullYear(date.getFullYear() - 1, 11);
      }
      else if (monthValue === 11 && val === 1) {
        newStamp = date.setFullYear(date.getFullYear() + 1, 1);
      }
      else {
        newStamp = date.setMonth(date.getMonth() + val);
      }
      this.set('value', new Date(newStamp));
    },
    pickerOpen(){
      //打开时复位日期视图
      if (this.get('dateValue')) {
        this.set('value', new Date(this.get('dateValue')));
      }
      else {
        this.set('value', new Date());
      }
    },
    inputChange(e){
      let date = copyDate(this.get('value'));
      let result = new Date();
      if(e.target.value){
        let value = e.target.value.split(':');
        result = new Date(date.setHours(value[0]));
        result = new Date(result.setMinutes(value[1]));
      }else {
        result = new Date(date.setHours('00'));
        result = new Date(date.setMinutes('00'))
      }
      this.set('dateValue', formatDate(result));
    },
    secondChange(e){
      let date = copyDate(this.get('value'));
      let result = new Date();
      if(e.target.value){
        let value = fixZero(e.target.value,2);
        result = new Date(date.setSeconds(value));
      }else {
        result = new Date(date.setSeconds('00'));
      }
      this.set('dateValue', formatDate(result));
    }
  }
});
