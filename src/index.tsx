import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import "firebase/auth";
import firebase from "firebase";

import {firebaseConfig} from './firebaseConfig';
import shuffle from './importFile/shuffle';
import drawScore from './importFile/drawScore';
import { titles, elements } from './importFile/testdb';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export const auth = firebase.auth();
export const db = firebase.firestore();

const collection_game = db.collection('game');

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

  const [gameID, setGameID] = useState("");
  const [myname, setMyname] = useState("");
  const [enemyname, setEnemyname] = useState("");
  const [roomID, setRoomID] = useState(0);
  const [applyID, setApplyID] = useState(0);
  const [startedFlag, setStartedFlag] = useState(false);

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
      {!startedFlag &&
        <div>
          <div>ニックネーム：<input placeholder="ニックネームを入力"
              onChange={(e)=>
                setMyname(e.target.value)
              }/>
          </div>
          <div>部屋を作る：<input placeholder="半角数字を入力"
              onChange={(e)=>
                setRoomID(Number(e.target.value))
              } />
              <button className="btn btn-primary"
              onClick={() => {
                //ランダムなGammeIDを作成
                var l = 8;
                var c = "abcdefghijklmnopqrstuvwxyz0123456789";
                var cl = c.length;
                var gameIDFirst = "";
                for(var i=0; i<l; i++){
                  gameIDFirst += c[Math.floor(Math.random()*cl)];
                }
                setGameID(gameIDFirst);

                // DBにaddする
                collection_game.add({
                  gameID: gameIDFirst,
                  roomName: myname,
                  roomID: roomID,
                  applyName: 'nobody',
                })
                .then(doc => {
                  console.log(doc);
                  setStartedFlag(true);
                })
                .catch(error => {
                  console.log(error);
                })
              }}>
              部屋を作る
              </button>
          </div>
          <div>参加する：<input placeholder="半角数字を入力"
              onChange={(e)=>
                setApplyID(Number(e.target.value))
          } />
              <button className="btn btn-primary"
              onClick={() => {
                collection_game.where('applyName', '==', 'nobody').where('roomID', '==', applyID).get()
                .then(snapshot => {
                  if (snapshot.empty) {
                    return;
                  }
                  snapshot.forEach(doc => {
                    console.log(doc);
                    collection_game.doc(doc.id)
                      .set({
                        gameID: doc.data().gameID,
                        roomName: doc.data().roomName,
                        roomID: doc.data().roomID,
                        applyName: myname,
                      })
                      .then(snapshot => {
                        console.log(snapshot);
                        setGameID(doc.data().gameID);
                        setEnemyname(doc.data().roomName);
                        setStartedFlag(true);
                      })
                      .catch(err => {
                        console.log(err);
                      });

          });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
              }}>
              申し込む
              </button>
          </div>
        </div>
      }
      {startedFlag &&
        <div>
        <div>{gameID}</div>
        <div>{myname}</div>
        <div>{enemyname}</div>
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
      }
      {startedFlag && canDraw &&
        <button className="btn btn-primary" onClick={() => {
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
