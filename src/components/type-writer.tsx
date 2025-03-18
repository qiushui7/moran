"use client";

import { useState, useEffect } from "react";

interface TypeWriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenTexts?: number;
  className?: string;
}

export function TypeWriter({
  texts,
  typingSpeed = 150,
  deletingSpeed = 50,
  delayBetweenTexts = 1500,
  className = "",
}: TypeWriterProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, delayBetweenTexts);
      return () => clearTimeout(timeout);
    }

    if (isDeleting) {
      if (currentText.length === 0) {
        setIsDeleting(false);
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
      } else {
        timeout = setTimeout(() => {
          setCurrentText((prevText) => prevText.substring(0, prevText.length - 1));
        }, deletingSpeed);
      }
    } else {
      const targetText = texts[currentTextIndex];
      if (currentText.length === targetText.length) {
        setIsPaused(true);
      } else {
        timeout = setTimeout(() => {
          setCurrentText((prevText) => targetText.substring(0, prevText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isDeleting, isPaused, texts, typingSpeed, deletingSpeed, delayBetweenTexts]);

  return (
    <span className={className}>
      {currentText}
      <span className="inline-block w-0.5 h-5 ml-0.5 bg-primary animate-blink"></span>
    </span>
  );
} 