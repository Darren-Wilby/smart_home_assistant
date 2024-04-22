FROM node:latest
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm install
COPY server ./
EXPOSE 4000
CMD ["node", "app.js"]
