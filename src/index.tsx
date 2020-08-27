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

function randomChar() {
  var l = 8;
  var c = "abcdefghijklmnopqrstuvwxyz0123456789";
  var cl = c.length;
  var randomChar = "";
  for (var i = 0; i < l; i++) {
    randomChar += c[Math.floor(Math.random() * cl)];
  }
  return randomChar;
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
  // const [enemyname, setEnemyname] = useState("");
  const [stage, setStage] = useState(0);
  const [createApp, setCreateApp] = useState(false);
  const [parent, setParent] = useState(false);


  const [hands, sethand] = useState([{ name: "", img: "", element1: "", element2: "" }]);
  const [select, setSelect] = useState([null]);
  const [scores, setScore]: any[] = useState(Array(Object.keys(elements[0]).length - 2).fill({ pairName: "", pairsCount: 0 }));
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (stage === 1) {
      collection_game.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'modified' && gameID === change.doc.data().gameID && change.doc.data().readListFlag.indexOf(myID) === -1 && change.doc.data().stage === 1) {

            console.log('applyed!!!');
            console.log(myID);
            collection_game.doc(change.doc.id)
              .set({
                gameID: change.doc.data().gameID,
                roomID: change.doc.data().roomID,
                userNameList: change.doc.data().userNameList,
                userIDList: change.doc.data().userIDList,
                readListFlag: change.doc.data().readListFlag.concat(myID),
                decks: change.doc.data().decks,
                stage: 1,
                scores: change.doc.data().scores,
              })
              .then(snapshot => {
                console.log("snapshot = " + snapshot);
                setUserNameList(change.doc.data().userNameList)
                setUserIDList(change.doc.data().userIDList);
                // setStage(2);
              })
              .catch(err => {
                console.log("err = " + err);
              });
          }

          if (change.type === 'modified' && gameID === change.doc.data().gameID && change.doc.data().readListFlag.indexOf(myID) === -1 && change.doc.data().stage === 2) {

            console.log('start!!!');
            collection_game.doc(change.doc.id)
              .set({
                gameID: change.doc.data().gameID,
                roomID: change.doc.data().roomID,
                userNameList: change.doc.data().userNameList,
                userIDList: change.doc.data().userIDList,
                readListFlag: change.doc.data().readListFlag.concat(myID),
                decks: change.doc.data().decks.slice(5),
                stage: 2,
                scores: change.doc.data().scores,
              })
              .then(snapshot => {
                console.log("snapshot = " + snapshot);
                sethand(change.doc.data().decks.slice(0, 5));
                setStage(2);
              })
              .catch(err => {
                console.log("err = " + err);
              });
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
                    // setUserNameList(userNameList.push(myname));
                    // setUserIDList(userIDList.push(myID));
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

                    snapshot.forEach(doc => {
                      var userNameListTmp = doc.data().userNameList;
                      var userIDListTmp = doc.data().userIDList;
                      console.log(userNameListTmp);
                      console.log(userIDListTmp);
                      console.log(userNameListTmp.concat(myname));
                      console.log(userIDListTmp.concat(randomMyID));
                      setMyNumber(doc.data().userNameList.length);

                      collection_game.doc(doc.id)
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
                setCreateApp(true);
                setStage(-1);
              }}
              >カードを作る</button>
          </div>
        </div>
      }

      {stage === 1 &&
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
          <div>{userNameList}</div>
        </div>
      }

      {stage >= 2 &&
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

                  upStage = 1;
                }

                // 次回、ここに得点カラムを追加させる
                // 得点カラムは配列で 長さは人数分 初期値は -1 すべてが 0以上になると、stageを3に上げて終了する。
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
      }
      {createApp &&
        <div>
          <h2><b>カード作成画面</b></h2>
          <h2>
            タイトル：<input value="スマブラ"/>
          </h2>
          <hr />
          <h4>
            役１:<input value="シリーズ"/>
          </h4>
          <h4>
            役２:<input value="武器"/>
          </h4>
          <h4>
            役３:<input />
          </h4>
          <h4>
            役４:<input />
          </h4>
          <h4>
            役５:<input />
          </h4>
          <button type="button" className="btn btn-primary rounded-circle p-0" style={{width:25, height:25}}>＋</button>
          <hr />
          <div className="row">
            <h5 className="col-2">
              シリーズ(役1):
              <div><input value="スーパーマリオ"/></div>
              <div><input value="ドンキーコング"/></div>
              <div><input value="ゼルダの伝説"/></div>
              <div><input value="METROID"/></div>
              <div><input value="YOSHI"/></div>
              <div><input value="星のカービー"/></div>
              <button type="button" className="btn btn-primary rounded-circle p-0" style={{width:25, height:25}}>＋</button>
            </h5>
            <div className="col-1"></div>
            <h5 className="col-2">
              武器(役2):
              <div><input value="素手"/></div>
              <div><input value="飛び道具"/></div>
              <div><input value="魔法"/></div>
              <div><input value="剣"/></div>
            </h5>
          </div>
          <hr />
          <table className="table">
            <tr>
              <td>カード1:</td>
              <td><input value="マリオ"/></td>
              <td>シリーズ:
              <select>
                <option selected>スーパーマリオ</option>
                <option>ドンキーコング</option>
                <option>ゼルダの伝説</option>
                <option>METROID</option>
                <option>YOSHI</option>
                <option>星のカービー</option>
              </select>
              </td>
              <td>武器:
              <select>
                <option selected>素手</option>
                <option>飛び道具</option>
                <option>魔法</option>
                <option>剣</option>
              </select>
              </td>
            </tr>
            <tr>
              <td>カード2:</td>
              <td><input value="ドンキー"/></td>
              <td>シリーズ:
              <select>
                <option>スーパーマリオ</option>
                <option selected>ドンキーコング</option>
                <option>ゼルダの伝説</option>
                <option>METROID</option>
                <option>YOSHI</option>
                <option>星のカービー</option>
              </select>
              </td>
              <td>武器:
              <select>
                <option selected>素手</option>
                <option>飛び道具</option>
                <option>魔法</option>
                <option>剣</option>
              </select>
              </td>
            </tr>
            <tr>
              <td>カード3:</td>
              <td><input value="リンク"/></td>
              <td>シリーズ:
              <select>
                <option>スーパーマリオ</option>
                <option>ドンキーコング</option>
                <option selected>ゼルダの伝説</option>
                <option>METROID</option>
                <option>YOSHI</option>
                <option>星のカービー</option>
              </select>
              </td>
              <td>武器:
                <select>
                  <option>素手</option>
                  <option selected>飛び道具</option>
                  <option>魔法</option>
                  <option>剣</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>カード4:</td>
              <td><input value="サムス"/></td>
              <td>シリーズ:
              <select>
                <option>スーパーマリオ</option>
                <option>ドンキーコング</option>
                <option>ゼルダの伝説</option>
                <option selected>METROID</option>
                <option>YOSHI</option>
                <option>星のカービー</option>
              </select>
              </td>
              <td>武器:
              <select>
                <option>素手</option>
                <option>飛び道具</option>
                <option selected>魔法</option>
                <option>剣</option>
              </select>
              </td>
            </tr>
            <button type="button" className="btn btn-primary rounded-circle p-0" style={{width:25, height:25}}>＋</button>
            <hr />
          </table>
        </div>
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
