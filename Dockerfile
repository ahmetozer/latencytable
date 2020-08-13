# Jekyll offical repo has a performance issue, switch to own repo
FROM ahmetozer/jekyll as latencytablebuild

RUN apk add nginx openssl bash

WORKDIR /srv/jekyll
COPY . .

RUN set -x &&\
export ;\
gem check ;\
bundle check ;\
bundle install &&\
chmod +x /srv/jekyll/docker_run.sh &&\
mv nginx.conf /etc/nginx/nginx.conf &&\
chown -R www-data:www-data /var/www &&\
chown -R www-data:www-data /srv/jekyll

FROM latencytablebuild as latencytabletest
USER www-data
RUN echo -e "\n \n \t\033[1;36mLatency Table Test Container\n\033[0m" &&\
jekyll build --trace && \
echo -e "\n \n \t\033[1;32mTest is OK. Removing Temp Container\n\033[0m"

FROM latencytablebuild

CMD [ "/srv/jekyll/docker_run.sh"]