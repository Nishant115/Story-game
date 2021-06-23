function Engine() {


  this.executeGameStep = function() {


    var cd = G.currentDialog;
    var td = G.tokenDialog;

    if (cd != td) {
      var fake = function(callback) {
        if (typeof(callback) == "function") {

          callback();
        }
      };

      var leaveDialog = fake;
      var leaveScene = fake;
      var beforeEnterScene = fake;
      var enterScene = fake;
      var enterDialog = fake;

      //raise leave dialog
      if (cd) {
        if (typeof(cd.leaveDialog) == "function") {
          leaveDialog = function(callback) {
            A.defaultLeaveDialog(function() {
              cd.leaveDialog(callback);
            });
          };
        } else {
          leaveDialog = A.defaultLeaveDialog;
        }
      }


      if (!cd || cd.scene != td.scene) {


        if (cd) {
          if (typeof(cd.scene.leaveScene) == "function") {
            leaveScene = function(callback) {
              A.defaultLeaveScene(function() {
                cd.scene.leaveScene(callback)
              });
            };
          } else {
            leaveScene = A.defaultLeaveScene;
          }
        }


        if (typeof(td.scene.beforeEnterScene) == "function")
          beforeEnterScene = td.scene.beforeEnterScene;


    
        if (typeof(td.scene.enterScene) == "function") {
        
          enterScene = function(callback) {
            P.loadScene(td, function() {
              td.scene.enterScene(callback);
            });
          };
        } else {
          enterScene = function(callback) {
            P.loadScene(td, callback);
          };
        }

      }

      
      if (cd && td.frame !== cd.frame) {
        enterDialog = function(callback) {
          P.panToFrame(td.frame, function() {
            if (typeof(td.enterDialog) == "function") {
              td.enterDialog(callback);
            } else {
              callback();
            }

          });
        };
      } else {
        if (typeof(td.enterDialog) == "function")
          enterDialog = td.enterDialog;
      }

    
      A.hidePlayerChoices();
      A.hidePlayerThinks();
      A.hidePlayerSays();
      A.hideNpcSays();
      A.hideSystemSays();
      A.hideMenu();

      //hide npc if not present on both dialogs
      if (cd && cd.npc && cd.npc != td.npc) {
        A.hideNpc();
      }

      if (cd && cd.id != td.id) log("leaving dialog: " + (cd ? cd.id : "empty"));
      leaveDialog(function() {

        if (cd && cd.scene.id != td.scene.id) log("leaving scene: " + (cd ? cd.scene.id : "empty"));
        leaveScene(function() {

          if (beforeEnterScene != fake)log("before entering scene: " + td.scene.id);
          beforeEnterScene(function() {

            if (!cd || cd.scene.id != td.scene.id) log("entering scene: " + td.scene.id);
            enterScene(function() {

              if (!cd || cd.id != td.id) log("entering dialog: " + td.id + " frame " + (td.frame ? td.frame : 0));
              $("#nav_compass").html(td.id);

              
              if (td.npc)
                A.showNpc(td.npc);


              enterDialog(function() {

                
                G.currentDialog = td;
                

                P.drawStage();

               
                if (typeof(td.action) == "function") {
                  log("executing action for dialog: " + td.id);
                  td.action();
                }

              });
            });
          });
        });
      });
    }
  };



  this.computeMenu = function(currentDialog) {
    var totMenu = {};
    // global menu
    if (G.menu) {
      var menu = G.menu();
      for (var i in menu) {
        var m = menu[i];
        totMenu[m[0]] = m;
      }
    }


    if (currentDialog.scene.menu) {
      var menu = currentDialog.scene.menu();
      for (var i in menu) {
        var m = menu[i];
        totMenu[m[0]] = m;
      }
    }


    if (currentDialog.menu) {
      var menu = currentDialog.menu();
      for (var i in menu) {
        var m = menu[i];
        totMenu[m[0]] = m;
      }
    }

    return(totMenu);
  };


  this.saveStatus = function(callback) {
    var req = { "CM":"SVSTS" ,STS:JSON.stringify(G.player),NPCS:JSON.stringify(G.npcs)};

    $.ajax({
      url: '/applications/adslife/game/ajaxController.jsp',
      dataType: 'json',
      data: req,
      type:"POST",

      success:  function(response) {
        if (response.ok) {
          if (typeof(callback) == "function")
            callback(response);
        }
      }
    });
  };


  this.loadPersistentStatus = function(callback) {

    var req = { "CM":"GETSTS"};
    $.getJSON('/applications/adslife/game/ajaxController.jsp', req, function(response) {
      if (response.ok) {

        if (response.status) {


          $.extend(G.npcs, response.status.npcs);
          delete response.status.npcs;

          $.extend(G.player, response.status);

          if (response.bids) {
            G.bids = new Object();
            for (var i in response.bids)
              G.bids[response.bids[i].id] = response.bids[i];
          }
          if (response.customers) {
            G.customers = new Object();
            for (var i in response.customers)
              G.customers[response.customers[i].id] = response.customers[i];
          }

          G.player.id = response.id;
          G.player.companyName = response.companyName;
          G.player.karma = response.karma;

        } else {
          log("Setting up new user game.");
        }
        if (typeof(callback) == "function") {
          callback(response);
        }
      }
    });
  };

  this.loadStatus = function(callback) {

    setupGame();
    this.loadPersistentStatus(callback);
  }

}

