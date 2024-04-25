import { cp } from 'fs';
import React, { FC, FormEvent, useState } from 'react';
import BounceLoader from 'react-spinners/BounceLoader';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import BuyWindow from './buy';
import QtyWindow from './qty';

export default function ChatStock() {
  const [request, setRequest] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const request = {
      text:
        event.currentTarget.prompt.value +
        " .Répond juste en format JSON avec ces champs : id, nom, prix, quantité! Mais sans les Block quotes ! C'est très important de les retirer !",
    };

    if (!request) {
      console.error('error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        'http://localhost:5035/api/ask?minimumRelevance=0.76&index=auto',
        {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );
      if (response.ok) {
        var answer = await response.json();

        // Ajouter des crochets et des virgules pour transformer la réponse en tableau JSON
        var answerString = answer.answer.replace(/\}\s*\{/g, '}, {');
        answerString = '[' + answerString + ']';

        // Transformer la réponse en objet JSON
        const answerObject = JSON.parse(answerString);
        setAnswer(answerObject);
      } else {
        console.error(
          "Échec de l'envoi de la demande du client :",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande du client :", error);
    } finally {
      setLoading(false);
    }
    console.log('Question submitted:', request);
    setRequest('');
  };

  return (
    <div className="w-1/2 space-y-4 duration-1200 ease-in-out animate-in fade-in slide-in-from-bottom-4">
      <form
        onSubmit={handleSubmit}
        className="flex h-fit w-full flex-row items-center rounded-xl bg-black px-1 shadow-lg"
      >
        <input
          placeholder="Ask me about our stock"
          className="h-10 w-full resize-none bg-transparent px-2 font-mono text-center text-base text-white placeholder:text-gray-400 sm:text-sm border-0 outline-none ring-0 focus:ring-0 transition-all duration-300"
          type="text"
          name="prompt"
          autoComplete="off"
        ></input>
        <button
          type="submit"
          aria-disabled="false"
          className=" flex aspect-square h-8 w-8 items-center justify-center rounded-lg text-white outline-0 ring-0 hover:bg-white/25 focus-visible:bg-white/25"
          title="Submit" // Added title attribute with descriptive text
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-corner-down-left shrink-0 -ml-px"
          >
            <polyline points="9 10 4 15 9 20"></polyline>
            <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
          </svg>
        </button>
      </form>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 ${
            loading ? '' : 'hidden'
          }`}
        >
          <BounceLoader
            color={'gray'}
            loading={loading}
            size={150}
            className=""
          />
        </div>
      </div>
      {answer && <QtyWindow text={answer} />}
    </div>
  );
}
