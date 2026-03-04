FROM node:20-alpine

WORKDIR /app

# Copy package files and install deps
COPY package.json ./
RUN npm install --production

# Copy all site files
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