function i18n(lbl, param) {

  if (!lbl)
    return "";

  if (I18NLabels[lbl]) {
    lbl = I18NLabels[lbl];
  }

  var myregexp = /%(\S+)%/ig;
  var match = myregexp.exec(lbl);

  var ret = lbl;

  while (match != null) {
    var v = "";
    try {
      var v = eval(match[1].replace());
    } catch (e) {
    }

    ret = ret.replace(match[0], v);
    match = myregexp.exec(lbl);
  }

  ret = ret.replace("%%", param);

  return ret;
}




function loadGameFiles(gameFolder, language, cacheControl, callback) {


  G = new Game();


  $("head script[gameScript]").remove();


  var scripts = [];
  var scripton = "";
  $.ajax({
    async:false,
    url:gameFolder + "/gameFiles.json?_=" + cacheControl,
    dataType:"json",
    success:function(jss) {
      scripts = jss;
    }
  });


  scripts.push("i18n/" + language + ".js?_=" + cacheControl);


  var waitingFor = 0;
  var missingImages = 0;




  for (var i in scripts) {
    waitingFor++;



    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function () {

      waitingFor--;
    };
    script.onerror = function () {
      console.error("Error loading " + $(this).attr("src"));
      waitingFor--;
    };
    script.src = gameFolder + "/" + scripts[i] + "?_=" + cacheControl;
    document.getElementsByTagName('head')[0].appendChild(script);

    $(script).attr("gameScript", "yes");

  }



  $("body").everyTime(300, "startup", function() {



    if (waitingFor == 0) {
      $("body").stopTime("startup");

      function loadAsynch(scene) {
        var jqScene = $("<div>");
        G.parts[scene.id] = jqScene;

        $.ajax({
          url:gameFolder + "/" + scene.screen + "?_=" + cacheControl,
          dataType:"html",
          error:function(jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
            waitingFor--;
          },
          success:function(response) {
         ;
            waitingFor--;

      
            var myregexp = /"([a-zA-Z_0-9\/]+\.((jpg)|(png)|(gif)))"/ig;
            var match = myregexp.exec(response);
            while (match != null) {

              var img = match[1];
              missingImages++;
          
              $("<img>").load(function() {
                missingImages--;

               
              }).error(function() {
                missingImages--;
                
              }).attr("src", img);


              match = myregexp.exec(response);
            }
            jqScene.append(response);
          }
        });
      }

     
      for (var i in G.scenes) {
        var scene = G.scenes[i];
        
        waitingFor++;

        loadAsynch(scene);
      }

      
      $("body").everyTime(300, "startup", function() {
        

        if (waitingFor == 0) {
          $("body").stopTime("startup");

 
          $("body").everyTime(300, "startup", function() {
           

            if (missingImages == 0) {
              $("body").stopTime("startup");

              setupGame();

              $("#stage h1").remove();

              callback();
            }
          });
        }
      });
    }

  });

}





