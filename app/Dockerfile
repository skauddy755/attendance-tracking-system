FROM node:16.14.0

RUN mkdir -p /attendance_tracking_system/app
RUN mkdir -p /attendance_tracking_system/userdata

WORKDIR /attendance_tracking_system/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]