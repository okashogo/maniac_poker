import React, { useState, useEffect } from 'react';
import firebase from "firebase";
import { collection_title } from "./index";
// import firebase from "firebase";

export default function TitleEdit(props: any) {
  console.log("title_edit_render");

  const [title, setTitle] = useState("");
  const [cards, setCard] = useState([{ name: "", img: "" }]);
  const [roles, setRoles] = useState([{ name: "", contain: ["",] }]);

  const [newCardsAry, setNewCard] = useState({ name: "", img: "" });
  const [createFlag, setCreateFlag] = useState(false);
  const [newRole, setNewRole] = useState("");
  console.log(cards);

  useEffect(() => {
    console.log("run useEffect");
    collection_title.where('title', '==', props.slectTitle).get().then(snapshot => {
      snapshot.forEach(async doc => {
        setTitle(doc.data().title);
        setCard(doc.data().cards);
        setRoles(doc.data().roles);
      })
    }).catch(err => {
      console.log('Error getting documents', err);
    });
    setCreateFlag(false);
  }, [props, createFlag]);

  // onClickAllStore はテスト用、最後に消す
  const onClickAllStore = () => {
    collection_title.where('title', '==', title).get().then(snapshot => {
      if (snapshot.empty) {
        collection_title.add({
          title: title,
          cards: cards,
          roles: roles,
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
              cards: cards,
              roles: roles,
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
  }

  const onClickCardsUpdate = () => {
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
              cards: cards,
              roles: roles,
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
  }

  const onClickCardsDelete = (key: number) => {
    var rolesTmp = roles;
    roles.forEach((role, roleKey) =>
      role.contain.forEach((contain, containKey) => {
        if (contain === cards[key].name) {
          rolesTmp[roleKey].contain.splice(containKey, 1);
        }
      })
    );
    var cardsTmp = cards;
    cardsTmp.splice(key, 1);

    collection_title.where('title', '==', title).get().then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc);
        collection_title.doc(doc.id)
          .set({
            title: title,
            cards: cardsTmp,
            roles: rolesTmp,
            updateAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(snapshot => {
            console.log(snapshot);
            setCreateFlag(true);
          })
          .catch(err => {
            console.log(err);
          });

      });
    })
  }

  const onClickCardsInsert = () => {
    collection_title.where('title', '==', title).get().then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc);
        collection_title.doc(doc.id)
          .set({
            title: title,
            cards: cards.concat(newCardsAry),
            roles: roles,
            updateAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(snapshot => {
            console.log(snapshot);
            var cardsTmp = cards.concat();
            setCard(cardsTmp.concat(newCardsAry));
            // setCreateFlag(true);
          })
          .catch(err => {
            console.log(err);
          });
      });
    })
  }

  const onClickRolesInsert = () => {
    if (newRole !== "") {
      var rolesTmp = roles.concat();
      rolesTmp.push({ name: newRole, contain: [] });
      collection_title.where('title', '==', title).get().then(snapshot => {
        snapshot.forEach(doc => {
          console.log(doc);
          collection_title.doc(doc.id)
            .set({
              title: title,
              cards: cards,
              roles: rolesTmp,
              updateAt: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then(snapshot => {
              console.log(snapshot);
              setCreateFlag(true);
              setNewRole("");
            })
            .catch(err => {
              console.log(err);
            });
        });
      })
    }
  }

  const onClickRolesDelete = (roleKey: number) => {
    roles.splice(roleKey, 1);
    collection_title.where('title', '==', title).get().then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc);
        collection_title.doc(doc.id)
          .set({
            title: title,
            cards: cards,
            roles: roles,
            updateAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(snapshot => {
            console.log(snapshot);
            setCreateFlag(true);
          })
          .catch(err => {
            console.log(err);
          });
      });
    })
  }

  const onChangeRemoveChecked = (role: any, card: any, roleKey: number) => {
    var rolesTmp = roles.concat();
    role.contain.splice(role.contain.indexOf(card.name), 1);
    rolesTmp[roleKey].contain = role.contain;
    collection_title.where('title', '==', title).get().then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc);
        collection_title.doc(doc.id)
          .set({
            title: title,
            cards: cards,
            roles: rolesTmp,
            updateAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(snapshot => {
            console.log(snapshot);
            setCreateFlag(true);
          })
          .catch(err => {
            console.log(err);
          });
      });
    })
  }

  const onChangeAddChecked = (role: any, card: any, roleKey: number) => {
    var rolesTmp = roles.concat();
    rolesTmp[roleKey].contain = role.contain.concat(card.name);
    collection_title.where('title', '==', title).get().then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc);
        collection_title.doc(doc.id)
          .set({
            title: title,
            cards: cards,
            roles: rolesTmp,
            updateAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(snapshot => {
            console.log(snapshot);
            setCreateFlag(true);
          })
          .catch(err => {
            console.log(err);
          });
      });
    })
  }

  const dom = (
    <div>
      <h2><b>カード作成画面</b></h2>
      <button className="btn btn-primary" onClick={onClickAllStore}>登録</button>
      <h2>
        タイトル：
        {title}
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
          {cards.map((data, key) => {
            return (<tr key={"card" + key}>
              <td><input defaultValue={data.name} onChange={(e) => {
                var setCardTmp = cards;
                setCardTmp[key].name = e.target.value;
                setCard(setCardTmp);
              }} /></td>
              <td>{data.img}</td>
              <td>
                <button className="btn btn-primary" onClick={onClickCardsUpdate}>変更</button>
              </td>
              <td>
                <button className="btn btn-danger" onClick={() => onClickCardsDelete(key)}>削除</button>
              </td>
            </tr>)
          })}
          <tr>
            <td><input key="newCardInput" defaultValue={newCardsAry.name} onChange={(e) => {
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
              <button className="btn btn-success" onClick={onClickCardsInsert}>追加</button>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <hr />

      <h2>
        役マスタ
      </h2>
      <div>
        <input placeholder="新しい役を入力" defaultValue="" onChange={(e) => {
          setNewRole(e.target.value);
        }} />
      </div>
      <div>
        <button className="btn btn-success" onClick={onClickRolesInsert}>追加</button>
      </div>
      <div className="row">
        {roles.map((role, roleKey) => {
          return (<div className="border border-success" style={{ display: "flex" }} >
            <div key={"rolename" + roleKey}>
              <div>{role.name}</div>
              <button className="btn btn-danger" onClick={() => onClickRolesDelete(roleKey)}>
                削除
              </button>
            </div>
            <div className="col-4" key={"roletable" + roleKey}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <td></td>
                    <td>名前</td>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card, key) => {
                    if (role.contain.includes(card.name)) {
                      return (
                        <tr key={"role" + roleKey + "check" + key}>
                          <td><input type="checkbox" checked onChange={() => onChangeRemoveChecked(role, card, roleKey)} /></td>
                          <td>{card.name}</td>
                        </tr>)
                    }
                    else {
                      return (
                        <tr key={"role" + roleKey + "check_" + key}>
                          <td><input type="checkbox" onChange={() => onChangeAddChecked(role, card, roleKey)} /></td>
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
      </div>
    </div>
  )
  return (
    dom
  );
}
