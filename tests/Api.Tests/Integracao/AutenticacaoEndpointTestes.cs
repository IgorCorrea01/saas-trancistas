using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Aplicacao.Autenticacao.DTOs;
using FluentAssertions;
using Xunit;

namespace Api.Testes.Integracao;

public class AutenticacaoEndpointTestes : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AutenticacaoEndpointTestes(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Deve_Registrar_Nova_Empresa_Fazer_Login_E_Obter_Perfil()
    {
        // 1. Registro
        var requisicaoRegistro = new RegistrarEmpresaRequisicao(
            NomeEmpresa: "Studio Beleza Afro",
            Slug: $"studio-afro-{Guid.NewGuid():N}",
            NomeUsuario: "Patricia Santos",
            Email: $"patricia_{Guid.NewGuid():N}@studio.com",
            Senha: "SenhaForte123@"
        );

        var respostaRegistro = await _client.PostAsJsonAsync("/api/autenticacao/registrar", requisicaoRegistro);
        respostaRegistro.StatusCode.Should().Be(HttpStatusCode.Created);

        var conteudoRegistro = await respostaRegistro.Content.ReadFromJsonAsync<RegistrarEmpresaResposta>();
        conteudoRegistro.Should().NotBeNull();
        conteudoRegistro!.Token.Should().NotBeNullOrWhiteSpace();

        // 2. Login
        var requisicaoLogin = new LoginRequisicao(
            Email: requisicaoRegistro.Email,
            Senha: requisicaoRegistro.Senha
        );

        var respostaLogin = await _client.PostAsJsonAsync("/api/autenticacao/login", requisicaoLogin);
        respostaLogin.StatusCode.Should().Be(HttpStatusCode.OK);

        var conteudoLogin = await respostaLogin.Content.ReadFromJsonAsync<LoginResposta>();
        conteudoLogin.Should().NotBeNull();
        conteudoLogin!.Token.Should().NotBeNullOrWhiteSpace();
        conteudoLogin.Email.Should().Be(requisicaoRegistro.Email);

        // 3. Obter Perfil SEM token deve retornar 401 Unauthorized
        var respostaSemToken = await _client.GetAsync("/api/autenticacao/perfil");
        respostaSemToken.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // 4. Obter Perfil COM token deve retornar 200 OK
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", conteudoLogin.Token);
        var respostaComToken = await _client.GetAsync("/api/autenticacao/perfil");
        respostaComToken.StatusCode.Should().Be(HttpStatusCode.OK);

        var perfil = await respostaComToken.Content.ReadFromJsonAsync<UsuarioPerfilResposta>();
        perfil.Should().NotBeNull();
        perfil!.Email.Should().Be(requisicaoRegistro.Email);
        perfil.Nome.Should().Be(requisicaoRegistro.NomeUsuario);
    }
}
