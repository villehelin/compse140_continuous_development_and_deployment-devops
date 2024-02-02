import time
import requests
from datetime import datetime
import pika
import sys

import subprocess

import grpc
import exercise2_pb2
import exercise2_pb2_grpc
# command to create grpc files from proto file run this in service1 folder
# python -m grpc_tools.protoc -I../ --python_out=. --pyi_out=. --grpc_python_out=. ../exercise2.proto

subprocess.call(['./utils/wait-for-it.sh', 'rabbitmq:5672', '--timeout=0', '--', 'echo', 'rabbitmq is up'])
subprocess.call(['./utils/wait-for-it.sh', 'service2:8000', '--timeout=0', '--', 'echo', 'service2 HTTP is up'])


connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
channel = connection.channel()
channel.queue_declare(queue='message')
channel.queue_declare(queue='log')

grpc_channel = grpc.insecure_channel("service2:50051")
grpc_stub = exercise2_pb2_grpc.messagerStub(grpc_channel)


counter = 1
send_stop_message_sent = False

def get_state():
    try:
        response = requests.get("http://gateway:8083/state")
        if response.status_code == 200:
            return response.text
    except requests.RequestException as e:
        print(f"Failed to get state: {str(e)}")
    return None



while True:
    state = get_state()

    if state == "INIT":
        counter = 1
        send_stop_message_sent = False

    elif state == "PAUSED":
        if not send_stop_message_sent:
            channel.basic_publish(exchange='', routing_key='log', body='SND STOP')
            send_stop_message_sent = True
        time.sleep(2)

    elif state == "RUNNING":
        send_stop_message_sent = False
        try:
            timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
            hostname = 'service2'
            port = 8000
            message = f"SND {counter} {timestamp} {hostname}:{port}"
            print(message)

            channel.basic_publish(exchange='', routing_key='message', body=message)

            response = requests.post(f"http://{hostname}:{port}", data=message, headers={'Content-Type': 'text/plain'})
            channel.basic_publish(exchange='', routing_key='log', body=f"{response.status_code} {timestamp}")

            grpc_response = grpc_stub.send_message(exercise2_pb2.message_request(message=message))
            channel.basic_publish(exchange='', routing_key='message', body=f"RPC {grpc_response.count}")

            counter += 1
            
            time.sleep(2)
        except Exception as e:
            channel.basic_publish(exchange='', routing_key='log', body=f"Error:  {str(e)}") 

    elif state == "SHUTDOWN":
        if not send_stop_message_sent:
            channel.basic_publish(exchange='', routing_key='log', body='SND STOP')
            send_stop_message_sent = True
        connection.close()
        sys.exit(0)