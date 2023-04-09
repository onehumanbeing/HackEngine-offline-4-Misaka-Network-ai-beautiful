ARG PG_MAJOR=12
FROM postgres:$PG_MAJOR
ARG PG_MAJOR
ENV POSTGRES_PASSWORD=demo
ENV POSTGRES_USER=sinkstars
ENV POSTGRES_DB=simple_cloth
COPY . /tmp/pgvector

RUN sed -i 's/http:\/\/deb.debian.org/http:\/\/mirrors.ustc.edu.cn/g' /etc/apt/sources.list && \
    sed -i 's/http:\/\/security.debian.org/http:\/\/mirrors.ustc.edu.cn/g' /etc/apt/sources.list && \ 
    apt-get update 
RUN		apt-get install -y --no-install-recommends build-essential postgresql-server-dev-$PG_MAJOR && \
		cd /tmp/pgvector && \
		make clean && \
		make OPTFLAGS="" && \
		make install && \
		mkdir /usr/share/doc/pgvector && \
		cp LICENSE README.md /usr/share/doc/pgvector && \
		rm -r /tmp/pgvector && \
		apt-get remove -y build-essential postgresql-server-dev-$PG_MAJOR && \
		apt-get autoremove -y && \
		rm -rf /var/lib/apt/lists/*

COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432

CMD ["postgres", "-D", "/var/lib/postgresql/data"]
