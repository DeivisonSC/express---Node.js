# API de Usuários - Node.js & Prisma

Este projeto demonstra a implementação de uma API RESTful utilizando **Node.js**, **Express** e o ORM **Prisma**, com foco na funcionalidade de escrita aninhada (Nested Writes) em um banco de dados relacional.

## Tecnologias
* Node.js
* Express (Framework Web)
* Prisma (ORM)
* MySQL

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
