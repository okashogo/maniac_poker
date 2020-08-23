import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import "firebase/auth";
import firebase from "firebase";

import shuffle from './shuffle';
import { elements } from './testdb';

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


function drawScore(hands: any[], scoresLength: number) {
  var handsTmp = hands.concat();
  var seriesList: any[] = [];
  var colorList: any[] = [];

  for (let i = 0; i < handsTmp.length; i++) {
    //単色
    var isPair: boolean = false;
    for (let k = 0; k < seriesList.length; k++) {
      if (seriesList[k][0] === handsTmp[i].series) {
        seriesList[k][1] += 1;
        isPair = true;
        break;
      }
    }
    // pairがなかったときのみ出力
    if (!isPair) {
      seriesList.push([handsTmp[i].series, 1]);
    }
  }


  for (let i = 0; i < handsTmp.length; i++) {
    if (Array.isArray(handsTmp[i].color)) {
      //多色
      for (let j = 0; j < handsTmp[i].color.length; j++) {
        //配列内にcolorがすでに登録されていれば、カウントを +1 する
        var isPair: boolean = false;
        for (let k = 0; k < colorList.length; k++) {
          if (colorList[k][0] === handsTmp[i].color[j]) {
            colorList[k][1] += 1;
            isPair = true;
            break;
          }
        }

        // pairがなかったときのみ出力
        if (!isPair) {
          colorList.push([handsTmp[i].color[j], 1]);
        }
      }
    }
    else if (handsTmp[i].color === "") {
      continue;
    }
    else {
      //単色
      var isPair: boolean = false;
      for (let k = 0; k < colorList.length; k++) {
        if (colorList[k][0] === handsTmp[i].color) {
          colorList[k][1] += 1;
          isPair = true;
          break;
        }
      }
      // pairがなかったときのみ出力
      if (!isPair) {
        colorList.push([handsTmp[i].color, 1]);
      }
    }
  }


  // 加点の計算
  var pairName: string = "";
  var pairsCount: number = 0;
  if(getHashProperties(seriesList).includes(5)){
    // console.log("ファイブカード x " + pairCount(getHashProperties(seriesList), 5));
    pairName = "ファイブカード x ";
    pairsCount = pairCount(getHashProperties(seriesList), 5);
  }
  else if(getHashProperties(seriesList).includes(4)){
    // console.log("フォアカード x " + pairCount(getHashProperties(seriesList), 4));
    pairName = "フォアカード x ";
    pairsCount = pairCount(getHashProperties(seriesList), 4);

  }
  else if(getHashProperties(seriesList).includes(3)){
    // console.log("スリーカード x " + pairCount(getHashProperties(seriesList), 3));
    pairName = "スリーカード x ";
    pairsCount = pairCount(getHashProperties(seriesList), 3);
  }
  else if(getHashProperties(seriesList).includes(2)){
    // console.log("ペア x " + pairCount(getHashProperties(seriesList), 2));
    pairName = "ペア x ";
    pairsCount = pairCount(getHashProperties(seriesList), 2);
  }
  else{
    return;
  }

  var scoresTmp = Array(scoresLength).fill(null);
  for (let i = 0; i < scoresTmp.length; i++) {
    scoresTmp[i] = {pairName: pairName, pairsCount: pairsCount};
  }

  return scoresTmp;
}

function getHashProperties(a:any[]){
  let r:number[] = [];
  for (let i = 0; i < a.length; i++) {
      r.push(a[i][1]);
  }
  return r;
}

function pairCount(list: number[], pairNum: number){
  var pairCount:number = 0;
  for (let i = 0; i < list.length; i++) {
      if(list[i] == pairNum){
        pairCount++;
      }
  }
  return pairCount;
}

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
  // for (let i = 1; i <= 13; i++) {
  //     cardsFirst[(i-1)*4 + 0] = {element: mario};
  //     cardsFirst[(i-1)*4 + 1] = {element: donki};
  //     cardsFirst[(i-1)*4 + 2] = {element: link};
  //     cardsFirst[(i-1)*4 + 3] = {element: samus};
  // }
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
                return <div>{data.pairName}{data.pairsCount}点</div>
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
