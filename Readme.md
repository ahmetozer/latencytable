# Latency Table

This software created for showing real time connection status between servers.  
System supports both IPv4 and IPv6.  
You can use by globally or region.  

![IPv4 Min Latency](https://github.com/ahmetozer/latencytable/raw/docs/img/ipv4_min_latency.png)
![IPv6 Packet Loss](https://github.com/ahmetozer/latencytable/raw/docs/img/ipv6_packet_loss.png)

## Installation

### Website

Site title, description, logo, favicon and company info configurations is under **_config.yml**

```yml
title: Acme Corp Latency Table
description: >-
  Welcome to Acme Data Center Latency Table. You can watch the Latency between our data centers in realtime.
company:
  url:                  https://example.com
  name:                 Acme Corp
  logo:                 # /acme.jpg
  logoinvert:           true
  favicon:              /favicon.png
```

You can also add your own links at footer.
To set custom footer links add, change or remove change footerLinks item at **_config.yml**. Maximum footer Links are limited to 7.

```yml
footerLinks:
  - one:
    name: "Link1"
    link:  "#Link1"
  - two:
    name: "Link2"
    link:  "#Link2"
  - three:
    name: "Link3"
    link:  "#Link3"
  - four:
    name: "Link4"
    link:  "#Link4"
```

### Server List (servers.json)

Table is created from servers json and servers make a request to given data.
Ensure given data is correct.

Scheme of json is easy to configure.  
Enter name of region or server, give a net-tools-service url and server connection addr.

System has a few modes to detecting IPv4 and IPv6.

You can set IPv4 and IPv6 addr by manual

```json
 {"name":"Ams1","ntsurl":"https://net-tools-service-ams1.ahmetozer.org/",   "ipv4":"203.0.113.2",       "ipv6":"2001:db8:900d:c0de::2"   },
 {"name":"Ams1","ntsurl":"https://net-tools-service-ams1.ahmetozer.org/",   "ipv4":"ipv4-ams1.ahmetozer.org",       "ipv6":"ipv6-ams1.ahmetozer.org"   }
```

Or give a Dualstack domain (has a A and AAAA record) for resolving addr.

```json
 {"name":"Ams1","ntsurl":"https://net-tools-service-ams1.ahmetozer.org/",   "ds": "ds-ams1.ahmetozer.org"   }
```

Example configuration

```json
{
    "servers": [
        {"name":"Ist1","ntsurl":"https://net-tools-service-ist1.ahmetozer.org/",   "ipv4":"203.0.113.2",       "ipv6":"2001:db8:900d:c0de::2"   },
        {"name":"Ams1","ntsurl":"https://net-tools-service-ams1.ahmetozer.org/",   "ds": "ds-ams1.ahmetozer.org"   }
        {"name":"Saw1","ntsurl":"https://net-tools-service-ist1.ahmetozer.org/",    "ipv4":"203.0.113.5",       "ipv6":"2001:db8:900d:c0de::5"   },
        {"name":"Iad1","ntsurl":"https://net-tools-service-iad1.ahmetozer.org/",    "ipv4":"203.0.113.10",     "ipv6":"2001:db8:900d:c0de::10"  }
    ]
}
```

### Region Pages

1. Create md file under region page.

2. Create and set server list under region folder.  
Ex. eu.json

```json
{
    "servers": [
        {"name":"Ams1","ntsurl":"https://net-tools-service-ams1.ahmetozer.org/",   "ipv4":"203.0.113.2",     "ipv6":"2001:db8:900d:c0de::2"     },
        {"name":"Dlm1","ntsurl":"https://net-tools-service-dlm1.ahmetozer.org/",    "ipv4":"203.0.113.4",     "ipv6":"2001:db8:900d:c0de::4"     },
        {"name":"Saw1","ntsurl":"https://net-tools-service-ist1.ahmetozer.org/",    "ipv4":"203.0.113.5",     "ipv6":"2001:db8:900d:c0de::5"     }
    ]
}
```

3. Configure page settings.

```markdown
---
title: EU
descr: Data centers in Europe
layout: default
listurl: /region/eu.json
permalink: /eu/
tags: ["region"]
---
```

### Net Tools Service Configuration

This system requires [net tools service](https://github.com/ahmetozer/net-tools-service) for measure latency and serving data to web.

You can see more details for installation and configuration on [net tools service](https://github.com/ahmetozer/net-tools-service) main page.

Latency table requires icmp function on net tools service.  
By default net tools rate limit is one request in one second. To prevent getting rate limit error on latency table increase rate limit to 10.  
For preventing cors with setting referrers to your latency table host.

```bash
#   Example Conf
docker run -it -e rate="10" -e functions="icmp" ahmetozer/net-tools-service

## Prevent cors request from other websites. Change `latencytable.ahmetozer.org` to your latency table host
docker run -it -e rate="10" -e functions="icmp" -e referrers="latencytable.ahmetozer.org" ahmetozer/net-tools-service
```
