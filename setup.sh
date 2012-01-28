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


exit

sudo apt-get install mongodb git-core g++ libssl-dev curl make haproxy mysql-server ruby rubygems

# Install node.js
curl http://nodejs.org/dist/node-v0.4.10.tar.gz > node-v0.4.10.tar.gz
tar xzvf node-v0.4.10.tar.gz
cd node-v0.4.10
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
#ln -sf /usr/local/bin/node .
#sudo ln -sf /usr/local/bin/node .
#sudo ln -sf /usr/local/bin/forever .

cd ~/
sudo ./start.sh
exit
