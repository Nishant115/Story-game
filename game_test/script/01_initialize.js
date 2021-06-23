function setupGame(){

 
  G.player=new Player(1,"Jackie Dummer");
  G.player.money=200;
  G.player.alcohol=0;
  G.player.karma=5;

  G.menu=function(){return [["MN_QUIT",G.dialogs.introQuitGame],["MN_OPTIONS",G.dialogs.introPlayerOptions]];};


  G.player.tokenDialogId=G.dialogs.intro.id;

}