FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Instalar servidor estático
RUN npm install -g serve

EXPOSE 3000

# Servir arquivos estáticos
CMD ["serve", "-s", "dist", "-l", "3000"]
