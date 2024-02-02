FROM node:14-slim

WORKDIR /app

COPY . /app/

RUN npm install
COPY ./src/utils/wait-for-it.sh /app/utils/
RUN chmod +x /app/utils/wait-for-it.sh
RUN apt-get update && apt-get install -y dos2unix
RUN dos2unix utils/wait-for-it.sh
ADD exercise2.proto /app/src/exercise2.proto

ENTRYPOINT node ./src/index.js