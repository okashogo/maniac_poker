import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import { titles, roles, cards } from './importFile/testdb';

export default function Create() {
  console.log("Create_render");
  return (
    <div>
      <h2><b>カード作成画面</b></h2>
      <h2>
        タイトル：<input value={titles[0].title} />
      </h2>
      <hr />

      <h2>
        カードマスタ
      </h2>
      <table>
        <thead>
          <tr>
            <td>名前</td>
            <td>画像</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {cards.map((data,key) => {
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
            <td><input /></td>
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
        {roles.map((role, key) =>{
            return (<div style={{ display: "flex" }} >
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
                    {cards.map((card, key) =>{
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
                      <div></div>
                  </tbody>
                </table>
                <hr />
              </div>
            </div>)
          })
        }
      </div>
    </div>
  );
}
