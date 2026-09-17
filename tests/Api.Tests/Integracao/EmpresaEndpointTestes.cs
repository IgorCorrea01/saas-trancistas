using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Aplicacao.Autenticacao.DTOs;
using Aplicacao.Empresas.DTOs;
using FluentAssertions;
using Xunit;

namespace Api.Testes.Integracao;

public class EmpresaEndpointTestes : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public EmpresaEndpointTestes(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Deve_Obter_E_Atualizar_Dados_Da_Empresa_Autenticada()
    {
        // 1. Registra nova empresa para o teste
        var slugOriginal = $"studio-gestao-{Guid.NewGuid():N}";
        var requisicaoRegistro = new RegistrarEmpresaRequisicao(
            NomeEmpresa: "Studio Gestão",
            Slug: slugOriginal,
            NomeUsuario: "Camila Rocha",
            Email: $"camila_{Guid.NewGuid():N}@studio.com",
            Senha: "SenhaForte123@"
        );

        var respostaRegistro = await _client.PostAsJsonAsync("/api/autenticacao/registrar", requisicaoRegistro);
        respostaRegistro.StatusCode.Should().Be(HttpStatusCode.Created);
        var registro = await respostaRegistro.Content.ReadFromJsonAsync<RegistrarEmpresaResposta>();

        // 2. Consulta empresa autenticada
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registro!.Token);
        var respostaObter = await _client.GetAsync("/api/empresas/atual");
        respostaObter.StatusCode.Should().Be(HttpStatusCode.OK);

        var empresaAtual = await respostaObter.Content.ReadFromJsonAsync<EmpresaResposta>();
        empresaAtual.Should().NotBeNull();
        empresaAtual!.Nome.Should().Be("Studio Gestão");
        empresaAtual.Slug.Should().Be(slugOriginal);

        // 3. Atualiza dados da empresa
        var novoSlug = $"studio-gestao-renovado-{Guid.NewGuid():N}";
        var requisicaoAtualizar = new AtualizarEmpresaRequisicao(
            Nome: "Studio Gestão Renovado",
            Slug: novoSlug
        );

        var respostaAtualizar = await _client.PutAsJsonAsync("/api/empresas/atual", requisicaoAtualizar);
        respostaAtualizar.StatusCode.Should().Be(HttpStatusCode.OK);

        var empresaAtualizada = await respostaAtualizar.Content.ReadFromJsonAsync<EmpresaResposta>();
        empresaAtualizada.Should().NotBeNull();
        empresaAtualizada!.Nome.Should().Be("Studio Gestão Renovado");
        empresaAtualizada.Slug.Should().Be(novoSlug);
    }
}
