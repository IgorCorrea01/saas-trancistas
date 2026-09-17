using Aplicacao.Comum;
using Aplicacao.Interfaces;
using Aplicacao.Solicitacoes.DTOs;
using Dominio.Entidades;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Solicitacoes;

public class CriarSolicitacaoOrcamentoCasoDeUso
{
    private readonly IAppDbContext _context;
    private readonly IArmazenamentoArquivos _armazenamentoArquivos;

    public CriarSolicitacaoOrcamentoCasoDeUso(IAppDbContext context, IArmazenamentoArquivos armazenamentoArquivos)
    {
        _context = context;
        _armazenamentoArquivos = armazenamentoArquivos;
    }

    public async Task<RespostaResultado<SolicitacaoOrcamentoResposta>> ExecutarAsync(
        string slugEmpresa,
        CriarSolicitacaoPublicaRequisicao requisicao,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(slugEmpresa))
            return RespostaResultado<SolicitacaoOrcamentoResposta>.Falha("Slug da empresa inválido.");

        if (requisicao == null)
            return RespostaResultado<SolicitacaoOrcamentoResposta>.Falha("Dados da solicitação inválidos.");

        if (string.IsNullOrWhiteSpace(requisicao.NomeCliente))
            return RespostaResultado<SolicitacaoOrcamentoResposta>.Falha("O nome da cliente é obrigatório.");

        if (string.IsNullOrWhiteSpace(requisicao.TelefoneCliente))
            return RespostaResultado<SolicitacaoOrcamentoResposta>.Falha("O telefone/WhatsApp da cliente é obrigatório.");

        if (requisicao.ServicoId == Guid.Empty)
            return RespostaResultado<SolicitacaoOrcamentoResposta>.Falha("O serviço selecionado é obrigatório.");

        var slugNormalizado = slugEmpresa.Trim().ToLowerInvariant();

        // 1. Busca a empresa
        var empresa = await _context.Empresas
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => e.Slug == slugNormalizado && e.Ativa, cancellationToken);

        if (empresa == null)
            return RespostaResultado<SolicitacaoOrcamentoResposta>.Falha("Empresa de tranças não encontrada ou inativa.");

        // 2. Busca o serviço ativo com perguntas e opções
        var servico = await _context.Servicos
            .IgnoreQueryFilters()
            .Include(s => s.Perguntas)
                .ThenInclude(p => p.Opcoes)
            .FirstOrDefaultAsync(s => s.Id == requisicao.ServicoId && s.EmpresaId == empresa.Id && s.Ativo, cancellationToken);

        if (servico == null)
            return RespostaResultado<SolicitacaoOrcamentoResposta>.Falha("O serviço de trança selecionado não está disponível.");

        // 3. Localiza ou cria a cliente
        var apenasDigitosTelefone = new string(requisicao.TelefoneCliente.Where(char.IsDigit).ToArray());
        if (apenasDigitosTelefone.Length < 10)
            return RespostaResultado<SolicitacaoOrcamentoResposta>.Falha("O telefone informado deve conter DDD e número válidos.");

        var cliente = await _context.Clientes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.EmpresaId == empresa.Id && c.Telefone == apenasDigitosTelefone, cancellationToken);

        if (cliente == null)
        {
            cliente = new Cliente(empresa.Id, requisicao.NomeCliente, apenasDigitosTelefone, requisicao.EmailCliente);
            _context.Clientes.Add(cliente);
        }
        else
        {
            cliente.AtualizarContato(requisicao.NomeCliente, apenasDigitosTelefone, requisicao.EmailCliente);
        }

        // 4. Validação de perguntas obrigatórias
        var mapaRespostas = requisicao.Respostas?.ToDictionary(r => r.PerguntaServicoId) ?? new Dictionary<Guid, RespostaItemRequisicao>();

        foreach (var pergunta in servico.Perguntas.Where(p => p.Obrigatoria))
        {
            if (!mapaRespostas.TryGetValue(pergunta.Id, out var respostaEnviada))
            {
                return RespostaResultado<SolicitacaoOrcamentoResposta>.Falha($"A pergunta '{pergunta.Enunciado}' é obrigatória.");
            }

            var preenchida = false;
            if (pergunta.Tipo == TipoPergunta.Arquivo && respostaEnviada.Arquivo != null && respostaEnviada.Arquivo.Conteudo.Length > 0)
                preenchida = true;
            else if ((pergunta.Tipo == TipoPergunta.EscolhaUnica || pergunta.Tipo == TipoPergunta.MultiplasEscolhas) && respostaEnviada.OpcaoPerguntaId.HasValue && respostaEnviada.OpcaoPerguntaId.Value != Guid.Empty)
                preenchida = true;
            else if (!string.IsNullOrWhiteSpace(respostaEnviada.ValorTexto))
                preenchida = true;

            if (!preenchida)
            {
                return RespostaResultado<SolicitacaoOrcamentoResposta>.Falha($"A pergunta '{pergunta.Enunciado}' é obrigatória.");
            }
        }

        // 5. Cria a solicitação
        var solicitacao = new SolicitacaoOrcamento(empresa.Id, cliente.Id, servico.Id, requisicao.ObservacoesCliente);
        _context.SolicitacoesOrcamento.Add(solicitacao);

        var quantidadeFotos = 0;

        // 6. Processa cada resposta e uploads
        if (requisicao.Respostas != null)
        {
            foreach (var rReq in requisicao.Respostas)
            {
                var pergunta = servico.Perguntas.FirstOrDefault(p => p.Id == rReq.PerguntaServicoId);
                if (pergunta == null) continue;

                string? caminhoArquivo = null;
                string? nomeArquivoOriginal = null;

                if (pergunta.Tipo == TipoPergunta.Arquivo && rReq.Arquivo != null && rReq.Arquivo.Conteudo.Length > 0)
                {
                    caminhoArquivo = await _armazenamentoArquivos.SalvarAsync(
                        rReq.Arquivo.Conteudo,
                        rReq.Arquivo.NomeArquivoOriginal,
                        rReq.Arquivo.ContentType,
                        cancellationToken
                    );
                    nomeArquivoOriginal = rReq.Arquivo.NomeArquivoOriginal;
                    quantidadeFotos++;
                }

                var resposta = solicitacao.AdicionarResposta(
                    pergunta.Id,
                    rReq.ValorTexto,
                    rReq.OpcaoPerguntaId,
                    caminhoArquivo,
                    nomeArquivoOriginal
                );

                _context.RespostasSolicitacao.Add(resposta);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        var respostaDto = new SolicitacaoOrcamentoResposta(
            solicitacao.Id,
            cliente.Id,
            cliente.Nome,
            cliente.Telefone,
            servico.Id,
            servico.Nome,
            servico.PrecoBase,
            solicitacao.Status,
            solicitacao.Status.ToString(),
            solicitacao.Respostas.Count,
            quantidadeFotos,
            solicitacao.DataCriacao
        );

        return RespostaResultado<SolicitacaoOrcamentoResposta>.Ok(respostaDto, "Solicitação de orçamento enviada com sucesso! A profissional entrará em contato em breve.");
    }
}
