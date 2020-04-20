import React, { useState, useEffect } from "react";
import "../App.css";
import utils from "../utils/utils";
import StarsDisplay from "./StarsDisplay";
import PlayAgain from "./PlayAgain";
import PlayNumber from "./PlayNumber";

let maxNum = 9;

const useGameState = () => {
  const [stars, setStars] = useState(utils.random(1, maxNum));
  const [availableNums, setAvailableNums] = useState(utils.range(1, maxNum));
  const [candidateNums, setCandidateNums] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(15);

  useEffect(() => {
    if (secondsLeft > 0 && availableNums.length > 0) {
      const timerId = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  });

  const setGameState = (newCandidateNums) => {
    if (utils.sum(newCandidateNums) !== stars) {
      setCandidateNums(newCandidateNums);
    } else {
      const newAvailableNums = availableNums.filter(
        (n) => !newCandidateNums.includes(n)
      );
      setStars(utils.randomSumIn(newAvailableNums, maxNum));
      setAvailableNums(newAvailableNums);
      setCandidateNums([]);
    }
  };

  return {
    stars,
    availableNums,
    candidateNums,
    secondsLeft,
    setGameState,
  };
};

const Game = (props) => {
  const {
    stars,
    availableNums,
    candidateNums,
    secondsLeft,
    setGameState,
  } = useGameState();

  const [value, setValue] = useState(""); // value to store state, setValue to define how
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value) return;

    maxNum = value;
    setValue("");
  };

  const candidatesAreWrong = utils.sum(candidateNums) > stars;
  const gameStatus =
    availableNums.length === 0 ? "won" : secondsLeft === 0 ? "lost" : "active";

  const numberStatus = (number) => {
    if (!availableNums.includes(number)) {
      return "used";
    }

    if (candidateNums.includes(number)) {
      return candidatesAreWrong ? "wrong" : "candidate";
    }

    return "available";
  };

  const onNumberClick = (number, currentStatus) => {
    if (currentStatus === "used" || secondsLeft === 0) {
      return;
    }

    const newCandidateNums =
      currentStatus === "available"
        ? candidateNums.concat(number)
        : candidateNums.filter((cn) => cn !== number);

    setGameState(newCandidateNums);
  };

  return (
    <div className="game">
      <div className="help">
        Pick 1 or more numbers that sum to the number of stars
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          value={value}
          placeholder="Enter a level"
          disabled={gameStatus == "active"}
          onChange={(e) => setValue(e.target.value)}
        />
      </form>
      <div className="body">
        <div className="left">
          {gameStatus !== "active" ? (
            <PlayAgain onClick={props.startNewGame} gameStatus={gameStatus} />
          ) : (
            <StarsDisplay count={stars} />
          )}
        </div>
        <div className="right">
          {utils.range(1, maxNum).map((number) => (
            <PlayNumber
              key={number}
              status={numberStatus(number)}
              number={number}
              onClick={onNumberClick}
            />
          ))}
        </div>
      </div>
      <div className="timer">Time Remaining: {secondsLeft}</div>
    </div>
  );
};

const StarMatch = () => {
  const [gameId, setGameId] = useState(1);
  return <Game key={gameId} startNewGame={() => setGameId(gameId + 1)} />;
};

export default StarMatch;
