import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import firebase from "firebase";
import {collection_title} from "./index";
// import firebase from "firebase";

import { titles, roles, cards } from './importFile/testdb';

export default function Create() {
  console.log("Create_render");
  const [title, setTitle] = useState(titles[0].title);
  const [cardsAry, setCard] = useState(cards);
  const [rolesAry, setRoles] = useState(roles);

  return (
    <div>
      <h2><b>カード作成画面</b></h2>
      <button className="btn btn-primary" onClick={() => {
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
      }}>登録</button>
      <h2>
        タイトル：<input value={title} />
      </h2>
      <hr />

      <h2>
        カードマスタ
      </h2>
      <table>
        <thead>
          <tr>
            <td>id</td>
            <td>名前</td>
            <td>画像</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {cardsAry.map((data,key) => {
            return (<tr key={key}>
              <td>{data.name}</td>
              <td>{data.img}</td>
              <td>
                <button className="btn btn-primary">編集</button>
              </td>
            </tr>)
          })}
          <tr>
            <td><input /></td>
            <td><input value="なし"/></td>
            <td>
              <button className="btn btn-danger">追加</button>
            </td>
          </tr>
        </tbody>
      </table>
      <hr />

      <h2>
        役マスタ
      </h2>
      <div className="row">
        {rolesAry.map((role, key) =>{
            return (<div className="border border-success" style={{ display: "flex" }} >
              <div key={key}>{role.name}</div>
              <div className="col-4" key={key}>
                <table>
                  <thead>
                    <tr>
                      <td></td>
                      <td>名前</td>
                    </tr>
                  </thead>
                  <tbody>
                    {cardsAry.map((card, key) =>{
                      if(role.contain.includes(card.name)){
                        return (
                          <tr key={key}>
                          <td><input type="checkbox" checked/></td>
                          <td>{card.name}</td>
                          </tr>)
                      }
                      else{
                        return (
                          <tr key={key}>
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
  );
}
