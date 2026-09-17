FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copia arquivos de projeto para restauração de dependências em cache
COPY src/Dominio/Dominio.csproj src/Dominio/
COPY src/Aplicacao/Aplicacao.csproj src/Aplicacao/
COPY src/Infraestrutura/Infraestrutura.csproj src/Infraestrutura/
COPY src/Api/Api.csproj src/Api/
RUN dotnet restore src/Api/Api.csproj

# Copia o restante do código e compila
COPY src/ src/
WORKDIR /app/src/Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Api.dll"]
