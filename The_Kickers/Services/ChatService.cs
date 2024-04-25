using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel.ChatCompletion;

namespace KernelMemoryService.Services;

public class ChatService(IMemoryCache cache, IChatCompletionService chatCompletionService, IOptions<AppSettings> appSettingsOptions, bool firstChat = true)
{
    public async Task<string> CreateQuestionAsync(Guid conversationId, string question)
    {
        var chat = new ChatHistory(cache.Get<ChatHistory?>(conversationId) ?? []);

        var embeddingQuestion = $"""
            Reformulate the following question taking into account the context of the chat to perform embeddings search:
            ---
            {question}
            ---
            You must reformulate the question in the same language of the user's question.
            Never add "in this chat", "in the context of this chat", "in the context of our conversation", "search for" or something like that in your answer.
            """;

        if (firstChat)
        {
            var systemMessage = @"Tu es un expert dans le domaine de la réparation automobile. Tu vas devoir comprendre la problématique de l'utilsateur.
                                  Il va t'expliquer son problème et tu vas devoir le résoudre ! Tu vas lui expliquer la solution à son problème et lui donner le nom du produit ainsi que le prix pour qu'il puisse changer son élément cassé.
                                  Fait ça de manière professionnelle et en utilisant un langage adapté à l'utilisateur. Tu vas devoir reformuler les questions de l'utilisateur pour obtenir plus d'informations.
                                  Ne soit pas trop long dans tes réponses, l'utilisateur n'a pas besoin de savoir tout ce que tu sais, juste ce qui l'intéresse. Bonne chance !
                                  ";
            chat.AddSystemMessage(systemMessage);
            firstChat = false;
        }

        chat.AddUserMessage(embeddingQuestion);
        var reformulatedQuestion = await chatCompletionService.GetChatMessageContentAsync(chat)!;
        chat.AddAssistantMessage(reformulatedQuestion.Content!);

        await UpdateCacheAsync(conversationId, chat);

        return reformulatedQuestion.Content!;
    }

    public async Task AddInteractionAsync(Guid conversationId, string question, string answer)
    {
        var chat = new ChatHistory(cache.Get<ChatHistory?>(conversationId) ?? []);

        chat.AddUserMessage(question);
        chat.AddAssistantMessage(answer);

        await UpdateCacheAsync(conversationId, chat);
    }

    private Task UpdateCacheAsync(Guid conversationId, ChatHistory chat)
    {
        if (chat.Count > appSettingsOptions.Value.MessageLimit)
        {
            chat = new ChatHistory(chat.TakeLast(appSettingsOptions.Value.MessageLimit));
        }

        cache.Set(conversationId, chat);

        return Task.CompletedTask;
    }

    // get chat history
    public ChatHistory GetChatHistory(Guid conversationId)
    {
        return cache.Get<ChatHistory?>(conversationId) ?? new ChatHistory();
    }
}
