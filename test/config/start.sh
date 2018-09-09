#!/bin/sh

# run craft setup
/usr/bin/expect tmp/setup.exp;

# set server root permissions
chown -R apache:apache /srv/www;

# start apache in foreground
/usr/sbin/httpd -D FOREGROUND
