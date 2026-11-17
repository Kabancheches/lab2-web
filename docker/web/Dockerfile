FROM httpd:2.4

RUN sed -i \
    -e 's/^#\(LoadModule proxy_module \)/\1/' \
    -e 's/^#\(LoadModule proxy_fcgi_module \)/\1/' \
    /usr/local/apache2/conf/httpd.conf \
  && grep -q '^LoadModule proxy_fcgi_module ' /usr/local/apache2/conf/httpd.conf \
  && echo 'Include conf/extra/lab2.conf' >> /usr/local/apache2/conf/httpd.conf

COPY docker/web/lab2.conf /usr/local/apache2/conf/extra/lab2.conf
COPY page/ /usr/local/apache2/htdocs/

EXPOSE 80
