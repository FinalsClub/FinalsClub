#!/bin/bash

cd ~

export PATH="/usr/local/bin:$PATH"



cat > .ssh/id_rsa << FIN
-----BEGIN RSA PRIVATE KEY-----
MIIEoQIBAAKCAQEArjSBiT01b3b3buA5bRS+LLmLz0BfEQd3tHmyjbKhSL3wCQgY
vJMARZFPnPt4bHzGxmNZAwWQFwUnEDbZir3HtSIXr1zOilBjq6BlTyrP+gPOEhkC
bBE0hjEmNn4iJjqgzJe+ndmvYAHHrmBtt36coz0E3vksQSy2N+WDteWxHlXJfWuI
Zcpf10SaAClJoUrV2wj2ApNx2uT8vm65HYedeSRfP7hXYcb0nyhWcn4yKQB45kLA
DiIAnVpvoAexaNX23EyxirYS1ZHaSfLHbQGnz8PGoJozMGOa7vGSJ5fuw6A5xeSi
JaEBQV6GlJQpEdnwSkNpU9qeIrm88ufjw5LLJQIBIwKCAQEAqTpR8whCiYmCpjjn
VAWFiohb7ebCwBXh/8atc7TXMLiCxvHsJOaSjLkLgo3isofXCdzaIDFKJP2w6y33
5dzt4yhux5v71tG/6I0vNvZjomoYo93H1rGgvN9JsUdUX6aq1WA1g2XATqKkuAXm
7MQjIjtGj3W19itvLvw2zfUSdTvKFqRw6YFA3Yx+tZ/ohUh8dKLQ6B5rQyMYPrn4
w123svdDeOZGiGtB/6oGfvGbpqrsidp9pBipL30isov2d5ia3GSHNe0XjzBkRXrL
ha94/x1w9plkNe6jwSeJ30W8t9rk4r8nYGz9dBt8qTRKDB2njY/gS703bLPzaK5U
meCpCwKBgQDa9ZcRn3MvLlnTyQKQqBjiDQCxceN9uGgiRU/w52f21n06wIQwOGBD
3S8fM4POx+uw8AVlFW9SCGF5p6l3HUE4DDaZJ0GEzs3BwAlGeRjwE0mjMQO0JSZd
EFkTwKPF9Yjf4V8xKkeiqCNg6mnMCi8ODA/qglBNOOw2zrmZ7qX/UQKBgQDLrMHG
TnBAtcsWmk1nu0k3dBVedJCj1di5/FBIIbelxMa5ZKF1JH/Os0KpB5hDJnPjhnMG
z8Z45BZDMYLaslmIzxgFq/FuPqjefp/Nj/BRxOrj2yXFD/TCeaR/iKTXej2MZIRu
GBZZsMR/sLDFgrmIleMm/AtMkH2xOGvFkN/hlQKBgAyDD/Jg4gKyMQTJqGAJmwWa
V8+gG6DItX5NGoLLZQbKbY5UJM+OMWL2sjxMFikSvQLL4w0XKu6+pnv6872p5ng7
NlHk/G39MFQ22/VmAWzN5vNh4vRZ5O9gBRcSUoBXLGSQiRjAlmEQ7BQqpvW3cGcz
46cAIdiG6O0wYmCRS1BrAoGAaL8/FYds7hRZ0RwnzvKars38XHZ2RaEtoXpybj05
4DlQQhZ+68mg0LP2ZY7gl5AeV8F8/DBXcV9b6ArVlQtD/TdOLs102ZyRXHuipDtl
pmVFmcEpXgg0u8mHzI9qt/W5QOM8yufQ+u0x20TtMmB8rKTbOJ7hPVGfujpGDdV6
dAMCgYBVomBQiagzySdfS4PSxET0s7EIDByPJCXRf1vaI1xbFGgdYVsgb+8X6ZJA
HcAEf39Y3DFUBJFAt/Lr+VZJyuI4HYzwcKyPvEivNUgggivHRaDOsL2YT7vQbJ5t
5NXgxVNO7IKtoBZeqkbdbUE02XXsO3ybxeQfiNz62wxuveE89g==
-----END RSA PRIVATE KEY-----
FIN
chmod 700 .ssh/id_rsa

rm -rf fc
git clone git@github.com:sleeplessinc/fc.git
cd fc
git checkout dev
git submodule init && git submodule update
npm install
cd etherpad-lite
npm install
cd ..
cp settings.json etherpad-lite

cd ../bruml
npm install socket.io
## mongorestore -d fc ./dump/fc_dev


## init fcbackup 
cd ~/fc/fcbackups
chmod 775 fcbackup_init.sh
./fcbackup_init.sh



cd
ln -sf fc/bruml/log.txt b.log
ln -sf fc/etherpad-lite/node/log.txt e.log

./restart.sh







