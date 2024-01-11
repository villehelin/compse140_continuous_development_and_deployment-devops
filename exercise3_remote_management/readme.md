# Ansible exercise

## Installation

Build image from dockerfile.
```bash
sudo docker build -t image .
```

Start container from image.
```bash
sudo docker run -d --name cont image
```

Get the ip address from this container.
```bash
sudo docker exec cont ifconfig
```

Take eth0 inet adress in my case it lookslike 172.17.0.2 and put it /etc/ansible/hosts file or make it if you dont have one. The hosts file looks should look like this.  
```
[anssible_clients]
172.17.0.2
```

You need to add fingerprint for ssh connection and can do it with connecting to the container with ssh.
```bash
ssh ssluser@172.17.0.2
```
After connecting just type yes then the password in this case it is `eee` and exit ssh by typing `exit`.

Run the ansible playbook twice.
```bash
ansible-playbook -b playbook.yml --extra-vars "ansible_user=ssluser ansible_password=eee ansible_sudo_pass=eee"
```

Open second container from the image created at start image.
```bash
sudo docker run -d --name cont2 image
```

Get this ip from this container.
```bash
sudo docker exec cont2 ifconfig
```

Put the ip to etc/ansible/hosts in my case it is 172.17.0.3 and file looks like this.
```
[anssible_clients]
172.17.0.2
172.17.0.3
```

Add fingerprint from this ssh.
```bash
ssh ssluser@172.17.0.3
```
Type yes then the password in this case it is `eee` and `exit` ssh.

Run ansible twice.
```bash
ansible-playbook -b playbook.yml --extra-vars "ansible_user=ssluser ansible_password=eee ansible_sudo_pass=eee"
```


## O1
PLAY [playbook] ********************************************************************************************************

TASK [Gathering Facts] *************************************************************************************************
ok: [172.17.0.2]

TASK [ensure that the target host has the latest version of git version management system] *****************************
ok: [172.17.0.2]

TASK [queries the uptime of target host] *******************************************************************************
changed: [172.17.0.2]

TASK [display uptime] **************************************************************************************************
ok: [172.17.0.2] => {
    "UPTIME.stdout": " 19:48:07 up 10:16,  0 user,  load average: 0.04, 0.47, 0.35"
}

PLAY RECAP *************************************************************************************************************
172.17.0.2                 : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0


## O2
PLAY [playbook] ********************************************************************************************************

TASK [Gathering Facts] *************************************************************************************************
ok: [172.17.0.2]

TASK [ensure that the target host has the latest version of git version management system] *****************************
ok: [172.17.0.2]

TASK [queries the uptime of target host] *******************************************************************************
changed: [172.17.0.2]

TASK [display uptime] **************************************************************************************************
ok: [172.17.0.2] => {
    "UPTIME.stdout": " 19:48:28 up 10:16,  0 user,  load average: 0.22, 0.48, 0.35"
}

PLAY RECAP *************************************************************************************************************
172.17.0.2                 : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0


## O3
PLAY [playbook] ********************************************************************************************************

TASK [Gathering Facts] *************************************************************************************************
ok: [172.17.0.3]
ok: [172.17.0.2]

TASK [ensure that the target host has the latest version of git version management system] *****************************
ok: [172.17.0.2]
ok: [172.17.0.3]

TASK [queries the uptime of target host] *******************************************************************************
changed: [172.17.0.2]
changed: [172.17.0.3]

TASK [display uptime] **************************************************************************************************
ok: [172.17.0.2] => {
    "UPTIME.stdout": " 19:49:52 up 10:18,  0 user,  load average: 0.35, 0.46, 0.36"
}
ok: [172.17.0.3] => {
    "UPTIME.stdout": " 19:49:53 up 10:18,  0 user,  load average: 0.35, 0.46, 0.36"
}

PLAY RECAP *************************************************************************************************************
172.17.0.2                 : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
172.17.0.3                 : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0


## O4
PLAY [playbook] ********************************************************************************************************

TASK [Gathering Facts] *************************************************************************************************
ok: [172.17.0.2]
ok: [172.17.0.3]

TASK [ensure that the target host has the latest version of git version management system] *****************************
ok: [172.17.0.3]
ok: [172.17.0.2]

TASK [queries the uptime of target host] *******************************************************************************
changed: [172.17.0.3]
changed: [172.17.0.2]

TASK [display uptime] **************************************************************************************************
ok: [172.17.0.2] => {
    "UPTIME.stdout": " 19:50:26 up 10:18,  0 user,  load average: 0.37, 0.46, 0.36"
}
ok: [172.17.0.3] => {
    "UPTIME.stdout": " 19:50:26 up 10:18,  0 user,  load average: 0.37, 0.46, 0.36"
}

PLAY RECAP *************************************************************************************************************
172.17.0.2                 : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
172.17.0.3                 : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0


