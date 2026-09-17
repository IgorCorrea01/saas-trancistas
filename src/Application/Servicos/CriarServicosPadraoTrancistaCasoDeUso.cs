using Aplicacao.Comum;
using Aplicacao.Servicos.DTOs;
using Aplicacao.Servicos.Templates;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Servicos;

public class CriarServicosPadraoTrancistaCasoDeUso
{
    private readonly IAppDbContext _context;
    private readonly IContextoEmpresa _contextoEmpresa;

    public CriarServicosPadraoTrancistaCasoDeUso(IAppDbContext context, IContextoEmpresa contextoEmpresa)
    {
        _context = context;
        _contextoEmpresa = contextoEmpresa;
    }

    public async Task<RespostaResultado<IReadOnlyList<ServicoResposta>>> ExecutarAsync(CancellationToken cancellationToken = default)
    {
        if (!_contextoEmpresa.EmpresaId.HasValue)
            return RespostaResultado<IReadOnlyList<ServicoResposta>>.Falha("Nenhuma empresa identificada no contexto da requisição.");

        var empresaId = _contextoEmpresa.EmpresaId.Value;

        // Verifica se a empresa já possui serviços
        var jaPossuiServicos = await _context.Servicos.AnyAsync(cancellationToken);
        if (jaPossuiServicos)
            return RespostaResultado<IReadOnlyList<ServicoResposta>>.Falha("A empresa já possui serviços cadastrados.");

        var catalogoPadrao = TemplateServicosTrancista.GerarCatalogoPadrao(empresaId);
        _context.Servicos.AddRange(catalogoPadrao);
        await _context.SaveChangesAsync(cancellationToken);

        var resposta = catalogoPadrao.Select(s => new ServicoResposta(
            s.Id,
            s.Nome,
            s.Descricao,
            s.PrecoBase,
            s.DuracaoEstimadaMinutos,
            s.Ativo,
            s.Perguntas.Count,
            s.DataCriacao
        )).ToList();

        return RespostaResultado<IReadOnlyList<ServicoResposta>>.Ok(resposta, "Catálogo padrão de tranças gerado com sucesso.");
    }
}
