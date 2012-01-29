#!/bin/bash

# this is sadly, out of date
# Bob, be bold and feel free to rewrite the old scripts rather than making new.sh

# TODO: Update this to install node 0.6.8 and whatever the latest stable mongodb is as of 02012-01-28 
# Will involve building node on linux, so be sure to install build-essential
# TODO: install the latest stable npm from their website
# don't use the latest git version, use the one from the npm site

## Start to deploy instructions
# git clone pathto fc repo
# cd FinalsClub
## checks out bc and EPL
# git submodule --update init
# npm install ./

# TODO: create separate deploy script for EPL
# should involve 'npm install ./'

sudo apt-get install git-core g++ libssl-dev curl make haproxy ruby rubygems mongodb-server

# install mongo_db
# Please change if running app on another arch!!!!

wget http://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.0.2.tgz
tar -xvvf mongodb-linux-x86_64-2.0.2.tgz
cd mongodb-linux-x86_64-2.0.2
cp bin/* /usr/bin/*

cd ../

# Install node.js
curl http://nodejs.org/dist/node-v0.6.1.tar.gz > node-v0.6.1.tar.gz
tar xzvf node-v0.6.1.tar.gz
cd node-v0.6.1
sudo ./configure
sudo make
sudo make install
cd ..

# Install npm
git clone http://github.com/isaacs/npm.git
cd npm
sudo make install
sudo npm install nodemon -g
sudo npm install forever -g
cd /usr/bin
ln -sf /usr/local/bin/node .
sudo ln -sf /usr/local/bin/node .
sudo ln -sf /usr/local/bin/forever .

cd ~/

export PATH="/usr/local/bin:$PATH"

cd ~
rm -rf bc
git clone git://github.com/finalsclubdev/bc.git
cd ~/bc
npm install connect
npm install socket.io
npm install express-messages
npm install jade

cd ~
rm -rf FinalsClub
git clone git://github.com/finalsclubdev/FinalsClub.git
ln -sf FinalsClub fc

cd ~/fc
git checkout devel
git submodule init && git submodule update
npm install
cd etherpad-lite
npm install

# install some dependencies
cd ~/fc
npm install connect
npm install socket.io
npm install express-messages
npm install jade

echo "Please re-deploy DB backup before starting :)"

exit
