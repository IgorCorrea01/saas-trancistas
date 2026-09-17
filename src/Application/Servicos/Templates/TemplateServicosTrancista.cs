using Dominio.Entidades;
using Dominio.Enums;

namespace Aplicacao.Servicos.Templates;

public static class TemplateServicosTrancista
{
    public static List<Servico> GerarCatalogoPadrao(Guid empresaId)
    {
        var servicos = new List<Servico>();

        // 1. Box Braids Tradicionais
        var boxBraids = new Servico(
            empresaId,
            "Box Braids Tradicionais",
            "Tranças soltas com fibra sintética (Jumbo), ideais para estilo protetor, alta durabilidade e versatilidade.",
            precoBase: 250.00m,
            duracaoEstimadaMinutos: 360 // 6 horas
        );

        var p1 = boxBraids.AdicionarPergunta(
            "Qual o comprimento desejado das tranças?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 1,
            descricaoAjuda: "O comprimento influencia diretamente no tempo de produção e na quantidade de material."
        );
        p1.AdicionarOpcao("Chanel / Altura do Ombro", 1);
        p1.AdicionarOpcao("Médio (Altura do Sutiã)", 2);
        p1.AdicionarOpcao("Longo (Altura da Cintura)", 3);
        p1.AdicionarOpcao("Extra Longo (Quadril / Abaixo)", 4);

        var p2 = boxBraids.AdicionarPergunta(
            "Qual a espessura / tamanho da divisão?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 2
        );
        p2.AdicionarOpcao("Fina (Micro / Delicada)", 1);
        p2.AdicionarOpcao("Média (Padrão Tradicional)", 2);
        p2.AdicionarOpcao("Grossa / Jumbo", 3);

        var p3 = boxBraids.AdicionarPergunta(
            "Quem irá fornecer o material (Jumbo)?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 3,
            descricaoAjuda: "Caso prefira que a trancista forneça, o valor da fibra será adicionado ao orçamento."
        );
        p3.AdicionarOpcao("Eu vou levar o cabelo/jumbo", 1);
        p3.AdicionarOpcao("Quero que a trancista forneça o material", 2);

        var p4 = boxBraids.AdicionarPergunta(
            "Qual a cor ou combinação de cores desejada?",
            TipoPergunta.Texto,
            obrigatoria: false,
            ordem: 4,
            descricaoAjuda: "Ex: Preto 1B, Castanho escuro, Mel/Loiro, Ombré hair degradê, Vermelho marsala, etc."
        );

        var p5 = boxBraids.AdicionarPergunta(
            "Envie uma foto atual do seu cabelo (comprimento e raiz)",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 5,
            descricaoAjuda: "Foto recente sem chapinha ou trança para avaliarmos a pegada da raiz e densidade dos fios."
        );

        var p6 = boxBraids.AdicionarPergunta(
            "Envie uma foto de referência do resultado que você deseja",
            TipoPergunta.Arquivo,
            obrigatoria: false,
            ordem: 6,
            descricaoAjuda: "Foto de inspiração do Instagram ou Pinterest."
        );

        servicos.Add(boxBraids);

        // 2. Nagô / Trança Rasteira
        var nago = new Servico(
            empresaId,
            "Nagô / Trança Rasteira",
            "Tranças coladas no couro cabeludo, retas ou com desenhos personalizados e geométricos.",
            precoBase: 120.00m,
            duracaoEstimadaMinutos: 180 // 3 horas
        );

        var pn1 = nago.AdicionarPergunta(
            "Qual o modelo de Nagô desejado?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 1
        );
        pn1.AdicionarOpcao("Nagô Tiara / Frente", 1);
        pn1.AdicionarOpcao("Nagô Lateral", 2);
        pn1.AdicionarOpcao("Nagô Topo com rabo/coque", 3);
        pn1.AdicionarOpcao("Nagô Cabeça Toda (Retas)", 4);
        pn1.AdicionarOpcao("Nagô Desenhada / Geométrica personalizada", 5);

        var pn2 = nago.AdicionarPergunta(
            "Deseja adicionar fibra/extensão ou fazer no próprio cabelo?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 2
        );
        pn2.AdicionarOpcao("Apenas no meu cabelo natural", 1);
        pn2.AdicionarOpcao("Com adição de Jumbo (alongamento)", 2);

        var pn3 = nago.AdicionarPergunta(
            "Deseja adicionar acessórios (anéis, búzios, fios dourados)?",
            TipoPergunta.SimNao,
            obrigatoria: false,
            ordem: 3
        );

        var pn4 = nago.AdicionarPergunta(
            "Envie uma foto do seu cabelo atual",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 4
        );

        var pn5 = nago.AdicionarPergunta(
            "Envie a foto de referência do desenho/modelo desejado",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 5
        );

        servicos.Add(nago);

        // 3. Knotless Braids (Tranças sem nó)
        var knotless = new Servico(
            empresaId,
            "Knotless Braids (Sem Nó na Raiz)",
            "Técnica moderna sem nó na raiz, proporcionando leveza imediata, caimento natural e zero dor no couro cabeludo.",
            precoBase: 320.00m,
            duracaoEstimadaMinutos: 420 // 7 horas
        );

        var pk1 = knotless.AdicionarPergunta(
            "Comprimento desejado",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 1
        );
        pk1.AdicionarOpcao("Médio (Altura do Sutiã)", 1);
        pk1.AdicionarOpcao("Longo (Cintura)", 2);
        pk1.AdicionarOpcao("Extra Longo (Quadril)", 3);

        var pk2 = knotless.AdicionarPergunta(
            "Acabamento das pontas",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 2
        );
        pk2.AdicionarOpcao("Pontas Finas Seladas", 1);
        pk2.AdicionarOpcao("Pontas Cacheadas com cacho orgânico", 2);
        pk2.AdicionarOpcao("Pontas Retas Tradicionais", 3);

        var pk3 = knotless.AdicionarPergunta(
            "Você possui sensibilidade no couro cabeludo ou alopecia?",
            TipoPergunta.SimNao,
            obrigatoria: false,
            ordem: 3
        );

        var pk4 = knotless.AdicionarPergunta(
            "Envie a foto do seu cabelo atual",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 4
        );

        servicos.Add(knotless);

        // 4. Fulani / Gypsy / Boho Braids
        var boho = new Servico(
            empresaId,
            "Gypsy / Boho Braids (Tranças com Cachos Orgânicos)",
            "Combinação de tranças com mechas de cabelo orgânico ondulado ou cacheado saindo ao longo do comprimento e pontas.",
            precoBase: 380.00m,
            duracaoEstimadaMinutos: 480 // 8 horas
        );

        var pb1 = boho.AdicionarPergunta(
            "Tipo e curvatura do cacho desejado nas mechas",
            TipoPergunta.Texto,
            obrigatoria: false,
            ordem: 1,
            descricaoAjuda: "Ex: Deep Wave, French Curl, Cacho aberto, Cacho afro fechado."
        );

        var pb2 = boho.AdicionarPergunta(
            "Quem irá fornecer o cabelo orgânico/humano para os cachos?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 2
        );
        pb2.AdicionarOpcao("Eu vou comprar e levar o cabelo cacheado e o jumbo", 1);
        pb2.AdicionarOpcao("Quero que a trancista forneça todo o material", 2);

        var pb3 = boho.AdicionarPergunta(
            "Foto do seu cabelo atual",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 3
        );

        var pb4 = boho.AdicionarPergunta(
            "Foto de referência do modelo de Boho/Gypsy desejado",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 4
        );

        servicos.Add(boho);

        // 5. Retirada de Tranças e Higienização
        var retirada = new Servico(
            empresaId,
            "Retirada de Tranças & Cuidados",
            "Serviço de remoção cuidadosa das tranças para evitar quebra dos fios, desembaraço e lavagem terapêutica.",
            precoBase: 90.00m,
            duracaoEstimadaMinutos: 120 // 2 horas
        );

        retirada.AdicionarPergunta(
            "Há quanto tempo você está com as tranças atuais?",
            TipoPergunta.Texto,
            obrigatoria: true,
            ordem: 1,
            descricaoAjuda: "Ex: 1 mês, 2 meses, 3 meses."
        );

        retirada.AdicionarPergunta(
            "As tranças foram feitas com qual material?",
            TipoPergunta.Texto,
            obrigatoria: false,
            ordem: 2
        );

        servicos.Add(retirada);

        // 6. French Curl Braids (Tendência Máxima)
        var frenchCurl = new Servico(
            empresaId,
            "French Curl Braids",
            "Tranças com mechas e pontas espiraladas sedosas em fibra francesa, trazendo leveza e movimento impecável.",
            precoBase: 350.00m,
            duracaoEstimadaMinutos: 420 // 7 horas
        );

        var pfc1 = frenchCurl.AdicionarPergunta(
            "Comprimento desejado",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 1
        );
        pfc1.AdicionarOpcao("Médio (Altura do Sutiã)", 1);
        pfc1.AdicionarOpcao("Longo (Cintura)", 2);
        pfc1.AdicionarOpcao("Extra Longo (Quadril)", 3);

        var pfc2 = frenchCurl.AdicionarPergunta(
            "Quem irá fornecer a fibra francesa (French Curl)?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 2
        );
        pfc2.AdicionarOpcao("Eu vou levar os pacotes de fibra francesa", 1);
        pfc2.AdicionarOpcao("Quero que a trancista forneça o material", 2);

        var pfc3 = frenchCurl.AdicionarPergunta(
            "Qual a cor da fibra francesa?",
            TipoPergunta.Texto,
            obrigatoria: false,
            ordem: 3,
            descricaoAjuda: "Ex: 1B (Preto), Mel / T27, Cobre / T30, Castanho claro / 4, etc."
        );

        frenchCurl.AdicionarPergunta(
            "Envie a foto do seu cabelo atual",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 4
        );

        frenchCurl.AdicionarPergunta(
            "Envie uma foto de referência do modelo desejado",
            TipoPergunta.Arquivo,
            obrigatoria: false,
            ordem: 5
        );

        servicos.Add(frenchCurl);

        // 7. Fulani Braids / Tribal Braids
        var fulani = new Servico(
            empresaId,
            "Fulani Braids (Tribal com Nagô)",
            "Estilo afro ancestral combinando tranças nagô com desenhos no topo/laterais e tranças soltas atrás com búzios e miçangas.",
            precoBase: 300.00m,
            duracaoEstimadaMinutos: 360 // 6 horas
        );

        var pfu1 = fulani.AdicionarPergunta(
            "Qual a proposta de desenho no topo?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 1
        );
        pfu1.AdicionarOpcao("Desenho clássico Fulani (trança central + laterais)", 1);
        pfu1.AdicionarOpcao("Desenho geométrico personalizado / zigue-zague", 2);
        pfu1.AdicionarOpcao("Trança Tiara frontal com tranças soltas atrás", 3);

        fulani.AdicionarPergunta(
            "Deseja colocar adornos (búzios, anéis dourados/prateados, miçangas de madeira)?",
            TipoPergunta.SimNao,
            obrigatoria: false,
            ordem: 2
        );

        fulani.AdicionarPergunta(
            "Envie a foto do seu cabelo natural",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 3
        );

        fulani.AdicionarPergunta(
            "Envie a foto de referência da Fulani desejada",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 4
        );

        servicos.Add(fulani);

        // 8. Twist / Passion Twist / Senegalese
        var twist = new Servico(
            empresaId,
            "Twist / Passion Twist",
            "Tranças torcidas de duas mechas (Two-Strand Twist), com textura leve, toque aveludado e caimento elegante.",
            precoBase: 280.00m,
            duracaoEstimadaMinutos: 360 // 6 horas
        );

        var ptw1 = twist.AdicionarPergunta(
            "Qual o estilo de Twist desejado?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 1
        );
        ptw1.AdicionarOpcao("Passion Twist (Cachos desconstruídos e macios)", 1);
        ptw1.AdicionarOpcao("Senegalese Twist (Alinhado e sedoso com kanekalon/jumbo)", 2);
        ptw1.AdicionarOpcao("Marley / Havana Twist (Textura crespa afro)", 3);

        twist.AdicionarPergunta(
            "Comprimento desejado",
            TipoPergunta.Texto,
            obrigatoria: false,
            ordem: 2,
            descricaoAjuda: "Ex: Ombro, Sutiã, Cintura."
        );

        twist.AdicionarPergunta(
            "Envie a foto do seu cabelo atual",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 3
        );

        servicos.Add(twist);

        // 9. Goddess Braids
        var goddess = new Servico(
            empresaId,
            "Goddess Braids",
            "Tranças soltas com mechas de cachos volumosos intercalados ao longo do comprimento e finalização romântica.",
            precoBase: 340.00m,
            duracaoEstimadaMinutos: 420 // 7 horas
        );

        var pg1 = goddess.AdicionarPergunta(
            "Intensidade dos cachos intercalados",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 1
        );
        pg1.AdicionarOpcao("Cachos sutis e pontas onduladas", 1);
        pg1.AdicionarOpcao("Muito volume de cachos ao longo de todo o comprimento", 2);

        goddess.AdicionarPergunta(
            "Envie foto do seu cabelo atual",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 2
        );

        servicos.Add(goddess);

        // 10. Faux Locs / Butterfly Locs
        var locs = new Servico(
            empresaId,
            "Faux Locs / Butterfly Locs",
            "Dreads temporários artesanais com textura estilizada (Butterfly desconstruída ou Locs alinhados tradicionais).",
            precoBase: 360.00m,
            duracaoEstimadaMinutos: 420 // 7 horas
        );

        var pl1 = locs.AdicionarPergunta(
            "Qual o tipo de Locs desejado?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 1
        );
        pl1.AdicionarOpcao("Butterfly Locs (Efeito borboleta texturizado)", 1);
        pl1.AdicionarOpcao("Faux Locs Tradicionais (Textura lisa e uniforme)", 2);
        pl1.AdicionarOpcao("Soft Locs (Leves e flexíveis)", 3);

        locs.AdicionarPergunta(
            "Envie foto do seu cabelo atual",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 2
        );

        servicos.Add(locs);

        // 11. Entrelace / Crochet Braids
        var entrelace = new Servico(
            empresaId,
            "Entrelace / Crochet Braids",
            "Aplicação de extensões orgânicas, cacheadas ou lisas sobre base protetora de trança nagô.",
            precoBase: 200.00m,
            duracaoEstimadaMinutos: 240 // 4 horas
        );

        var pe1 = entrelace.AdicionarPergunta(
            "Qual a técnica de aplicação?",
            TipoPergunta.EscolhaUnica,
            obrigatoria: true,
            ordem: 1
        );
        pe1.AdicionarOpcao("Entrelace Tradicional (Costurado na base nagô)", 1);
        pe1.AdicionarOpcao("Crochet Braids (Passado na agulha mecha a mecha)", 2);

        entrelace.AdicionarPergunta(
            "Envie foto do seu cabelo atual e referência da fibra",
            TipoPergunta.Arquivo,
            obrigatoria: true,
            ordem: 2
        );

        servicos.Add(entrelace);

        return servicos;
    }
}
