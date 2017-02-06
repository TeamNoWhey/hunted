 HUNTED

In this 2D multiplayer game, one player (the werewolf) pursues the other player (the human) and attempts to win the game by catching them. However, the tables can quickly turn on the werewolf. The human simply has to survive long enough to acquire 10 pieces of silver in order to build a weapon. Once they have a weapon, the hunter has now become the hunted. The werewolf must eat enough pieces of meat to be able to overpower the human, thus reversing their roles again. This continues until one player is eliminated.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Node, npm, and mongodb are required to use this application.

To install node/npm with homebrew on Mac OS X:

```
$ brew update && brew install node
```

To install node/npm with Ubuntu/Debian:

```
$ sudo apt-get update
$ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

For Windows get the Windows installer for node/npm:
[Here](https://nodejs.org/en/download/)

For mongo, follow the instructions specific to your OS:
[Here](https://docs.mongodb.com/manual/administration/install-community/)

### Installing

Once you have node and npm, install application dependencies.
Make sure you are in the application directory and run:

```
$ npm install
$ cd server && npm install
```

### Run It

Run these each time you want to start the server:

```
$ mongod --fork --logpath /var/log/mongodb.log
$ npm run build
$ ./startprod.sh
```

## Built With

* [Phaser](https://phaser.io/) - Game Framwork for Canvas and WebGL powered games
* [React](https://facebook.github.io/react/) - Front end UI Framework
* [Express](http://expressjs.com/) - NodeJS Web Framework
* [SocketIO](http://socket.io/) - Websockets library for node
* [Passport](http://passportjs.org/) - Node authentication library
* [MongoDB](https://www.mongodb.com/) - Document Database
* [Mongoose](http://mongoosejs.com/) - MongoDB ODM
* [Twitter Bootstrap](https://getbootstrap.com/) - UI Framework for Creating Responsive Web Apps
* [Axios](https://github.com/mzabriskie/axios) - Promise based http client

## Authors

* **Daniel Olita** [@danielwolita](https://twitter.com/danielwolita)
* **Tai Hovanky** [tai.hovanky@gmail.com](tai.hovanky@gmail.com)
* **Greg Bacus** [gbacus28@gmail.com](gbacus28@gmail.com)

* **Nicholas Barnett** [barnettn26@gmail.com](barnettn26@gmail.com)
* **Rachel DePriest** [racheldepriest1@gmail.com](racheldepriest1@gmail.com)
* **Forrest Miller** [forrest.heath.miller@gmail.com](forrest.heath.miller@gmail.com)
* **Tin Nguyen** [gbacus28@gmail.com](tinytheyfon8@gmail.com)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Thank you to the first group of Authors, which laid the foundation for us to continue on.

* Thank you to Youtuber [https://www.youtube.com/channel/UCRpV6MFrOgw1YM9vzbsBPDw](RBG Music) for allowing us to use the following tracks. A New Beginning, Haunted House, and GameOver