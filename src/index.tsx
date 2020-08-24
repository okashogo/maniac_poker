import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import "firebase/auth";
import firebase from "firebase";

import shuffle from './importFile/shuffle';
import drawScore from './importFile/drawScore';
import { titles, elements } from './importFile/testdb';

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCCbrHFW2l02sNTab4ncFV3JRBtM_7-GZc",
  authDomain: "maniac-poker.firebaseapp.com",
  databaseURL: "https://maniac-poker.firebaseio.com",
  projectId: "maniac-poker",
  storageBucket: "maniac-poker.appspot.com",
  messagingSenderId: "842646066858",
  appId: "1:842646066858:web:d6be81077b2a75543e22d3",
  measurementId: "G-908H22M967"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();


function drawHand(decks: any[], hands: any[], select: any[]) {
  var decksTmp = decks.concat();
  var handsTmp = hands.concat();

  for (let i = 1; i < select.length; i++) {
    handsTmp[select[i]] = decksTmp.slice(-1)[0];
    decksTmp.pop();
  }
  return handsTmp;
}

function calTotal(scores: any[]){
  var total: number = 0;
  console.log(scores);
  for (let i = 0; i < scores.length; i++) {
      if(scores[i].pairName === "ファイブカード x "){
        total += scores[i].pairsCount * 10;
        continue;
      }
      else if(scores[i].pairName === "フォアカード x "){
        total += scores[i].pairsCount * 5;
        continue;
      }
      else if(scores[i].pairName === "スリーカード x "){
        total += scores[i].pairsCount * 3;
        continue;
      }
      else if(scores[i].pairName === "ペア x "){
        total += scores[i].pairsCount * 1;
        continue;
      }
  }
  return total;
}

function drawDeck(decks: any[], select: any[]) {
  // 最初のnullはカウントしない。
  var decksTmp = decks.concat();
  for (let i = 1; i < select.length; i++) {
    decksTmp[select[i]] = decksTmp.slice(-1)[0];
    decksTmp.pop();
  }
  return decksTmp;
}

function Img(props: any) {
  // 最初のnullはカウントしない
  return <img style={{ height: "150px" }} src={props.src} />;
}

function bgcChange(key: number, select: any[]) {
  if (select.includes(key)) {
    return "red";
  }
  return
}

function App() {
  // 初期設定
  var cardsFirst: any[] = [];
  for (let i = 0; i < elements.length; i++) {
    cardsFirst[i] = {
      element: elements[i].img,
      name: elements[i].name,
      element1: elements[i].element1,
      element2: elements[i].element2,
    };
  }

  cardsFirst = shuffle(cardsFirst);
  // 初期設定終了

  var handFirst = cardsFirst.slice(0, 5);
  var deckFirst = cardsFirst.slice(5);
  const [hands, sethand] = useState(handFirst);
  const [decks, setdeck] = useState(deckFirst);
  const [select, setSelect] = useState([null]);
  const [canDraw, setCanDraw] = useState(true);
  const [scores, setScore]:any[] = useState(Array(Object.keys(elements[0]).length - 2).fill({pairName: "",pairsCount: 0}));
  const [total, setTotal] = useState(0);

  const element = (
    <div className="container-fluid">
      <div>
        <div style={{ display: "flex" }} className="row">
          <div className="col-1"></div>
          {hands.map((data, key) => {
            return (
              <div className="col-2 text-center"
                   style={{ background: bgcChange(key, select) }}
                   onClick={() => {
                    let newSetSelect: any[] = select.concat();
                    if (!newSetSelect.includes(key)) {
                      newSetSelect.push(key);
                    } else {
                      newSetSelect.forEach((item, index) => {
                        if (item === key) {
                          newSetSelect.splice(index, 1);
                        }
                      });
                    }
                    setSelect(newSetSelect);
                  }}
              >
                {data.name}
                <h1>
                  <Img src={data.element} />
                </h1>
              </div>
            )
          })}
          <div className="col-1">得点</div>
        </div>
        {!canDraw &&
          <div style={{ display: "flex" }} className="row">
            <div className="col-1">
              <div>{titles[0].element1}</div>
              <div>{titles[0].element2}</div>
            </div>
            {hands.map((data, key) => {
              return (
                <div className="col-2 text-center" style={{ background: bgcChange(key, select) }}>
                  <div>{data.element1}</div>
                  <div>{data.element2}</div>
                </div>
              )
            })}
            <div className="col-1">
              {scores.map((data:{[key:string] :any; }) => {
                if(data.length !== 1){
                  return <div>{data.pairName}{data.pairsCount}点</div>
                }else{
                  return <div>ペアなし</div>
                }
              })}
            </div>
            <h1 style={{ color: "red"}}>{total}</h1>
          </div>
        }
      </div>
      {canDraw &&
        <button onClick={() => {
          // output の結果を drawScore に渡す
          var outputHnand = drawHand(decks, hands, select);
          var outputScores = drawScore(outputHnand, scores.length);
          var outputotal = calTotal(outputScores);
          sethand(outputHnand);
          setdeck(drawDeck(decks, select));
          setScore(outputScores);
          setTotal(calTotal(outputScores));
          console.log(outputotal);
          setSelect([null]);
          setCanDraw(false);
        }}>
          ドロー
        </button>
      }
    </div>
  );
  return (
    element
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
