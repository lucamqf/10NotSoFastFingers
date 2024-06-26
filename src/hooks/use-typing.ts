import { useState } from "react";
import { useEventListener } from "@/hooks/use-event-listener";

interface IUseTyping {
  words: string[];
  isBlocked?: boolean;
  shouldValidateBeforeNextWord?: boolean;
  allowBackspace?: boolean;
  onKeyPress?(): void;
  onKeyDown?(): void;
}

export function useTyping({
  words,
  isBlocked = false,
  shouldValidateBeforeNextWord = false,
  allowBackspace = true,
  onKeyPress = () => undefined,
  onKeyDown = () => undefined,
}: IUseTyping) {
  const [activeWord, setActiveWord] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [charactersCount, setCharactersCount] = useState(0);
  const [activeLetterInWord, setActiveLetterInWord] = useState(0);
  const [incorrectLetters, setIncorrectLetters] = useState<[number, number][]>(
    []
  );

  useEventListener("keypress", handleKeyPress);
  useEventListener("keydown", handleKeyDown);

  function resetWords() {
    setActiveWord(0);
    setActiveLetterInWord(0);
    setIncorrectLetters([]);
    setWordCount(0);
    setCharactersCount(0);
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (isBlocked) return;

    const key = event.key;

    onKeyPress();

    const shouldGoToNextWord = activeLetterInWord === words[activeWord].length;

    const isConfirmKey = key === "Enter" || key === " ";

    if (isConfirmKey && shouldGoToNextWord) {
      if (shouldValidateBeforeNextWord && incorrectLetters.length > 0) return;

      goToNextWord();

      return;
    }

    if (shouldGoToNextWord) return;

    const isCorrect = validateCharacter(key);

    if (!isCorrect) {
      setIncorrectLetters((prev) => [
        ...prev,
        [activeWord, activeLetterInWord],
      ]);
    }

    setCharactersCount((prev) => prev + 1);
    setActiveLetterInWord((prev) => prev + 1);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (isBlocked) return;

    onKeyDown();

    if (event.key === "Backspace" && allowBackspace) {
      handleBackspace();
    }
  }

  function handleBackspace() {
    const isFirstWord = activeWord === 0;
    const isFirstLetter = activeLetterInWord === 0;

    if (isFirstWord && isFirstLetter) return;

    setCharactersCount((prev) => prev - 1);

    const newWordIndex = isFirstLetter ? activeWord - 1 : activeWord;
    const newLetterIndex = isFirstLetter
      ? words[newWordIndex].length - 1
      : activeLetterInWord - 1;

    const incorrectLettersCopy = [...incorrectLetters];

    const shouldRemoveIncorrectLetter = incorrectLettersCopy.find(
      ([wordIndex, letterIndex]) =>
        wordIndex === newWordIndex && letterIndex === newLetterIndex
    );

    if (shouldRemoveIncorrectLetter) {
      incorrectLettersCopy.pop();
      setIncorrectLetters(incorrectLettersCopy);
    }

    if (isFirstLetter) {
      setActiveWord((prev) => prev - 1);
      setActiveLetterInWord(words[activeWord - 1].length - 1);

      return;
    }

    setActiveLetterInWord((prev) => prev - 1);
  }

  function validateCharacter(letter: string) {
    return words[activeWord][activeLetterInWord] === letter;
  }

  function goToNextWord() {
    setActiveLetterInWord(0);

    setWordCount((prev) => prev + 1);
    setActiveWord((prev) => prev + 1);
  }

  const correctCharactersCount = charactersCount - incorrectLetters.length;
  const incorrectCharactersCount = incorrectLetters.length;
  const isLastWord = activeWord >= words.length - 1;

  return {
    wordCount,
    correctCharactersCount,
    incorrectCharactersCount,
    charactersCount,
    incorrectLetters,
    activeWord,
    activeLetter: activeLetterInWord,
    resetWords,
    isLastWord,
  };
}
