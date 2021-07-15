import React, { useState, useEffect } from "react";
import styles from "./PostList.module.css";
import { db } from "../firebase";
import firebase from "firebase/app";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core";
import { Message, Send } from "@material-ui/icons";

interface PROPS {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
}

interface COMMENT {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

const PostList: React.FC<PROPS> = (props) => {
  const classes = useStyles();
  const user = useSelector(selectUser);
  const [openComments, setOpenComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);

  useEffect(() => {
    const unSub = db
      .collection("posts")
      .doc(props.postId)
      .collection("comments")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            timestamp: doc.data().timestamp,
            username: doc.data().username,
          }))
        );
      });
    return () => {
      unSub();
    };
  }, [props.postId]);

  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    db.collection("posts").doc(props.postId).collection("comments").add({
      avatar: user.photoURL,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
    });
    setComment("");
  };

  return (
    <div className={styles.post_list}>
      <div className={styles.post_list_avatar}>
        <Avatar src={props.avatar} className={classes.small} />
      </div>
      <div className={styles.post_list_body}>
        <div>
          <div>
            <h3>
              <span className={styles.post_list_headerUser}>
                @{props.username}
              </span>
              <span className={styles.post_list_headerTime}>
                {new Date(props.timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_list_input}>
            <p>{props.text}</p>
          </div>
        </div>
        {props.image && (
          <div className={styles.post_list_img}>
            <img src={props.image} alt="posts" />
          </div>
        )}
        <Message onClick={() => setOpenComments(!openComments)} />
        {openComments && (
          <>
            {comments.map((com) => (
              <div key={com.id} className={styles.post_comment}>
                <Avatar src={com.avatar} />
                <span className={styles.post_list_headerUser}>
                  @{props.username}
                </span>
                <span className={styles.post_commentText}>{com.text}</span>
                <span className={styles.post_list_headerTime}>
                  {new Date(props.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}

            <form onSubmit={newComment}>
              <div className={styles.post_list_form}>
                <input
                  type="text"
                  placeholder="コメント"
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setComment(e.target.value);
                  }}
                />
                <button
                  className={
                    comment ? styles.post_button : styles.post_button_disable
                  }
                  type="submit"
                >
                  <Send />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PostList;
