#!/bin/bash

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
	echo "/usr/local/bin &> /var/log/mongod.log &" >> /etc/rc.local
	mkdir -p /data/db
	/usr/local/bin/mongod -v --rest --replSet finalsclubset &> /var/log/mongod.log &

	## optional arbiter start command
	## mkdir -p /data/arbiterdb
	## /usr/local/bin/mongod -v --dbpath /data/arbiterdb --port 27021 --rest --replSet finalsclubset &> /var/log/mongod-arbiter.log &
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



curl https://s3.amazonaws.com/finalsclub.org/start.sh | sudo -u ec2-user sh

