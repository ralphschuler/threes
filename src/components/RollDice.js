import React, { useContext, useEffect, useState } from "react";
import { Button } from "../styledComponents/Button";
import { contractAddress } from "../constants";
import diceAudio from "../audio/diceSound.mp3";
import { GameContext } from "./GameProvider";
import { useContract } from "@web3-ui/hooks";
import { abi } from "./DiceGame.json";
import BetInput from "./BetInput";
var audio = new Audio(diceAudio);

export default function RollDice() {
  const [roomId, setRoomId] = useState();
  const {
    game,
    loading,
    setLoading,
    etherscan,
    setEtherscan,
    roomName,
    paid,
    setPaid,
    bet,
    sock,
    setBet,
    player,
    betPlaced,
    handleReset,
    setBetPlaced,
    setClientScore,
    setClientGame,
  } = useContext(GameContext);

  const [contract, isReady] = useContract(contractAddress, abi);
  const [totalBet, setTotalBet] = useState(0);
  let overrides = {
    value: String(bet), // ether in this case MUST be a string
  };

  let currentPlayer = game.names[game.currentPlayer];

  // Gets the total bet
  async function checkBet() {
    if (contract.checkBet === undefined) return;
    try {
      if (!roomId) {
        const roomIdx = await contract.getGameId(game.names[0]);

        setRoomId(parseInt(roomIdx));
        console.log(parseInt(roomIdx));
      }
      const currentBet = await contract.checkBet(roomId);
      setTotalBet(Number(currentBet));
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (isReady) checkBet();
    // eslint-disable-next-line
  }, [contract]);

  sock.on("bet", (betObj) => {
    console.log(betObj["bet"], betObj["player"]);
    if (isReady) checkBet();
  });
  // Sets the score on-chain
  useEffect(() => {
    async function sendScore() {
      try {
        const scoreTxn = await contract.setScore(
          roomId,
          game.scores[game.currentPlayer]
        );

        setLoading(true);
        setClientScore(game.scores[game.currentPlayer]);
        setEtherscan("https://ropsten.etherscan.io/tx/" + scoreTxn.hash);

        await scoreTxn.wait();

        setClientScore(null);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
    if (game.playerTurns <= 0 && game.currentPlayer < game.names.length) {
      if (player !== currentPlayer) return;
      sendScore();
      setBet(0);
    } // eslint-disable-next-line
  }, [game]);

  // handle the rolling dice UI effect. Timeout controls length of dice roll animation
  useEffect(() => {
    setTimeout(() => {
      let el = document.getElementsByClassName("dice");
      for (let i = 0; i < el.length; i++) {
        el[i].classList.remove("rolling");
      }
    }, 500);
    return () => {
      setTimeout(() => {
        let el = document.getElementsByClassName("dice");
        for (let i = 0; i < el.length; i++) {
          el[i].classList.add("rolling");
        }
      }, 0);
      return;
    };
  }, [game.rolling]);

  // Set new dice numbers and emit rollDice event
  function handleRoll() {
    if (!betPlaced) return;
    audio.play();
    let value = [Array(5).fill(null)];

    for (let i = 0; i < game.diceValues.length; i++) {
      value[i] = Math.ceil(Math.random() * 6);
      setClientGame({
        ...game,
        diceValues: value,
        rollDisabled: true,
        diceDisabled: false,
        rolling: !game.rolling,
      });
    }
    setClientGame({
      ...game,
      diceValues: value,
      rollDisabled: true,
      diceDisabled: false,
      rolling: !game.rolling,
    });
    sock.emit("rollDice", {
      ...game,
      diceValues: value,
      rollDisabled: true,
      diceDisabled: false,
      rolling: !game.rolling,
    });
  }

  // Set the bet on-chain
  async function handleSendBet() {
    const betTxn = await contract.placeBet(overrides);

    setLoading(true);
    setEtherscan("https://ropsten.etherscan.io/tx/" + betTxn.hash);

    await betTxn.wait();
    sock.emit("bet", { bet: bet, player: player });
    setLoading(false);
    setBetPlaced(true);
    setBet(0);
  }

  async function handleWinner() {
    try {
      const winTxn = await contract.payWinner(roomId);
      setLoading(true);
      setEtherscan("https://ropsten.etherscan.io/tx/" + winTxn.hash);

      await winTxn.wait();

      setLoading(false);
      setPaid(true);
    } catch (error) {
      console.log(error);
    }
  }
  function shortenName(name) {
    return String(name).substring(0, 4) + "..." + String(name).substring(38);
  }

  function openEtherscan() {
    window.open(etherscan, "_blank");
  }

  return (
    <div className="roll-area">
      <BetInput bet={bet} setBet={setBet} />
      {!betPlaced ? (
        bet <= 0 ? (
          <Button onClick={handleSendBet} disabled={true}>
            Enter bet{" "}
            <span role="img" aria-label="up emoji">
              👆
            </span>
          </Button>
        ) : !loading ? (
          <Button onClick={handleSendBet}>Place Bet</Button>
        ) : (
          <Button onClick={openEtherscan}>Placing Bet...</Button>
        )
      ) : (
        <Button
          disabled={player !== currentPlayer ? true : game.rollDisabled}
          onClick={handleRoll}
        >
          {game.gameOver || !currentPlayer
            ? "game over "
            : currentPlayer !== player
            ? `${
                currentPlayer.length > 12
                  ? shortenName(currentPlayer)
                  : currentPlayer
              }'s turn`
            : "roll the dice"}
        </Button>
      )}
      <Button
        reset={!game.gameOver}
        onClick={
          !paid && !game.gameOver
            ? null
            : !paid && game.gameOver
            ? handleWinner
            : handleReset
        }
      >
        {!paid && !game.gameOver
          ? "disabled"
          : !paid && game.gameOver
          ? "pay winner"
          : "reset game"}
      </Button>
      <div>Bet: {totalBet}</div>
    </div>
  );
}
