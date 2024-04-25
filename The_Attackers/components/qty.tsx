import React, { FC } from "react";

interface Qty {
  text?: string;
}
const QtyWindow: FC<Qty> = ({
  text = "...",
}: Qty) => {

    var response:any = text[0];
    return (
        <div className="container-card bg-black rounded-xl p-6 shadow- w-full max-w-md mx-auto flex flex-col justify-between font-mono">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Proposed Article :</h2>
              <p className="text-white text-normal">{response.nom}</p>
            </div>
            <hr className="border-white" />
            <div className="py-2">
              <h3 className="text-xl font-bold text-white">Quantity :</h3>
              <p className="text-white text-normal">
                {response.quantité}
              </p>
            </div>
            <hr className="border-white" />
            <div className="py-2 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Price :</h3>
              <p className="text-white">{response.prix}€</p>
            </div>
          </div>
        </div>
      );
};
export default QtyWindow;