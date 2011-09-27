sudo yum install ruby
sudo yum install rubygems
sudo gem install aws-s3

chmod 775 fc_rotating_db_backup.sh
chmod 775 cp2s3.rb
sudo cp cp2s3.rb /usr/bin/cp2s3
