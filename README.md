
# How to Run? 

## 1.1 Live

*Currently, the site is not hosted. You need to run the setup locally* 

## 1.2 Localhost: In Docker container 

No worries if you don't have `node.js` or `mongo` installed in your machine. Just install docker from [here](https://docs.docker.com/engine/install/) and you are good to go. 

*After installing docker follow the steps below:* 

1. Clone the respository to your local machine: ```git clone https://github.com/skauddy755/attendance-tracking-system.git``` 
2. Now you can run the app either in either of the two modes: production or development 

### 1.2.1 Development Mode 

You can use the following command to start the app in development mode: 
```
docker compose --file docker-compose.development.yaml up 
```

- Here, `./userdata` folder binded to a mount inside the container. This allows you to make modifications directly in this folder from your machine, and the same will be reflected in your container and vice versa. 
- Additionally, the `./app` folder is also binded to a mount inside the container. This allows you to use `nodemon` which will automatically look for changes in your source code, and update your website in real time, without you having to restart the server after each change you make to the code. 
- There is an additional volume (non-binded, hence managed by docker itself) called `mongo_data` which stores the `/data/db` of the **mongo service**. This keeps your MongoDB Data alive accross different container creations and deletions. 



### 1.2.2 Production Mode

You can use the following command to start the app in production mode:
```
docker compose --file docker-compose.production.yaml up 
```

- Unlike Development Mode, Here `./userdata` is not binded. Rather we handover the responsibility of this volume to docker itself. 
- Unline Development Mode, the `./app` folder too is no more binded. Since we do not intend to go in development mode. 
- Like Development Mode, there is a `mongo_data` volume to allow persistance of `/data/db` folder of **mongo_service**



