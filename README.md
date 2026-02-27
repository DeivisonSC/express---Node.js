# API de Usuários - Node.js & Prisma

Este projeto demonstra a implementação de uma API RESTful utilizando **Node.js**, **Express** e o ORM **Prisma**, com foco na funcionalidade de escrita aninhada (Nested Writes) em um banco de dados relacional.

## Tecnologias
* Node.js  20.20.0
* Express  5.2.1 (Framework Web)
* Prisma  6.19.2 (ORM)
* MySQL  (Laragon)

## Funcionalidade Principal (Nested Write)
O projeto utiliza o recurso nativo do Prisma para criar simultaneamente um `Usuario` e seu `Perfil` em uma única transação, garantindo a integridade dos dados:

```javascript
const novoUsuario = await prisma.usuario.create({
    data: {
        nome,
        email,
        senha,
        perfil: {
            create: { perfil_nome }
        }
    }
});
```
Como Executar:

1. Instale as dependências: `npm install`

2. Configure o banco no arquivo `.env`

3. Rode as migrações: `npx prisma migrate dev`

4. Inicie o servidor: `npm start` (ou `node index.js`)
