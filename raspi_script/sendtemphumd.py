import http.client
import json
import time
import datetime
#import Adafruit_DHT
#sensor = Adafruit_DHT.DHT22
#pin = 13
humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)

def sendData():
    conn = http.client.HTTPConnection("calm-springs-74688.herokuapp.com", 80, timeout=60)
    headers = {'Content-type': 'application/json',"Connection": "close"}
    json_foo = json.dumps(d)
    conn.request("POST", "/nodes",json_foo,headers)
    r1 = conn.getresponse()
    print('sending data ', r1.status, r1.reason)
    conn.close()
    
while 1:
    if time.time()-t_lastread>60*15:   ###read and send data every 15 mins
        #humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)
        d = {}
        d["Node"] = 4
        d["Temp"] = 2
        d["Humd"] = 3
        d["timestamp"] = round(time.time()*1000)
        d["date"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sendData()
        t_lastread = time.time()