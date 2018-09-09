# Dockerized LAMP stack for local Craft 3 development

## Setup

1. Build the Craft 3 image locally from the Dockerfile:    
    `docker build -t courtneymyers/craft3 .`    
    or download it from [Docker Hub](https://hub.docker.com/r/courtneymyers/craft3):    
    `docker pull courtneymyers/craft3:latest`    

    Optionally download the MariaDB image from [Docker Hub](https://hub.docker.com/_/mariadb) as well (not required, as it’ll get pulled in step 3, if you don't already have it locally):    
    `docker pull mariadb:10.3`    

2. Set environment variables for the database, and Craft in the following files:    
    Duplicate `env/.craft.env.example` as `env/.craft.env` (`CRAFT_PASSWORD` must be at least 6 digits long)    
    Duplicate `env/.mysql.env.example` as `env/.mysql.env`    

3. Run setup script:    
    `sh setup.sh`    

4. When done with local development, stop each container individually:    
    `docker container stop craft-db`    
    `docker container stop craft-cms`    

    And to resume at a later point:    
    `docker container start craft-db`    
    `docker container start craft-cms`    
