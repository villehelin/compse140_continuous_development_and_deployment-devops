import os
import time
import requests
from datetime import datetime

counter = 1

log_file_path = os.path.join(os.path.dirname(__file__), '..', 'logs/service1.log') 
if not os.path.exists(log_file_path):
    # Create directory for logs if it does not exists
    os.makedirs(os.path.dirname(log_file_path), exist_ok=True)
    
# Create service1.log if it does not exists
with open(log_file_path, 'w') as log_file: 
    # Ensure that the files are empty in the beginning
    log_file.write('') 
    while counter <= 20:
            # Compose a text from a counter current time and address+port of service2.
            timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
            hostname = 'helin-service2'
            port = 8000
            message = f"{counter} {timestamp} {hostname}:{port}"

            try:
                # Send the text with HTTP protocol to service 2
                response = requests.post(f"http://{hostname}:{port}", data=message, headers={'Content-Type': 'text/plain'})
                if response.status_code == 200:
                    # Write message to a file “service1.log” and print it to console 
                    log_file.write(message + "\n")
                    print("Sending: " + message)
                    # Increase the counter with 1
                    counter += 1
                else:
                    # If the sending fails, catch the exception and write the error message to “service1.log”
                    log_file.write(f"{response.text}\n")
            except requests.exceptions.RequestException as e:
                # Post could not connect or has no connection to hostname in this case service 2
                # This error happens when using helin-service2 as hostname not with straight ip
                # If the sending fails, catch the exception and write the error message to “service1.log”
                log_file.write("No connection to service 2\n")
                print("No connection to service 2")
            except Exception as e:
                # If the sending fails, catch the exception and write the error message to “service1.log”
                log_file.write(f"An unexpected error occurred: {str(e)}\n")
                print(f"An unexpected error occurred: {str(e)}")
                
            time.sleep(2)

    # After the 20 rounds write “STOP” to file “service1.log”
    log_file.write("STOP\n")
    print("STOP")

    try:
        # send STOP to service 2
        requests.post(f"http://{hostname}:{port}", data="STOP", headers={'Content-Type': 'text/plain'})
    except Exception as e:
        log_file.write(f"An unexpected error occurred while sending STOP: {str(e)}\n")
        print(f"An unexpected error occurred while sending STOP: {str(e)}")

log_file.close()