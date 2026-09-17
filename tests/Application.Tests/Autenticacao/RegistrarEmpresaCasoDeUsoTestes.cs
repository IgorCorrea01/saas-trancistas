using Aplicacao.Autenticacao;
using Aplicacao.Autenticacao.DTOs;
using Aplicacao.Comum;
using Aplicacao.Interfaces;
using Dominio.Entidades;
using FluentAssertions;
using Infraestrutura.Persistencia;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace Aplicacao.Testes.Autenticacao;

public class RegistrarEmpresaCasoDeUsoTestes
{
    private readonly IServicoCriptografia _servicoCriptografia = Substitute.For<IServicoCriptografia>();
    private readonly ITokenJwtService _tokenJwtService = Substitute.For<ITokenJwtService>();
    private readonly IContextoEmpresa _contextoEmpresa = Substitute.For<IContextoEmpresa>();

    private AppDbContext CriarDbContextInMemory()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options, _contextoEmpresa);
    }

    [Fact]
    public async Task Deve_Registrar_Empresa_E_Usuario_Com_Sucesso()
    {
        // Arrange
        using var db = CriarDbContextInMemory();
        _servicoCriptografia.GerarHash(Arg.Any<string>()).Returns("hash_senha_segura");
        _tokenJwtService.GerarToken(Arg.Any<Usuario>(), Arg.Any<Empresa>())
            .Returns(("token_jwt_valido", DateTime.UtcNow.AddHours(24)));

        var casoDeUso = new RegistrarEmpresaCasoDeUso(db, _servicoCriptografia, _tokenJwtService);

        var requisicao = new RegistrarEmpresaRequisicao(
            NomeEmpresa: "Studio Tranças Vip",
            Slug: "trancas-vip",
            NomeUsuario: "Juliana Silva",
            Email: "juliana@trancasvip.com",
            Senha: "SenhaSegura123"
        );

        // Act
        var resultado = await casoDeUso.ExecutarAsync(requisicao);

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados.Should().NotBeNull();
        resultado.Dados!.NomeEmpresa.Should().Be("Studio Tranças Vip");
        resultado.Dados.Slug.Should().Be("trancas-vip");
        resultado.Dados.NomeUsuario.Should().Be("Juliana Silva");
        resultado.Dados.Email.Should().Be("juliana@trancasvip.com");
        resultado.Dados.Token.Should().Be("token_jwt_valido");

        // Verifica persistência no banco
        var empresaNoBanco = await db.Empresas.FirstOrDefaultAsync(e => e.Slug == "trancas-vip");
        empresaNoBanco.Should().NotBeNull();
        empresaNoBanco!.Nome.Should().Be("Studio Tranças Vip");

        var usuarioNoBanco = await db.Usuarios.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "juliana@trancasvip.com");
        usuarioNoBanco.Should().NotBeNull();
        usuarioNoBanco!.EmpresaId.Should().Be(empresaNoBanco.Id);
    }

    [Fact]
    public async Task Deve_Falhar_Quando_Slug_Ja_Estiver_Em_Uso()
    {
        // Arrange
        using var db = CriarDbContextInMemory();
        var empresaExistente = new Empresa("Outro Studio", "trancas-vip");
        db.Empresas.Add(empresaExistente);
        await db.SaveChangesAsync();

        var casoDeUso = new RegistrarEmpresaCasoDeUso(db, _servicoCriptografia, _tokenJwtService);

        var requisicao = new RegistrarEmpresaRequisicao(
            NomeEmpresa: "Studio Tranças Vip",
            Slug: "trancas-vip",
            NomeUsuario: "Juliana Silva",
            Email: "juliana@trancasvip.com",
            Senha: "SenhaSegura123"
        );

        // Act
        var resultado = await casoDeUso.ExecutarAsync(requisicao);

        // Assert
        resultado.Sucesso.Should().BeFalse();
        resultado.Mensagem.Should().Contain("Já existe uma empresa cadastrada com este slug.");
    }
}
