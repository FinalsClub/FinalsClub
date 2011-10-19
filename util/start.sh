#!/bin/bash

cd ~

export PATH="/usr/local/bin:$PATH"

rm -rf fc
git clone git@github.com:finalsclubdev/FinalsClub.git
cd fc
git checkout master
git submodule init && git submodule update
npm install
cd etherpad-lite
npm install


## init fcbackup 
cd ~/fc/fcbackups
chmod 775 fcbackup_init.sh
./fcbackup_init.sh



cd

./restart.sh







