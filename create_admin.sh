#!/bin/bash

# Script para criar primeiro usuário administrador
echo "Criando primeiro usuário administrador..."

curl -X POST http://localhost:5000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@treinador.com",
    "password": "admin123",
    "phone": "11999999999"
  }'

echo -e "\n\nAdmin criado! Use:"
echo "Email: admin@treinador.com"
echo "Senha: admin123"
echo "Acesse: /admin"