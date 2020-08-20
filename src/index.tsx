import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import "firebase/auth";
import firebase from "firebase";

import shuffle from './shuffle';

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

const H = "❤︎";
const D = "♠️";
const C = "♣️";
const S = "♦︎";

// function draw(cards: any[], deck: any[], select:any[]){
function draw(cards: any[], select:any[]){
  // 最初のnullはカウントしない。
  var cardsTmp = cards.concat();
  for (let i = 1; i < select.length; i++) {
      console.log(select[i]);
      cardsTmp[select[i]] = cardsTmp.slice(-1)[0];
      cardsTmp.pop();
  }
  return cardsTmp;
}

function bgcChange(key: number,select:any[]){
  if(select.includes(key)){
    return "red";
  }
  return
}

function App() {
  // 初期設定 (DB)
  var cardsFirst:any[] = [];
  for (let i = 1; i <= 13; i++) {
      cardsFirst[(i-1)*4 + 0] = {number: i, mark: H};
      cardsFirst[(i-1)*4 + 1] = {number: i, mark: D};
      cardsFirst[(i-1)*4 + 2] = {number: i, mark: C};
      cardsFirst[(i-1)*4 + 3] = {number: i, mark: S};
  }

  cardsFirst = shuffle(cardsFirst);
  // DB構造終了

  var handFirst = cardsFirst.slice(0, 5);
  var deckFirst = cardsFirst.slice(5);
  const [cards, setCard] = useState(cardsFirst);
  const [select, setSelect] = useState([null]);
  const [isShow, setShow] = useState(true);

  // const element = (
  //   <div>
  //     <div style={{display: "flex"}}>
  //       {hand.map((data, key) => {
  //           return (
  //               <h1 style={{ background: bgcChange(key,select) }}
  //                   onClick={() => {
  //                   let newSetSelect:any[] = select.concat();
  //                   if(!newSetSelect.includes(key)){
  //                     newSetSelect.push(key);
  //                   }else{
  //                     newSetSelect.forEach((item, index) => {
  //                         if(item === key) {
  //                             newSetSelect.splice(index, 1);
  //                         }
  //                     });
  //                     console.log(newSetSelect);
  //                   }
  //                   setSelect(newSetSelect);
  //                 }}
  //               >
  //                 [{data.mark}{data.number}]
  //               </h1>
  //           )
  //       })}
  //     </div>
  //     { isShow &&
  //       <button onClick={() => {
  //         setCard(draw(hand, deck, select));
  //         setSelect([null]);
  //         setShow(false);
  //       }}>
  //       ドロー
  //       </button>
  //     }
  //   </div>
  // );
  const element = (
    <div>
      <div style={{display: "flex"}}>
        {cards.map((data, key) => {
          if (key < 5) {
            return (
                <h1 style={{ background: bgcChange(key,select) }}
                    onClick={() => {
                    let newSetSelect:any[] = select.concat();
                    if(!newSetSelect.includes(key)){
                      newSetSelect.push(key);
                    }else{
                      newSetSelect.forEach((item, index) => {
                          if(item === key) {
                              newSetSelect.splice(index, 1);
                          }
                      });
                      console.log(newSetSelect);
                    }
                    setSelect(newSetSelect);
                  }}
                >
                  [{data.mark}{data.number}]
                </h1>
            )
          }
        })}
      </div>
      { isShow &&
        <button onClick={() => {
          setCard(draw(cards, select));
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
