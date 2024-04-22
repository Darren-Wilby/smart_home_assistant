# Stage 1: Build the React application
FROM node:latest as build
WORKDIR /app
COPY client/package.json client/package-lock.json ./
RUN npm install
COPY client ./
RUN npm run build

# Stage 2: Serve the React application using serve
FROM node:latest
WORKDIR /app
COPY --from=build /app/build ./
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", ".", "-l", "3000"]

