const express = require('express');
const { PrismaClient }  = require('@prisma/client');

//Instância o prisma, ele lê as connffigurações do schema automaticamente
const prisma = new PrismaClient();
const app = express();

//Permite o Express entender o JSON
app.use(express.json());

//CRUD
//CREATE: criar usuario e perfil juntos
app.post('/usuarios', async (req, res) => {
    const { nome, email, senha, perfil } = req.body;

    try {
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,  
                email,
                senha,

                //Nested Write:
                //O prisma abre uma transação no bandoe insere o perfil e o usuário juntos
                //garantindo a integridade relacional: o 'id' do perfil gerado é vinculado 
                //automaticamente ao usuário sem precisarmos de uma segunda query.
                perfil: {
                    create: {
                        perfil_nome: perfil.perfil_nome
                    }
                }
            },
            include: { perfil: true } //Fala para o prisma fazer um JOIN  no MySQL e trazer os dados da tabela de perfis.
                                      //Isso molda o JSON  final, cumprindo a regra de retornar o perfil junto com o usuario.
        });

        res.status(201).json(novoUsuario);
    } catch (error){

        //Tratamento de UNIQUE CONSTRAINT(P2002)
        //Ao invés de fazer um select para checar o e-maildeixamos o banco testar a inserção.
        //Se  o MySQL barrar a duplicidade, o prisma lança o erro P2002, interceptando a duplicidade de forma mais suave.
        if(error.code ==='P2002') {
            return res.status(400).json({ detail: "Este email ja está cadastrado." });
        }
        res.status(500).json({ detail: "Erro interno do servidor." });
    }
});
// READ: Listar os usuários
app.get('/usuarios', async (req, res)=>{
    const usuarios = await prisma.usuario.findMany({
        include: { perfil: true }
    });
    res.json(usuarios);
});

// UPDATE: Atualizar o usuário e o perfil
app.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, senha, perfil } = req.body;

    try {
        const usuarioAtulizado = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data:{
                nome,
                email, 
                senha,
                perfil: {
                    update: {
                        perfil_nome: perfil.perfil_nome
                    }
                }
            },
            include: { perfil: true }
        });
        res.json(usuarioAtulizado);
    } catch (error) {
        res.status(404).json({ detail: "Usuário não encontrado." });
    }
});

// DELETE: Deletar o usuário e o perfil
app.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        //Busca o usuário para descobrir o id_perfil
        const usuario = await prisma.usuario.findUnique({ where: { id: parseInt(id) } });
        if (!usuario) return res.status(404).json({ detail: "Usuário nãoo  encontrado." });
        
        //Deleta em transação, primeiro o usuário e depois o perfil
        await prisma.$transaction([
            prisma.usuario.delete({ where: { id: parseInt(id) } }),
            prisma.perfil.delete({ where: { id: usuario.id_perfil } })
        ]);
        res.json({ mensagem: "Usuário e perfil deletados com sucesso" });
    } catch (error) {
        res.status(500).json({ detail: "Erro ao deletar." });
    }
});
// Iniciando o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});