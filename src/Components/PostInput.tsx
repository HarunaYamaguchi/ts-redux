import React, { useState }from 'react';
import styles from './PostInput.module.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { auth, db, storage } from '../firebase';
import { Avatar, Button, IconButton} from '@material-ui/core';
import firebase from 'firebase/app';
import { AddAPhoto } from '@material-ui/icons';

const PostInput: React.FC = () => {
  const user = useSelector(selectUser);
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postMsg, setPostMsg] = useState("");

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files![0]) {
      setPostImage(e.target.files![0]);
      e.target.value = ""; //空にして毎回初期化
    };
  };

  const sendPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(postImage){
      const S = 
      "abcdefghijklmnopqrxtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; //ランダムな文字列を作るための候補の文字
      const N = 16; //生成したいランダムの文字列の数
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
      .map((n) => S[n % S.length])
      .join("");

      const fileName = randomChar + "_" + postImage.name;
      const uploadPostImg = storage.ref(`images/${fileName}`).put(postImage);
      uploadPostImg.on( //データの読み取り、変更をリッスン
        firebase.storage.TaskEvent.STATE_CHANGED, //stateの状態が変わった時

         () => { /* nothing */ }, //progress
         (err) => { //errorハンドリング
           alert(err.message)
         }, async() => {  //正常終了した場合
           await storage.ref('images').child(fileName).getDownloadURL().then( //URLの取得が成功した場合、画像の保存
             async(url) => {
               await db.collection('posts').add({ //投稿内容の保存
                avatar: user.photoURL,
                image: url,
                text: postMsg,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                username: user.displayName
               });
             }
           );
         }
      );
    } else {
      db.collection('posts').add({
        avatar: user.photoURL,
        image: "",
        text: postMsg,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
      })
    }
    setPostImage(null);
    setPostMsg("");
  };

  return (
    <>
    <form onSubmit={sendPost}>
      <div className={styles.post_form}>
          <Avatar 
            className={styles.post_avatar}
            src={user.photoURL}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          <input
            className={styles.post_input}
            placeholder="投稿内容"
            type="text"
            autoFocus
            value={postMsg}
            onChange={(e) => setPostMsg(e.target.value)}
          />
          <IconButton>
            <label>
              <AddAPhoto 
                className={
                  postImage ? styles.post_addIconLoaded : styles.post_addIcon
                }
              />
              <input 
                className={styles.post_hiddenIcon}
                type="file"
                onChange={onChangeImageHandler}
               />
            </label>
          </IconButton>
      </div>
      <Button
        type="submit"
        disabled={!postMsg}
        className={
          postMsg ? styles.post_sendBtn : styles.post_sendDisabledBtn
        }
      >
        投稿
      </Button>
    </form>
    </>
  );
};

export default PostInput;
