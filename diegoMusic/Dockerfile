FROM node:20-alpine AS builder

WORKDIR /app

ARG EXPO_PUBLIC_API_URL=https://api.diegomusic.com:47821/api
ARG EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
ARG EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID

ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=$EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
ENV EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=$EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npx expo export --platform web --output-dir dist


FROM nginx:1.27-alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 47822
CMD ["nginx", "-g", "daemon off;"]
