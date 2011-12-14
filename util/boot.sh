#!/bin/bash


################################################################
##  Finals Club instance set up notes by Joe Snow 11/19/2011
################################################################
##  these are the steps I take to create a new fc instance
##  log into aws, launch new AMI instance
##  ssh into machine
##  sudo to root
##  download and run boot.sh (this file -- either from s3 or ssh), this can take 10 minutes
##  NOTE: start.sh usually fails due to env vars, etc..
##  as ec2-user, run start.sh
##  add arbiter db config, and mongo replicated set config, import mongo data using mongorestore command
##    I usually create and grab the latest mongodb backup from S3 (created from existing live server)
##  add dev public keys to /home/ec2-user/.ssh/authorized_keys
##  update /home/ec2-user/.bashrc with AWS env vars
##  add /home/ec2-user/fc/fcbackup/.fcbackup.env (populated with AWS env vars)
##  restart fc app
##  add crontab, using fc/util/crontab-example.txt as example as needed.
##  update cloudwatch monitors for cpu, disk, etc..
##  as root, start epl monitor script in /home/ec2-user/fc/util/start-fc-epl-monitor.sh
##  check app health and switch DNS as desired
################################################################

cd /root

if test ! -e "reset.sh" ; then
cat > "reset.sh" << FIN
#!/bin/bash
curl https://s3.amazonaws.com/finalsclub.org/boot.sh | sh
FIN
chmod 500 reset.sh
fi


echo "Booting" `date` 

yes | yum --nogpgcheck install gcc-c++
yes | yum --nogpgcheck install openssl-devel
yes | yum --nogpgcheck install make
yes | yum --nogpgcheck install git
yes | yum --nogpgcheck install sqlite-devel

yes | yum --nogpgcheck install mysql-server
# /etc/init.d/mysqld start
# /usr/bin/mysqladmin -u root password 'foobarbazquX'

# install mongodb
mongover="1.8.2"
if test ! -e mongodb.tgz ; then
	curl http://fastdl.mongodb.org/linux/mongodb-linux-i686-$mongover.tgz > mongodb-linux-i686-$mongover.tgz
	tar xzf mongodb-linux-i686-$mongover.tgz
	cd mongodb-linux-i686-$mongover/bin
	chmod a+rx *
	chmod uo-w *
	cp -f * /usr/local/bin
	mkdir -p /data/db
	/usr/local/bin/mongod -v --rest --replSet finalsclubset &> /var/log/mongod.log &

	## optional arbiter start command
	## mkdir -p /data/arbiterdb
	## /usr/local/bin/mongod -v --dbpath /data/arbiterdb --port 27021 --rest --replSet finalsclubset &> /var/log/mongod-arbiter.log &

	#### NOTE: the replicated set name could change or increment, for example we might be using finalsclubset4 instead of finalsclubset

	## example to set up new clean replicated set
	## as ec2-user
	## mongo									### start mongo cli util from bash prompt
	## > rs.initiate()							## init the replicated set (assumes you are starting a new clean replicated set)
	## > rs.addArb("ip-10-166-206-34:27021")	## assumes arbiter instance was started previously on specified port, IP for example only, use same machineID
	## > rs.status()							## confirm both instances are in set
fi




# install node
nodever="v0.4.10"
if test ! -e node-$nodever ; then
		curl http://nodejs.org/dist/node-$nodever.tar.gz > node-$nodever.tar.gz
		tar xzvf node-$nodever.tar.gz
		cd node-$nodever
		./configure
		make
		make install
fi

# install npm
if test ! -e npm ; then
		git clone http://github.com/isaacs/npm.git
		cd npm
		sudo make install
		cd ..
fi

npm install nodemon -g
npm install forever -g

## make it easier for root to run node
cd /usr/bin
ln -sf /usr/local/bin/node .
ln -sf /usr/local/bin/forever .



## haproxy install (optional) 
# assumes this script is running as root
mkdir /usr/local/haproxy
cd /usr/local/haproxy
wget http://haproxy.1wt.eu/download/1.4/bin/haproxy-1.4.17-pcre-40kses-linux-i586.notstripped.gz
gunzip haproxy-1.4.17-pcre-40kses-linux-i586.notstripped.gz
ln -sf haproxy-1.4.17-pcre-40kses-linux-i586.notstripped haproxy
chmod 770 haproxy*
wget https://s3.amazonaws.com/finalsclub.org/haproxy.cfg 
chmod 660 haproxy.cfg

## command to start haproxy (from /usr/local/haproxy dir)
#  sudo /usr/local/haproxy/haproxy -f /usr/local/haproxy/haproxy.cfg -p /var/run/haproxy.pid &


## init the reboot-restart.sh script, but don't run it.
cd ~
wget https://s3.amazonaws.com/finalsclub.org/reboot-restart.sh
chmod 755 reboot-restart.sh
echo "/root/reboot-restart.sh &> /var/log/fc-reboot-restart.log.txt &" >> /etc/rc.local
	

## NOTE: each time, I've had to run this step manually, as the ec2-user, after env vars have been set up
cd /home/ec2-user
curl https://s3.amazonaws.com/finalsclub.org/start.sh | sudo -u ec2-user sh

