import React, { useState } from 'react';
import { collection_game, collection_title } from "./index";
import Img from "./index";
import drawScore from './importFile/drawScore';
import calTotal from './importFile/calTotal';
import drawHand from './importFile/drawHand';
import bgcChange from './importFile/bgcChange';
import changePairname from './importFile/changePairname';
// import firebase from "firebase";

export default function Battle(props: any) {
  const [stage, setStage] = useState(2);
  const [hands, sethand] = useState(props.hands);
  const [select, setSelect] = useState([null]);
  const [scores, setScore]: any[] = useState([{ pairName: "", pairsCount: 0 }]);
  const [total, setTotal] = useState(0);

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
    collection_game.where('gameID', '==', props.gameID).get()
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
          collection_title.where('title', '==', props.nowTitle).get()
            .then(snapshot => {
              snapshot.forEach(async doc_title => {
                rolesTmp = doc_title.data().roles;

                var outputScores = drawScore(outputHnand, rolesTmp);
                setScore(outputScores);
                var myScoreTmp = calTotal(outputScores);
                setTotal(myScoreTmp);
                setSelect([null]);
                setStage(3);

                var concatScores = doc.data().scores.concat({ name: props.myname, score: myScoreTmp });

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

  const dom = (
    <div>
      <div>gameID: {props.gameID}</div>
      <div>自分の名前：{props.myname}</div>
      <div>相手の名前一覧</div>
      <div style={{ display: "flex" }} className="row">
        <div className="col-1"></div>
        {hands.map((data:any, key:any) => {
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
        <div>
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

        </div>
      }
      {stage === 2 &&
        <button className="btn btn-primary" onClick={onClickDraw}>
        ドロー
        </button>
      }
    </div>
  )
  return (
    dom
  );
}
