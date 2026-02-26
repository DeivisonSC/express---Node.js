const express = require('express');
const { PrismaClient }  = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.post('/usuarios', async (req, res) => {
    const { nome, email, senha, perfil } = req.body;

    try {
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,  
                email,
                senha,
                perfil: {
                    create: {
                        perfil_nome: perfil.perfil_nome
                    }
                }
            },
            include: { perfil: true }
        });

        res.status(201).json(novoUsuario);
    } catch (error){
        if(error.code ==='P2002') {
            return res.status(400).json({ detail: "Este email ja está cadastrado." });
        }
        res.status(500).json({ detail: "Erro interno do servidor." });
    }
});

app.get('/usuarios', async (req, res)=>{
    const usuarios = await prisma.usuario.findMany({
        include: { perfil: true }
    });
    res.json(usuarios);
});

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

app.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const usuario = await prisma.usuario.findUnique({ where: { id: parseInt(id) } });
        if (!usuario) return res.status(404).json({ detail: "Usuário nãoo  encontrado." });

        await prisma.$transaction([
            prisma.usuario.delete({ where: { id: parseInt(id) } }),
            prisma.perfil.delete({ where: { id: usuario.id_perfil } })
        ]);
        res.json({ mensagem: "Usuário e perfil deletados com sucesso" });
    } catch (error) {
        res.status(500).json({ detail: "Erro ao deletar." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});