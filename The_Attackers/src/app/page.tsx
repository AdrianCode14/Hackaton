"use client";
import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { BounceLoader } from "react-spinners";
import css from "styled-jsx/css";
import Link from "next/link";
import BuyWindow from "../../components/buy";
export default function Home() {
  const [request, setRequest] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const request = {
      text:
        event.currentTarget.prompt.value +
        " .Répond juste en format JSON avec ces champs : id, nom, prix, quantité, justification_de_la_piece ! Mais sans les Block quotes ! C'est très important de les retirer !",
    };

    if (!request) {
      console.error("error");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5035/api/ask?minimumRelevance=0.76&index=auto",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );
      if (response.ok) {
        var answer = await response.json();

        // Ajouter des crochets et des virgules pour transformer la réponse en tableau JSON
        var answerString = answer.answer.replace(/\}\s*\{/g, "}, {");
        answerString = "[" + answerString + "]";

        // Transformer la réponse en objet JSON
        const answerObject = JSON.parse(answerString);

        console.log("Réponse du serveur :", answerObject);
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
    console.log("Question submitted:", request);
    setRequest("");
  };

  const handleFileSubmit = async (event: FormEvent<HTMLInputElement>) => {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const formData = new FormData();
      formData.append("file", file);
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5035/Kickers", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          var answer = await response.json();
          console.log("answer:"+answer);
          // Ajouter des crochets et des virgules pour transformer la réponse en tableau JSON
          var answerString = answer.answer.replace(/\}\s*\{/g, "}, {");
          answerString = "[" + answerString + "]";
  
          // Transformer la réponse en objet JSON
          const answerObject = JSON.parse(answerString);
  
          console.log("Réponse du serveur :", answerObject);
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
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      <Link href="/"></Link>
      <Link className="fixed right-3 top-3 rounded-lg border-black border-2 p-4 shadow-2xl " href="/admin">
        Admin Panel
      </Link>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 ${
            loading ? "" : "hidden"
          }`}
        >
          <BounceLoader
            color={"gray"}
            loading={loading}
            size={150}
            className=""
          />
        </div>
        <p className="shadow-2xl fixed left-0 top-0 flex w-full justify-center border-b border-black bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome to &nbsp;
          <code className="font-mono font-bold">Kickers</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://www.google.com/search?q=kicker&tbm=isch&ved=2ahUKEwih2u-VwIqFAxWEkv0HHVqCARsQ2-cCegQIABAA&oq=kicker&gs_lp=EgNpbWcaAhgDIgZraWNrZXIyDRAAGIAEGIoFGEMYsQMyChAAGIAEGIoFGEMyBRAAGIAEMgoQABiABBiKBRhDMgUQABiABDIFEAAYgAQyCBAAGIAEGIsDMggQABiABBiLAzIIEAAYgAQYiwMyCBAAGIAEGIsDSKIlULAJWIwkcAV4AJABAZgBPKAB6wOqAQIxMLgBA8gBAPgBAYoCC2d3cy13aXotaW1nqAIAwgIGEAAYBxgewgINEAAYgAQYigUYQxiLA8ICDhAAGIAEGLEDGIMBGIsDwgIREAAYgAQYigUYsQMYgwEYiwPCAgsQABiABBixAxiLA4gGAQ&sclient=img&ei=k9r-ZeHEOYSl9u8P2oSG2AE&bih=826&biw=1536&prmd=ivnbz"
            target="_blank"
            rel="noopener noreferrer"
            title="Kickers Logo" // Added title attribute with descriptive text
          >
            <Image
              src="/logo.svg"
              alt="Logo"
              className="dark:invert"
              width={250}
              height={60}
              priority
            />
          </a>
        </div>
      </div>

      <div className="w-1/2 mb-6 mt-6 space-y-4 duration-1200 ease-in-out animate-in fade-in slide-in-from-bottom-4">
        <form
          onSubmit={handleSubmit}
          className="flex h-fit w-full flex-row items-center rounded-xl bg-black px-1 shadow-2xl"
        >
          <input
            placeholder="Tell your problem here and we will give you the solution !"
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
      </div>
      <div className="w-1/6 mb-6 duration-1200 ease-in-out animate-in fade-in slide-in-from-bottom-4">
        <form className="flex h-fit w-full flex-row items-center rounded-xl bg-black px-1 shadow-2xl">
          <label className="flex h-10 w-full items-center justify-center rounded-xl bg-black font-mono text-sm text-gray-400 cursor-pointer">
            Show us a picture !
            <input type="file" className="hidden" onChange={handleFileSubmit} />
          </label>
        </form>
      </div>
      <div className="mb-6 w-full flex justify-center">
        {answer && <BuyWindow text={answer} />}
      </div>
      <div className=" grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left font-mono">
        <a
          href="https://www.linkedin.com/in/adrian-grosu14/"
          className=" group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Adrian{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Car guy, Porsche lover. Winner at the MiC team's kicker tournament.
          </p>
        </a>

        <a
          href="https://www.linkedin.com/in/matteo-firenze-a27b78283/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Matteo{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            F1 passionate, Forza Ferrari ! Winner at the MiC team's kicker
            tournament.
          </p>
        </a>

        <a
          href="https://www.linkedin.com/in/guillaume-trpn/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Guillaume{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Pokemon trainer, long live electrics ! Loser at the MiC team's
            kicker tournament.
          </p>
        </a>

        <a
          href="https://www.linkedin.com/in/franco-falconi-9a3911294/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Franco{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-balance`}>
            F1 passionate, Aston Martin power ! Loser at the MiC team's kicker
            tounament.
          </p>
        </a>
      </div>
    </main>
  );
}
