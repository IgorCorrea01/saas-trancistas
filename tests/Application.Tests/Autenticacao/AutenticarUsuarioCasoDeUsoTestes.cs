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

public class AutenticarUsuarioCasoDeUsoTestes
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
    public async Task Deve_Autenticar_Usuario_Com_Credenciais_Validas()
    {
        // Arrange
        using var db = CriarDbContextInMemory();
        var empresa = new Empresa("Studio Afro", "studio-afro");
        var usuario = new Usuario(empresa.Id, "Bruna Lima", "bruna@studio.com", "hash_senha_correta");

        db.Empresas.Add(empresa);
        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync();

        _servicoCriptografia.Verificar("SenhaCorreta123", "hash_senha_correta").Returns(true);
        _tokenJwtService.GerarToken(Arg.Any<Usuario>(), Arg.Any<Empresa>())
            .Returns(("token_jwt_valido", DateTime.UtcNow.AddHours(24)));

        var casoDeUso = new AutenticarUsuarioCasoDeUso(db, _servicoCriptografia, _tokenJwtService);
        var requisicao = new LoginRequisicao("bruna@studio.com", "SenhaCorreta123");

        // Act
        var resultado = await casoDeUso.ExecutarAsync(requisicao);

        // Assert
        resultado.Sucesso.Should().BeTrue();
        resultado.Dados.Should().NotBeNull();
        resultado.Dados!.Email.Should().Be("bruna@studio.com");
        resultado.Dados.NomeUsuario.Should().Be("Bruna Lima");
        resultado.Dados.EmpresaId.Should().Be(empresa.Id);
        resultado.Dados.Token.Should().Be("token_jwt_valido");
    }

    [Fact]
    public async Task Deve_Falhar_Quando_Senha_For_Invalida()
    {
        // Arrange
        using var db = CriarDbContextInMemory();
        var empresa = new Empresa("Studio Afro", "studio-afro");
        var usuario = new Usuario(empresa.Id, "Bruna Lima", "bruna@studio.com", "hash_senha_correta");

        db.Empresas.Add(empresa);
        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync();

        _servicoCriptografia.Verificar("SenhaErrada", "hash_senha_correta").Returns(false);

        var casoDeUso = new AutenticarUsuarioCasoDeUso(db, _servicoCriptografia, _tokenJwtService);
        var requisicao = new LoginRequisicao("bruna@studio.com", "SenhaErrada");

        // Act
        var resultado = await casoDeUso.ExecutarAsync(requisicao);

        // Assert
        resultado.Sucesso.Should().BeFalse();
        resultado.Mensagem.Should().Contain("Credenciais inválidas");
    }
}
