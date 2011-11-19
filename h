    1  ls
    2  sudo su -
    3  ls
    4  sudo su - 
    5  curl https://s3.amazonaws.com/finalsclub/start.sh | sh
    6  ls
    7  cd fc
    8  ls
    9  cd bruml/
   10  ls
   11  forever server.js
   12  npm install socket.io
   13  vim ../util/start.sh 
   14  git branch
   15  grl
   16  git reflog
   17  ls
   18  vim ../util/start.sh 
   19  git commit -m "remove cruft from start.sh" -a
   20  git config --global user.name "fcdev EC2"
   21  git config --global user.name "fcdev@sleepless.com"
   22  git commit -m "remove cruft from start.sh" -a
   23  git status
   24  cd ..
   25  git status
   26  git pull
   27  vim util/start.sh 
   28  git status
   29  git commit -m "." -a
   30  git push origin dev
   31  ls
   32  cd bruml/
   33  ls
   34  forever server.js 
   35  forever server.js &> ~/b.log &
   36  cd ../etherpad-lite/
   37  ls
   38  cd node
   39  ls
   40  forever server.js 
   41  forever server.js &> ~/e.log &
   42  ls
   43  tail -f *log
   44  tail -f e.log 
   45  pwd
   46  cd fc
   47  ls
   48  ps waux
   49  kill 23712
   50  ls
   51  ps waux | grep forever
   52  kill 23697
   53  kill 23708
   54  ls
   55  ps waux | grep forever
   56  kill 23709
   57  ls
   58  cd etherpad-lite/
   59  ls
   60  cd node
   61  ls
   62  node server.js 
   63  bg
   64  ls
   65  cd ..
   66  ls
   67  cd ..
   68  cd brml
   69  cd bruml/
   70  ls
   71  node server.js 
   72  bg
   73  fg
   74  ls
   75  forever server.js &> ~/b.log 
   76  bg
   77  fg
   78  forever server.js &> ~/b.log  &
   79  cd ../etherpad-lite/node
   80  forever server.js &> ~/e.log  &
   81  fg
   82  la
   83  chmod 775 boot.sh 
   84  sudo su
   85  sudo ./boot.sh 
   86  ./boot.sh 
   87  sudo ./boot.sh 
   88  whoami
   89  curl https://s3.amazonaws.com/finalsclub.org/start.sh 
   90  curl https://s3.amazonaws.com/finalsclub.org/start.sh | sudo -u ec2-user sh
   91  sudo curl https://s3.amazonaws.com/finalsclub.org/start.sh | sudo -u ec2-user sh
   92  la
   93  whoami
   94  sudo su
   95  cd fc
   96  ./restart 
   97  cd
   98  cd bak/
   99  la
  100  tar xzvf fc_db_bak_9-9-2011.tgz 
  101  cd fc_db_bak_9-9-2011
  102  la
  103  mongorestore
  104  ps aux | grep mongo
  105  mongo
  106  sudo kill -9 1089
  107  sudo /usr/local/bin/mongod -v --rest --replSet finalsclubset &> /var/log/mongod.log &
  108  ps aux | grep mongo
  109  sudo su
  110  mongo
  111  pwd
  112  la
  113  mongorestore
  114  cd
  115  cd fc
  116  git pull
  117  git st
  118  git status
  119  ./restart 
  120  ls
  121  cd fc
  122  ls
  123  top 
  124  ls
  125  git pull
  126  mongo
  127  exit
  128  ls
  129  exit
  130  ls
  131  mongorestore -d fc -c archivedcourses archivedcourses.bson 
  132  mongorestore -d fc -c archivedcourses archivedsubjects.bson 
  133  mongorestore -d fc -c archivedcourses archivednotess.bson 
  134  mongorestore -d fc -c archivedcourses archivednotes.bson 
  135  mongorestore -d fc -c archivedcourses archivedcourses.bson 
  136  exit
  137  ls
  138  mongorestore -d fc -c archivednotes archivednotes.bson 
  139  mongorestore -d fc -c archivedsubjects archivedsubjects.bson 
  140  mongorestore -d fc -c archivedcourses archivedcourses.bson 
  141  exit
  142  ls
  143  mongorestore -d fc -c archivedcourses archivedcourses.bson 
  144  mongo
  145  ls
  146  cd fc
  147  ls
  148  vim app.js 
  149  ./restart 
  150  ls
  151  vim app.js 
  152  ./restart 
  153  vim app.js 
  154  ./restart 
  155  vim app.js 
  156  ./restart 
  157  vim app.js 
  158  ./restart 
  159  vim app.js 
  160  ./restart 
  161  vim mailer.js 
  162  ./restart 
  163  vim app.js 
  164  ./restart 
  165  sudo su
  166  whoami
  167  cd
  168  cd .ssh/
  169  la
  170  vi authorized_keys 
  171  less .ssh/authorized_keys 
  172  ls
  173  cd fc
  174  ls
  175  git status
  176  exit
  177  df -h
  178  cd fc
  179  la
  180  cd ../
  181  la
  182  sudo su
  183  la
  184  whoami
  185  sudo su
  186  la
  187  cd fc
  188  git st
  189  git status
  190  cd ../
  191  df -h
  192  cp -rf fc/ jsnow_fc
  193  cd jsnow_fc/
  194  git pull
  195  git status
  196  la
  197  rm log.txt 
  198  git status
  199  git checkout master
  200  git diff app.js 
  201  git checkout app.js 
  202  cd jsnow_fc/
  203  git branch
  204  git pull
  205  cd
  206  la
  207  cd
  208  la
  209  whoami
  210  la
  211  mkdir util
  212  cd util/
  213  la
  214  java -version
  215  export
  216  export | grep java
  217  export | grep JAVA
  218  la
  219  unzip CloudWatch-2010-08-01.zip 
  220  la
  221  cd CloudWatch-
  222  cd CloudWatch-1.0.12.1/
  223  la
  224  cd ./
  225  cd ../
  226  la
  227  cd CloudWatch-1.0.12.1/
  228  la
  229  cd bin
  230  la
  231  cd
  232  cd .ssh/
  233  vi id_rsa 
  234  env
  235  env | grep SECRET
  236  cd util/
  237  la
  238  cd CloudWatch-
  239  la
  240  mkdir dl
  241  mv CloudWatch-2010-08-01.zip dl/.
  242  la
  243  cd CLo
  244  cd CloudWatch-1.0.12.1/
  245  la
  246  cd bin
  247  cd ..
  248  vi credential-file-path.template 
  249  cd bin
  250  la
  251  mon-cmd 
  252  mon-get-stats
  253  mon-list-metrics
  254  la
  255  pwd
  256  cd ../../
  257  la
  258  which java
  259  la
  260  chmod 775 mon-disk-space.sh 
  261  la
  262  ./mon-disk-space.sh 
  263  vi mon-disk-space.sh 
  264  ./mon-disk-space.sh 
  265  la
  266  ./mon-disk-space.sh 
  267  vi mon-disk-space.sh 
  268  which bash
  269  /usr/bin/env bash
  270  ./mon-disk-space.sh 
  271  cd
  272  cd util/
  273  la
  274  cat mon-disk-space.sh 
  275  ./mon-disk-space.sh 
  276  vi mon-disk-space.sh
  277  la
  278  chmod 775 mon-disk-space.sh
  279  la
  280  ./mon-disk-space.sh
  281  vi mon-disk-space.sh
  282  ./mon-disk-space.sh
  283  df --local --block-size=1M $path | grep $path | tr -s ' ' | cut -d ' ' -f 4
  284  df --local --block-size=1M
  285  ./mon-disk-space.sh
  286  /home/ec2-user/util/CloudWatch-1.0.12.1/bin/mon-get-stats 
  287  ./mon-disk-space.sh
  288  cd /home/ec2-user/util/CloudWatch-1.0.12.1/cd
  289  cd CloudWatch-1.0.12.1/
  290  pwd
  291  la
  292  cd ../
  293  ./mon-disk-space.sh
  294  cd  /home/ec2-user/util/CloudWatch-1.0.12.1
  295  cd ../
  296  la
  297  ./mon-disk-space.sh
  298  cd /home/ec2-user/util/CloudWatch-1.0.12.1/bin/
  299  cd ../../
  300  ./mon-disk-space.sh
  301  pwd
  302  ./mon-disk-space.sh
  303  vi mon-disk-space.sh
  304  ./mon-disk-space.sh
  305  vi mon-disk-space.sh
  306  ./mon-disk-space.sh
  307  vi mon-disk-space.sh
  308  ./mon-disk-space.sh
  309  df -h
  310  la CloudWatch-1.0.12.1/bin/
  311  ./mon-disk-space.sh
  312  la
  313  mv CloudWatch-1.0.12.1/ ../fc/util/.
  314  la
  315  cd 
  316  cd fc
  317  cd util/CloudWatch-1.0.12.1/li
  318  cd util/CloudWatch-1.0.12.1/
  319  la
  320  cd lib
  321  la
  322  rm wsdl4j-1.6.1.jar 
  323  la
  324  cd ../bin
  325  mon-list-metrics 
  326  mon-cmd
  327  cd 
  328  cd util/
  329  la
  330  mv mon-disk-space.sh ~/fc/util/.
  331  cd 
  332  cd fc/util/
  333  la
  334  ./mon-disk-space.sh 
  335  env
  336  env | grep SECRET
  337  ./mon-disk-space.sh 
  338  cd
  339  cd fc/fcbackups/
  340  la
  341  rm .fcbackup.env 
  342  cd
  343  crontab -e
  344  sudo su
  345  whoami
  346  crontab -l
  347  crontab -e
  348  date
  349  crontab -e
  350  la
  351  date
  352  crontab -e
  353  date
  354  cd fc
  355  la
  356  cd util/
  357  la
  358  cat mon-disk-space.
  359  cat mon-disk-space.log.txt 
  360  rm mon-disk-space.log.txt 
  361  la
  362  date
  363  rm mon-disk-space.log.txt 
  364  la
  365  date
  366  crontab -e
  367  cd CloudWatch-1.0.12.1/bin/
  368  mon-cmd
  369  mon-cmd help
  370  mon-put-data
  371  la
  372  mon-put-data
  373  sudo su
  374  env | grep REGION
  375  cd fc/util/
  376  la
  377  ./mon-disk-space.sh 
  378  env | grep REGION
  379  date
  380  env | grep REGION
  381  cd fc/util/
  382  la
  383  ./mon-disk-space.sh 
  384  crontab -e
  385  env | grep REGION
  386  crontab -e
  387  date
  388  crontab -e
  389  date
  390  env | grep REGION
  391  /usr/bin/env bash
  392  date
  393  crontab -e
  394  date
  395  cd
  396  cd fc
  397  cd ../jsnow_fc/
  398  git branch
  399  git pull
  400  git checkout master
  401  rm mailer.js 
  402  git stash
  403  git pull
  404  git checkout master
  405  git pull
  406  git checkout dev
  407  git branch
  408  history | grep git
  409  git branch
  410  git pull
  411  git st
  412  git status
  413  git checkout master
  414  git pull
  415  git st
  416  git pull
  417  cd ../fc
  418  git branch
  419  git pull
  420  df -h
  421  cd util/
  422  la
  423  rm -rf CloudWatch-1.0.12.1aaa/
  424  la
  425  git pull
  426  crontab -e
  427  cd
  428  cd jsnow_fc/
  429  la
  430  cd ../
  431  mf jsnow_fc/ jsnow_fc-2
  432  mv jsnow_fc/ jsnow_fc-2
  433  mkdir jsnow_fc
  434  cd jsnow_fc
  435  cd ../
  436  rmdir jsnow_fc
  437  mv jsnow_fc-2/ jsnow_fc
  438  cd jsnow_fc/
  439  git pull
  440  git branch
  441  git checkout dev
  442  git st
  443  git status
  444  git st
  445  cd util/
  446  la
  447  cd CloudWatch-1.0.12.1/
  448  la
  449  cd bin/
  450  la
  451  cd ut
  452  cd
  453  la
  454  cd util/
  455  la
  456  cd
  457  cd jsnow_fc/
  458  cd util/
  459  la
  460  cd CloudWatch-1.0.12.1/
  461  la
  462  cd li
  463  la
  464  cd lib
  465  la
  466  cd ../bin
  467  la
  468  mon-list-metrics
  469  cd ../../
  470  la
  471  git status
  472  git config --global -l
  473  git config --global user.name "Joseph Snow"
  474  git config --global user.name ""
  475  git config --global
  476  git config --global -l
  477  git config --global user.name fcdev@sleepless.com
  478  git config -l
  479  git config user.name "snow@sleepless.com"
  480  git config user.email "snow@sleepless.com"
  481  git config user.name "Joseph Snow"
  482  pwd
  483  git config -l
  484  git status
  485  git config --global -l
  486  git config ui.color auto
  487  git status
  488  git config --global color.ui auto
  489  git status
  490  git config --global alias.st status
  491  git st
  492  git config --global-l
  493  git config --global -l
  494  git config -l
  495  git pull
  496  git st
  497  pwd
  498  cd
  499  cd util/
  500  la
  501  cd dl/
  502  la
  503  unzip CloudWatch-2010-08-01.zip 
  504  cd CloudWatch-
  505  cd CloudWatch-1.0.12.1/
  506  la
  507  cd bin/
  508  la
  509  cd
  510  cd jsnow_fc/util/
  511  mv CloudWatch-1.0.12.1/ CloudWatch-1.0.12.1-old
  512  mv ~/util/dl/CloudWatch-1.0.12.1/ .
  513  svn st
  514  git st
  515  git add CloudWatch-1.0.12.1/*
  516  git st
  517  la
  518  chmod 775 mon-disk-space.sh 
  519  chmod 775 fc_monitor_epl_cron.sh 
  520  la
  521  git st
  522  git add fc_monitor_epl_cron.sh 
  523  git add mon-disk-space.sh 
  524  git st
  525  git commit
  526  git push
  527  git branch
  528  git checkout master
  529  git pull
  530  git checkout dev util
  531  cd ../
  532  git checkout dev util
  533  git st
  534  git commit
  535  git pull
  536  git push
  537  cd ../fc
  538  git pull
  539  la
  540  ls
  541  crontab -e
  542  pwd
  543  ls
  544  cd fc
  545  git status
  546  exit
  547  la
  548  cd fc
  549  git st
  550  git config --global -l
  551  date
  552  la
  553  cd
  554  la
  555  mf jsnow_fc/ jsnow_fc-old
  556  mv jsnow_fc/ jsnow_fc-old
  557  mkdir jsnow_fc
  558  cd jsnow_fc
  559  git clone git@github.com:finalsclubdev/FinalsClub.git .
  560  git st
  561  git config -l
  562  git config user.name "Joseph Snow"
  563  git config user.email "snow@sleepless.com"
  564  git config -l
  565  git config --global -l
  566  ls
  567  cd fc
  568  ls -l
  569  ls -la
  570  git show origin
  571  git show
  572  git remote
  573  git origin
  574  git set
  575  git help
  576  git show -?
  577  git show --help
  578  git status
  579  git help
  580  git status --help
  581  git show --help
  582  git remote -v show
  583  cd ..
  584  ls
  585  git clone git@github.com:/finalsclubdev/FinalsClub fc-new
  586  ps waux | grep node
  587  cd fc
  588  ls
  589  ./stop
  590  ps waux | grep node
  591  cd ../fc-new
  592  ls
  593  git branch 1page
  594  git pull
  595  ls
  596  git submodule init
  597  git submodule update
  598  ls
  599  ./start
  600  ls
  601  ps waux | grep node
  602  pwd
  603  ./stop
  604  cat start
  605  cat stop
  606  ls -ltr
  607  less log.
  608  less log.txt 
  609  npm install express
  610  tail -f log.txt &
  611  ./stop
  612  ./start
  613  nnpm install connect-mongo
  614  fg
  615  nnpm install connect-mongo
  616  npm install connect-mongo
  617  tail -f log.txt &
  618  fg
  619  npm install async
  620  tail -f log.txt
  621  npm install mongodb
  622  tail -f log.txt
  623  npm install mongoose
  624  tail -f log.txt
  625  npm install aws-lib
  626  tail -f log.txt
  627  npm install ejs
  628  tail -f log.txt
  629  npm install hat
  630  tail -f log.txt
  631  npm install connect
  632  tail -f log.txt
  633  npm install bc
  634  git clone git@github.com:finalsclubdev/bc
  635  tail -f log.txt
  636  mv bc ..
  637  tail -f log.txt
  638  npm install socket.io
  639  tail -f log.txt
  640  npm install socket.io
  641  tail -f log.txt
  642  pushd ../bc
  643  npm install socket.io
  644  popd
  645  tail -f log.txt
  646  npm install  express-messages
  647  tail -f log.txt
  648  npm install  jade
  649  tail -f log.txt
  650  git branch
  651  git checkout 1page
  652  git pull
  653  git pull remote 1page
  654  git branch
  655  git update
  656  git status
  657  git submodule update
  658  git submodule init
  659  git submodule update
  660  ./restart 
  661  ls
  662  vim app.js 
  663  git reflog
  664  git pull
  665  git pull origin 1page
  666  ./restart
  667  ls
  668  exit
  669  cd fc-new
  670  ls
  671  history > h
