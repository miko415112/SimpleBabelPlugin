FROM node:14-alpine AS build
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build


FROM nginx:alpine


EXPOSE ${PORT}

COPY nginx.conf /etc/nginx/nginx.conf


# Start Nginx
CMD ["nginx", "-g", "daemon off;"]





RUN corepack enable
RUN npm install
RUN npm run build

CMD ["npm", "run", "deploy"]
