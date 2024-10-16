FROM node:20-alpine

WORKDIR /app
RUN npm install -g pnpm
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
