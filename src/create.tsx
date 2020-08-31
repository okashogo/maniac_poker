import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import firebase from "firebase";
import { collection_title } from "./index";
// import firebase from "firebase";

import { titles, roles, cards } from './importFile/testdb';

export default function Create(props: any) {
  console.log("Create_render");

  const [title, setTitle] = useState("");
  const [cardsAry, setCard] = useState([{ name: "", img: "" }]);
  const [rolesAry, setRoles] = useState([{ name: "", contain: ["",] }]);

  const [newCardsAry, setNewCard] = useState({ name: "", img: "" });

  useEffect(() => {
    collection_title.where('title', '==', props.slectTitle).get().then(snapshot => {
      snapshot.forEach(async doc => {
        setTitle(doc.data().title);
        setCard(doc.data().cards);
        setRoles(doc.data().roles);
      })
    }).catch(err => {
      console.log('Error getting documents', err);
    });
  }, [props]);

  const dom = (
    <div>
      <h2><b>カード作成画面</b></h2>
      <button className="btn btn-primary" onClick={() => {
        collection_title.where('title', '==', title).get().then(snapshot => {
          if (snapshot.empty) {
            collection_title.add({
              title: title,
              cards: cardsAry,
              roles: rolesAry,
              updateAt: firebase.firestore.FieldValue.serverTimestamp(),
            })
              .then(doc => {
                console.log("doc = " + doc);
                alert("DBを登録しました。")
              })
              .catch(error => {
                console.log("error = " + error);
              })
          }
          else {
            snapshot.forEach(doc => {
              console.log(doc);
              collection_title.doc(doc.id)
                .set({
                  title: title,
                  cards: cardsAry,
                  roles: rolesAry,
                  updateAt: firebase.firestore.FieldValue.serverTimestamp(),
                })
                .then(snapshot => {
                  console.log(snapshot);
                  alert("DBを変更しました。")
                })
                .catch(err => {
                  console.log(err);
                });

            });
          }
        })
      }}>登録</button>
      <h2>
        タイトル：
        {title}
        <input defaultValue={title} onChange={(e) => {
          setTitle(e.target.value)
        }}/>
      </h2>
      <hr />

      <h2>
        カードマスタ
      </h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <td>名前</td>
            <td>画像</td>
            <td></td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {cardsAry.map((data, key) => {
            return (<tr key={"card" + key}>
              <td><input defaultValue={data.name} onChange={(e) => {
                var setCardTmp = cardsAry;
                setCardTmp[key].name = e.target.value;
                setCard(setCardTmp)
              }} /></td>
              <td>{data.img}</td>
              <td>
                <button className="btn btn-primary" onClick={() => {
                  collection_title.where('title', '==', title).get().then(snapshot => {
                    if (snapshot.empty) {
                      console.log("error: 同じタイトル名のDBがありません。")
                      return;
                    }
                    else {
                      snapshot.forEach(doc => {
                        console.log(doc);
                        collection_title.doc(doc.id)
                          .set({
                            title: title,
                            cards: cardsAry,
                            roles: rolesAry,
                            updateAt: firebase.firestore.FieldValue.serverTimestamp(),
                          })
                          .then(snapshot => {
                            console.log(snapshot);
                          })
                          .catch(err => {
                            console.log(err);
                          });

                      });
                    }
                  })
                }}>編集</button>
              </td>
            </tr>)
          })}
          <tr>
            <td><input defaultValue={newCardsAry.name} onChange={(e) => {
              var newCardsAryTmp = newCardsAry;
              newCardsAryTmp.name = e.target.value;
              setNewCard(newCardsAryTmp);
            }} /></td>
            <td><input defaultValue={newCardsAry.img} onChange={(e) => {
              var newCardsAryTmp = newCardsAry;
              newCardsAryTmp.img = e.target.value;
              setNewCard(newCardsAryTmp);
            }} /></td>
            <td>
              <button className="btn btn-danger" onClick={() => {
                collection_title.where('title', '==', title).get().then(snapshot => {
                    snapshot.forEach(doc => {
                      console.log(doc);
                      collection_title.doc(doc.id)
                        .set({
                          title: title,
                          cards: cardsAry.concat(newCardsAry),
                          roles: rolesAry,
                          updateAt: firebase.firestore.FieldValue.serverTimestamp(),
                        })
                        .then(snapshot => {
                          console.log(snapshot);
                        })
                        .catch(err => {
                          console.log(err);
                        });
                    });
                })
              }}>追加</button>
            </td>
          </tr>
        </tbody>
      </table>
      <hr />

      <h2>
        役マスタ
      </h2>
      <div className="row">
        {rolesAry.map((role, key) => {
          return (<div className="border border-success" style={{ display: "flex" }} >
            <div key={"rolename" + key}>{role.name}</div>
            <div className="col-4" key={"roletable" + key}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <td></td>
                    <td>名前</td>
                  </tr>
                </thead>
                <tbody>
                  {cardsAry.map((card, key) => {
                    if (role.contain.includes(card.name)) {
                      return (
                        <tr key={"check" + key}>
                          <td><input type="checkbox" checked /></td>
                          <td>{card.name}</td>
                        </tr>)
                    }
                    else {
                      return (
                        <tr key={"check" + key}>
                          <td><input type="checkbox" /></td>
                          <td>{card.name}</td>
                        </tr>)
                    }
                  })}
                </tbody>
              </table>
              <hr />
            </div>
          </div>)
        })}
        <div className="border border-success">
          <div>
            <input placeholder="新しい役を入力" />
          </div>
          <div>
            <button className="btn btn-danger">追加</button>
          </div>
        </div>
      </div>
    </div>
  )
  return (
    dom
  );
}
