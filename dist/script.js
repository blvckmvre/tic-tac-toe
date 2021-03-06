const winCombinations = [
[0, 1, 2],
[3, 4, 5],
[6, 7, 8],
[0, 3, 6],
[1, 4, 7],
[2, 5, 8],
[0, 4, 8],
[2, 4, 6]];


const corners = [0, 2, 6, 8];
const edges = [1, 3, 5, 7];
const center = 4;
const counterCorners = [[0, 8], [2, 6]];
const edgeLines = [[0, 1, 2], [0, 3, 6], [6, 7, 8], [2, 5, 8]];

const App = () => {
  const [currState, setCurrState] = React.useState(0);
  const [mySign, setMySign] = React.useState(null);
  const [oppSign, setOppSign] = React.useState(null);
  return /*#__PURE__*/(
    React.createElement("div", { id: "app-wrapper" },
    currState ? /*#__PURE__*/
    React.createElement(Board, {
      setCurrState: setCurrState,
      mySign: mySign,
      oppSign: oppSign }) : /*#__PURE__*/

    React.createElement(Menu, {
      setCurrState: setCurrState,
      setMySign: setMySign,
      setOppSign: setOppSign })));



};

const Menu = ({ setCurrState, setMySign, setOppSign }) => {
  const moveToBoard = e => {
    if (e.target.textContent === "X") {
      setMySign("X");
      setOppSign("O");
    } else {
      setMySign("O");
      setOppSign("X");
    }
    setCurrState(1);
  };
  return /*#__PURE__*/(
    React.createElement("div", { id: "menu" }, /*#__PURE__*/
    React.createElement("h3", null, "Choose your sign"), /*#__PURE__*/
    React.createElement("div", { className: "btns-wrapper" }, /*#__PURE__*/
    React.createElement("button", { className: "btn", onClick: e => moveToBoard(e) }, "X"), /*#__PURE__*/
    React.createElement("button", { className: "btn", onClick: e => moveToBoard(e) }, "O"))));



};

