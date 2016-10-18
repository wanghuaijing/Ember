import Ember from 'ember';

export default Ember.Component.extend({
  id: null,
  didInsertElement(){
    let textArea = this.$().find('textarea').get(0);
    textArea.id = 'textarea' + parseInt(Math.random() * 100000);
    KindEditor.options.cssData = 'body { font-size: 16px; }';
    this.set('id', textArea.id);
    var editor = KindEditor.create('#' + textArea.id, {
      allowFileManager: true,
      items: [
        'source', '|', 'undo', 'redo', '|', 'preview', 'print', 'template', 'code', 'cut', 'copy', 'paste',
        'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
        'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
        'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
        'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
        'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'table', 'hr', 'emoticons', 
        'baidumap', 'pagebreak', 'anchor', 'link', 'unlink'
      ],

    });

    this.get('onInit')(editor);
    editor.appendHtml(this.get('initialData'));
    console.log(Ember.$('#'+textArea.id).get(0));
  },
  willDestroyElement(){
    KindEditor.remove('#' + this.get('id'));
  }
});
