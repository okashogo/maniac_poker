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
import bgcChange from './importFile/bgcChange';
import randomChar from './importFile/randomChar';
// import drawDeck from './importFile/drawDeck';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export const auth = firebase.auth();
export const db = firebase.firestore();

const collection_game = db.collection('game');
// gameテーブルに保存するカラム
// gameID:
// roomID:
// userNameList:
// userIDList:
// readListFlag:
// decks:
// stage:
// scores:
// winner:

function Img(props: any) {
  // 最初のnullはカウントしない
  return <img style={{ height: "150px" }} src={props.src} />;
}

function App() {

  const [gameID, setGameID] = useState("");
  const [myname, setMyname] = useState("");
  const [myID, setMyID] = useState("");
  const [myNumber, setMyNumber] = useState(-1);
  const [userNameList, setUserNameList] = useState([]);
  const [userIDList, setUserIDList] = useState([]);
  const [roomID, setRoomID] = useState(0);
  const [applyID, setApplyID] = useState(0);
  const [stage, setStage] = useState(0);
  const [isCreate, setIsCreate] = useState(false);
  const [parent, setParent] = useState(false);
  const [hands, sethand] = useState([{ name: "", img: "", element1: "", element2: "" }]);
  const [select, setSelect] = useState([null]);
  const [scores, setScore]: any[] = useState(Array(Object.keys(elements[0]).length - 2).fill({ pairName: "", pairsCount: 0 }));
  const [total, setTotal] = useState(0);

  // ---------------useEffect from--------------------------
  useEffect(() => {
    if (stage === 1) {
      asyncFunc();

      collection_game.onSnapshot(async snapshot => {
        snapshot.docChanges().forEach(async change => {
          if (change.type === 'modified' && gameID === change.doc.data().gameID && change.doc.data().readListFlag.indexOf(myID) === -1 && change.doc.data().stage === 1) {
            var readListFlagTnp = change.doc.data().readListFlag.concat(myID);
            // console.log('applyed!!!');
            await collection_game.doc(change.doc.id)
              .set({
                gameID: change.doc.data().gameID,
                roomID: change.doc.data().roomID,
                userNameList: change.doc.data().userNameList,
                userIDList: change.doc.data().userIDList,
                readListFlag: readListFlagTnp,
                decks: change.doc.data().decks,
                stage: 1,
                scores: change.doc.data().scores,
              });

            setUserNameList(change.doc.data().userNameList)
            setUserIDList(change.doc.data().userIDList);
          }

          if (change.type === 'modified' && gameID === change.doc.data().gameID && change.doc.data().stage === 3) {
            collection_game.doc(change.doc.id)
              .set({
                gameID: change.doc.data().gameID,
                roomID: change.doc.data().roomID,
                userNameList: change.doc.data().userNameList,
                userIDList: change.doc.data().userIDList,
                readListFlag: change.doc.data().readListFlag,
                decks: change.doc.data().decks,
                stage: 3,
                scores: change.doc.data().scores,
                winner: change.doc.data().winner,
              })
              .then(snapshot => {
                console.log("snapshot = " + snapshot);

                if (change.doc.data().winner === myname) {
                  alert("あなたの勝ちです。")
                }
                else if (change.doc.data().winner === "draw") {
                  alert("引き分けです。")
                }
                else {
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

  const asyncFunc = async () => {
    await new Promise(collectionGameSnapshot);
  }


  function collectionGameSnapshot() {
    collection_game.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        // if文の中でDBが変更されたら、このif文は通らないので、一回しか通らないようにしています。
        // change.doc.data().readListFlag.length が myNumber(参加した順) のときにしか読み込まないようにしています。
        if (change.type === 'modified' && gameID === change.doc.data().gameID && change.doc.data().readListFlag.length === myNumber && change.doc.data().stage === 2) {
          console.log('game start!!!');

          // ここでDBを変更
          collection_game.doc(change.doc.id)
            .set({
              gameID: change.doc.data().gameID,
              roomID: change.doc.data().roomID,
              userNameList: change.doc.data().userNameList,
              userIDList: change.doc.data().userIDList,
              readListFlag: change.doc.data().readListFlag.concat(myID),// ここで、readListFlag.length を変更
              decks: change.doc.data().decks.slice(5),
              stage: 2,
              scores: change.doc.data().scores,
            })
          // console.log("snapshot = " + snapshot);
          sethand(change.doc.data().decks.slice(0, 5));
          setStage(2);
        }
      })
    });
  }
  // ---------------useEffect to--------------------------

  // ---------------render from--------------------------
  const element = (
    <div className="container-fluid">
      {stage === 0 &&
        //---------------stage=0 from (初期画面)-----------------------
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
                var randomGameID = randomChar();
                setGameID(randomGameID);
                var randomMyID = randomChar();
                setMyID(randomMyID);

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

                // DBにaddする
                collection_game.add({
                  gameID: randomGameID,
                  roomID: roomID,
                  userNameList: [myname,],
                  userIDList: [randomMyID,],
                  decks: deckFirst,
                  readListFlag: [],
                  stage: 1,
                  scores: [],
                })
                  .then(doc => {
                    console.log("doc = " + doc);
                    setParent(true);
                    setStage(1);
                    setMyNumber(0);
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
                var randomMyID = randomChar();
                setMyID(randomMyID);

                collection_game.where('stage', '==', 1).where('roomID', '==', applyID).get()
                  .then(snapshot => {
                    if (snapshot.empty) {
                      return;
                    }

                    snapshot.forEach(async doc => {
                      var userNameListTmp = doc.data().userNameList;
                      var userIDListTmp = doc.data().userIDList;
                      console.log(userNameListTmp);
                      console.log(userIDListTmp);
                      console.log(userNameListTmp.concat(myname));
                      console.log(userIDListTmp.concat(randomMyID));
                      setMyNumber(doc.data().userNameList.length);

                      await collection_game.doc(doc.id)
                        .set({
                          gameID: doc.data().gameID,
                          roomID: doc.data().roomID,
                          userNameList: userNameListTmp.concat(myname),
                          userIDList: userIDListTmp.concat(randomMyID),
                          decks: doc.data().decks.slice(5),
                          readListFlag: [],
                          stage: 1,
                          scores: doc.data().scores,
                        })
                        .then(snapshot => {
                          console.log("snapshot = " + snapshot);
                          sethand(doc.data().decks.slice(0, 5));

                          setGameID(doc.data().gameID);
                          console.log(doc.data().gameID);
                          setStage(1);
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

          <div>
            <button className="btn btn-info"
              onClick={() => {
                console.log('make_card');
                setIsCreate(true);
                setStage(-1);
              }}
            >カードを作る</button>
          </div>
        </div>
        // ---------------stage=0 to (初期画面)--------------------------
      }

      {stage === 1 &&
        // ---------------stage=1 from (対戦相手を探し中)--------------------------
        <div>
          <div>ようこそ、{myname}さん</div>
          <div>対戦相手を探しています。。。</div>

          {parent &&
            <button className="btn btn-primary"
              onClick={() => {
                console.log("start button!");
                collection_game.where('stage', '==', 1).where('gameID', '==', gameID).get()
                  .then(snapshot => {
                    if (snapshot.empty) {
                      return;
                    }
                    snapshot.forEach(doc => {
                      collection_game.doc(doc.id)
                        .set({
                          gameID: doc.data().gameID,
                          roomID: doc.data().roomID,
                          usercount: doc.data().userNameList.length,
                          nextUser: 1,
                          userNameList: doc.data().userNameList,
                          userIDList: doc.data().userIDList,
                          readListFlag: [],
                          decks: doc.data().decks,
                          stage: 2,
                          scores: doc.data().scores,
                        })
                        .then(snapshot => {
                          console.log("snapshot = " + snapshot);
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
              }}>ゲームスタート</button>
          }

          <div>ユーザー一覧</div>
          {userNameList.map((data) => {
            return <div>{data}さん</div>
          })}
        </div>
        // ---------------stage=1 to (対戦相手を探し中)--------------------------
      }

      {stage >= 2 &&
        // ---------------stage ＞= 2 from (ゲーム内容)--------------------------
        <div>
          <div>gameID: {gameID}</div>
          <div>自分の名前：{myname}</div>
          <div>相手の名前一覧</div>
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
        // ---------------stage ＞= 2 to (ゲーム内容)--------------------------
      }

      {stage === 2 &&
        // ---------------stage = 2 from (ドロー)--------------------------
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

                var concatScores = doc.data().scores.concat({ name: myname, score: myScoreTmp });

                var winner: string = "nobody";
                var upStage: number = 0;

                // 最後の人だった場合
                if (concatScores.length === doc.data().userNameList.length) {
                  console.log("finish");
                  // 対戦相手が複数の場合
                  let getScores: number[] = [];
                  for (let i = 0; i < concatScores.length; i++) {
                    getScores.push(concatScores[i].score);
                  }
                  console.log(getScores);
                  console.log(Math.max.apply(null, getScores));
                  console.log(getScores.indexOf(Math.max.apply(null, getScores)));
                  var winnerNumber = getScores.indexOf(Math.max.apply(null, getScores));
                  winner = concatScores[winnerNumber].name;
                  console.log(winner + "さんの勝利");
                  setStage(3);

                  upStage = 1;
                }

                collection_game.doc(doc.id)
                  .set({
                    gameID: doc.data().gameID,
                    roomID: doc.data().roomID,
                    userNameList: doc.data().userNameList,
                    userIDList: doc.data().userIDList,
                    readListFlag: doc.data().readListFlag,
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
        // ---------------stage = 2 to (ドロー)--------------------------
      }

      {isCreate &&
        // ---------------isCreate = true from (create画面)--------------------------
        <div>
          <h2><b>カード作成画面</b></h2>
          <h2>
            タイトル：<input value="スマブラ" />
          </h2>
        </div>
        // ---------------isCreate = true to (create画面)--------------------------
      }
    </div>
  );
  // ---------------render to--------------------------
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
