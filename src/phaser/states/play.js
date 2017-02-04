// Play game state
import Phaser from '../../../public/phaser.min.js';
import io from 'socket.io-client';
import axios from 'axios';
import _ from 'lodash';

import EnemyPlayer from '../EnemyPlayer';
import LocalPlayer from '../LocalPlayer';

// Importing Visual Assets
import land from '../assets/images/earth.png';
import meat from '../assets/images/food.png';
import silver from '../assets/images/silver.png';
import werewolf from '../assets/images/werewolf.png';
import human from '../assets/images/human.png';
import walls from '../assets/images/walls.png'

// Importing Audio Assets
import humanAnvil from '../assets/audio/anvil.wav';
import wolfChomp from '../assets/audio/chomp.mp3';
import humanBlade from '../assets/audio/blade.mp3';
import wolfHowl from '../assets/audio/howl.mp3';
import soundTrack from '../assets/audio/hauntedhouse.mp3';
import sprintIcon from '../assets/images/sprint.png';



// Play class is the Play state for phaser.
// This is where the actual game play occurs.
export default class Play extends window.Phaser.State {
  // set up initial values for class properties
  constructor() {
    super();

    this.me = null;
    this.enemy = null;
    this.land = null;
    this.meatObj = {};
    this.silverObj = {};
    this.wallObj = {};
    this.squareSize = 15;
    this.score = 0;
    this.speed = 0;
    this.updateDelay = 0;
    this.direction = 'right';
    this.newDirection = null;
    this.cursors = null;
    this.sprintKey = null;
    this.sprintCooldown = false;
    this.sprintOn = false;
    this.scoreTextValue = null;
    this.textStyleKey = {};
    this.textStyleValue = {};
    this.socket = null;
    this.humanAnvilSfx = null;
    this.wolfChompSfx = null;
    this.wolfHowlSfx = null;
    this.humanBladeSfx = null;
    this.soundTrack = null;
    this.sprintIcon = null;
    this.pad1 = null;
  }

  // preload is a method used by Phaser states.
  // It preloads all the Phaser assets for that state.
  // In this case, we are loading the background image
  // and sprites that will be used for the game.
  preload() {
    this.game.load.image('land', land);
    this.game.load.image('walls', walls, 20, 20); //load walls
    this.game.load.spritesheet('werewolf', werewolf, 46, 46); // 46x46 is perfect
    this.game.load.spritesheet('meat', meat, 16, 17); // load meat sprite
    this.game.load.spritesheet('silver', silver, 37, 35); // load silver sprite
    this.game.load.spritesheet('human', human, 29, 31);
    
    this.game.load.audio('humanAnvil', humanAnvil);
    this.game.load.audio('wolfChomp', wolfChomp);
    this.game.load.audio('wolfHowl', wolfHowl);
    this.game.load.audio('humanBlade', humanBlade);
    this.game.load.audio('soundTrack', soundTrack);

    this.game.load.image('sprintIcon', sprintIcon);
  }

  // create is also a method used by Phaser states.
  // It creates the game state. Here we actually create the
  // resources that we loaded in preload.

