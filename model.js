var G = new Game();
var E = new Engine();
var P = new Painters();
var A = new Actions();


function Player(id, name) {
  this.id = id;
  this.name = name;
  this.money = 500;
  this.karma = 0;  
}

function Npc(id, name) {
  this.id = id;
  this.name = name;
  this.money = 500;
  this.karma = 50;
}



function History(date, content) {
  this.date = date;
  this.content = content;
}

function Game() {

  this.player = new Player(0, "");
  this.npcs = new Object();

  
  this.scenes = new Object();
  this.dialogs = new Object();

  
  this.parts = new Object();

 
  this.masterVolume=50; // from 0 to 100


  this.readingTimePerChar = 55;



}


