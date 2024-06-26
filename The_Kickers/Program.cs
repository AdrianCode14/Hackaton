using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using KernelMemory.MemoryStorage.SqlServer;
using KernelMemoryService.Models;
using KernelMemoryService.Services;
using KernelMemoryService.Settings;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.KernelMemory;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using MinimalHelpers.OpenApi;
using The_Kickers.Controllers;
using The_Kickers.Models;
using TinyHelpers.AspNetCore.Extensions;
using TinyHelpers.AspNetCore.Swagger;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true);

// Add services to the container.
var aiSettings = builder.Configuration.GetSection<AzureOpenAISettings>("AzureOpenAI")!;
var appSettings = builder.Services.ConfigureAndGet<AppSettings>(builder.Configuration, nameof(AppSettings))!;

builder.Services.AddMemoryCache();
builder.Services.AddCors();
builder.Services.AddScoped<DBkickers>();


var kernelMemory = new KernelMemoryBuilder(builder.Services)
    .WithAzureOpenAITextEmbeddingGeneration(new()
    {
        APIKey = aiSettings.Embedding.ApiKey,
        Deployment = aiSettings.Embedding.Deployment,
        Endpoint = aiSettings.Embedding.Endpoint,
        APIType = AzureOpenAIConfig.APITypes.EmbeddingGeneration,
        Auth = AzureOpenAIConfig.AuthTypes.APIKey,
    })
    .WithAzureOpenAITextGeneration(new()
    {
        APIKey = aiSettings.ChatCompletion.ApiKey,
        Deployment = aiSettings.ChatCompletion.Deployment,
        Endpoint = aiSettings.ChatCompletion.Endpoint,
        APIType = AzureOpenAIConfig.APITypes.ChatCompletion,
        Auth = AzureOpenAIConfig.AuthTypes.APIKey
    })
    .WithSimpleFileStorage(appSettings.StoragePath)
    .WithSimpleVectorDb(appSettings.VectorDbPath)
    //.WithSqlServerMemoryDb("Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=kickers;Integrated Security=True;")
    .WithSearchClientConfig(new()
    {
        EmptyAnswer = "I'm sorry, I haven't found any relevant information that can be used to answer your question",
        MaxMatchesCount = 10,
        AnswerTokens = 800
    })
    .WithCustomTextPartitioningOptions(new()
    {
        MaxTokensPerParagraph = 1000,
        MaxTokensPerLine = 300,
        OverlappingTokens = 100
    })
    // Configure the asynchronous memory.
    .WithSimpleQueuesPipeline(appSettings.QueuePath)
    .Build<MemoryService>();  // Asynchronous memory with pipelines.

builder.Services.AddSingleton<IKernelMemory>(kernelMemory);

// Semantical Kernel is used to reformulate questions taking into account all the previous interactions, so that embeddings can be generate more accurately.
var kernelBuilder = builder.Services.AddKernel()
    .AddAzureOpenAIChatCompletion(aiSettings.ChatCompletion.Deployment, aiSettings.ChatCompletion.Endpoint, aiSettings.ChatCompletion.ApiKey);

builder.Services.AddScoped<ChatService>();
builder.Services.AddScoped<ApplicationMemoryService>();

builder.Services.AddScoped<Stock>();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Kernel Memory Service API", Version = "v1" });

    options.AddDefaultResponse();
    options.AddFormFile();
    options.MapType<UploadTag>(() => new() { Type = "string", Default = new OpenApiString("Name:Value") });
});

builder.Services.AddDefaultProblemDetails();
builder.Services.AddDefaultExceptionHandler();

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.RoutePrefix = string.Empty;
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Kernel Memory Service API v1");
        options.InjectStylesheet("/css/swagger.css");
    });
}


app.MapControllers();

// allow cors for all origins
app.UseCors(options =>
{
    options.AllowAnyOrigin();
    options.AllowAnyMethod();
    options.AllowAnyHeader();
});


var documentsApiGroup = app.MapGroup("/api/documents");

documentsApiGroup.MapPost(string.Empty, async (IFormFile file, ApplicationMemoryService memory, LinkGenerator linkGenerator, string? documentId = null, [FromQuery(Name = "tag")] UploadTag[]? tags = null, string? index = null) =>
{
    documentId = await memory.ImportAsync(file.OpenReadStream(), file.FileName, documentId, tags, index);
    var uri = linkGenerator.GetPathByName("GetDocumentStatus", new { documentId });

    return TypedResults.Accepted(uri, new UploadDocumentResponse(documentId));
})
.DisableAntiforgery();

documentsApiGroup.MapDelete("{documentId}", async (string documentId, ApplicationMemoryService memory, string? index = null) =>
{
    await memory.DeleteDocumentAsync(documentId, index);
    return TypedResults.NoContent();
});


app.MapPost("/api/ask", async Task<Results<Ok<MemoryResponse>, NotFound>> (Question question, ApplicationMemoryService memory, double minimumRelevance = 0.76, string? index = null) =>
{
    var chat = new ChatHistory();
    chat.AddSystemMessage(@"Tu es un expert dans le domaine de la r�paration automobile. Tu vas devoir comprendre la probl�matique de l'utilsateur. 
                            Il va t'expliquer son probl�me et tu vas devoir le r�soudre ! Tu vas lui expliquer la solution � son probl�me et lui donner le nom du produit ainsi que le prix 
                            pour qu'il puisse changer son �l�ment cass�. 
                            ");

    var response = await memory.AskQuestionAsync(question, minimumRelevance, index);
    if (response is null)
    {
        return TypedResults.NotFound();
    }

    return TypedResults.Ok(response);
})
.WithOpenApi(operation =>
{
    operation.Summary = "Ask a question to the Kernel Memory Service";
    operation.Description = "Ask a question to the Kernel Memory Service using the provided question and optional tags. The question will be reformulated taking into account the context of the chat identified by the given ConversationId. If tags are provided, they will be used as filters with OR logic.";

    var minimumRelevance = operation.Parameters.First(p => p.Name == "minimumRelevance");
    var index = operation.Parameters.First(p => p.Name == "index");

    minimumRelevance.Description = "The minimum Cosine Similarity required.";
    index.Description = "The index in which to search for documents. If not provided, the default index will be used ('default').";

    return operation;
});

app.Run();
