import React,{ useState } from 'react';
import styles from './Auth.module.css';
import { useDispatch } from 'react-redux';
import { auth, provider, storage } from '../firebase';
import { updateUserProfile } from '../features/userSlice';

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  Modal,
  IconButton,
  makeStyles
} from '@material-ui/core';

import SendIcon from '@material-ui/icons/Send';
import CameraIcon from '@material-ui/icons/Camera';
import EmailIcon from '@material-ui/icons/Email';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://images.unsplash.com/photo-1625406797282-2824a1876e88?ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDQ0fHhIeFlUTUhMZ09jfHxlbnwwfHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  modal: {
    outline: "none",
    position: "absolute",
    width: 400,
    borderRadius: 10,
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10)
  },
}));

const Auth: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const sendResetEmail = async (e:React.MouseEvent<HTMLElement>) => {
    await auth
    .sendPasswordResetEmail(resetEmail)
    .then(() => {
      setOpenModal(false)
      setResetEmail("")
    }) .catch((error) => {
      alert(error.message);
      setResetEmail("");
  })};

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files![0]) {
      setAvatarImage(e.target.files![0]);
      e.target.value = ""; //空にして毎回初期化
    };
  };

  const signInEmail = async () => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  const signUpEmail = async () => {
    const authUser = await auth.createUserWithEmailAndPassword(email,password);
    let url = ""; //アバター画像の保存場所がどこにあるか識別

    if (avatarImage) {
      const S = 
      "abcdefghijklmnopqrxtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; //ランダムな文字列を作るための候補の文字
      const N = 16; //生成したいランダムの文字列の数
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
      .map((n) => S[n % S.length])
      .join("");

      const fileName = randomChar + "_" + avatarImage.name

      await storage.ref(`avater/${fileName}`).put(avatarImage);
      url = await storage.ref("avater").child(fileName).getDownloadURL(); //アップロードした画像のURLを取得
    }
    await authUser.user?.updateProfile({
      displayName: username,
      photoURL: url,
    });

    dispatch(
      updateUserProfile({ //ReduxのユーザーStateに渡す
        displayName: username,
        photoURL: url,
      })
    );
  };

  const signInGoogle = async () => {
    await auth.signInWithPopup(provider).catch((error) =>  alert(error.message));
  };

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            { isLogin ? "ログイン" : "サインイン"}
          </Typography>
          <form className={classes.form} noValidate>
            {!isLogin && (
              <>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="ユーザー名"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUserName(e.target.value);
                  }}
                />
                <Box textAlign="center">
                  <IconButton>
                    <label>
                      <AccountCircleIcon 
                        fontSize="large"
                        className={
                          avatarImage 
                          ? styles.login_addIconLoaded
                          : styles.login_addIcon
                        }
                      />
                      <input
                        className={styles.login_hiddenIcon}
                        type="file"
                        onChange={onChangeImageHandler}
                      />
                    </label>
                  </IconButton>
                </Box>
              </>
            )}
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
              }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
              }}
            />

            <Button
              disabled={
                isLogin
                  ? !email || password.length < 6
                  : !username || !email || password.length < 6 || !avatarImage 
              }
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              startIcon={<EmailIcon />}
              onClick={
                isLogin
                ?
                async () => {
                  try {
                    await signInEmail();
                  } catch (err) {
                    alert(err.message);
                  }
                }
                :
                async() => {
                  try {
                    await signUpEmail();
                  } catch (err) {
                    alert(err.message);
                  }
                }
              }
            >
              { isLogin ? "ログイン" : "サインイン"}
            </Button>

            <Grid container>
              <Grid item xs>
                <span className={styles.login_reset}
                  onClick={() => setOpenModal(true)}
                >
                  パスワードをお忘れの方はこちら
                </span>
              </Grid>
              <Grid item>
                <span
                  className={styles.login_toggleMode}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "新しくアカウントを作る" : "ログイン画面に戻る"}
                </span>
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<CameraIcon />}
              className={classes.submit}
              onClick={signInGoogle}
            >
              {isLogin ?　"Googleアカウントでログイン" : "Googleアカウントでサインイン"}
            </Button>
          </form>
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <div style={getModalStyle()} className={classes.modal}>
              <div>
                <TextField
                  type="email"
                  value={resetEmail}
                  name="email"
                  label="パスワードリセット"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setResetEmail(e.target.value)
                  }}
                />
                <IconButton onClick={sendResetEmail}>
                  <SendIcon />
                </IconButton>
              </div>
            </div>
          </Modal>
        </div>
      </Grid>
    </Grid>
  );
};

export default Auth;