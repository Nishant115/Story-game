$.fn.loadTemplates = function() {
  $.JST.loadTemplates($(this));
  return this;
};

$.JST = {
  _templates: new Object(),
  _decorators:new Object(),

  loadTemplates: function(elems) {
    elems.each(function() {
      $(this).find(".__template__").each(function() {
        try {
          var tmpl = $(this);
          var type = tmpl.attr("type");

      
          if (tmpl.get(0).firstChild.nodeType == 8) 
            var templateBody = tmpl.get(0).firstChild.nodeValue; 
          else
            var templateBody = tmpl.html(); 

          if (!templateBody.match(/##\w+##/)) { 
            var strFunc =
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +
                    "with(obj){p.push('" +
                    templateBody.replace(/[\r\t\n]/g, " ")
                            .replace(/'(?=[^#]*#\))/g, "\t")
                            .split("'").join("\\'")
                            .split("\t").join("'")
                            .replace(/\(#=(.+?)#\)/g, "',$1,'")
                            .split("(#").join("');")
                            .split("#)").join("p.push('")
                            + "');}return p.join('');";

            $.JST._templates[type] = new Function("obj", strFunc);

          } else { 
            $.JST._templates[type] = templateBody;
          }

          tmpl.remove();
        } catch (e) {
          console.error("JST error: "+e.message);
        }

      });
    });
  },

  createFromTemplate: function(jsonData, template) {
    var templates = $.JST._templates;

    function fillStripData(strip, data) {
      for (var prop in data) {
        var value = data[prop];
        strip = strip.replace(new RegExp("##" + prop + "##", "gi"), value);
      }

      strip = strip.replace(new RegExp("##\\w+##", "gi"), "");
      return strip;
    }

    var stripString = "";
    if (typeof(template) == "undefined") {
      console.error("Template is required");
      stripString = "<div>Template is required</div>";

    } else if (typeof(templates[template]) == "function") { 
      try {
        stripString = templates[template](jsonData);
      } catch (e) {
        console.error("JST error on template '"+template+"': "+e.message,jsonData);
        stripString = "<div> ERROR on template '"+template+"': " + e.message + "</div>";
      }

    } else {
      stripString = templates[template];
      if (!stripString || stripString.trim() == "") {
        console.error("No template found for type '" + template + "'",jsonData);
        return $("<div>");

      } else {
        stripString = fillStripData(stripString, jsonData); 
      }
    }

    var ret = $(stripString);
    ret.attr("__template", template);


    var dec = $.JST._decorators[template];
    if (typeof (dec) == "function")
      dec(ret, jsonData);

    return ret;
  },


  existsTemplate: function(template) {
    return $.JST._templates[template];
  },

  loadDecorator:function(template, decorator) {
    $.JST._decorators[template] = decorator;
  },

  decorateTemplate:function(element) {
    var dec = $.JST._decorators[element.attr("__template")];
    if (typeof (dec) == "function")
      dec(editor);
  },


  ajaxLoadAsynchTemplates: function(templateUrl, callback) {

    $.get(templateUrl, function(data) {

      var div = $("<div>");
      div.html(data);

      $.JST.loadTemplates(div);

      if (typeof(callback == "function"))
        callback();
    });
  },

  ajaxLoadTemplates: function(templateUrl) {
    $.ajax({
      async:false,
      url: templateUrl,
      dataType: "text",
      success: function(data) {
        var div = $("<div>");
        div.html(data);
        $.JST.loadTemplates(div);
      }
    });

  }


};
