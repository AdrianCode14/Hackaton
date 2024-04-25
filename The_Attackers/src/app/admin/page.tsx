'use client';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import ChatStock from '../../../components/chatStock';

export default function adminPage() {
  const UploadDocument = () => {
    const [file, setFile] = useState<File | null>(null);
    const [index, setIndex] = useState<string>('');
    const [indexDelete, setIndexDelete] = useState<string>('');
    const [id, setId] = useState<string>('');

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      setFile(e.target.files ? e.target.files[0] : null);
    };

    const onIndexChange = (e: ChangeEvent<HTMLInputElement>) => {
      setIndex(e.target.value);
    };

    const onIndexDeleteChange = (e: ChangeEvent<HTMLInputElement>) => {
      setIndexDelete(e.target.value);
    };

    const onIdChange = (e: ChangeEvent<HTMLInputElement>) => {
      setId(e.target.value);
    };

    const onSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      console.log('http://localhost:5035/api/documents?index=' + index);

      try {
        const response = await fetch(
          'http://localhost:5035/api/documents?index=' + index,
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await response.json();
        console.log(data.documentId);

        // Save the document ID and index name in local storage in table
        const documentId = data.documentId;
        const documentIndex = index;
        const documentName = file.name;
        const documentData = { documentId, documentIndex, documentName };
        const documentTable = localStorage.getItem('documentTable');
        if (documentTable) {
          const documentTableParsed = JSON.parse(documentTable);
          documentTableParsed.push(documentData);
          localStorage.setItem(
            'documentTable',
            JSON.stringify(documentTableParsed)
          );
          // reload the page
          window.location.reload();
        } else {
          localStorage.setItem('documentTable', JSON.stringify([documentData]));
          // reload the page
          window.location.reload();
        }
      } catch (error) {
        console.error(error);
      }
    };

    const onSubmitDelete = async (e: FormEvent) => {
      console.log('TEST');
      e.preventDefault();

      try {
        const response = await fetch(
          'http://localhost:5035/api/documents/' + id + '?index=' + index,
          {
            method: 'DELETE',
          }
        );

        console.log(response);
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <div className="w-full h-screen bg-gray-200 flex flex-col items-center justify-around font-mono">
        <ChatStock></ChatStock>
        <div>
          <form
            onSubmit={onSubmit}
            className="flex flex-col space-y-5 border-slate-950 border-2 p-7 rounded-lg"
          >
            <input type="file" onChange={onFileChange} />
            <input
              type="text"
              value={index}
              onChange={onIndexChange}
              placeholder="Nom d'index"
            />
            <button type="submit">Envoyer le document</button>
          </form>
        </div>
        <div>
          {/* Lister les documents du localstorage */}
          {/* Si le local storage est vide affichier un message */}
          {localStorage.getItem('documentTable') &&
            JSON.parse(localStorage.getItem('documentTable')!).length > 0 && (
              <>
                <h1>Documents</h1>
                <table>
                  <thead>
                    <tr>
                      <th>Index</th>
                      <th>Document Name</th>
                      <th>Document ID</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localStorage.getItem('documentTable') ? (
                      JSON.parse(localStorage.getItem('documentTable')!).map(
                        (document: any) => (
                          <tr key={index}>
                            <td>{document.documentIndex}</td>
                            <td>{document.documentName}</td>
                            <td>{document.documentId}</td>
                            <td>
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await fetch(
                                      'http://localhost:5035/api/documents/' +
                                        document.documentId +
                                        '?index=' +
                                        document.documentIndex,
                                      {
                                        method: 'DELETE',
                                      }
                                    );
                                    console.log(response);
                                    // Remove the document from the local storage
                                    const documentTable =
                                      localStorage.getItem('documentTable');
                                    if (documentTable) {
                                      const documentTableParsed =
                                        JSON.parse(documentTable);
                                      const newDocumentTable =
                                        documentTableParsed.filter(
                                          (doc: any) =>
                                            doc.documentId !==
                                            document.documentId
                                        );
                                      localStorage.setItem(
                                        'documentTable',
                                        JSON.stringify(newDocumentTable)
                                      );
                                      // reload the page
                                      window.location.reload();
                                    }
                                  } catch (error) {
                                    console.error(error);
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td>No documents</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
        </div>
      </div>
    );
  };

  return <UploadDocument />;
}
