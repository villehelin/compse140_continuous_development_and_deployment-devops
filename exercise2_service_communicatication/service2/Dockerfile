FROM node:14-slim
WORKDIR /app
COPY ./service2 .
RUN npm install
ADD wait-for-it.sh /app/wait-for-it.sh
RUN apt-get update && apt-get install -y dos2unix
RUN dos2unix wait-for-it.sh
ADD exercise2.proto /app/exercise2.proto
CMD ["node", "app.js"]