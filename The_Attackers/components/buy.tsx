import React, { FC } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";

interface Buy {
  text?: string;
}
const BuyWindow: FC<Buy> = ({ text = "..." }: Buy) => {
  var response: any = text[0];


  const fillAll = (data: any) =>
    toast.info(data, {
      position: "top-center",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Bounce,
    });
    
  async function buyItem() {
    try {
      const request = {
        id: response.id,
      };
      const responseApi = await fetch("http://localhost:5035/Stock", {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
        },
        body: response.id,
      });
      if (responseApi.ok) {
        console.log("Demande du client envoyée avec succès !");
        fillAll("Achat réussi!");
      } else {
        console.error(
          "Échec de l'envoi de la demande du client :",
          responseApi.statusText
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande du client :", error);
    }
  }
  return (
    <div className="container-card bg-black rounded-xl p-6 shadow- w-full max-w-md mx-auto flex flex-col justify-between font-mono">
        <ToastContainer></ToastContainer>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Proposed Article :</h2>
          <p className="text-white text-normal">{response.nom}</p>
        </div>
        <hr className="border-white" />
        <div className="py-2">
          <h3 className="text-xl font-bold text-white">Explanation :</h3>
          <p className="text-white text-normal">
            {response.justification_de_la_piece}
          </p>
        </div>
        <hr className="border-white" />
        <div className="py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Price :</h3>
          <p className="text-white">{response.prix}€</p>
        </div>
        <hr className="border-white" />
        <div className="buttonContainer flex items-center justify-center ">
          <button
            className="buttonDesign w-1/4 rounded-xl text-gray-400"
            onClick={buyItem}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
export default BuyWindow;
