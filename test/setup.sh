#!/bin/sh

echo '\nCleaning up previous setup...';
docker container rm --force craft-lazyfox-db;
docker container rm --force craft-lazyfox-cms;
docker volume rm craftdb;
# rm -rf ./www;

echo '\nBringing up containers...';
docker run \
  --name craft-lazyfox-db \
  --env-file ./env/.mysql.env \
  --mount type=volume,source=craftdb,target=/var/lib/mysql \
  --detach \
  mariadb:10.3;

docker run \
  --name craft-lazyfox-cms \
  --env-file ./env/.craft.env \
  --link craft-lazyfox-db:db \
  --publish 8000:80 \
  --detach \
  courtneymyers/craft3:latest;

sleep 15;

echo '\nCopying /srv/www directory from craft-lazyfox-cms container...';
docker cp craft-lazyfox-cms:/srv/www "$(PWD)"/www;

echo '\nBringing down and removing craft-lazyfox-cms container...';
docker container rm --force craft-lazyfox-cms;

echo '\nBringing up craft-lazyfox-cms container with bound volume...';
docker run \
  --name craft-lazyfox-cms \
  --env-file ./env/.craft.env \
  --mount type=bind,source=$PWD/www,target=/srv/www \
  --link craft-lazyfox-db:db \
  --publish 8000:80 \
  --detach \
  courtneymyers/craft3:latest;

sleep 15;

echo '\nRestarting apache on craft--lazyfoxcms container...';
docker exec -it --detach craft-lazyfox-cms sh -c "/usr/sbin/httpd -D FOREGROUND";

echo '\nVisit site: http://localhost:8000/admin';
echo '\n';
