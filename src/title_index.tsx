import React, { useState, useEffect } from 'react';
import firebase from "firebase";
import { collection_title } from "./index";
import TitleEdit from './title_edit';
// import firebase from "firebase";

export default function TitleIndex() {
  console.log("title_index_render");

  const [newTitle, setNewTitle] = useState("");
  const [slectTitleFlag, setSlectTitleFlag] = useState("");
  const [titles, setTitles] = useState([""]);

  useEffect(() => {
    var titlesTmp: string[] = [];
    collection_title.get().then(snapshot => {
      snapshot.forEach(doc => {
        titlesTmp.push(doc.data().title);
      })
      setTitles(titlesTmp);
    })
  }, []);

  const onClickMakeNewtitle = () => {
    collection_title.add({
      title: newTitle,
      cards: [{ name: "", img: "" }],
      roles: [{ name: "", contain: ["",] }],
      updateAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
      .then(doc => {
        console.log("doc = " + doc);
        setTitles(titles.concat(newTitle));
      })
      .catch(error => {
        console.log("error = " + error);
      })
  }

  const dom = (
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
              {titles.map((data, key) => {
                return (
                  <tr>
                    <td>{data}</td>
                    <td><button className="btn btn-primary" onClick={() => {
                      setSlectTitleFlag(data);
                    }}>編集</button></td>
                  </tr>
                )
              })}
              <tr>
                <td><input onChange={(e) =>
                  setNewTitle(e.target.value)
                } /></td>
                <td><button className="btn btn-success" onClick={onClickMakeNewtitle}>追加</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      }
      {slectTitleFlag !== "" &&
        <TitleEdit slectTitle={slectTitleFlag} />
      }
    </div>
  )
  return (
    dom
  );
}
