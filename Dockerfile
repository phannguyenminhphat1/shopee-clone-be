FROM node:20
WORKDIR /root/app
COPY package*.json ./
RUN npm install
COPY ./prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build
EXPOSE 8080
CMD [ "node", "dist/src/main" ]