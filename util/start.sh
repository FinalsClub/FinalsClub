#!/bin/bash

export PATH="/usr/local/bin:$PATH"

cd ~
rm -rf bc
git clone git@github.com:finalsclubdev/bc
cd ~/bc
npm install connect
npm install socket.io
npm install express-messages
npm install jade

cd ~
rm -rf fc
git clone git@github.com:finalsclubdev/FinalsClub.git
ln -sf FinalsClub fc

cd ~/fc
git checkout master
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


## init fcbackup 
cd ~/fc/fcbackups
chmod 775 fcbackup_init.sh
./fcbackup_init.sh


## start the server
cd ~/fc
./restart







