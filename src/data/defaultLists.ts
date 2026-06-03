import type { FlashcardList } from "../types";
import { createId } from "../utils/flashcards";

export function createDefaultLists(): FlashcardList[] {
  return [
    {
      id: createId(),
      name: "Alemán básico",
      labels: ["es", "de"],
      cards: [
        {
          id: createId(),
          left: "casa",
          right: "Haus",
          status: null,
        },
        {
          id: createId(),
          left: "perro",
          right: "Hund",
          status: null,
        },
        {
          id: createId(),
          left: "gato",
          right: "Katze",
          status: null,
        },
        {
          id: createId(),
          left: "agua",
          right: "Wasser",
          status: null,
        },
        {
          id: createId(),
          left: "comida",
          right: "Essen",
          status: null,
        },
        {
          id: createId(),
          left: "libro",
          right: "Buch",
          status: null,
        },
        {
          id: createId(),
          left: "mesa",
          right: "Tisch",
          status: null,
        },
        {
          id: createId(),
          left: "silla",
          right: "Stuhl",
          status: null,
        },
        {
          id: createId(),
          left: "coche",
          right: "Auto",
          status: null,
        },
        {
          id: createId(),
          left: "tren",
          right: "Zug",
          status: null,
        },
        {
          id: createId(),
          left: "ciudad",
          right: "Stadt",
          status: null,
        },
        {
          id: createId(),
          left: "calle",
          right: "Straße",
          status: null,
        },
        {
          id: createId(),
          left: "escuela",
          right: "Schule",
          status: null,
        },
        {
          id: createId(),
          left: "trabajo",
          right: "Arbeit",
          status: null,
        },
        {
          id: createId(),
          left: "amigo",
          right: "Freund",
          status: null,
        },
        {
          id: createId(),
          left: "familia",
          right: "Familie",
          status: null,
        },
        {
          id: createId(),
          left: "día",
          right: "Tag",
          status: null,
        },
        {
          id: createId(),
          left: "noche",
          right: "Nacht",
          status: null,
        },
        {
          id: createId(),
          left: "bueno",
          right: "gut",
          status: null,
        },
        {
          id: createId(),
          left: "malo",
          right: "schlecht",
          status: null,
        },
      ],
    },
  ];
}