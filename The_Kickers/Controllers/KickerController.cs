using Azure;
using Azure.AI.OpenAI;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using Newtonsoft.Json;
namespace The_Kickers.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class KickersController : ControllerBase
    {


        private readonly IConfiguration _config;
        public KickersController(IConfiguration config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
        }

        [HttpPost(Name = "GetInformationImage")]
        public async Task<string> GetInformationFromImage(IFormFile file)
        {
            string azureModelEndpoint = _config["AzureOAIEndpoint"] ?? throw new ArgumentNullException("AzureOAIEndpoint");
            string azureModelKey = _config["AzureOAIKey"] ?? throw new ArgumentNullException("AzureOAIKey");
            string azureModelName = _config["AzureOAIModelName"] ?? throw new ArgumentNullException("AzureOAIModelName");
            // Convertir le fichier en une chaîne Base64
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();
            string base64String = Convert.ToBase64String(fileBytes);

            // Créer une URL de données pour l'image
            string dataUrl = $"data:image/jpeg;base64,{base64String}";

            OpenAIClient client = new(new Uri(azureModelEndpoint), new AzureKeyCredential(azureModelKey));

            ChatCompletionsOptions chatCompletionsOptions = new()
            {
                Messages =
                {
                    new ChatRequestSystemMessage("You are a helpful assistant that describes images and describe the image in french."),
                    new ChatRequestUserMessage(
                        new ChatMessageTextContentItem("Hi! Please describe precisly the problem on this image exemple : something is dammaged. And don't say more! Say it in french."),
                        new ChatMessageImageContentItem(new Uri(dataUrl))
                    ),
                },
                Temperature = 0,
                DeploymentName = azureModelName,
                MaxTokens = 1000,
            };
            Response<ChatCompletions> response = await client.GetChatCompletionsAsync(chatCompletionsOptions);

            var httpClient = new HttpClient();
            var obj = new
            {
                text = response.Value.Choices[0].Message.Content + " .Répond juste en format JSON avec ces champs : id, nom, prix, quantité, justification_de_la_piece ! Mais sans les Block quotes ! C'est très important de les retirer !"
            };

            var data = JsonConvert.SerializeObject(obj);
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri("http://localhost:5035/api/ask?minimumRelevance=0.76&index=auto"),
                Content = new StringContent(data, System.Text.Encoding.UTF8, "application/json")
            };
            var resp = await httpClient.SendAsync(request);
            // Check if the request was successful
            if (resp.IsSuccessStatusCode)
            {
                // Read the response content
              return await resp.Content.ReadAsStringAsync();

            } return "Problem not ok";



        }


    }
}