  create() {

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    // set the world bounds (startx, starty, endx, endy)
    this.game.world.setBounds(0, 0, 1200, 600);

    // show the image 'land' as the background across field
    this.land = this.game.add.tileSprite(0, 0, 1200, 600, 'land');

    //this.wall = this.game.add.sprite(randomX, randomY, 'walls');

    // show the image 'sprint' to illustrate when the ability is ready and when its on cooldown (add x whenever space is pressed and ability is still on cooldown)
    // this.game.add.tileSprite(30, 45, 64, 64, 'sprintIcon');
    this.sprintIcon = this.game.add.sprite(30, 45, 'sprintIcon');


    // create an input controller to listen for keydown events
    this.cursors = this.game.input.keyboard.createCursorKeys();

    // create an input controller for listening for a keydown event on the space bar
    this.sprintKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //  Stop the following keys from propagating up to the browser
    this.game.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.SPACEBAR ]);

    // To listen to buttons from a specific pad listen directly on that pad game.input.gamepad.padX, where X = pad 1-4
    this.game.input.gamepad.start();
    this.pad1 = this.game.input.gamepad.pad1;

    // initiate socket connection
    this.socket = io.connect();

    // styles used for score and score text
    this.textStyleKey = {
      font: 'bold 14px sans-serif',
      fill: '#46c0f9',
      align: 'center'
    };
    this.textStyleValue = {
      font: 'bold 18px sans-serif',
      fill: '#fff',
      align: 'center'
    };


    //Audio Files
    this.humanAnvilSfx = this.game.add.audio('humanAnvil');
    this.wolfChompSfx = this.game.add.audio('wolfChomp');
    this.wolfHowlSfx = this.game.add.audio('wolfHowl');
    this.humanBladeSfx = this.game.add.audio('humanBlade');
    this.soundTrack = this.game.add.audio('soundTrack')
    this.game.sound.stopAll();
    this.soundTrack.play();


    // Score and score text
    this.game.add.text(30, 20, 'SCORE', this.textStyleKey);
    this.scoreTextValue = this.game.add.text(
      90, 18, this.score.toString(), this.textStyleValue
    );

    // create the local player model and sprite
    this.addLocalPlayer();

    // set the socket event handlers
    this.setEventHandlers();

    // create the walls 
    this.generateWall();

    // send the socket event 'disconnect' on reload
    window.addEventListener("beforeunload", () => {
      this.socket.emit('disconnect');

    //start the soundtrack  
    });

    // this.sprint = function() {
    //   console.log('sprint has been activated');

    //   this.speed *= 3;
    //   this.sprintOn = true;
    //   var context = this;

    //   this.game.time.events.add(Phaser.Timer.SECOND * 3, function() { //these are buidling up
    //     console.log('3 seconds have elasped. this.speed =', context.speed);
    //     // context.speed /= 4;
    //     context.sprintOn = false;
    //   });
    // };

    // this.sprint = _.debounce(this.sprint, 2000);






  }

  // update is a method that every Phaser play state has.
  // It is called about 60 times per second by phaser.
  update() {
    // this.game.physics.arcade.collide(this.silver, this.wall);
    // this.game.physics.arcade.collide(this.me.player, this.wall);
    
    if (this.me) {
      // set speed if one of the arrow keys is down
      if (
        this.cursors.right.isDown || this.cursors.left.isDown ||
        this.cursors.up.isDown || this.cursors.down.isDown
      ) {
        this.speed = 2;
      } else {
        this.speed = 0;
      }

      // if (this.sprintCooldown) {
      //     // this.game.add.tween(sprintIcon).to( { alpha: .15 }, 0, Phaser.Easing.Linear.None, true);
      //     this.sprintIcon
      // }


      if (!this.sprintOn) { // proceeds only if sprint is off
        // console.log('sprint is OFF');
        // console.log('speed without sprint is:', this.speed);
        if (this.sprintKey.isDown && !this.sprintCooldown) { // proceeds only if the player hits the space bar
          // console.log('turning sprint on');

          this.speed *= 3;
          this.sprintOn = true;
          this.sprintIcon.alpha = 0.15;
          var context = this;

          this.game.time.events.add(Phaser.Timer.SECOND * 3, function() { //these are buidling up
            // console.log('3 seconds have elasped. this.speed =', context.speed);
            context.sprintOn = false;
            context.sprintCooldown = true;
            context.game.add.tween(context.sprintIcon).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true);
            context.game.time.events.add(Phaser.Timer.SECOND * 2, function() {
              context.sprintCooldown = false;
              
            });
          });
        }
      } else { // sprint is on
        // console.log('sprint is ON');
        this.sprintIcon.alpha = 0.15;
        this.speed *= 3;
        // console.log('speed with sprint on is:', this.speed);
      }

      // this.game.time.totalElapsedSeconds() USED FOR ABILITY COOLDOWN

    //  downDuration (previously called 'justPressed') does not schedule key pressing, it's merely indicative 
    //  of key states. 
    //  
    //  In this case the downDuration function tells us that between this current time and 250 milliseconds ago, 
    //  this key was pressed (not the same as holding down) and if it was pressed between that slice of time, it returns
    //  true, otherwise false.
    // if (this.leftKey.downDuration(250)) {
    //   this.textLeft.text = "Left was pressed 250 ms ago? YES";
    // } 

      // dramatically increase player's speed if the space bar has been pressed

      // set direction based on what keys are down
      if (this.cursors.right.isDown && this.cursors.up.isDown) {
        this.newDirection = 'up-right';
      } else if (this.cursors.right.isDown && this.cursors.down.isDown) {
        this.newDirection = 'down-right';
      } else if (this.cursors.left.isDown && this.cursors.up.isDown) {
        this.newDirection = 'up-left';
      } else if (this.cursors.left.isDown && this.cursors.down.isDown) {
        this.newDirection = 'down-left';
      } else if (this.cursors.right.isDown) {
        this.newDirection = 'right';
      } else if (this.cursors.left.isDown) {
        this.newDirection = 'left';
      } else if (this.cursors.up.isDown) {
        this.newDirection = 'up';
      } else if (this.cursors.down.isDown) {
        this.newDirection = 'down';
      }

      // set speed if one of the xbox gamepad dpad/sticks are pressed
      if(this.pad1.connected){

        if (
          this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1 || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1 ||
          this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1 || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1
        ) {
          this.speed = 2;
        } else {
          this.speed = 0;
        }

        // // set direction based on what dpad/keys are down
        if (this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1 && this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1) {
          this.newDirection = 'down-left';
        } else if (this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1 && this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1) {
          this.newDirection = 'up-left';
        } else if (this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1 && this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1) {
          this.newDirection = 'down-right';
        } else if (this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1 && this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1) {
          this.newDirection = 'up-right';
        } else if (this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
          this.newDirection = 'left';
        } else if (this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
          this.newDirection = 'right';
        } else if (this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1) {
          this.newDirection = 'down';
        } else if (this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1) {
          this.newDirection = 'up';
        }
      };
      // With this.updateDelay incrementing every time
      // update is called, the if statement below is only
      // true once every ten times. It is on these times
      // we move the local player if one of the arrow keys
      // is depressed. If we did not restrict this to every
      // ten times the player would move very fast.
      this.updateDelay++;

      if (this.updateDelay % (8 - this.speed) === 0) {
        if (this.speed > 0) {
          if (this.newDirection) {
            this.direction = this.newDirection;
            this.me.direction = this.direction;
            this.newDirection = null;
          }

          this.me.update(this.direction);

          // for each meatPiece, check to see if the player's
          // location is the same as the meatPiece
          // had to change to object since destroy will not
          // remove from array
          Object.keys(this.meatObj).forEach(i => {
            this.meatCollision(this.meatObj[i], i);
          });

          Object.keys(this.silverObj).forEach(j => {
            this.silverCollision(this.silverObj[j], j);
          });

          Object.keys(this.wallObj).forEach(k => {
            this.wallCollision(this.wallObj[k], k);
          })

          // this.socket.emit(
          //   'move',
          //   {
          //     x: this.me.player.x,
          //     y: this.me.player.y,
          //     direction: this.me.direction,
          //     id: this.me.id
          //   }
          // );
        } else {
          this.me.showStopAnimations(this.direction);
        }

        // send move event to server
        this.socket.emit('move', { x: this.me.player.x, y: this.me.player.y, direction: this.me.direction, id: this.me.id } );
      }
    }
  }

  // add the local player object and sprite
  addLocalPlayer() {
    const char = window.app.model.characterSelected;
    if (char) {
      this.me = new LocalPlayer(
        this.game,
        char === 'human' ? 500 : 100,
        char === 'human' ? 500: 100,
        'left',
        char,
        char === 'human',
        'me',
        0
      );

      if (char === 'human') {
        this.generateSilver();
      }
    }
  }

  getRandomX() {
    const randomX = Math.floor(Math.random() * 80) * this.squareSize;
    return randomX >= 1140 ? randomX - 60 : randomX <= 60 ? randomX + 60 : randomX;
  }

  getRandomY() {
    const randomY = Math.floor(Math.random() * 40) * this.squareSize;
    return randomY >= 440 ? randomY - 60 : randomY <= 60 ? randomY + 60 : randomY;
  }

  getRandomTreeX() {
    const randomX = Math.floor(Math.random() * 80) * this.squareSize;
    return randomX >= 1140 ? randomX - 60 : randomX <= 60 ? randomX + 60 : randomX;
  }

  getRandomTreeY() {
    const randomY = Math.floor(Math.random() * 40) * this.squareSize;
    return randomY >= 440 ? randomY - 60 : randomY <= 60 ? randomY + 60 : randomY;
  }


  generateWall() {
    for(let i = 0; i < 9; i++){
      const wall = this.game.add.sprite(this.getRandomTreeX(), this.getRandomTreeY(), 'walls');

      this.wallObj[i] = wall;
    }
  }

  generateSilver() {
    for (let i = 0; i < 10; i++) {
      const silver = this.game.add.sprite(this.getRandomX(), this.getRandomY(), 'silver');
      silver.frame = 7;

      this.silverObj[i] = silver;
    }
  }

  generateMeat() {
    for (let i = 0; i < 10; i++) {
      const meat = this.game.add.sprite(this.getRandomX(), this.getRandomY(), 'meat');
      meat.frame = 140;

      this.meatObj[i] = meat;
    }
  }

  
  // If meat collision happens remove meat and increase score
  // If score is divisible by 10, then the last piece was just
  // picked up. Call switch roles method in this case.
  // Finally emit eat socket event to server.
  meatCollision(food, i) {
    if (
      this.me.player.x >= food.x - 25 &&
      this.me.player.x <= food.x + 25 &&
      this.me.player.y >= food.y - 25 &&
      this.me.player.y <= food.y + 25
    ) {
      // because the x, y coordinates of the meat and
      // player never line up perfectly, give a range
      // of overlapping variables
      delete this.meatObj[i];
      food.destroy();
      this.score++;
      // this.wolfChompSfx.play(); //FIX IF HUMAN HEARS THIS
      this.scoreTextValue.text = this.score.toString();
      if (this.score % 10 === 0 && this.score !== 0) {
        this.wolfHowlSfx.play();
        this.switchRoles();
      } else if (this.score !== 10 || this.score !== 0) {
        this.wolfChompSfx.play();
      }
      this.socket.emit('eat', { id: this.me.id, score: this.score });
    }
  }

  // If silver collision happens remove silver and increase score.
  // If score is divisible by 10, then the last piece was just
  // picked up. Call switch roles method in this case.
  // Finally emit forge socket event to server.
  silverCollision(silver, i) {
    if (
      this.me.player.x >= silver.x - 25 &&
      this.me.player.x <= silver.x + 25 &&
      this.me.player.y >= silver.y - 25 &&
      this.me.player.y <= silver.y + 25
    ) {
      // because the x, y coordinates of the meat and
      // player never line up perfectly, give a range
      // of overlapping variables
      delete this.silverObj[i];
      silver.destroy();
      this.score++;
      this.humanAnvilSfx.play();
      this.scoreTextValue.text = this.score.toString();
      if (this.score % 10 === 0 && this.score !== 0) {
        this.humanBladeSfx.play();
        this.switchRoles();
      } else if (this.score % 10 >= 1 || this.score !== 0) {
        this.humanAnvilSfx.play();
      } 
      this.socket.emit('forge', { id: this.me.id, score: this.score });
    }
  }


  wallCollision(wall, i) {
      if (
        this.me.player.x >= wall.x - 25 &&
        this.me.player.x <= wall.x + 25 &&
        this.me.player.y >= wall.y - 25 &&
        this.me.player.y <= wall.y + 25
      ) {
        // because the x, y coordinates of the wall and
        // player never line up perfectly, give a range
        // of overlapping variables
        // this.score++;
        // this.scoreTextValue.text = this.score.toString();
      }  
       this.socket.emit('bounce');
      }


  switchRoles() {
    this.socket.emit('switch');
  }

  // websocket event handlers
  setEventHandlers() {
    this.socket.on('new player added', this.onNewPlayerAdded.bind(this));
    this.socket.on('new enemy', this.onNewEnemyPlayer.bind(this));
    this.socket.on('connect', this.onSocketConnected.bind(this));
    this.socket.on('eat', this.onMeatEat.bind(this));
    this.socket.on('bounce', this.onWallBounce.bind(this));
    this.socket.on('forge', this.onCollectSilver.bind(this));
    this.socket.on('move', this.onPlayerMovement.bind(this));
    this.socket.on('switch', this.onRoleSwitch.bind(this));
    this.socket.on('player killed', this.onPlayerCollision.bind(this));
    this.socket.on('winner', this.onWinning.bind(this));
    this.socket.on('loser', this.onLosing.bind(this));
  }

  onSocketConnected() {
    console.log('Connected to socket server');

    this.me.updateId(this.socket.id);
    this.socket.emit('new player', {
      x: this.me.player.x,
      y: this.me.player.y,
      direction: this.me.direction,
      type: this.me.type,
      isHunted: this.me.isHunted,
      id: this.me.id,
      score: 0,
      playerID: document.cookie
    });
  }

  onNewPlayerAdded(data) {

  }

  onNewEnemyPlayer(data) {
   if (!this.getPlayerById(data.id)) {

      this.enemy = new EnemyPlayer(
        this.game, data.x, data.y, data.dir,
        data.type, data.isHunted, 'enemy', data.id
      );
      console.log('enemy added', this.enemy);
    }
  }

  onMeatEat(data) {
    console.log('other player ate meat', data);
  }

  onCollectSilver(data) {
    console.log('other player collected silver for weapon', data);
  }

  onWallBounce(){
    console.log('You hit the wall');
  }

  onPlayerMovement(data) {
    this.enemy.update(data.x, data.y, data.direction);
  }

  // change hunted status for local player
  // do proper animations for each player
  onRoleSwitch() {
    this.me.changeHuntedStatus();
    if (this.me.type === 'werewolf' && this.me.isHunted) {
      this.generateMeat();
      this.enemy.humanHunterAnimations();
    } else if (this.me.type === 'werewolf' && !this.me.isHunted) {
      this.enemy.humanHuntedAnimations();
    } else if (this.me.type === 'human' && !this.me.isHunted) {
      this.me.humanHunterAnimations();
    } else if (this.me.type === 'human' && this.me.isHunted) {
      this.generateSilver();
      this.me.humanHuntedAnimations();
    }
  }

  // figure out who won and increase score if local player won
  // remove sprites and zero out game properties. Start game over state.
  onPlayerCollision() {
    const won = !this.me.isHunted;
    window.app.model.won = won;
    window.app.model.score = won ? this.score + 100 : this.score;
    this.me.player.destroy();
    this.enemy.player.destroy();
    this.me = null;
    this.enemy = null;
    this.score = 0;
    this.meatObj = {};
    this.silverObj = {};
    this.soundTrack.stop();
    this.game.world.removeAll();
    this.game.state.start('GameOver');
  }

  getPlayerById(id) {
    return (this.me && this.me.id === id) || (this.enemy && this.enemy.id === id);
  }

  onWinning(data) {
    if(this.me.id === data.id){
      data.score += 100;
      data.won = true;
      axios.post('/api/gameover', data)
        .then((err, game) => {
          if(err) {
            console.log(err);
          }
        });
    }

  }

  onLosing(data) {
    if(this.me.id === data.id){
      axios.post('/api/gameover', data)
        .then((err, game) => {
          if(err) {
            console.log(err);
          }
        });
    }
  }
}
