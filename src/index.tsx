import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import "firebase/auth";
import firebase from "firebase";

import Create from './create';
import { firebaseConfig } from './firebaseConfig';
import shuffle from './importFile/shuffle';
import drawScore from './importFile/drawScore';
import { roles, cards } from './importFile/testdb';
import drawHand from './importFile/drawHand';
import calTotal from './importFile/calTotal';
import bgcChange from './importFile/bgcChange';
import randomChar from './importFile/randomChar';
import changePairname from './importFile/changePairname';
// import drawDeck from './importFile/drawDeck';

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
  return <img style={{ height: "150px" }} src={props.src} />;
}

function App() {
	console.log('render');
  const [gameID, setGameID] = useState("");
  const [myname, setMyname] = useState("");
  const [userNameList, setUserNameList] = useState([]);
  const [roomID, setRoomID] = useState(0);
  const [applyID, setApplyID] = useState(0);
  const [stage, setStage] = useState(0);
  const [isCreate, setIsCreate] = useState(false);
  const [parent, setParent] = useState(false);
  const [hands, sethand] = useState([{ name: "", img: "", element1: "", element2: "" }]);
  const [select, setSelect] = useState([null]);
  const [scores, setScore]: any[] = useState(Array(Object.keys(cards[0]).length - 2).fill({ pairName: "", pairsCount: 0 }));
  const [total, setTotal] = useState(0);
  const [titles, setTitles] = useState([""]);
  const [slectTitleFlag, setSlectTitleFlag] = useState("");

  const [crateFlag, setCrateFlag] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // ---------------useEffect from--------------------------
  useEffect(() => {
		if(gameID){
      collection_game.where('gameID', '==', gameID).onSnapshot(async snapshot => {
        snapshot.docChanges().forEach(async change => {
					const data = change.doc.data();
					if(change.doc.data().gameID === gameID){
						setStage(data.stage);
						if(data.stage === 1){
							setUserNameList(data.userNameList)
						} else if(data.stage === 3){
							setTimeout(() => {
								if(data.winner === myname){
									alert("あなたの勝ちです。");
								}
								else if(data.winner === "draw"){
									alert("引き分けです。");
								} else{
									alert("あなたの負けです。");
								}
							},1000);
						}
					}
				});
			});
		}
    if(crateFlag){
      collection_title.onSnapshot(async snapshot => {
        var titleList:string[] = [];
        snapshot.docChanges().forEach(async change => {
          const data = change.doc.data();
          titleList.push(data.title);
        });
        setTitles(titleList);
      });
      setCrateFlag(false);
    }
	},[gameID,crateFlag]);

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

                // 初期設定
                var cardsFirst: any[] = [];
                for (let i = 0; i < cards.length; i++) {
                  cardsFirst[i] = {
                    img: cards[i].img,
                    name: cards[i].name,
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
              }}>
              申し込む
              </button>
          </div>

          <div>
            <button className="btn btn-info"
              onClick={async () => {
                var titlesTmp:string[] = [];
                await collection_title.get().then(async snapshot =>{
                  snapshot.forEach(doc => {
                    console.log(doc.data().title);
                    titlesTmp.push(doc.data().title);
                  })
                })
                setTitles(titlesTmp);
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

                var outputScores = drawScore(outputHnand);
                console.log("outputScores");
                console.log(outputScores);
                console.log("outputScores");
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

        }}>
          ドロー
        </button>
        // ---------------stage = 2 to (ドロー)--------------------------
      }

      {isCreate &&
        // ---------------isCreate = true from (create画面)--------------------------
        <div>
          {slectTitleFlag === "" &&
            <div>
              <h2>タイトル一覧</h2>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <td>タイトル</td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {titles.map((data,key) => {
                    return(
                      <tr>
                        <td>{data}</td>
                        <td><button className="btn btn-primary" onClick={()=>{
                          setSlectTitleFlag(data);
                        }}>編集</button></td>
                      </tr>
                    )
                  })}
                  <tr>
                    <td><input onChange={(e) =>
                      setNewTitle(e.target.value)
                    }/></td>
                    <td><button className="btn btn-danger" onClick={()=>{
                      collection_title.add({
                        title: newTitle,
                        cards: [{ name: "", img: "" }],
                        roles: [{ name: "", contain: ["",] }],
                        updateAt: firebase.firestore.FieldValue.serverTimestamp(),
                      })
                        .then(doc => {
                          console.log("doc = " + doc);
                          setCrateFlag(true);
                        })
                        .catch(error => {
                          console.log("error = " + error);
                        })
                    }}>追加</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
          {slectTitleFlag !== "" &&
            <Create slectTitle={slectTitleFlag}/>
          }
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
