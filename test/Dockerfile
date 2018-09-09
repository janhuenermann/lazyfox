FROM alpine:3.7

LABEL maintainer="Courtney Myers <courtney.myers@erg.com>" \
      description="Minimal PHP 7.1 and Apache 2 for Craft CMS" \
      vesion="1.0"

# install apache, php, php extensions for craft, and other utilities
RUN apk add --no-cache \
    apache2 \
    php7 \
    php7-apache2 \
    php7-phar \
    php7-zlib \
    php7-ctype \
    php7-session \
    php7-fileinfo \
    # required php extensions for craft
    php7-pdo \
    php7-pdo_mysql \
    php7-gd \
    php7-openssl \
    php7-mbstring \
    php7-json \
    php7-curl \
    php7-zip \
    # optional extensions for craft
    php7-iconv \
    php7-intl \
    php7-dom \
    # expect for passing arguments to craft setup script's prompts
    expect;

# install composer, craft, and configure apache
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"; \
    php composer-setup.php; \
    rm composer-setup.php; \
    mv composer.phar /usr/bin/composer; \
    # install craft
    composer create-project craftcms/craft /srv/www; \
    # create missing apache2 run directory
    mkdir -p /run/apache2;

# copy over config files
COPY config/ tmp/

# configure virtual hosts, php settings, and run craft setup script
RUN mv tmp/vhosts.conf /etc/apache2/conf.d/; \
    mv tmp/php.ini /etc/php7/conf.d;

EXPOSE 80

# run craft setup and start apache in foreground
CMD /bin/sh tmp/start.sh