const Board = ({ setCurrState, mySign, oppSign }) => {
  const [isMyTurn, setIsMyTurn] = React.useState(!!Math.round(Math.random()));
  const [boxes, setBoxes] = React.useState([
  "", "", "",
  "", "", "",
  "", "", ""]);

  const [myTurns, setMyTurns] = React.useState([]);
  const [oppTurns, setOppTurns] = React.useState([]);
  const [endInfo, setEndInfo] = React.useState({
    message: null, endCombo: null, winner: null });

  const oppTurnTimeout = React.useRef(null);

  const backToMenu = () => {
    setCurrState(0);
  };
  const fillBox = (index, sign) => {
    setBoxes(p => [...p.slice(0, index), sign, ...p.slice(index + 1)]);
  };

  const makeTurn = index => {
    if (![...myTurns, ...oppTurns].includes(index)) {
      fillBox(index, mySign);
      setMyTurns(p => [...p, index]);
      setIsMyTurn(false);
    }
  };

  const decideOpponentTurn = () => {

    //Offense

    let oneOffWin = winCombinations.find((comb) =>
    comb.filter(turn => oppTurns.includes(turn)).length === 2 &&
    comb.some(turn => !boxes[turn]));

    if (oneOffWin) {
      const offensiveTurn = oneOffWin.find(turn => !boxes[turn]);
      return offensiveTurn;
    }

    //Defense

    let dangerComb = winCombinations.find((comb) =>
    comb.filter(turn => myTurns.includes(turn)).length === 2 &&
    comb.some(turn => !boxes[turn]));

    if (dangerComb) {
      const defensiveTurn = dangerComb.find(turn => !boxes[turn]);
      return defensiveTurn;
    }

    //AI goes first

    if (!myTurns.length && !oppTurns.length) {
      return corners[Math.floor(Math.random() * 4)];
    }
    if (oppTurns.length === 1 && myTurns.length === 1) {
      let counter = counterCorners.find(arr => arr.includes(oppTurns[0])).
      find(corner => !boxes[corner]);
      if (counter)
      return counter;else

      return corners.find(corner => !boxes[corner]);
    }

    //AI goes second

    if (!oppTurns.length && myTurns.length === 1) {
      if (boxes[center])
      return corners[Math.floor(Math.random() * 4)];else

      return center;
    }
    if (corners.filter(corner => myTurns.includes(corner)).length == 2 && myTurns.length === 2) {
      return edges[Math.floor(Math.random() * 4)];
    } else
    if (myTurns.length === 2 && oppTurns.length === 1) {
      if (myTurns.every(turn => edges.includes(turn))) {
        return corners[Math.floor(Math.random() * 4)];
      } else if (myTurns.some(turn => edges.includes(turn))) {
        let dangerLines = edgeLines.filter(line => line.some(turn => myTurns.includes(turn)));
        let freeCounters = counterCorners.find(arr => arr.every(corner => !boxes[corner]));
        return freeCounters.find(corner => dangerLines.filter(line => line.includes(corner)).length > 1);
      } else
      return corners.find(corner => !boxes[corner]);
    }

    //Later game autofill

    if (!boxes[center]) {
      return center;
    }
    let remaining = boxes.map((box, i) => box ? null : i).filter(box => box);
    if (remaining.length) {
      let index = remaining[Math.floor(Math.random() * remaining.length)];
      return index;
    }
  };

  const waitOpponent = () => {
    document.body.style["pointer-events"] = "none";
    const index = decideOpponentTurn();
    setOppTurns(p => [...p, index]);
    if (index !== -1) {
      oppTurnTimeout.current = setTimeout(() => {
        fillBox(index, oppSign);
        document.body.style["pointer-events"] = "unset";
        setIsMyTurn(true);
      }, 500);
    }
  };

  const assertEnd = () => {
    const winCondition = winCombinations.find(comb => comb.every(turn => myTurns.includes(turn)));
    const loseCondition = winCombinations.find(comb => comb.every(turn => oppTurns.includes(turn)));
    const drawCondition = boxes.every(box => box);
    if (winCondition || loseCondition || drawCondition) {
      document.body.style["pointer-events"] = "none";
      clearTimeout(oppTurnTimeout.current);
      setTimeout(() => {
        document.body.style["pointer-events"] = "unset";
        backToMenu();
      }, 1500);
    }
    if (winCondition)
    setEndInfo({
      message: "You Win",
      endCombo: winCondition,
      winner: 1 });

    if (loseCondition)
    setEndInfo({
      message: "Opponent Wins",
      endCombo: loseCondition,
      winner: 2 });

    if (drawCondition && !loseCondition && !winCondition)
    setEndInfo(p => ({
      ...p,
      message: "Draw" }));

  };

  React.useEffect(() => {
    if (!isMyTurn)
    waitOpponent();
  }, [isMyTurn]);

  React.useEffect(() => {
    assertEnd();
  }, [boxes]);

  return /*#__PURE__*/(
    React.createElement("div", { id: "board" }, "Playing as \"",
    mySign, "\". ",
    !endInfo.message ?
    isMyTurn ?
    "Your turn" :
    "Opponent's turn" :
    endInfo.message, /*#__PURE__*/

    React.createElement("div", { id: "box-wrapper" },
    boxes.map((sign, i) => /*#__PURE__*/
    React.createElement("div", {
      key: "box" + i,
      className:
      endInfo.endCombo &&
      endInfo.endCombo.includes(i) ?
      endInfo.winner === 1 ?
      "box win-box" :
      "box lose-box" :
      "box",

      id: "b" + (i + 1),
      onClick: () => makeTurn(i) },
    sign))), /*#__PURE__*/


    React.createElement("button", { className: "btn", onClick: backToMenu }, "Menu")));


};

ReactDOM.render( /*#__PURE__*/React.createElement(App, null), document.getElementById("root"));