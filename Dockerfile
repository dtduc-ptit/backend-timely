# 1. Base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package
COPY package*.json ./

# 4. Install deps
RUN npm install

# 5. Copy source
COPY . .

# 6. Build TS
RUN npm run build

# 7. Expose port
EXPOSE 3000

# 8. Run app
CMD ["node", "dist/main.js"]
