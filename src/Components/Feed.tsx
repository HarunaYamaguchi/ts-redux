import React from 'react';
import { auth } from '../firebase';
import PostInput from './PostInput';
import styles from './Feed.module.css';


const Feed = () => {
  return (
    <div className={styles.feed}>
      Feed
      <PostInput />
      <button onClick={() => auth.signOut()}>ログアウト</button>
    </div>
  )
}

export default Feed
