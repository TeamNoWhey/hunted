import MenuItem from '../text/menuitem';
import intromusic from '../assets/audio/8bitGeralt.wav';

export default class Menu extends window.Phaser.State {
  constructor(options, title) {
    super();
    this.options = options;
    this.title = title;
    this.introMusic;
    this.pad1 = null;
    this.button1 = null;
    this.button2 = null;
    this.button3 = null;
  }

  preload() {
    this.game.load.audio('intromusic', intromusic);
  }

  create() {
    this.menuSetup();
    this.generateMenu();
    this.introMusic = this.game.add.audio('intromusic')
    this.game.sound.stopAll()
    this.introMusic.play();
  }

  menuSetup() {
    this.focused = 0;

    //Defining our inputs
    this.keyboard = this.game.input.keyboard;
    this.game.input.gamepad.start();
    this.pad1 = this.game.input.gamepad.pad1;

    //This allows user to make selections using arrow keys
    this.controls = this.keyboard.addKeys({
      up: window.Phaser.Keyboard.UP,
      down: window.Phaser.Keyboard.DOWN,
      left: window.Phaser.Keyboard.LEFT,
      right: window.Phaser.Keyboard.RIGHT,
      interact: window.Phaser.Keyboard.SPACEBAR
    });

    this.game.add.text(20, 20, this.title, { font: "20px monospace", fill: "#888" });

    this.menuItems = [];
  }

  generateMenu() {
    for (let i = 0; i < this.options.length; i++) {
      let option, menuItem;

      option = this.options[i];

      if (window.app.model.joinedPlayer && window.app.model.joinedPlayer === option.text.toLowerCase()) {
        continue;
      }

      //places menu item on the correct x and y coordinates.
      menuItem = new MenuItem(this.game, 20, (((i + 1) * 40) + 40), option.text, option.targetState);

      this.menuItems.push(menuItem);
    }

    this.menuItems[this.focused].focus(true);


    this.controls.interact.onDown.add(this.activateFocusedItem, this);
    this.controls.up.onDown.add(this.selectItem, this, 0, -1);
    this.controls.down.onDown.add(this.selectItem, this, 0, 1);

    if(this.pad1.connected){
      this.button1 = this.game.input.gamepad.pad1.addButton(window.Phaser.Gamepad.XBOX360_A);
      this.button1.onDown.add(this.activateFocusedItem, this)

      this.button1 = this.game.input.gamepad.pad1.addButton(window.Phaser.Gamepad.XBOX360_DPAD_UP);
      this.button2.onDown.add(this.selectItem, this, 0, -1)
      
      this.button3 = this.game.input.gamepad.pad1.addButton(window.Phaser.Gamepad.XBOX360_DPAD_DOWN);
      this.button3.onDown.add(this.selectItem, this, 0, 1)
      
    }

  }

  //This highligts selected item in menu upon selection from arrow keys
  selectItem(key, delta) {
    this.menuItems[this.focused].focus(false);

    this.focused += delta;

    if (this.focused >= this.menuItems.length) {
      this.focused -= this.menuItems.length;
    } else if (this.focused < 0) {
      this.focused += this.menuItems.length;
    }

    this.menuItems[this.focused].focus(true);
  }

  //activates targetState in options array once spacebar is pressed.
  activateFocusedItem() {
    this.menuItems[this.focused].navigate();
  }
}
