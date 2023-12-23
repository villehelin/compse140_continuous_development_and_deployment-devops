FROM python:3.8-slim
WORKDIR /app
COPY ./service1 .
RUN pip install requests
RUN pip install pika
RUN pip install grpcio
RUN pip install grpcio-tools
ADD exercise2.proto /app/exercise2.proto
RUN python -m grpc_tools.protoc -I. --python_out=. --pyi_out=. --grpc_python_out=. exercise2.proto
ADD wait-for-it.sh /app/wait-for-it.sh
RUN apt-get update && apt-get install -y dos2unix
RUN dos2unix wait-for-it.sh
CMD ["python", "app.py"]