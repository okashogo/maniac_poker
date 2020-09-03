import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import "firebase/auth";
import firebase from "firebase";

import TitleIndex from './title_index';
import { firebaseConfig } from './firebaseConfig';
import shuffle from './importFile/shuffle';
import drawScore from './importFile/drawScore';
import drawHand from './importFile/drawHand';
import calTotal from './importFile/calTotal';
import bgcChange from './importFile/bgcChange';
import randomChar from './importFile/randomChar';
import changePairname from './importFile/changePairname';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export const auth = firebase.auth();
export const db = firebase.firestore();

const collection_game = db.collection('game');
export const collection_title = db.collection('title');
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
  return <img style={{ height: "150px" }} src={props.src} alt={props.src}/>;
}

function App() {
  console.log('render');
  const [gameID, setGameID] = useState("");
  const [myname, setMyname] = useState("");
  const [userNameList, setUserNameList] = useState([]);
  const [roomID, setRoomID] = useState(0);
  const [applyID, setApplyID] = useState(0);
  const [stage, setStage] = useState(0);
  const [isTitleIndex, setIsTitleIndex] = useState(false);
  const [parent, setParent] = useState(false);
  const [hands, sethand] = useState([{ name: "", img: "", element1: "", element2: "" }]);
  const [select, setSelect] = useState([null]);
  const [nowTitle, setNowTitle] = useState("");
  const [scores, setScore]: any[] = useState([{ pairName: "", pairsCount: 0 }]);
  const [total, setTotal] = useState(0);
  const [titles, setTitles] = useState([""]);

  // ---------------useEffect from--------------------------
  useEffect(() => {
    if (gameID) {
      collection_game.where('gameID', '==', gameID).onSnapshot(async snapshot => {
        snapshot.docChanges().forEach(async change => {
          const data = change.doc.data();
          if (change.doc.data().gameID === gameID) {
            setStage(data.stage);
            if (data.stage === 1) {
              setUserNameList(data.userNameList)
            } else if (data.stage === 3) {
              setTimeout(() => {
                if (data.winner === myname) {
                  alert("あなたの勝ちです。");
                }
                else if (data.winner === "draw") {
                  alert("引き分けです。");
                } else {
                  alert("あなたの負けです。");
                }
              }, 1000);
            }
          }
        });
      });
    }
  }, [gameID]);

  useEffect(() => {
    var titlesTmp: string[] = [];
    collection_title.get().then(snapshot => {
      snapshot.forEach(doc => {
        titlesTmp.push(doc.data().title);
      })
      setTitles(titlesTmp);
    })
  }, []);

  // ---------------useEffect to--------------------------

  const onClickMakeRoom = () => {
    //ランダムなGammeIDを作成
    var randomGameID = randomChar();
    setGameID(randomGameID);
    var randomMyID = randomChar();

    if (nowTitle === "") {
      alert("タイトルを選択してください。");
      return;
    }

    var cardsTmp: any[];
    collection_title.where('title', '==', nowTitle).get()
      .then(snapshot => {
        snapshot.forEach(async doc => {
          cardsTmp = doc.data().cards;
          console.log(cardsTmp);
        })
        // 初期設定
        var cardsFirst: any[] = [];
        for (let i = 0; i < cardsTmp.length; i++) {
          cardsFirst[i] = {
            img: cardsTmp[i].img,
            name: cardsTmp[i].name,
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
          updateAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
          .then(doc => {
            console.log("doc = " + doc);
            setParent(true);
            setStage(1);
          })
          .catch(error => {
            console.log("error = " + error);
          })
      }).catch(err => {
        console.log('Error getting documents', err);
      });


  }

  const onClickApplyRoom = () => {
    var randomMyID = randomChar();

    collection_game.where('stage', '==', 1)
      .where('roomID', '==', applyID)
      .orderBy('updateAt', 'desc')
      .limit(1)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          return;
        }

        snapshot.forEach(async doc => {
          console.log(doc.data(), 'data');
          var userNameListTmp = doc.data().userNameList;
          var userIDListTmp = doc.data().userIDList;

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
              updateAt: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then(snapshot => {
              console.log("snapshot = " + snapshot);
              sethand(doc.data().decks.slice(0, 5));
              setGameID(doc.data().gameID);
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
  }

  const onClickToMakeCard = async () => {
    var titlesTmp: string[] = [];
    await collection_title.get().then(async snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.data().title);
        titlesTmp.push(doc.data().title);
      })
    })
    setTitles(titlesTmp);
    setIsTitleIndex(true);
    setStage(-1);
  }

  const onClickGameStart = () => {
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
  }

  const onClickSetSelect = (key: number) => {
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
  }

  const onClickDraw = () => {
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

          var rolesTmp: any[];
          collection_title.where('title', '==', nowTitle).get()
            .then(snapshot => {
              snapshot.forEach(async doc_title => {
                rolesTmp = doc_title.data().roles;

                var outputScores = drawScore(outputHnand, rolesTmp);
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
                  //Todo: 引き分けの判定をする。
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
        })

      })
      .catch(err => {
        console.log('Error getting documents', err);
      });
  }

  const onChangeSelectbox = (title: string) => {
    setNowTitle(title);
  }
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

          <div>タイトル選択：
            <select onChange={(e) => onChangeSelectbox(e.target.value)}>
              <option value=""></option>
              {titles.map((data) => {
                return <option value={data}>{data}</option>
              })}
            </select>
          </div>

          <div>部屋を作る：<input placeholder="半角数字を入力"
            onChange={(e) =>
              setRoomID(Number(e.target.value))
            } />

            <button className="btn btn-primary"
              onClick={onClickMakeRoom}>
              部屋を作る
              </button>
          </div>

          <div>参加する：<input placeholder="半角数字を入力"
            onChange={(e) =>
              setApplyID(Number(e.target.value))
            } />

            <button className="btn btn-primary"
              onClick={onClickApplyRoom}>
              参加する
              </button>
          </div>

          <div>
            <button className="btn btn-info"
              onClick={onClickToMakeCard}
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
              onClick={onClickGameStart}>ゲームスタート</button>
          }

          <div>ユーザー一覧</div>
          {userNameList.map((data) => {
            return <div key={data}>{data}さん</div>
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
                <div key={key} className="col-2 text-center"
                  style={{ background: bgcChange(key, select) }}
                  onClick={() => onClickSetSelect(key)}
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
              </div>
              <div className="col-3">
                {scores.map((data: { [key: string]: any; }) => {
                  if (data.pairsCount >= 1) {
                    return <div>{data.pairName}</div>
                  }
                })}
              </div>
              <div className="col-2">
                {scores.map((data: { [key: string]: any; }) => {
                  if (data.pairsCount >= 1) {
                    return <div>{changePairname(data.pairsCount)}</div>
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
        <button className="btn btn-primary" onClick={onClickDraw}>
          ドロー
        </button>
        // ---------------stage = 2 to (ドロー)--------------------------
      }

      {isTitleIndex &&
        // ---------------isTitleIndex = true from (create画面)--------------------------
        <div>
          <TitleIndex />
        </div>
        // ---------------isTitleIndex = true to (create画面)--------------------------
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
