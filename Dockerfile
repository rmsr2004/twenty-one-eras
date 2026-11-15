FROM node:24-alpine

WORKDIR /app
COPY . .

ENV HOST=0.0.0.0
ENV PORT=8000
EXPOSE 8000

USER node
CMD ["node", "server.js"]
