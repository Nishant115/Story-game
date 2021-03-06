function Painters() {

 
  this.goto = function(newDialog) {
    log($("<div>").addClass("moving").html("going to dialog: " + newDialog.id));
  };


  this.systemSays = function(sentence, callback, modal) {
    var div = $("<div>").addClass("systemSays");
    div.append("System:<ul><li>"+i18n(sentence)+"</li></ul>");
    log(div,callback);
  };

  this.hideSystemSays = function () {
  };


  
  this.npcSays = function(npc, sentence, callback, modal) {
    var div = $("<div>").addClass("npcSays");
    div.append(npc.name+" says:");
    div.append( "<br>- " + i18n(sentence));
    log(div,callback);
  };

  this.hideNpcSays = function () {
  };

  this.showNpc = function (npc) {
  };

  this.hideNpc = function () {
  };



  this.playerThinks = function(sentence, callback) {
    var div = $("<div>").addClass("playerThinks");
    div.append(G.player.name + " thinks<ul><li>" + i18n(sentence) + "</li></ul>");
    log(div,callback);
  };

  this.hidePlayerThinks = function () {
  };



  /**
   *
   * @param choices  
   */
  this.showPlayerChoices = function(choices) {
    var extdiv = $("<div>").addClass("playerChoices");
    extdiv.append("Choose:");
    var div=$("<ul>");
    extdiv.append(div);
    for (var i in choices) {
      var ch = choices[i];
      var d = $("<li>");

      if (ch[1]) {
        d.addClass("link");
        d.data("menuChoice", ch).click(function() {

          var lch = $(this).data("menuChoice");

          if (typeof(lch[1]) == "function") {
            if (lch.length > 2)
              lch[1](lch[2]);
            else
              lch[1]();
          } else {
            A.goto(lch[1]);
          }

        });
      } else {
        d = $("<span>");
        d.addClass("playerChoicesTitle missing");
      }
      d.html(i18n(ch[0]));
      div.append(d);
    }

    log(extdiv);
  };

  this.hidePlayerChoices = function() {
  };

  this.hideMenu = function() {
  };



  this.showAnimation = function(animationName, params, callback) {
    if (eval("!(typeof("+animationName+")=='function')")) {
      log("<h4 class='missing'>Missing animation: " + animationName ,callback);
    } else {
      log("Showing animation: " + animationName + " " + JSON.stringify(params),callback);
    }
  };


  this.playerSays = function(sentence, callback, modal) {
    var div = $("<div>").addClass("playerSays");
    div.append(G.player.name+" says"+(modal?" (modal):":":")+"<br>"+i18n(sentence));

    log(div,callback);
  };

  this.hidePlayerSays = function () {

  };

  this.drawStage = function() {
  
    this.drawPlayerStatus();
    this.drawMenu();


    $("#currentDialog").html(G.currentDialog.id);
    $("#currentScene").html(G.currentDialog.scene.id);
    $("#currentFrame").html(G.currentDialog.frame?G.currentDialog.frame:0);


  };

 
  /**
   *
   * @param menu entry  
   */

  this.drawMenu = function() {

    var div = $("#menu");
    P.emulatorDrawMenu(div,G.currentDialog,A.goto);
  };

  this.emulatorDrawMenu = function(div,currentDialog,gotoFunction) {
    var totMenu = E.computeMenu(currentDialog);

    div.empty();
    for (var i in totMenu) {
      var ch = totMenu[i];
    


      if (ch.length > 1) { 

        var missingMenu=false;
        if(!G.parts[currentDialog.id] || G.parts[currentDialog.id].find("#"+ch[0]).size()<=0)
          missingMenu=true;

        var d = $("<span>");
        d.addClass("menuVoice link");
        if (missingMenu)
          d.addClass("missingMenuObject");

        d.html(i18n(ch[0]));


        if (typeof(ch[1]) == "undefined") {
          d.addClass("missingDialog");
        } else if (typeof(ch[1]) != "function") {

          d.attr("dialogId", ch[1].id).unbind("click").click(function() {
            gotoFunction($(this).attr("dialogId"));
          });
        } else if (typeof(ch[1]) == "function") {
          if (ch.length > 2)
            d.data("params", ch);

          d.click(function() {
            var ch = $(this).data("params");

            if (ch.length > 2)
              ch[1](ch[2]);
            else
              ch[1]();
          });
        } else {
          d.addClass("missing");
        }

        div.append(d);
      }
    }
  };


  this.drawPlayerStatus = function() {

    var slp = $("#playerStatus");
    slp.empty();

    slp.append($.JST.createFromTemplate(G, "playerViewer"));

    for (var np in G.npcs) {
      slp.append($.JST.createFromTemplate(G.npcs[np], "npcViewer"));
    }


  };


  this.loadScene = function(dialog, callback) {
    log($("<div>").addClass("moving").html("loading scene: " + dialog.scene.screen),callback);
  };

  this.panToFrame = function (frameIndex, callback) {
    frameIndex = !frameIndex ? 0 : frameIndex;
    log("panning to frame:" + frameIndex);
    if (callback)
      callback();
  };

  this.expose = function (elementId) {
    log("exposing: " + elementId);
  };


  this.defaultLeaveScene = function(callback) {
    callback();
  };

  this.defaultLeaveDialog = function(callback) {

    callback();
  };




  log = function (el,callback) {
    var jqEl=el;
    if (typeof(el)=="string"){
      jqEl=$("<div>").html(el);
    }
    jqEl.hide();
    $("#log").prepend("<hr>").prepend(jqEl);
    jqEl.fadeIn(1500,callback);
  };

  function getFunctionName(funct) {
    var ownName = funct.toString();
    ownName = ownName.substr('function '.length);      
    ownName = ownName.substr(0, ownName.indexOf('('));     
    return ownName;
  }


}

