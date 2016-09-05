import Ember from 'ember';

function _(s) {
  for (var k in s) {
    s[k.toUpperCase()] = s[k];
  }
  return s;
}

const block = _({
  address: 1,
  blockquote: 1,
  center: 1,
  dir: 1,
  div: 1,
  dl: 1,
  fieldset: 1,
  form: 1,
  h1: 1,
  h2: 1,
  h3: 1,
  h4: 1,
  h5: 1,
  h6: 1,
  hr: 1,
  isindex: 1,
  menu: 1,
  noframes: 1,
  ol: 1,
  p: 1,
  pre: 1,
  table: 1,
  ul: 1
});

//from ueditor
function getPlainText(html) {

  return html.replace(/<(p|div)[^>]*>(<br\/?>|&nbsp;)<\/\1>/gi, '\n')
    .replace(/<br\/?>/gi, '\n')
    .replace(/<[^>/]+>/g, '')
    .replace(/(\n)?<\/([^>]+)>/g, function (a, b, c) {
      return block[c] ? '\n' : b ? b : '';
    });
}

function getPlainHtml(el) {
  var noDivEl = [];
  el.children().each(function () {
    let c = $(this);
    if (!c.is('div')) {
      return noDivEl.push(c);
    }
    let v = c.html()
      .replace(/<(?!img)[^>]*>/gi, '');
    //.replace(/<(?!br)[^>]*>/gi, '');
    //.replace(/<\/[^(?!img)(?=br)].*[^>]*>/gi, '');
    c.html(v);
    c.removeAttr('class');
    c.removeAttr('style');
    c.find('img').each(function () {
      if (this.getAttribute('data-role') != 'emoji') {
        $(this).remove();
      }
    });
  });
  noDivEl.length && $('<div></div>').append(noDivEl).appendTo(el);
}

export default Ember.Component.extend({
  tools: Ember.inject.service(),
  classNames: ['emoji-textarea'],
  init(){
    this._super(...arguments);
    this.generateEmoji(1);
  },
  generateEmoji(page){
    let imgCollection = [];
    let max = 143;
    for (let i = 1; i <= 5; i++) {
      let row = [];
      for (let j = 1; j <= 9; j++) {
        let num = (page - 1) * 45 + 9 * (i - 1) + j;
        row.push({
          name: num <= max ? `ee_${num}` : ''
        });
      }
      imgCollection.push(row);
    }
    this.set('imgCollection', imgCollection);
  },
  didInsertElement(){
    let el = this.$();
    let content = el.find('.content');
    let that = this;
    //禁用粘贴
    content.on({
      'paste': function () {
        Ember.run.later(function () {
          getPlainHtml(content);
          content.trigger('valueChange');
        }, 100);
      },
      'valueChange': function () {
        let htmlStr = content.html();
        if (/\n/g.test(htmlStr[0])) {
          htmlStr = htmlStr.substr(1);
        }
        htmlStr = htmlStr.replace(/<img[^>]*src="[^>]*images\/emoji\/([^>]*)\.((png)|(gif))"[^>]*>/gim, '[e($1)e]');
        that.get('onChange')(getPlainText(htmlStr));
      },
      'input': function () {
        content.trigger('valueChange');
      },
      'focus keydown': function () {
        //fix first line
        if (content.html().trim() === '' || content.html().trim() === '<br>') {
          let $first = $('<div><br></div>').appendTo(content);
          //first focus
          let range = document.createRange();
          range.selectNodeContents($first.get(0));
          range.collapse(false);
          let sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    });

    this.set('contentEl', content);
    this.set('eventID', this.get('tools').guid());
    content.focus();

    let obj = {
      clear(){
        content.html('');
        content.trigger('valueChange');
      }
    };

    this.get('onInitial') && this.get('onInitial')(obj);
  },
  willDestroyElement(){
    this.get('contentEl').off();
  },
  actions: {
    //save range state
    saveRange(){
      let range = window.getSelection().getRangeAt(0);
      this.set('currentRange', range);
    },

    //clear range state when focus
    clearRange(){
      this.set('currentRange', null);
    },
    //mouse in
    enter(e){
      let el = Ember.$(e.target);
      let img = new Image();
      let name = el.data('name');
      $(img).on('load', function () {
        el.attr('src', `images/emoji/${name}.gif`);
      });
      img.src = `images/emoji/${name}.gif`;
    },

    //mouse out
    out(e){
      let el = Ember.$(e.target);
      let name = el.data('name');
      el.attr('src', `images/emoji/${name}.png`);
    },

    //insert
    insertImg(name, e){
      e.stopPropagation();
      if (!name)return;
      let range;
      if (this.get('currentRange')) {
        range = this.get('currentRange');
      }
      else {
        range = window.getSelection().getRangeAt(0);
      }
      range.deleteContents();
      if (/^\n$/i.test(this.get('contentEl').text())) {
        this.get('contentEl').find('br:eq(0)').remove();
      }
      var img = document.createElement('img');
      img.height = 25;
      img.width = 25;
      img.setAttribute('data-role', 'emoji');
      img.onerror = function () {
        if (img.src.indexOf('png') == -1) {
          img.src = `images/emoji/${name}.png`;
        }
      };
      img.src = `images/emoji/${name}.gif`;
      range.insertNode(img);
      range.setStartAfter(img);
      this.get('contentEl').trigger('valueChange');
    },
    pageChange(p, e){
      e.stopPropagation();
      this.generateEmoji(p);
      Ember.$(e.target).addClass('text-theme').siblings().removeClass('text-theme');
    }
  }
});
