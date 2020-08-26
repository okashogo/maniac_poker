import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import "firebase/auth";
import firebase from "firebase";

import { firebaseConfig } from './firebaseConfig';
import shuffle from './importFile/shuffle';
import drawScore from './importFile/drawScore';
import { titles, elements } from './importFile/testdb';
import drawHand from './importFile/drawHand';
import calTotal from './importFile/calTotal';
// import drawDeck from './importFile/drawDeck';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export const auth = firebase.auth();
export const db = firebase.firestore();

const collection_game = db.collection('game');

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


  const [gameID, setGameID] = useState("");
  const [myname, setMyname] = useState("");
  const [enemyname, setEnemyname] = useState("");
  const [roomID, setRoomID] = useState(0);
  const [applyID, setApplyID] = useState(0);
  const [stage, setStage] = useState(0);

  const [hands, sethand] = useState([{ name: "", img: "", element1: "", element2: "" }]);
  const [select, setSelect] = useState([null]);
  const [scores, setScore]: any[] = useState(Array(Object.keys(elements[0]).length - 2).fill({ pairName: "", pairsCount: 0 }));
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (stage === 1) {
      collection_game.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'modified' && gameID === change.doc.data().gameID && change.doc.data().applyName !== "nobody" && change.doc.data().stage === 1) {

            console.log('applyed!!!');
            collection_game.doc(change.doc.id)
              .set({
                gameID: change.doc.data().gameID,
                roomName: change.doc.data().roomName,
                roomID: change.doc.data().roomID,
                applyName: change.doc.data().applyName,
                decks: change.doc.data().decks,
                stage: 2,
                scores: change.doc.data().scores,
              })
              .then(snapshot => {
                console.log("snapshot = " + snapshot);
                setEnemyname(change.doc.data().applyName);
                setStage(2);
              })
              .catch(err => {
                console.log("err = " + err);
              });
          }

          if (change.type === 'modified' && gameID === change.doc.data().gameID && change.doc.data().applyName !== "nobody" && change.doc.data().stage === 3) {

            console.log('applyed!!!');
            collection_game.doc(change.doc.id)
              .set({
                gameID: change.doc.data().gameID,
                roomName: change.doc.data().roomName,
                roomID: change.doc.data().roomID,
                applyName: change.doc.data().applyName,
                decks: change.doc.data().decks,
                stage: 3,
                scores: change.doc.data().scores,
                winner: change.doc.data().winner,
              })
              .then(snapshot => {
                console.log("snapshot = " + snapshot);

                if(change.doc.data().winner === myname){
                  alert("あなたの勝ちです。")
                }
                else if(change.doc.data().winner === "draw"){
                  alert("引き分けです。")
                }
                else{
                  alert("あなたの負けです。")
                }
              })
              .catch(err => {
                console.log("err = " + err);
              });
          }
        })
      });
    }
  });

  const element = (
    <div className="container-fluid">
      {stage === 0 &&
        <div>
          <div>ニックネーム：<input placeholder="ニックネームを入力"
            onChange={(e) =>
              setMyname(e.target.value)
            } />
          </div>
          <div>部屋を作る：<input placeholder="半角数字を入力"
            onChange={(e) =>
              setRoomID(Number(e.target.value))
            } />
            <button className="btn btn-primary"
              onClick={() => {
                //ランダムなGammeIDを作成
                var l = 8;
                var c = "abcdefghijklmnopqrstuvwxyz0123456789";
                var cl = c.length;
                var gameIDFirst = "";
                for (var i = 0; i < l; i++) {
                  gameIDFirst += c[Math.floor(Math.random() * cl)];
                }
                setGameID(gameIDFirst);

                // DBにaddする
                // 初期設定
                var cardsFirst: any[] = [];
                for (let i = 0; i < elements.length; i++) {
                  cardsFirst[i] = {
                    img: elements[i].img,
                    name: elements[i].name,
                    element1: elements[i].element1,
                    element2: elements[i].element2,
                  };
                }
                cardsFirst = shuffle(cardsFirst);
                // 初期設定終了
                var handFirst = cardsFirst.slice(0, 5);
                var deckFirst = cardsFirst.slice(5);
                sethand(handFirst);

                collection_game.add({
                  gameID: gameIDFirst,
                  roomName: myname,
                  roomID: roomID,
                  applyName: 'nobody',
                  decks: deckFirst,
                  stage: 1,
                  scores: [],
                })
                  .then(doc => {
                    console.log("doc = " + doc);
                    setStage(1);
                  })
                  .catch(error => {
                    console.log("error = " + error);
                  })
              }}>
              部屋を作る
              </button>
          </div>
          <div>参加する：<input placeholder="半角数字を入力"
            onChange={(e) =>
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
                      collection_game.doc(doc.id)
                        .set({
                          gameID: doc.data().gameID,
                          roomName: doc.data().roomName,
                          roomID: doc.data().roomID,
                          applyName: myname,
                          decks: doc.data().decks.slice(5),
                          stage: 1,
                          scores: doc.data().scores,
                        })
                        .then(snapshot => {
                          console.log("snapshot = " + snapshot);
                          sethand(doc.data().decks.slice(0, 5));

                          setGameID(doc.data().gameID);
                          setEnemyname(doc.data().roomName);
                          setStage(2);
                        })
                        .catch(err => {
                          console.log("err = " + err);
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
      {stage === 1 &&
        <div>
          <div>ようこそ、{myname}さん</div>
          <div>対戦相手を探しています。。。</div>
        </div>
      }
      {stage >= 2 &&
        <div>
          <div>gameID: {gameID}</div>
          <div>自分の名前：{myname}</div>
          <div>相手の名前：{enemyname}</div>
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
                    <Img src={data.img} />
                  </h1>
                </div>
              )
            })}
            <div className="col-1">得点</div>
          </div>
          {stage >= 3 &&
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
                {scores.map((data: { [key: string]: any; }) => {
                  if (data.length !== 1) {
                    return <div>{data.pairName}{data.pairsCount}点</div>
                  } else {
                    return <div>ペアなし</div>
                  }
                })}
              </div>
              <h1 style={{ color: "red" }}>{total}</h1>
            </div>
          }
        </div>
      }
      {stage === 2 &&
        <button className="btn btn-primary" onClick={() => {
          collection_game.where('gameID', '==', gameID).get()
            .then(snapshot => {
              if (snapshot.empty) {
                return;
              }
              snapshot.forEach(doc => {
                console.log("doc =" + doc);
                var decksTmp = doc.data().decks;
                // output の結果を drawScore に渡す
                var outputHnand = drawHand(decksTmp, hands, select);
                sethand(outputHnand);

                var outputScores = drawScore(outputHnand, scores.length);
                setScore(outputScores);
                var myScoreTmp = calTotal(outputScores);
                setTotal(myScoreTmp);
                setSelect([null]);
                setStage(3);

                var concatScores = doc.data().scores.concat({name:myname, score:myScoreTmp});

                var winner: string = "nobody";
                var upStage: number = 0;

                if(concatScores.length == 2){
                  console.log("finish");

                  // 対戦相手が複数の場合
                  // let getScores:number[] = [];
                  // for (let i = 0; i < concatScores.length; i++) {
                  //     getScores.push(concatScores[i].score);
                  // }
                  // console.log(getScores);
                  // console.log(getScores.indexOf(Math.max.apply(null,getScores)));
                  if(concatScores[0].score > concatScores[1].score){
                    // console.log(concatScores[0].name + "さんの勝利");
                    winner = concatScores[0].name;
                  }
                  else if(concatScores[0].score === concatScores[1].score){
                    // console.log("同点");
                    winner = "draw";
                  }
                  else{
                    // console.log(concatScores[1].name + "さんの勝利");
                    winner = concatScores[1].name;
                  }
                  setStage(3);

                  if(winner === myname){
                    alert("あなたの勝ちです。")
                  }
                  else if(winner === "draw"){
                    alert("引き分けです。")
                  }
                  else{
                    alert("あなたの負けです。")
                  }

                  upStage = 1;
                }

                // 次回、ここに得点カラムを追加させる
                // 得点カラムは配列で 長さは人数分 初期値は -1 すべてが 0以上になると、stageを3に上げて終了する。
                collection_game.doc(doc.id)
                  .set({
                    gameID: doc.data().gameID,
                    roomName: doc.data().roomName,
                    roomID: doc.data().roomID,
                    applyName: doc.data().applyName,
                    decks: decksTmp.slice(0, decksTmp.length - 1 - select.length),
                    stage: 2 + upStage,
                    scores: concatScores,
                    winner: winner,
                  })
                  .then(snapshot => {
                    console.log("snapshot = " + snapshot);
                  })
                  .catch(err => {
                    console.log("err = " + err);
                  });



              });
            })
            .catch(err => {
              console.log('Error getting documents', err);
            });

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
