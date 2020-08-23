import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import "firebase/auth";
import firebase from "firebase";

import shuffle from './importFile/shuffle';
import drawScore from './importFile/drawScore';
import { elements } from './importFile/testdb';

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
      series: elements[i].series,
      color: elements[i].color,
    };
  }

  cardsFirst = shuffle(cardsFirst);
  // 初期設定終了

  var handFirst = cardsFirst.slice(0, 5);
  var deckFirst = cardsFirst.slice(5);
  const [hands, sethand] = useState(handFirst);
  const [decks, setdeck] = useState(deckFirst);
  const [select, setSelect] = useState([null]);
  const [isShow, setShow] = useState(true);
  const [scores, setScore]:any[] = useState(Array(Object.keys(elements[0]).length - 2).fill({pairName: "",pairsCount: 0}));

  const element = (
    <div className="container-fluid">
      <div>
        <div style={{ display: "flex" }} className="row">
          <div className="col-1"></div>
          {hands.map((data, key) => {
            return (
              <div className="col-2 text-center" style={{ background: bgcChange(key, select) }}>
                {data.name}
                <h1 onClick={() => {
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
                  <Img src={data.element} />
                </h1>
              </div>
            )
          })}
          <div className="col-1">得点</div>
        </div>
        {!isShow &&
          <div style={{ display: "flex" }} className="row">
            <div className="col-1">
              <div>シリーズ</div>
              <div>イメージカラー</div>
            </div>
            {hands.map((data, key) => {
              return (
                <div className="col-2 text-center" style={{ background: bgcChange(key, select) }}>
                  <div>{data.series}</div>
                  <div>{data.color}</div>
                </div>
              )
            })}
            <div className="col-1">
              {scores.map((data:{[key:string] :any; }) => {
                if(data.length !== 0){
                  return <div>{data.pairName}{data.pairsCount}点</div>
                }else{
                  return <div>ペアなし</div>
                }
              })}
            </div>
          </div>
        }
      </div>
      {isShow &&
        <button onClick={() => {
          // output の結果を drawScore に渡す
          var outputHnand = drawHand(decks, hands, select);
          sethand(outputHnand);
          setdeck(drawDeck(decks, select));
          setScore(drawScore(outputHnand, scores.length));
          console.log(drawScore(outputHnand, scores.length));
          setSelect([null]);
          setShow(false);
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
