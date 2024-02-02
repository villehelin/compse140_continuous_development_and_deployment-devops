FROM python:3.8-slim

WORKDIR /app

COPY . /app/

RUN pip install requests
RUN pip install pika
RUN pip install grpcio
RUN pip install grpcio-tools

ADD exercise2.proto /app/src/exercise2.proto
RUN python -m grpc_tools.protoc -I. --python_out=./src --pyi_out=./src --grpc_python_out=./src exercise2.proto

COPY ./src/utils/wait-for-it.sh /app/utils/
RUN chmod +x /app/utils/wait-for-it.sh

RUN apt-get update && apt-get install -y dos2unix
RUN dos2unix utils/wait-for-it.sh

CMD ["python","-u","src/app.py"]